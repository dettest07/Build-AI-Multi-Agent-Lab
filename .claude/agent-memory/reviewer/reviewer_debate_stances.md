---
name: reviewer-debate-stances
description: Reviewer positions argued in the 2026-09-25 PROFILE debate (honeypot, email obfuscation, ship gate, pricing copy); check docs/DECISIONS.md for what was actually approved
metadata:
  type: project
---

These are my stances from the debate, not approved decisions. `docs/DECISIONS.md` (the rewritten version) is the source of truth. Check it first; if it differs, follow it and update this file.

- **Honeypot:** add it only when the server (OpenCode) checks the field. A UI-only honeypot does nothing. Ship it together with the server-side rate limit.
- **Email:** do not assemble it with JS. Doing so hurts screen readers and no-JS visitors while barely stopping scrapers. Use a plain `mailto:` with a dedicated work address, plus a copy button.
- **Ship gate:** block ship until the owner closes OPEN_LOOPS L3 (work email confirmed) and L4 (repo public/private, `docs/` in the image). A site with no working contact channel defeats its purpose.
- **Pricing copy:** use "ประเมินฟรีหลังคุย". Show no numbers until the owner confirms a rate.
- **Claims:** no "secure-by-design", "Expert" or badges without at least one concrete example.

**Why:** these came up as disagreements with frontend. Remembering them avoids re-arguing them in a later session.

**How to apply:** when reviewing Lab 04 / 07 / 08, compare the PR against DECISIONS first, then these stances. Related: [[review-recurring-risks]].
