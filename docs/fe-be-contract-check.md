# FE ↔ BE Contract Check — Contact / Guestbook

> อัปเดตล่าสุด: 2026-09-25 15:19 +07 — ตรวจซ้ำบน branch `lab-05-backend` หลัง Lab 05 implement แล้ว  
> เวอร์ชันแรกของเอกสารนี้เขียนตอน backend ยังเป็น **stub 501** — ตาราง "ช่องว่างเดิม" คงไว้เพื่ออ้างอิง พร้อมสถานะล่าสุดของแต่ละข้อ  
> แหล่งอ้างอิง: `docs/DECISIONS.md` (D7 · D9) · `docs/handoffs/04-claude-to-opencode.md` · `docs/handoffs/05-opencode-to-claude.md` · `src/lib/db.ts` · `src/lib/ratelimit.ts` · `src/pages/api/*.ts` · ฟอร์มใน `src/pages/*.astro`

## สรุปสถานะ (2026-09-25 15:19 +07)

- **Backend (Lab 05, branch `lab-05-backend`) ปิด mismatch เดิมครบแล้ว** — ดูสรุปใน [`docs/handoffs/05-opencode-to-claude.md`](./handoffs/05-opencode-to-claude.md)
- **ยืนยันแล้ว:** `npm test` **17/17** · `npm run test:labs` **2/2** (แดง → เขียว)
- คงเหลือเป็นงานฝั่ง **FE (Claude · L12)** และ policy ก่อนเปิด guestbook — ดูหัวข้อ 4

## 1. Contract ปัจจุบัน (ยืนยันกับโค้ดจริง)

### `POST /api/contact`

| ประเด็น | FE (`contact.astro`) | BE (`api/contact.ts` + `db.ts`) | สถานะ |
|---|---|---|---|
| payload | `{ name, email, message }` · ประเภทงานแนบ `[worktype]\n` บรรทัดแรกของ `message` (D7 — ไม่แตะ contract) | `insertContact` รับรูปร่างเดียวกัน · **เก็บ prefix ตามเดิม ไม่ parse/ตัด** · limit 1950 เผื่อ prefix | ✅ match |
| สำเร็จ | `res.ok` → "ได้รับแล้ว ผมจะติดต่อกลับทางอีเมล" | **201** + row | ✅ |
| 400 | "ข้อมูลไม่ครบหรือไม่ถูกต้อง…" | `ValidationError` → 400 `{error:"invalid input"}` | ✅ |
| 429 (ใหม่) | ไม่ใช่ ok และไม่ใช่ 400 → fallback ชี้ไปอีเมล | rate limit 5/นาที/IP → **429** | ✅ FE ครอบคลุมอยู่แล้ว (ตกกลุ่ม "อื่น ๆ") |
| 500 | fallback ชี้ไปอีเมล | generic `{error:"internal error"}` — **ไม่ echo** `err.message` (log ที่ server เท่านั้น) | ✅ แก้แล้วจากเดิม |
| 501 stub | — | ไม่มีแล้ว (implement จบ — เส้นทาง 501 หมดไปพร้อมกับ stub) | ✅ |

### `GET / POST /api/guestbook`

| ประเด็น | FE (`guestbook.astro`) | BE (`api/guestbook.ts` + `db.ts`) | สถานะ |
|---|---|---|---|
| GET | อ่าน `data.entries` · entry `{ name, message, created_at }` | 200 `{ entries }` ใหม่สุดก่อน (**เพิ่ม `id`** — FE ไม่ใช้, backward-compatible) | ✅ |
| POST | `Object.fromEntries(FormData)` → `{ name, message }` | `insertGuestbook` — name ≤ 80 · message ≤ 500 ตาม `maxlength` ของฟอร์ม | ✅ |
| XSS (D9) | สร้าง node ด้วย `textContent` ทั้งหมด | ตรงตาม D9 | ✅ |
| 400 vs 500 (POST) | 400 → "ข้อมูลไม่ครบ…" · อื่น ๆ → "ยังไม่เปิดใช้งาน" | `ValidationError` → 400 · อื่น ๆ → 500 generic | ✅ แยกแล้ว |
| GET fail | → UNAVAILABLE | 500 generic | ✅ |

## 2. ช่องว่างเดิม (ตอน stub) → สถานะปัจจุบัน

