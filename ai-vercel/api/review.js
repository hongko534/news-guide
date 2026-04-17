// news-guide-ai — Vercel Serverless Function (Node.js runtime, 60s timeout)
// Proxies the news-guide "AI 심화 검토" button to the Anthropic Claude API.

import { SYSTEM_PROMPT } from './_prompts.js';

export const config = { maxDuration: 60 };

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

const rateLimitStore = new Map();

export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://hongko534.github.io';
  const model = 'claude-sonnet-4-6';
  const maxInputChars = Number(process.env.MAX_INPUT_CHARS || '10000');
  const maxOutputTokens = Number(process.env.MAX_OUTPUT_TOKENS || '4096');
  const rateHour = Number(process.env.RATE_HOUR || '20');
  const rateDay = Number(process.env.RATE_DAY || '100');

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Health check
  if (req.method === 'GET') {
    return res.status(200).send('news-guide-ai (vercel serverless) ok');
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // 1. Origin check
  const origin = req.headers['origin'] || '';
  if (allowedOrigin && origin !== allowedOrigin) {
    return res.status(403).json({ error: { code: 'origin_not_allowed', message: `Origin ${origin} is not allowed` } });
  }

  // 2. Parse body
  const body = req.body;
  const text = (body && typeof body.text === 'string') ? body.text.trim() : '';
  if (!text) {
    return res.status(400).json({ error: { code: 'empty_text', message: 'text field is required and must be non-empty' } });
  }
  if (text.length > maxInputChars) {
    return res.status(400).json({ error: { code: 'text_too_long', message: `text exceeds ${maxInputChars} characters` } });
  }

  // 3. Rate limit
  const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.headers['x-real-ip'] || 'unknown';
  const limited = checkAndIncrement(clientIp, rateHour, rateDay);
  if (limited) {
    return res.status(429).json({ error: { code: 'rate_limited', message: limited } });
  }

  // 4. Check API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { code: 'not_configured', message: 'ANTHROPIC_API_KEY env var is not set' } });
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
    return res.status(502).json({ error: { code: 'upstream_fetch_failed', message: String(e) } });
  }

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => '');
    return res.status(upstream.status).json({ error: { code: 'upstream_error', message: errText.slice(0, 500) } });
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
    try {
      review = JSON.parse(repairTruncatedJson(stripCodeFence(assistantText)));
    } catch (_) {
      return res.status(502).json({ error: { code: 'model_invalid_json', message: 'AI 응답을 JSON으로 해석하지 못했습니다. 다시 시도해주세요.' } });
    }
  }

  return res.status(200).json({ review, usage: data?.usage || null, model });
}

// --- helpers ---

function stripCodeFence(text) {
  const m = text.match(/^\s*```(?:json)?\s*([\s\S]*?)\s*```\s*$/);
  if (m) return m[1];
  const open = text.match(/^\s*```(?:json)?\s*([\s\S]*)$/);
  if (open) return open[1];
  return text;
}

function repairTruncatedJson(text) {
  let s = text;
  const jsonStart = s.indexOf('{');
  if (jsonStart < 0) return text;
  s = s.slice(jsonStart).trimEnd();

  let depth = 0, inStr = false, jsonEnd = -1;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"' && (i === 0 || s[i - 1] !== '\\')) { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '{' || c === '[') depth++;
    else if (c === '}' || c === ']') { depth--; if (depth === 0) { jsonEnd = i; break; } }
  }
  if (jsonEnd > 0) return s.slice(0, jsonEnd + 1);

  const quotes = (s.match(/"/g) || []).length;
  if (quotes % 2 !== 0) s += '"';
  s = s.replace(/,\s*"[^"]*"\s*:\s*$/, '');
  s = s.replace(/,\s*"[^"]*"\s*:\s*"[^"]*$/, '');
  const stack = [];
  let inStr2 = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"' && (i === 0 || s[i - 1] !== '\\')) { inStr2 = !inStr2; continue; }
    if (inStr2) continue;
    if (c === '{' || c === '[') stack.push(c === '{' ? '}' : ']');
    else if (c === '}' || c === ']') stack.pop();
  }
  s = s.replace(/,\s*$/, '');
  return s + stack.reverse().join('');
}

function checkAndIncrement(ip, hourLimit, dayLimit) {
  const now = Date.now();
  const hourBucket = Math.floor(now / 3_600_000);
  const dayBucket = Math.floor(now / 86_400_000);
  const hourKey = `h:${ip}:${hourBucket}`;
  const dayKey = `d:${ip}:${dayBucket}`;
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
