# Project Status

> คัดลอกเป็น `docs/STATUS.md` ใน Lab 00 · อ่านทุก session · **สั้น** · single-writer ต่อรอบ  
> ดู [`COURSE.md`](../COURSE.md) ชั้น State (Hot)

Last updated: 2026-09-25 14:50 +07:00  
Updated by: OpenCode (backend · Lab 05)

## Current goal

- Lab 05 backend เสร็จบน branch `lab-05-backend` (insertContact / guestbook / SQLite) → เปิด PR → Claude เปิด `FORM_ENABLED` (L12)

## Done

- Lab 00: `/init` merge เข้า `CLAUDE.md` (API contract · env · DB gotcha) — เก็บกฎ seed ครบ
- Lab 01: `docs/PROFILE.md` กรอกจากการสัมภาษณ์ 9 ข้อ + `## Brainstorm`
- Lab 02: `DEBATE.md` → `DECISIONS.md` D1–D14 · PROFILE แยก `## Tagline` / `## Proof` (D13)
- Lab 03: GitHub issues #1–#13 ครบ D1–D14
- Lab 04 (2026-09-25): parser อ่านทุกบรรทัด + Tagline / Proof / Contact email / Services (L2 · #1) · Hero D1 (#2) · Thai nav 4 หน้า + "ติดต่อ" เป็นปุ่ม (#5) · ธีมสว่าง CSS vars + ลบข้อความ dev/คอร์ส (#9) · Contact mailto + ฟอร์มซ่อนด้วย `FORM_ENABLED` (#6 · #7) · Guestbook ออกจาก nav/Home + `textContent` + noindex (L6 · #8) · test กันหลุด 3 ชั้น (frontmatter literal + Astro Container render + ไม่ตก FALLBACK) (L9 · #10)
- Lab 05 (2026-09-25 · branch `lab-05-backend`): `src/lib/db.ts` insertContact / insertGuestbook / listGuestbook + validation (name ≤ 80 · email ≤ 120+รูปแบบ · message ≤ 1950/500) · `src/lib/ratelimit.ts` in-memory 5 req/min/IP → 429 · honeypot field `website` → fake 201 ไม่ persist · API routes ไม่ echo error ดิบ (400/429/500 generic) · `test:labs` เขียว 2/2 · `npm test` 17/17 · build ผ่าน · handoff `05-opencode-to-claude.md`
- Persistent memory (harness `memory: project`): `.claude/agent-memory/reviewer/` · `.claude/agent-memory/frontend/`

## In progress

- Lab 05: เปิด PR จาก branch `lab-05-backend` (ข้อความ PR เตรียมแล้วในเซสชัน OpenCode) · รอ human commit/push

## Blocked

- ship: L3 / L4 / L5 ยังเปิด (D14)

## Next actions

1. human: commit + push branch `lab-05-backend` แล้วเปิด PR (ดูข้อความ PR ที่ OpenCode เตรียม) · merge หลัง review
2. Claude: เปิด `FORM_ENABLED` ใน `src/pages/contact.astro` + เพิ่ม honeypot `website` — ตาม handoff `05-opencode-to-claude.md` (ยืนยัน `POST /api/contact` = 201 แล้ว · L12)
3. human: ตัดสิน L3 / L4 (อีเมล PROFILE · public/private repo) ก่อน push PROFILE
4. Lab 06 QA: e2e + ทดสอบ API จริงผ่าน curl/เบราว์เซอร์ (L13)

## Files changed in latest session

- `src/lib/db.ts` · `src/lib/ratelimit.ts` (ใหม่) · `src/pages/api/contact.ts` · `src/pages/api/guestbook.ts`
- `docs/STATUS.md` · `docs/OPEN_LOOPS.md` · `docs/handoffs/05-opencode-to-claude.md`

## Notes

- Proposed vs Approved: brainstorm อยู่ใน `DEBATE.md` — สิ่งที่ปิดแล้วอยู่ใน `DECISIONS.md`
- `npm test` 17/17 · `npm run build` ผ่าน · `test:labs` **เขียวแล้ว 2/2** (Lab 05) · e2e ยังไม่รัน: เครื่องนี้ยังไม่ได้ `npx playwright install` (L13)
