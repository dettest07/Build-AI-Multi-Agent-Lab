import type { APIRoute } from 'astro';
import { insertContact, ValidationError } from '../../lib/db';
import { allow } from '../../lib/ratelimit';

export const prerender = false;

/**
 * POST /api/contact
 * Body: { name, email, message } (contract from docs/handoffs/04-claude-to-opencode.md — do not change).
 * 201 = persisted · 400 = invalid input · 429 = rate limited · 500 = other (no details leaked).
 * Honeypot: field `website` (non-empty) → fake 201, nothing persisted. UI adds the field later.
 */
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
  try {
    if (!allow(`contact:${ip}`, 5)) return json(429, { error: 'too many requests' });

    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return json(400, { error: 'invalid input' });

    const website = (body as { website?: unknown }).website;
    if (typeof website === 'string' && website.trim() !== '') {
      return json(201, { ok: true }); // honeypot hit — silently drop, never stored
    }

    const row = insertContact(body as { name: string; email: string; message: string });
    return json(201, row);
  } catch (err) {
    if (err instanceof ValidationError) return json(400, { error: 'invalid input' });
    console.error('[api/contact] failed:', err); // server log only — body stays generic
    return json(500, { error: 'internal error' });
  }
};