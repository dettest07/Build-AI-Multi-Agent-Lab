# Project Status

> คัดลอกเป็น `docs/STATUS.md` ใน Lab 00 · อ่านทุก session · **สั้น** · single-writer ต่อรอบ  
> ดู [`COURSE.md`](../COURSE.md) ชั้น State (Hot)

Last updated: 2026-09-25 16:00 +07:00  
Updated by: OpenCode (reviewer · Lab 07 Round 2)

## Current goal

- Lab 07: cross-model review ปิดรอบแล้ว (`docs/review-opencode.md` Round 2) → PR #14 **รอ merge จนกว่า human ปิด L4** (Must 1) · follow-up L14/L15 ถูกเปิด

## Done

- Lab 00: `/init` merge เข้า `CLAUDE.md` (API contract · env · DB gotcha) — เก็บกฎ seed ครบ
- Lab 01: `docs/PROFILE.md` กรอกจากการสัมภาษณ์ 9 ข้อ + `## Brainstorm`
- Lab 02: `DEBATE.md` → `DECISIONS.md` D1–D14 · PROFILE แยก `## Tagline` / `## Proof` (D13)
- Lab 03: GitHub issues #1–#13 ครบ D1–D14
- Lab 04 (2026-09-25): parser อ่านทุกบรรทัด + Tagline / Proof / Contact email / Services (L2 · #1) · Hero D1 (#2) · Thai nav 4 หน้า + "ติดต่อ" เป็นปุ่ม (#5) · ธีมสว่าง CSS vars + ลบข้อความ dev/คอร์ส (#9) · Contact mailto + ฟอร์มซ่อนด้วย `FORM_ENABLED` (#6 · #7) · Guestbook ออกจาก nav/Home + `textContent` + noindex (L6 · #8) · test กันหลุด 3 ชั้น (frontmatter literal + Astro Container render + ไม่ตก FALLBACK) (L9 · #10)
- Lab 05 (2026-09-25 · branch `lab-05-backend`): `src/lib/db.ts` insertContact / insertGuestbook / listGuestbook + validation (name ≤ 80 · email ≤ 120+รูปแบบ · message ≤ 1950/500) · `src/lib/ratelimit.ts` in-memory 5 req/min/IP → 429 · honeypot field `website` → fake 201 ไม่ persist · API routes ไม่ echo error ดิบ (400/429/500 generic) · `test:labs` เขียว 2/2 · `npm test` 17/17 · build ผ่าน · handoff `05-opencode-to-claude.md`
- Lab 06 E2E (2026-09-25 · Playwright MCP · dev server): 16/16 PASS — pages 200 · API contact/guestbook 201/400 · honeypot · XSS escaped · noindex · results in `docs/QA.md` `## E2E Playwright` · screenshots in `docs/screenshots/`
- Persistent memory (harness `memory: project`): `.claude/agent-memory/reviewer/` · `.claude/agent-memory/frontend/`

## In progress

- Lab 07 (branch `lab-06-qa-fix`): artifacts ครบ (`review-opencode.md` + `review-claude-rebuttal.md` + Round 2) · guestbook UI gate (`GUESTBOOK_ENABLED=false`) แก้แล้ว · เหลือ: human โพสต์ PR comment (ขั้น 5) + commit/push (ขั้น 6)

## Blocked

- merge PR #14: L4 (repo public/private — อีเมล + Brainstorm ใน PROFILE ถูก push แล้วใน `5c56941`) · ship: L3 / L5 ยังเปิด (D14)

## Next actions

1. human: ตัดสิน L4 (แนะนำ: ตั้ง repo private ก่อน — ทางเลือกอื่นใน `docs/review-claude-rebuttal.md`) → แล้ว merge PR #14 → PR #15 ตามลำดับ stack
2. OpenCode: L14 — gate `POST /api/guestbook` ฝั่ง server จนกว่า moderation จะพร้อม (F1) + จัด moderation กับ human (F2)
3. Claude: L12 เปิด `FORM_ENABLED` + honeypot `website` · L15 (F3–F5 follow-up จาก review)
4. human: โพสต์ PR comment สรุป Lab 07 บน PR #14 (README ขั้น 5) · commit artifacts (ขั้น 6 — OpenCode commit ให้แล้ว)

## Files changed in latest session

- `src/pages/guestbook.astro` · `tests/public-site.test.ts` (Claude แก้ตาม Must 2 — guestbook UI gate)
- `docs/review-opencode.md` · `docs/review-claude-rebuttal.md` · `docs/STATUS.md` · `docs/OPEN_LOOPS.md`

## Notes

- Proposed vs Approved: brainstorm อยู่ใน `DEBATE.md` — สิ่งที่ปิดแล้วอยู่ใน `DECISIONS.md`
- `npm test` 18/18 (+1 จาก guestbook gate) · `npm run build` ผ่าน · `test:labs` เขียว 2/2 · e2e 16/16 (Lab 06 บน dev server · `npm run test:e2e` ยังไม่เคยรันผ่าน CLI — L13)
