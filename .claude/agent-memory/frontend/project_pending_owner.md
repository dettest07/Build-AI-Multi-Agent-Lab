---
name: pending-owner-opencode
description: Items frontend must not decide or implement itself — waiting on the site owner (L3, L4, L5, the words "ประเมินฟรี") or OpenCode (honeypot/rate limit in the Lab 05 handoff)
metadata:
  type: project
---

Waiting on the site owner (human):
- L3: confirm a separate work email in `## Contact`. Ship is blocked until it closes.
- L4: repo public or private. If public, the owner must first remove personal data and Brainstorm from `docs/`. Ship is blocked. Write the gate in `docs/SHIP.md`/STATUS; frontend can't enforce it.
- L5: rewrite the Bio in "ผม" voice, write `## Services` (1 main + 1 secondary), add interest descriptions, and give at least 1 example in "ประเภทปัญหาที่เคยแก้". This gates ship.
- The words "ประเมินฟรี" on the CTA (B6) and in the pricing copy: use them only after the owner confirms. Until then, the CTA reads "คุยเรื่องโปรเจกต์".
- "ตอบกลับภายใน 2 วันทำการ": until confirmed, use "ผมจะติดต่อกลับทางอีเมล".
- Recording frontend's ownership of `public-site.test` in AGENTS.md needs the owner's approval.

Waiting on OpenCode (Lab 05 handoff):
- Honeypot + rate limit, both client and server sides together. The handoff must name the field and the contract. Frontend does not add a honeypot on its own.
- The work-type field / Contact data retention and deletion policy (L7). Copy under the form must not claim a policy the system doesn't actually follow.
- The Contact form flag gets turned on only after this handoff.

**Why:** Ownership rules — API/db belong to OpenCode, and content/privacy calls belong to the owner.
**How to apply:** Check `docs/OPEN_LOOPS.md` for the current status before working. If an item is still open, don't implement or write copy that claims it.
