---
name: review-recurring-risks
description: Non-obvious recurring risks in this Astro personal-site repo (test blind spots, FALLBACK leak, guestbook XSS, course text in meta) and the first-look checklist for Lab 04 / Lab 07 reviews
metadata:
  type: project
---

Found during the PROFILE debate (2026-09-25). Verify each against the current code before citing it; these may already be fixed.

- **R8 test blind spot:** `tests/public-site.test.ts` strips frontmatter before matching, but `BaseLayout.astro` sets its default `description` in the frontmatter. Course text in meta therefore passes CI. Adding "course" to the regex does not help. What works is a test on the rendered HTML, using narrow terms (`multi-agent course`, `คอร์ส`), because plain "course" also matches "of course".
- **R2:** the default meta description mentions the course, which violates public-site-safe. The fix is to default it to Headline.
- **R9:** `profile.ts` `FALLBACK` ("Your Name", "Teaching" …) renders publicly whenever a section fails to parse. The regex also stops at the first line (`$` + flag `m`, around line 42, not 37 as OPEN_LOOPS L2 once said). Ask for a test that the real PROFILE never falls back.
- **R1:** `guestbook.astro` builds entries with `innerHTML` from user input (XSS). It must use `textContent`, and the guestbook is out of v1 nav/Home.
- Also check for: API paths or raw `data.error` shown to visitors, and a contact form that returns 501 while it is the only channel.

**Why:** the public-site test gives false confidence, and on a site selling "ปลอดภัยก่อนส่ง" any leak or XSS directly damages the brand.

**How to apply (first checks in Lab 04 / Lab 07):**
1. View-source of every page (meta, `<title>`, fallback text), not just the `.astro` body.
2. Grep for `innerHTML` and for raw error strings.
3. Parser: multi-line sections, last section in the file, `\r\n`.
4. Contact works, or falls back to email, when the API returns 501.
5. Stances and ship gate: see [[reviewer-debate-stances]]. Source of truth is `docs/DECISIONS.md`.
