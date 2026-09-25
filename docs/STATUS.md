# Project Status

> คัดลอกเป็น `docs/STATUS.md` ใน Lab 00 · อ่านทุก session · **สั้น** · single-writer ต่อรอบ  
> ดู [`COURSE.md`](../COURSE.md) ชั้น State (Hot)

Last updated: 2026-09-25 +07:00  
Updated by: Claude (frontend · Lab 04)

## Current goal

- Lab 04 UI เสร็จบน branch `lab-04-frontend` → ส่งต่อ OpenCode ทำ backend Lab 05 (ดู `docs/handoffs/04-claude-to-opencode.md`)

## Done

- Lab 00: `/init` merge เข้า `CLAUDE.md` (API contract · env · DB gotcha) — เก็บกฎ seed ครบ
- Lab 01: `docs/PROFILE.md` กรอกจากการสัมภาษณ์ 9 ข้อ + `## Brainstorm`
- Lab 02: `DEBATE.md` → `DECISIONS.md` D1–D14 · PROFILE แยก `## Tagline` / `## Proof` (D13)
- Lab 03: GitHub issues #1–#13 ครบ D1–D14
- Lab 04 (2026-09-25): parser อ่านทุกบรรทัด + Tagline / Proof / Contact email / Services (L2 · #1) · Hero D1 (#2) · Thai nav 4 หน้า + "ติดต่อ" เป็นปุ่ม (#5) · ธีมสว่าง CSS vars + ลบข้อความ dev/คอร์ส (#9) · Contact mailto + ฟอร์มซ่อนด้วย `FORM_ENABLED` (#6 · #7) · Guestbook ออกจาก nav/Home + `textContent` + noindex (L6 · #8) · test กันหลุด 3 ชั้น (frontmatter literal + Astro Container render + ไม่ตก FALLBACK) (L9 · #10)
- Persistent memory (harness `memory: project`): `.claude/agent-memory/reviewer/` · `.claude/agent-memory/frontend/`

## In progress

- Lab 04: เปิด PR (body เตรียมแล้ว) · call ข้าม harness ให้ OpenCode เขียน `docs/fe-be-contract-check.md` (ยังไม่รัน)

## Blocked

- ship: L3 / L4 / L5 ยังเปิด (D14)

## Next actions

1. human: commit `docs/PROFILE.md` (ไม่เคย commit ตั้งแต่ Lab 01 · มีอีเมล → ดู L4 ก่อน push ถ้า repo public) · commit + push + เปิด PR
2. `opencode run` contract check → `docs/fe-be-contract-check.md` (Lab 04 ขั้น 4)
3. OpenCode Lab 05: ตาม handoff `04-claude-to-opencode.md`
4. Claude หลัง Lab 05: เปิด `FORM_ENABLED` ใน `src/pages/contact.astro` เมื่อ handoff กลับยืนยัน `POST /api/contact` = 201

## Files changed in latest session

- `src/lib/profile.ts` · `src/layouts/BaseLayout.astro` · `src/pages/{index,about,interests,contact,guestbook}.astro`
- `tests/profile.test.ts` (ใหม่) · `tests/public-site.test.ts` · `vitest.config.ts` (`getViteConfig`) · `playwright/smoke.spec.ts` · `.gitignore` (`.playwright-mcp/`)
- `docs/STATUS.md` · `docs/OPEN_LOOPS.md` · `docs/handoffs/04-claude-to-opencode.md`

## Notes

- Proposed vs Approved: brainstorm อยู่ใน `DEBATE.md` — สิ่งที่ปิดแล้วอยู่ใน `DECISIONS.md`
- `npm test` 17/17 · `npm run build` ผ่าน · `test:labs` ยังแดงตามคาด (Lab 05) · e2e ยังไม่รัน: เครื่องนี้ยังไม่ได้ `npx playwright install`
