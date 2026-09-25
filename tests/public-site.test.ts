import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { FALLBACK } from '../src/lib/profile';
import Home from '../src/pages/index.astro';
import About from '../src/pages/about.astro';
import Interests from '../src/pages/interests.astro';
import Contact from '../src/pages/contact.astro';
import Guestbook from '../src/pages/guestbook.astro';

/**
 * The deployed site must never mention the course to visitors — they should
 * see a personal site, not lab scaffolding. Three layers (DECISIONS D11):
 *  1. rendered markup in every .astro/.html file under src (frontmatter and
 *     HTML comments stripped);
 *  2. string literals inside frontmatter (e.g. a default meta description),
 *     which layer 1 cannot see — code comments there are still allowed;
 *  3. real HTML rendered with the Astro Container API (meta, title, text).
 * Code comments in .ts files are learner scaffolding, are not rendered, and
 * are allowed to mention labs.
 */
function collectMarkupFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) collectMarkupFiles(full, out);
    else if (/\.(astro|html)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

function splitFrontmatter(text: string): { frontmatter: string; markup: string } {
  if (text.startsWith('---')) {
    const end = text.indexOf('\n---', 3);
    if (end !== -1) return { frontmatter: text.slice(3, end), markup: text.slice(end + 4) };
  }
  return { frontmatter: '', markup: text };
}

function stripNonRendered(text: string): string {
  return splitFrontmatter(text).markup.replace(/<!--[\s\S]*?-->/g, '');
}

/** String literals only — `// Lab 04` style comments in frontmatter stay allowed. */
function frontmatterLiterals(text: string): string[] {
  const code = splitFrontmatter(text)
    .frontmatter.replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
  return [...code.matchAll(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g)].map((m) => m[0]);
}

/** Visible text + attribute values, without <script>/<style> bodies. */
function visibleHtml(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
}

const COURSE_LEAK_PATTERN = /\blabs?\b\s*[-–—]?\s*0?\d+\b|แล็บ/i;
const COURSE_WORDS = /multi-agent course|คอร์ส|เวิร์กช็อป|workshop/i;

describe('public site must not leak course/lab references', () => {
  const files = collectMarkupFiles(join(process.cwd(), 'src'));

  it('finds astro/html files to scan', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('rendered markup has no lab references', () => {
    const offenders: string[] = [];
    for (const file of files) {
      const match = stripNonRendered(readFileSync(file, 'utf8')).match(COURSE_LEAK_PATTERN);
      if (match) offenders.push(`${file} -> "${match[0]}"`);
    }
    expect(offenders, 'course references leaked into public markup').toEqual([]);
  });

  it('frontmatter string literals have no course references', () => {
    const offenders: string[] = [];
    for (const file of files) {
      for (const lit of frontmatterLiterals(readFileSync(file, 'utf8'))) {
        const match = lit.match(COURSE_WORDS) || lit.match(COURSE_LEAK_PATTERN);
        if (match) offenders.push(`${file} -> ${lit}`);
      }
    }
    expect(offenders, 'course references in frontmatter strings').toEqual([]);
  });
});

describe('rendered pages (Astro Container API)', () => {
  const pages = [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/interests', component: Interests },
    { path: '/contact', component: Contact },
    { path: '/guestbook', component: Guestbook },
  ];

  for (const { path, component } of pages) {
    it(`${path} has no course text, API paths or placeholder content`, async () => {
      const container = await AstroContainer.create();
      const html = visibleHtml(
        await container.renderToString(component, { request: new Request(`http://localhost${path}`) }),
      );
      expect(html).not.toMatch(COURSE_LEAK_PATTERN);
      expect(html).not.toMatch(COURSE_WORDS);
      expect(html, 'internal endpoint shown to visitors').not.toMatch(/\/api\//);
      expect(html).toMatch(/<title>[^<]+ · [^<]+<\/title>/);
      for (const placeholder of [FALLBACK.name, FALLBACK.headline, FALLBACK.bio]) {
        expect(html, 'FALLBACK content rendered').not.toContain(placeholder);
      }
      expect(html, 'guestbook must not be linked (D9)').not.toMatch(/href="\/guestbook"/);
    });
  }

  it('/guestbook renders no form or entry list until moderation exists (D9)', async () => {
    const container = await AstroContainer.create();
    const html = visibleHtml(
      await container.renderToString(Guestbook, { request: new Request('http://localhost/guestbook') }),
    );
    expect(html).not.toMatch(/<form\b/);
    expect(html).not.toMatch(/id="entries"/);
  });
});
