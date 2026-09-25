# Handoff: OpenCode (backend) → Claude (frontend)

Timestamp: 2026-09-25 14:50 +07:00  
Task: Lab 05 Backend (contact + guestbook API / SQLite)  
Status: READY — `POST /api/contact` ยืนยันคืน **201 จริง** แล้ว (Claude เปิด `FORM_ENABLED` ได้ตาม L12)

## What changed

- `src/lib/db.ts` — implement ครบ 3 helpers (ไม่แตะ schema เดิม):
  - `insertContact` — trim + validate: `name` ≤ 80 · `email` ≤ 120 + รูปแบบอีเมล · `message` ≤ 1950 → `ValidationError` เมื่อไม่ผ่าน
  - `insertGuestbook` — `name` ≤ 80 · `message` ≤ 500 (ตาม contract UI)
  - `listGuestbook` — `SELECT … ORDER BY id DESC` (ใหม่สุดก่อน) คืน `{ id, name, message, created_at }`
- `src/lib/ratelimit.ts` (ใหม่) — fixed-window in-memory per IP: **5 ครั้ง/นาที** ต่อ `POST /api/contact` และ `POST /api/guestbook` → เกินคืน **429** · ใช้ได้กับ deploy standalone 1 instance (@astrojs/node) — ถ้า scale หลาย instance ต้องย้ายไป shared store
- `src/pages/api/contact.ts` · `src/pages/api/guestbook.ts` — ผูก helpers เข้า route:
  - JSON parse ไม่ได้ / ไม่ใช่ object → 400
  - `ValidationError` → **400 `{ "error": "invalid input" }`** · error อื่น → **500 `{ "error": "internal error" }`** — **ไม่ echo err.message / stack / SQL ใน body อีกต่อไป** (route เดิม echo — แก้แล้ว, public-site-safe)
  - บันทึก log ฝั่ง server (`console.error`) เท่านั้น

## สัญญากับ UI — ไม่เปลี่ยนจากตารางใน handoff 04

| Route | ตอนนี้จริง |
|---|---|
| `POST /api/contact` | 201 (persist แล้ว) · 400 ข้อมูลไม่ผ่าน validation · 429 rate limit · 500 generic — UI ไม่อ่าน `error` body เหมือนเดิม ปลอดภัย |
| `GET /api/guestbook` | 200 `{ entries: [{ id, name, message, created_at }] }` — เพิ่ม `id` ในแต่ละ entry (UI ไม่ได้ใช้, backward-compatible) |
| `POST /api/guestbook` | 201 · 400 · 429 · 500 |

ประเภทงานยังอยู่บรรทัดแรกของ `message` (`[ประเภทงาน]\n…`) ตาม D7/L7 — ไม่มี field แยก, ไม่มี field บังคับใหม่

## Honeypot (D9 · L7) — สำหรับ UI เพิ่ม field เองตามขั้นถัดไป

- **ชื่อ field: `website`** (ชื่อ generic หลอกบอททั่วไป) · ใช้กับทั้ง contact และ guestbook
- UI ใส่ `<input type="text" name="website" tabindex="-1" autocomplete="off" hidden aria-hidden="true">` — **ห้าม** `type="hidden"` ล้วน (บอทบางตัวกรอง) · user ต้องไม่เห็น
- **พฤติกรรม server:** เจอ `website` เป็น string ที่ trim แล้วไม่ว่าง → คืน **201 fake** (`{ "ok": true }`) **และไม่บันทึกลง DB** (ทำให้บอทเชื่อว่าสำเร็จ) · `website` ว่าง/ไม่ส่ง = ปกติ

## นโยบายเก็บ/ลบข้อมูล Contact (L7) — เขียนสั้นตามที่ขอ

- ข้อมูลถูกเก็บใน SQLite ที่ `$DATA_DIR/site.sqlite` (default `./data/`) — **ไม่ commit** (อยู่นอก git อยู่แล้ว)
- **v1 ไม่มี** retention อัตโนมัติ / endpoint ลบ / แจ้งเตือน — ลบด้วยมือโดยเจ้าของผ่าน sqlite client (`DELETE FROM contact_messages WHERE …`)
- **UI จึงอย่าเคลม** ว่า "ลบข้อมูลอัตโนมัติ" หรือระยะเวลาเก็บใด ๆ — ข้อความสำเร็จ D7 ("ได้รับแล้ว ผมจะติดต่อกลับทางอีเมล") ใช้ได้ตามเดิม

## Verification

- `npm run test:labs` — **2/2 PASS** (แดง→เขียวครั้งแรกหลัง implement)
- `npm test` — **17/17 PASS** (ไม่พังงาน frontend เดิม)
- `npm run build` — PASS
- Manual curl ยังไม่ได้รันบนเครื่องนี้ (แนะนำทำตอน QA Lab 06 ร่วมกับ e2e L13)

## Assumption ที่ท้าทายกลับ (จาก handoff 04)

- ประเภทงานในบรรทัดแรกของ `message` เพียงพอ v1 — เห็นด้วย ไม่ขอ field แยก
- 429 เพิ่มจาก contract เดิม (UI ตีความ "อื่น ๆ" → ชี้ไปอีเมล ครอบคลุมอยู่แล้ว ไม่ต้องแก้ UI)

## Request to next agent

Claude `@frontend`:

1. เปิด `FORM_ENABLED = true` ใน `src/pages/contact.astro` (L12) + เพิ่ม honeypot field `website` ตามสเปคด้านบน (contact + guestbook ถ้าเปิดใช้)
2. อย่าแสดง error ดิบ — ยังเหมือนเดิมทุกอย่าง (400/429/500 = ข้อความสำรองเดิม)
3. ยืนยัน Guestbook ยังไม่กลับเข้า nav (D9) — API พร้อมแต่ไม่ได้ขอให้เปิดหน้าเว็บ

## Canonical state updated

- [x] `docs/STATUS.md`
- [x] `docs/OPEN_LOOPS.md`
- [ ] `docs/DECISIONS.md` (ไม่มี decision ใหม่ — honeypot field name / rate limit เป็น implementation detail ตาม D9 ที่ตกลงไว้)

## Single-writer note

Writer รอบถัดไปของ STATUS/OPEN_LOOPS = Claude (หลัง merge branch `lab-05-backend`)