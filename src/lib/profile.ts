/**
 * Profile helpers. Learners fill docs/PROFILE.md in Lab 01.
 * Lab 04 (DECISIONS D6): sections are read in full (not just the first line),
 * plus Tagline / Proof / Contact / Services.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** One `- name — description` line; description is '' when there is no "—". */
export type ListItem = { name: string; description: string };

export type Profile = {
  name: string;
  headline: string;
  bio: string;
  audience: string;
  /** Raw list lines — kept as string[] for the GET /api/interests contract. */
  interests: string[];
  interestItems: ListItem[];
  tagline: string;
  proof: string;
  /** Public contact email from `## Contact` (`- email: ...`); '' when absent. */
  email: string;
  services: ListItem[];
};

/**
 * FALLBACK renders publicly when docs/PROFILE.md is missing or a section is
 * empty — keep it course-free (no lab references); learner hints belong in
 * comments and docs, not in rendered fallback text.
 */
export const FALLBACK: Profile = {
  name: 'Your Name',
  headline: 'Personal branding site',
  bio: 'This personal site is still being built — content is coming soon.',
  audience: 'Hiring managers / peers / community',
  interests: ['AI agents', 'Web', 'Teaching'],
  interestItems: [
    { name: 'AI agents', description: '' },
    { name: 'Web', description: '' },
    { name: 'Teaching', description: '' },
  ],
  tagline: '',
  proof: '',
  email: '',
  services: [],
};

function profilePath(): string {
  const candidates = [
    join(process.cwd(), 'docs', 'PROFILE.md'),
    join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'docs', 'PROFILE.md'),
  ];
  return candidates.find((p) => existsSync(p)) || candidates[0];
}

/** Split markdown into `## Heading` → body (every line up to the next `## `). */
function sections(raw: string): Map<string, string> {
  const map = new Map<string, string>();
  let current: string | null = null;
  let buf: string[] = [];
  const flush = () => {
    if (current !== null && !map.has(current)) map.set(current, buf.join('\n').trim());
  };
  for (const line of raw.replace(/\r\n?/g, '\n').split('\n')) {
    const h = line.match(/^##\s+(.+?)\s*$/);
    if (h) {
      flush();
      current = h[1];
      buf = [];
    } else if (current !== null) {
      buf.push(line);
    }
  }
  flush();
  return map;
}

function listLines(body: string): string[] {
  return body
    .split('\n')
    .map((l) => l.replace(/^\s*[-*]\s*/, '').trim())
    .filter(Boolean);
}

/** Parse `- name — description` lines (shared by Interests and Services). */
export function parseList(body: string): ListItem[] {
  return listLines(body).map((line) => {
    const i = line.indexOf('—');
    if (i === -1) return { name: line, description: '' };
    return { name: line.slice(0, i).trim(), description: line.slice(i + 1).trim() };
  });
}

function parseEmail(contact: string): string {
  for (const line of listLines(contact)) {
    const m = line.match(/^e-?mail\s*:\s*(\S+@\S+\.\S+)$/i);
    if (m) return m[1];
  }
  return '';
}

export function parseProfile(raw: string): Profile {
  const s = sections(raw);
  const get = (label: string) => s.get(label) || '';
  const interests = listLines(get('Interests'));
  return {
    name: get('Name') || FALLBACK.name,
    headline: get('Headline') || FALLBACK.headline,
    bio: get('Bio') || FALLBACK.bio,
    audience: get('Audience') || FALLBACK.audience,
    interests: interests.length ? interests : FALLBACK.interests,
    interestItems: interests.length ? parseList(get('Interests')) : FALLBACK.interestItems,
    tagline: get('Tagline'),
    proof: get('Proof'),
    email: parseEmail(get('Contact')),
    services: parseList(get('Services')),
  };
}

export function loadProfile(): Profile {
  const path = profilePath();
  if (!existsSync(path)) return FALLBACK;
  return parseProfile(readFileSync(path, 'utf8'));
}
