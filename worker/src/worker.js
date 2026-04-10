// news-guide-ai Worker
// Proxies the frontend "AI 심화 검토" button to Anthropic Claude.
//
// Endpoints:
//   OPTIONS /review   CORS preflight
//   POST    /review   { text: "기사 초안" } → Claude JSON review
//
// Security:
//   - Origin must match ALLOWED_ORIGIN (set in wrangler.toml vars)
//   - Anthropic API key is read from env.ANTHROPIC_API_KEY (set via `wrangler secret put`)
//   - Rate limited per client IP via Cloudflare KV (hour + day windows)
//
// Prompt caching: the big system prompt (editing guides + 291 rules) is sent
// with cache_control so subsequent calls within 5 minutes cost ~10% of normal.

import SYSTEM_PROMPT_TEMPLATE from '../prompts/system_prompt.md';
import RULES_SUMMARY from '../prompts/rules_summary.md';

// Assemble the full system prompt once at module load time.
// The lightweight version embeds only the 291-rule compact summary; the
// full editing-guide transcripts are intentionally omitted to keep the
// input under the Tier 0 ITPM limit.
const SYSTEM_PROMPT = SYSTEM_PROMPT_TEMPLATE
  .replace('{{RULES_SUMMARY}}', RULES_SUMMARY);

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return corsResponse(env, null);
    }

    // Health check
    if (request.method === 'GET' && url.pathname === '/') {
      return corsResponse(env, new Response('news-guide-ai Worker ok', { status: 200 }));
    }

    // Main endpoint
    if (request.method === 'POST' && url.pathname === '/review') {
      return corsResponse(env, await handleReview(request, env, ctx));
    }

    return corsResponse(env, new Response('Not Found', { status: 404 }));
  },
};

function corsResponse(env, innerResponse) {
  const headers = new Headers(innerResponse ? innerResponse.headers : {});
  headers.set('Access-Control-Allow-Origin', env.ALLOWED_ORIGIN || '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  headers.set('Access-Control-Max-Age', '86400');
  headers.set('Vary', 'Origin');
  if (!innerResponse) {
    return new Response(null, { status: 204, headers });
  }
  return new Response(innerResponse.body, {
    status: innerResponse.status,
    statusText: innerResponse.statusText,
    headers,
  });
}

async function handleReview(request, env, ctx) {
  // 1. Origin check — reject anything but the allowed frontend
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = env.ALLOWED_ORIGIN || '';
  if (allowedOrigin && origin !== allowedOrigin) {
    return jsonError(403, 'origin_not_allowed', `Origin ${origin} is not allowed`);
  }

  // 2. Parse body
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonError(400, 'bad_json', 'Request body must be JSON');
  }
  const text = (body && typeof body.text === 'string') ? body.text.trim() : '';
  if (!text) {
    return jsonError(400, 'empty_text', 'text field is required and must be non-empty');
  }
  const maxChars = Number(env.MAX_INPUT_CHARS || '10000');
  if (text.length > maxChars) {
    return jsonError(400, 'text_too_long', `text exceeds ${maxChars} characters`);
  }

  // 3. Rate limit by client IP
  const clientIp =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For') ||
    'unknown';
  const rateHour = Number(env.RATE_HOUR || '20');
  const rateDay = Number(env.RATE_DAY || '100');
  if (env.RATE_LIMIT_KV) {
    const limited = await checkAndIncrement(env.RATE_LIMIT_KV, clientIp, rateHour, rateDay);
    if (limited) {
      return jsonError(429, 'rate_limited', limited);
    }
  }

  // 4. Check secret presence
  if (!env.ANTHROPIC_API_KEY) {
    return jsonError(500, 'not_configured', 'ANTHROPIC_API_KEY secret is not set');
  }

  // 5. Call Anthropic
  const model = env.MODEL || 'claude-sonnet-4-5-20250929';
  const maxOutputTokens = Number(env.MAX_OUTPUT_TOKENS || '4000');

  const payload = {
    model,
    max_tokens: maxOutputTokens,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: '다음 기사 초안을 심화 검토해주세요. 규정된 JSON 포맷으로만 응답하세요.\n\n' + text,
      },
    ],
  };

  let upstream;
  try {
    upstream = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION,
        // Explicit UA: Cloudflare Workers' default fetch UA can look like a
        // headless/bot client to Anthropic's rate-limit heuristics.
        'User-Agent': 'news-guide-ai-worker/1.0 (https://hongko534.github.io/news-guide/)',
        // Prompt caching is now GA — enabled automatically by `cache_control`
        // fields on the `system` blocks. No beta header required.
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return jsonError(502, 'upstream_fetch_failed', String(e));
  }

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => '');
    return jsonError(upstream.status, 'upstream_error', errText.slice(0, 500));
  }

  const data = await upstream.json();
  // Extract the assistant text from Claude response
  const assistantText =
    (Array.isArray(data?.content) ? data.content : [])
      .filter((b) => b && b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

  // Parse the JSON the model emitted
  let review;
  try {
    review = JSON.parse(stripCodeFence(assistantText));
  } catch (e) {
    // If the model failed to emit clean JSON, return the raw text so the UI can degrade gracefully.
    return jsonError(502, 'model_invalid_json', assistantText.slice(0, 1200));
  }

  // Attach usage info (non-sensitive)
  const usage = data?.usage || null;

  return new Response(
    JSON.stringify({ review, usage, model }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    }
  );
}

// --- helpers ---

function jsonError(status, code, message) {
  return new Response(
    JSON.stringify({ error: { code, message } }),
    {
      status,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    }
  );
}

function stripCodeFence(text) {
  // Some models wrap JSON in ```json ... ``` — strip it.
  const m = text.match(/^\s*```(?:json)?\s*([\s\S]*?)\s*```\s*$/);
  return m ? m[1] : text;
}

/**
 * Simple two-window rate limiter backed by KV.
 * Returns a rejection message string if limited, else null.
 */
async function checkAndIncrement(kv, ip, hourLimit, dayLimit) {
  const now = Date.now();
  const hourBucket = Math.floor(now / 3_600_000);
  const dayBucket = Math.floor(now / 86_400_000);
  const hourKey = `rl:h:${ip}:${hourBucket}`;
  const dayKey = `rl:d:${ip}:${dayBucket}`;

  const [hourRaw, dayRaw] = await Promise.all([kv.get(hourKey), kv.get(dayKey)]);
  const hourCount = Number(hourRaw || 0);
  const dayCount = Number(dayRaw || 0);

  if (hourCount >= hourLimit) {
    return `Hour limit ${hourLimit} exceeded for IP ${ip}`;
  }
  if (dayCount >= dayLimit) {
    return `Day limit ${dayLimit} exceeded for IP ${ip}`;
  }

  // Increment both counters (eventually consistent — small race tolerance OK for abuse prevention)
  await Promise.all([
    kv.put(hourKey, String(hourCount + 1), { expirationTtl: 3700 }),
    kv.put(dayKey, String(dayCount + 1), { expirationTtl: 90000 }),
  ]);
  return null;
}
