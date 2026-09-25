# Handoff: Claude (frontend) → OpenCode (backend)

Timestamp: 2026-09-25 14:20 +07:00  
Task: Lab 04 Frontend pages → Lab 05 Backend (contact + guestbook API / SQLite)  
Status: NEEDS_REVIEW

## What changed

- `loadProfile()` แก้ bug อ่านแค่บรรทัดแรก (L2) · เพิ่ม `parseProfile(raw)` · field ใหม่ `tagline` · `proof` · `email` · `services` · `interestItems` — **`interests: string[]` คงเดิม** ดังนั้น `GET /api/interests` ไม่เปลี่ยน contract (ตอนนี้คืนครบ 4 ข้อ แทน 1)
- UI 4 หน้า ไทย · ธีมสว่าง · Guestbook ถอดจาก nav/Home (D9) แต่หน้า `/guestbook` ยังอยู่ (noindex) และ render entry ด้วย `textContent`
- Contact: ช่องทางหลัก = `mailto:` · ฟอร์มซ่อนด้วย `const FORM_ENABLED = false` ใน `src/pages/contact.astro`
- **ไม่ได้แตะ** `src/lib/db.ts` หรือ `src/pages/api/*`

## Files

- `src/lib/profile.ts` · `src/layouts/BaseLayout.astro` · `src/pages/{index,about,interests,contact,guestbook}.astro`
- `tests/profile.test.ts` (ใหม่) · `tests/public-site.test.ts` · `vitest.config.ts` (ใช้ `getViteConfig` เพื่อ render `.astro` ใน vitest) · `playwright/smoke.spec.ts`

## Verification

- Unit / smoke: PASS — `npm test` 3 files / 17 tests · `npm run build` ผ่าน
- Labs (`npm run test:labs`): FAIL (คาดไว้ — stubs ยัง `NOT_IMPLEMENTED`)
- Manual / localhost: `node dist/server/entry.mjs` → `/` `/about` `/interests` `/contact` `/guestbook` `/api/interests` = 200 · screenshot desktop + mobile ตรวจแล้ว
- E2E: NOT_RUN — เครื่องยังไม่มี browser ของ Playwright (L13)

## สัญญาที่ UI ใช้ (ห้ามเปลี่ยนโดยไม่ handoff กลับ)

| Route | UI ส่ง | UI คาด |
|---|---|---|
| `POST /api/contact` | `{ name, email, message }` · `message` บรรทัดแรก = `[ประเภทงาน]` (D7 · L7) · `name` ≤ 80 · `email` ≤ 120 · `message` ≤ ~1950 | 201 = สำเร็จ · 400 = "ข้อมูลไม่ครบ" · อื่น ๆ/501 = ชี้ไปอีเมล · **UI ไม่อ่าน `error` body** |
| `GET /api/guestbook` | — | 200 `{ entries: [{ name, message, created_at }] }` · non-2xx = "ยังไม่เปิดใช้งาน" |
| `POST /api/guestbook` | `{ name, message }` · name ≤ 80 · message ≤ 500 | 201 · 400 · อื่น ๆ |

## Assumptions to challenge

1. ใส่ประเภทงานไว้บรรทัดแรกของ `message` เพียงพอสำหรับ v1 — ถ้า backend อยากได้ field แยก ให้เสนอใน handoff กลับ (อย่าเพิ่ม field บังคับจนกว่า UI จะส่ง)
2. UI ไม่แสดง `error` string จาก API เลย — backend จึงไม่ต้องแปลข้อความเป็นไทย แต่ต้องไม่ leak stack/SQL ใน body อยู่ดี (`public-site-safe`)
3. Guestbook ยังไม่ขึ้นเว็บ v1 (D9) — implement API ให้ `test:labs` เขียวได้ แต่ไม่ต้องขอให้ Claude ใส่กลับใน nav

## Request to next agent

OpenCode `@backend` — **implement only, อย่าแก้ UI (`src/pages/*.astro`, `src/layouts/`)**

1. Implement `insertContact` / `listGuestbook` / `insertGuestbook` ใน `src/lib/db.ts` ตามตารางด้านบน + validate ความยาว/รูปแบบ (email) → `npm run test:labs` เขียว · `npm test` ยังเขียว
2. Honeypot + rate limit (D9 · L7): ถ้าทำ ให้ระบุ **ชื่อ field honeypot** และพฤติกรรม (status code) ใน handoff กลับ — UI จะเพิ่ม field เองหลังจากนั้น
3. นโยบายเก็บ/ลบข้อมูล Contact (L7) — เขียนสั้น ๆ ใน handoff กลับ (UI จะไม่เคลมนโยบายที่ระบบไม่ได้ทำ)
4. เขียน `docs/handoffs/05-opencode-to-claude.md` ยืนยันว่า `POST /api/contact` คืน 201 จริง → Claude เปิด `FORM_ENABLED` (L12)
5. ถ้ายังไม่ได้ทำ contract check ของ Lab 04 ขั้น 4: เขียน `docs/fe-be-contract-check.md` (match / mismatch / suggestion)

## Canonical state updated

- [x] `docs/STATUS.md`
- [x] `docs/OPEN_LOOPS.md` (ปิด L2 · L6 · L9 · เปิด L11 OpenCode · L12 Claude · L13 human)
- [ ] `docs/DECISIONS.md` (ไม่มี decision ใหม่)
- [x] อื่น ๆ: `.gitignore` เพิ่ม `.playwright-mcp/`

## Single-writer note

Writer รอบถัดไปของ STATUS/OPEN_LOOPS = OpenCode (หลัง human commit branch นี้แล้ว)
