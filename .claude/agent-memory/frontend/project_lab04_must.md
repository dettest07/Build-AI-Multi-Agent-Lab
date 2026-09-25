---
name: lab04-frontend-must
description: Must list for Lab 04 that frontend accepted in the Brand/UX/Devil debate (2026-09-25) — parser, Tagline/Proof, Contact, meta, Guestbook, theme, Thai UI, form flag
metadata:
  type: project
---

Frontend (Claude) took on this Must list in the 2-round debate with reviewer, finished 2026-09-25. Source of truth is `docs/DECISIONS.md` (read the D-ids there; don't trust this list if it disagrees).

1. Fix the parser in `src/lib/profile.ts`: the bug is at **line 42** (the lookahead `$` under flag `m`), not line 37 as OPEN_LOOPS L2 says. Correct the line number in OPEN_LOOPS during a round when frontend is the writer.
2. Add `## Tagline` and `## Proof` headings to PROFILE plus fields in the parser. Don't pull them from `## Tone`. Home order: H1 Tagline → Headline → Proof → CTA. No Bio on Home until it's rewritten in "ผม" voice.
3. Parse `## Contact` so the email shows up, as a plain `mailto:` link. No JS-assembled email. A copy button is an optional extra only.
4. Change the default meta description in `BaseLayout.astro` to use the Headline, with no course wording.
5. Take Guestbook out of nav and Home. Switch `innerHTML` to build nodes with `textContent`.
6. Light theme: change the CSS vars in `BaseLayout` in one place and pick an accent colour that passes WCAG AA (including the focus state).
7. Thai UI and `<title>` ("หน้า · ชื่อ"). URLs stay in English.
8. Contact: email is the main channel. Hide the form behind a page-level constant flag and turn it on only after the OpenCode handoff. Keep a friendly 501 fallback that points to email, and never show `data.error` raw.
Also: make "ติดต่อ" in nav stand out as a button (U8), and use a card grid that adapts to the number of cards (U9).

**Why:** Agreed by both sides in the debate. The owner of the site still needs to confirm some content (see [[pending-owner-opencode]]).
**How to apply:** Use this as the Lab 04 checklist. Check DECISIONS first, and see the details in [[lab04-impl-gotchas]].
