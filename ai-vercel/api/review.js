// news-guide-ai — Vercel Edge Function
// Proxies the news-guide "AI 심화 검토" button to the Anthropic Claude API.
//
// Endpoints:
//   OPTIONS /api/review   CORS preflight
//   POST    /api/review   { text: "기사 초안" } → Claude JSON review
//   GET     /api/review   health check
//
// Security:
//   - Origin must match ALLOWED_ORIGIN env var
//   - Anthropic API key is read from ANTHROPIC_API_KEY env var
//   - Simple in-memory rate limit per edge isolate (best-effort)
//     For production, swap for Upstash Redis or Vercel KV.

import { SYSTEM_PROMPT } from './_prompts.js';

export const config = { runtime: 'edge' };

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

// In-memory counters — reset per isolate (best-effort abuse prevention)
const rateLimitStore = new Map();

export default async function handler(request) {
  const url = new URL(request.url);
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://hongko534.github.io';
  const model = process.env.MODEL || 'claude-haiku-4-5';
  const maxInputChars = Number(process.env.MAX_INPUT_CHARS || '10000');
  const maxOutputTokens = Number(process.env.MAX_OUTPUT_TOKENS || '3000');
  const rateHour = Number(process.env.RATE_HOUR || '20');
  const rateDay = Number(process.env.RATE_DAY || '100');

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return corsResponse(allowedOrigin, null);
  }

  // Health check
  if (request.method === 'GET') {
    return corsResponse(allowedOrigin, new Response('news-guide-ai (vercel edge) ok', { status: 200 }));
  }

  if (request.method !== 'POST') {
    return corsResponse(allowedOrigin, new Response('Method Not Allowed', { status: 405 }));
  }

  // 1. Origin check
  const origin = request.headers.get('Origin') || '';
  if (allowedOrigin && origin !== allowedOrigin) {
    return corsResponse(allowedOrigin, jsonError(403, 'origin_not_allowed', `Origin ${origin} is not allowed`));
  }

  // 2. Parse body
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return corsResponse(allowedOrigin, jsonError(400, 'bad_json', 'Request body must be JSON'));
  }
  const text = (body && typeof body.text === 'string') ? body.text.trim() : '';
  if (!text) {
    return corsResponse(allowedOrigin, jsonError(400, 'empty_text', 'text field is required and must be non-empty'));
  }
  if (text.length > maxInputChars) {
    return corsResponse(allowedOrigin, jsonError(400, 'text_too_long', `text exceeds ${maxInputChars} characters`));
  }

  // 3. Rate limit by client IP (best-effort, per-isolate)
  const clientIp =
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    request.headers.get('X-Real-IP') ||
    'unknown';
  const limited = checkAndIncrement(clientIp, rateHour, rateDay);
  if (limited) {
    return corsResponse(allowedOrigin, jsonError(429, 'rate_limited', limited));
  }

  // 4. Check API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return corsResponse(allowedOrigin, jsonError(500, 'not_configured', 'ANTHROPIC_API_KEY env var is not set'));
  }

  // 5. Call Anthropic
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
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'User-Agent': 'news-guide-ai-vercel/1.0 (https://hongko534.github.io/news-guide/)',
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return corsResponse(allowedOrigin, jsonError(502, 'upstream_fetch_failed', String(e)));
  }

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => '');
    return corsResponse(allowedOrigin, jsonError(upstream.status, 'upstream_error', errText.slice(0, 500)));
  }

  const data = await upstream.json();
  const assistantText =
    (Array.isArray(data?.content) ? data.content : [])
      .filter((b) => b && b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

  let review;
  try {
    review = JSON.parse(stripCodeFence(assistantText));
  } catch (e) {
    // 토큰 한도로 JSON이 잘렸을 수 있으므로 복구 시도
    try {
      review = JSON.parse(repairTruncatedJson(stripCodeFence(assistantText)));
    } catch (_) {
      return corsResponse(allowedOrigin, jsonError(502, 'model_invalid_json', 'AI 응답을 JSON으로 해석하지 못했습니다. 다시 시도해주세요.'));
    }
  }

  return corsResponse(
    allowedOrigin,
    new Response(
      JSON.stringify({ review, usage: data?.usage || null, model }),
      { status: 200, headers: { 'Content-Type': 'application/json; charset=UTF-8' } }
    )
  );
}

// --- helpers ---

function corsResponse(allowedOrigin, innerResponse) {
  const headers = new Headers(innerResponse ? innerResponse.headers : {});
  headers.set('Access-Control-Allow-Origin', allowedOrigin || '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  headers.set('Access-Control-Max-Age', '86400');
  headers.set('Vary', 'Origin');
  if (!innerResponse) return new Response(null, { status: 204, headers });
  return new Response(innerResponse.body, {
    status: innerResponse.status,
    statusText: innerResponse.statusText,
    headers,
  });
}

function jsonError(status, code, message) {
  return new Response(
    JSON.stringify({ error: { code, message } }),
    { status, headers: { 'Content-Type': 'application/json; charset=UTF-8' } }
  );
}

function stripCodeFence(text) {
  // 완전한 코드 펜스 (열기 + 닫기)
  const m = text.match(/^\s*```(?:json)?\s*([\s\S]*?)\s*```\s*$/);
  if (m) return m[1];
  // 열기만 있고 닫기가 없는 경우 (응답이 잘렸을 때)
  const open = text.match(/^\s*```(?:json)?\s*([\s\S]*)$/);
  if (open) return open[1];
  return text;
}

function repairTruncatedJson(text) {
  // 잘린 문자열 값을 닫고, 열린 배열/객체 괄호를 순서대로 닫는다
  let s = text.trimEnd();
  // 닫히지 않은 문자열 닫기
  const quotes = (s.match(/"/g) || []).length;
  if (quotes % 2 !== 0) s += '"';
  // 마지막 불완전한 속성(키만 있고 값이 없는 경우) 제거
  s = s.replace(/,\s*"[^"]*"\s*:\s*$/, '');
  // 열린 괄호를 역순으로 닫기
  const stack = [];
  let inStr = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"' && (i === 0 || s[i - 1] !== '\\')) { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '{' || c === '[') stack.push(c === '{' ? '}' : ']');
    else if (c === '}' || c === ']') stack.pop();
  }
  // 마지막에 쉼표가 남아있으면 제거
  s = s.replace(/,\s*$/, '');
  return s + stack.reverse().join('');
}

function checkAndIncrement(ip, hourLimit, dayLimit) {
  const now = Date.now();
  const hourBucket = Math.floor(now / 3_600_000);
  const dayBucket = Math.floor(now / 86_400_000);
  const hourKey = `h:${ip}:${hourBucket}`;
  const dayKey = `d:${ip}:${dayBucket}`;
  // Opportunistic cleanup: drop entries older than current day
  if (rateLimitStore.size > 1000) {
    for (const k of rateLimitStore.keys()) {
      if (!k.endsWith(`:${hourBucket}`) && !k.endsWith(`:${dayBucket}`)) {
        rateLimitStore.delete(k);
      }
    }
  }
  const hourCount = rateLimitStore.get(hourKey) || 0;
  const dayCount = rateLimitStore.get(dayKey) || 0;
  if (hourCount >= hourLimit) return `Hour limit ${hourLimit} exceeded`;
  if (dayCount >= dayLimit) return `Day limit ${dayLimit} exceeded`;
  rateLimitStore.set(hourKey, hourCount + 1);
  rateLimitStore.set(dayKey, dayCount + 1);
  return null;
}
