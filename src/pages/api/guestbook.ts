import type { APIRoute } from 'astro';
import { insertGuestbook, listGuestbook, ValidationError } from '../../lib/db';
import { allow } from '../../lib/ratelimit';

export const prerender = false;

/**
 * GET  /api/guestbook → 200 { entries } (newest first)
 * POST /api/guestbook → 201 persisted · 400 invalid input · 429 rate limited · 500 other
 * Body: { name, message } — name ≤ 80, message ≤ 500 (UI contract, do not change).
 * Honeypot: field `website` (non-empty) → fake 201, nothing persisted. UI adds the field later.
 */
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

export const GET: APIRoute = async () => {
  try {
    return json(200, { entries: listGuestbook() });
  } catch (err) {
    console.error('[api/guestbook] GET failed:', err);
    return json(500, { error: 'internal error' });
  }
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
  try {
    if (!allow(`guestbook:${ip}`, 5)) return json(429, { error: 'too many requests' });

    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return json(400, { error: 'invalid input' });

    const website = (body as { website?: unknown }).website;
    if (typeof website === 'string' && website.trim() !== '') {
      return json(201, { ok: true }); // honeypot hit — silently drop, never stored
    }

    const row = insertGuestbook(body as { name: string; message: string });
    return json(201, row);
  } catch (err) {
    if (err instanceof ValidationError) return json(400, { error: 'invalid input' });
    console.error('[api/guestbook] POST failed:', err);
    return json(500, { error: 'internal error' });
  }
};