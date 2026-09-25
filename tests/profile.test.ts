import { describe, it, expect } from 'vitest';
import { FALLBACK, loadProfile, parseList, parseProfile } from '../src/lib/profile';

const SAMPLE = `# PROFILE

## Name
Jane Doe

## Headline
Builder of careful systems

## Bio
First paragraph.

Second paragraph.

## Interests
- .NET — runtime and tooling
- AI
- Security

## Contact
- email: jane@example.com
- github: —

## Tagline
Design first, ship safe

## Proof
C# · SQL Server · 10 years

## Services
- Freelance .NET — web apps end to end
- Consulting — architecture review`;

describe('parseProfile', () => {
  it('keeps every line of a multi-line section', () => {
    const p = parseProfile(SAMPLE);
    expect(p.bio).toBe('First paragraph.\n\nSecond paragraph.');
    expect(p.interests).toEqual(['.NET — runtime and tooling', 'AI', 'Security']);
  });

  it('reads the last heading in the file', () => {
    const p = parseProfile(SAMPLE);
    expect(p.services).toEqual([
      { name: 'Freelance .NET', description: 'web apps end to end' },
      { name: 'Consulting', description: 'architecture review' },
    ]);
  });

  it('handles \\r\\n line endings', () => {
    const p = parseProfile(SAMPLE.replace(/\n/g, '\r\n'));
    expect(p.interests).toHaveLength(3);
    expect(p.bio).toContain('Second paragraph.');
    expect(p.email).toBe('jane@example.com');
  });

  it('reads Tagline, Proof and Contact email', () => {
    const p = parseProfile(SAMPLE);
    expect(p.tagline).toBe('Design first, ship safe');
    expect(p.proof).toBe('C# · SQL Server · 10 years');
    expect(p.email).toBe('jane@example.com');
  });

  it('does not treat a longer heading as a prefix match', () => {
    const p = parseProfile('## Name\nA\n\n## Name Extra\nB');
    expect(p.name).toBe('A');
  });

  it('falls back per field when a section is missing', () => {
    const p = parseProfile('## Name\nOnly Name');
    expect(p.name).toBe('Only Name');
    expect(p.headline).toBe(FALLBACK.headline);
    expect(p.email).toBe('');
    expect(p.services).toEqual([]);
  });
});

describe('parseList', () => {
  it('splits "name — description" and keeps name-only lines', () => {
    expect(parseList('- A — desc a\n* B\n\n- C — d — e')).toEqual([
      { name: 'A', description: 'desc a' },
      { name: 'B', description: '' },
      { name: 'C', description: 'd — e' },
    ]);
  });
});

describe('loadProfile on the real docs/PROFILE.md', () => {
  it('does not fall back to placeholder content', () => {
    const p = loadProfile();
    expect(p.name).not.toBe(FALLBACK.name);
    expect(p.headline).not.toBe(FALLBACK.headline);
    expect(p.bio).not.toBe(FALLBACK.bio);
    expect(p.interests).not.toEqual(FALLBACK.interests);
  });
});