| # | เดิม (stub 501) | ตอนนี้ | เหลือ |
|---|---|---|---|
| 1 | 400 กลืน 500 — DB error โดนแสดงเป็น "ข้อมูลไม่ครบ" | `ValidationError` → 400 · error อื่น → 500 generic (`api/contact.ts`, `api/guestbook.ts`) | — |
| 2 | `maxlength` มีแค่ฝั่ง client | server validate ครบ: name ≤ 80 · email ≤ 120 + รูปแบบ · message ≤ 1950 (เผื่อ prefix) · guestbook 80/500 (`db.ts` `clean()`) | — |
| 3 | convention `[worktype]` บรรทัดแรกมีอยู่แค่คอมเมนต์ `contact.astro` | ระบุไว้ใน handoff 05 + message limit 1950 รองรับ prefix · BE ไม่ parse/ตัด | — |
| 4 | ไม่มี validation จริง — `request.json()` ส่งเข้า DB ตรง ๆ | validate ครบใน `db.ts` · JSON parse fail → 400 | — |
| 5 | honeypot (D9) ไม่มีทั้งสองฝั่ง ไม่ระบุชื่อ field | **BE พร้อม:** field `website` — non-empty → fake **201** `{ok:true}` ไม่บันทึกลง DB · ว่าง/ไม่ส่ง = ปกติ · สเปค FE อยู่ใน handoff 05 | FE เพิ่ม `<input name="website" type="text" tabindex="-1" autocomplete="off" hidden aria-hidden="true">` — **L12 (Claude)** |
| 6 | 400/500 echo `err.message` (SQL ฯลฯ) | body generic ทั้งหมด · log ฝั่ง server เท่านั้น | — |
| 7 | — (ไม่เคยมี) | rate limit **429** 5/นาที/IP ทั้งสอง POST (in-memory fixed-window — เหมาะกับ deploy 1 instance, ถ้า scale ต้องย้าย shared store) | — |

## 3. ยืนยันการ implement

- `src/lib/db.ts` — 3 helpers ครบ + `ValidationError` · schema เดิมไม่แตะ
- `src/lib/ratelimit.ts` — fixed-window per IP · จัดการ memory (MAX_BUCKETS + cleanup) แล้ว
- Honeypot ฝั่ง server ทำ **fake 201** (บอทเชื่อว่าสำเร็จ) — ต่างจากข้อเสนอเดิมในเอกสารนี้ (400) เพราะ handoff 05 เลือกแบบหลอกบอท — **เห็นด้วย** มาตรฐาน anti-bot ดีกว่า
- Verification 15:19: `npm test` 17/17 · `npm run test:labs` 2/2 — ตรงกับที่ handoff อ้าง

## 4. สิ่งที่ยังค้าง — ไม่ใช่งานฝั่ง OpenCode

1. **L12 (Claude):** เพิ่ม honeypot field `website` ตามสเปค handoff 05 + เปิด `FORM_ENABLED = true` ใน `src/pages/contact.astro` — ต้องทำ **ก่อน** โชว์ฟอร์มจริง ไม่งั้นบอททะลุ (D7 · D9)
2. **D9:** guestbook ยังไม่กลับเข้า nav จนกว่าจะมี moderation — API พร้อมแต่ยังไม่ขอเปิดหน้าสาธารณะ (หน้า `noindex` อยู่)
3. **(เล็กน้อย — แนบไปกับ L12 ได้):** `guestbook.astro` แสดง "สมุดเยี่ยมยังไม่เปิดใช้งาน" เมื่อโดน 429 — ถ้าอยากแยกข้อความ "ส่งบ่อยเกินไป" ให้เพิ่มเคส `res.status === 429` ตอนแก้ FE
4. นโยบายข้อมูล (L7): v1 ไม่มี retention อัตโนมัติ — **UI ห้ามเคลม** ว่าลบข้อมูลอัตโนมัติ (handoff 05)

## 5. ข้อจำกัดที่ยังเปิดอยู่

- **Manual curl ยังไม่ได้รัน** (handoff 05) — แนะนำยืนยัน 201/400/429 จริงตอน QA Lab 06 ร่วมกับ e2e (L13: `npx playwright install chromium`)
- Rate limit แบบ in-memory รีเซ็ตตอน restart — เพียงพอ v1 บน Coolify single instance ถ้า scale หลาย instance ต้องย้ายไป shared store (ระบุใน handoff แล้ว)