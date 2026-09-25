---
name: lab04-impl-gotchas
description: Implementation gotchas for Lab 04 — list format "- ชื่อ — คำอธิบาย", parser test cases, FALLBACK test, 2-layer R8 test (frontmatter leak)
metadata:
  type: project
---

- Interests and Services use the same format, `- ชื่อ — คำอธิบาย`, with one shared helper parser. A line without "—" shows only the name, so the old PROFILE still works.
- Write parser tests before fixing: 3 cases, (a) multi-line sections, (b) the last heading in the file, (c) `\r\n`.
- R9 FALLBACK test: call `loadProfile()` and assert only that the result is not the FALLBACK value. Don't pin specific values, because the test depends on each learner's real PROFILE.
- R8: `tests/public-site.test.ts` strips frontmatter, so string literals in frontmatter (like the default description) slip past the test. Frontend owns this test. Fix it in 2 layers:
  1. Low cost: scan frontmatter string literals too, using narrow terms ("multi-agent course", "คอร์ส"), not a bare "course".
  2. Render the real page with the Astro Container API in vitest (Astro 7). If it runs into version or mocking trouble, move the check to Playwright e2e + a view-source step in `docs/QA.md`. Scanning `dist/` won't work because CI runs `npm test` before build.

**Why:** Agreed in the 2026-09-25 debate. R8 was confirmed against the real code.
**How to apply:** Use while writing Lab 04 code and tests. Related to [[lab04-frontend-must]].
