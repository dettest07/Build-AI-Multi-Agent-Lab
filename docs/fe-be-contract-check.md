# FE ↔ BE Contract Check — Contact / Guestbook

> วันที่: 2026-09-25 · เตรียมก่อน handoff Lab 05 (OpenCode)  
> แหล่งที่อ่าน: `docs/DECISIONS.md` (D7 · D9) · `src/pages/contact.astro` · `src/pages/guestbook.astro` · `src/pages/api/contact.ts` · `src/pages/api/guestbook.ts` · `src/lib/db.ts` · `tests/labs/lab05-api.test.ts`  
> เอกสารวิเคราะห์เท่านั้น — ไม่แก้ไฟล์ใดใน `src/`

## 1. Contact — `POST /api/contact`

### ✅ Match

| ประเด็น | FE (`contact.astro`) | BE (`api/contact.ts` + `db.ts`) |
|---|---|---|
| รูปร่าง payload | JSON `{ name, email, message }` | `insertContact(input: { name, email, message })` — ตรงกันทุก field |
| ประเภทงาน (D7) | แนบเป็น `[worktype]\n` บรรทัดแรกของ `message` — **ไม่เพิ่ม field ใน API** | signature ไม่เปลี่ยน — สอดคล้อง D7 "ไม่แตะ API contract" |
| สถานะสำเร็จ | ใช้ `res.ok` (ยอมรับ 2xx) | คืน **201** + row JSON |
| 400 | แสดงข้อความสุภาพ "ข้อมูลไม่ครบหรือไม่ถูกต้อง…" | error ที่ไม่ใช่ `NOT_IMPLEMENTED` → **400** |
| 501 (D7) | fallback ชี้ไปอีเมล (`form.dataset.email`) | `NOT_IMPLEMENTED` → **501** — ตรงกับ "ข้อความสำรองเมื่อเจอ 501" |
| error ดิบ (D7) | ไม่แสดง error ดิบ / ไม่อ้าง path `/api/*` | ไม่กระทบ (FE แสดงข้อความของตัวเองเสมอ) |
| Lab test | — | `lab05-api.test.ts` ยิง `{name, email, message}` ตรงรูปร่างเดียวกับ FE · คาดหวัง `row.id > 0` + email คืนมา |

### ⚠️ Mismatch / ช่องว่าง

1. **400 กลืน 500** — `api/contact.ts` map ทุก error ที่ไม่ขึ้นต้น `NOT_IMPLEMENTED` เป็น 400 รวมถึง error จาก DB (เช่น SQLITE constraint) → ผู้ใช้จะเห็น "ข้อมูลไม่ครบหรือไม่ถูกต้อง" ทั้งที่ฝั่งเซิร์ฟเวอร์พัง ไม่ใช่ข้อมูลผิด
2. **`maxlength` มีแค่ฝั่ง client** — FE จำกัด name 80 / email 120 / message 1900 แต่เมื่อ implement จริง ถ้า server ไม่ validate ตาม จะเขียนข้อมูลยาวเกินได้ (SQLite ไม่บังคับความยาว)
3. **ความยาว message รวม prefix** — FE ส่ง `[${worktype}]\n` + message(≤1900) → รวมได้ ~1,950+ ตัวอักษร และ convention `[worktype]` มี**อยู่เฉพาะในคอมเมนต์ `contact.astro`** — BE ไม่มีทางรู้ถ้าไม่อ่านไฟล์นั้น
4. **ยังไม่มี validation จริงใน API stub** — ส่ง `body` เข้า `insertContact` ตรง ๆ (`request.json()` คืน `any`) · email format / required fields ต้องเป็นหน้าที่ Lab 05
5. **D9 ระบุ honeypot ทำ "ทั้งสองฝั่งพร้อมกัน"** — ฟอร์ม Contact/Guestbook ปัจจุบัน**ไม่มี honeypot field** และ BE ก็ยังไม่ตรวจ — ถ้า Lab 05 เพิ่มเช็คฝั่ง server ก่อนโดยไม่แจ้งชื่อ field ใน handoff ฟอร์มจะยิงไม่ผ่านทันที
6. **body error เปิดเผย internals** — 400/500 คืน `{ error: err.message }` เช่นข้อความ SQL จริง (FE ไม่แสดง แต่อยู่ใน response ของเว็บสาธารณัน)

### 💡 ข้อเสนอแนะ

- แยก 400 (validation ไม่ผ่าน) ออกจาก 500 (persist fail) ใน `api/contact.ts` — ให้ `insertContact` throw ชนิด error ที่จำแนกได้ หรือ validate ใน route ก่อนเรียก `insertContact`
- บังคับความยาวฝั่ง server ให้ตรง FE: `name ≤ 80` · `email ≤ 120` · `message ≤ 2000` (เผื่อ prefix `[worktype]\n`)
- เขียน convention prefix `[ประเภทงาน]` บรรทัดแรกลงใน handoff Lab 05 + คอมเมนต์ `db.ts` — **ห้าม** BE ตีความ/ตัด prefix ทิ้ง (D7: ไม่แตะ contract)
- ระบุชื่อ honeypot field (ตาม D9) ใน handoff **ก่อน** implement เช็คฝั่ง server แล้ว FE ค่อยเพิ่ม `<input type="text" hidden>` ชื่อเดียวกัน
- validate email format ฝั่ง server ด้วย (FE มีแค่ `type="email"`)

## 2. Guestbook — `GET/POST /api/guestbook`

### ✅ Match

| ประเด็น | FE (`guestbook.astro`) | BE (`api/guestbook.ts` + `db.ts`) |
|---|---|---|
| GET | อ่าน `data.entries` เป็น array | `listGuestbook()` → `{ entries: rows }` — ตรงกัน |
| รูปร่าง entry | `{ name, message, created_at }` (`type Entry`) | `GuestbookEntry` มี field เดียวกัน |
| POST | `Object.fromEntries(FormData)` → `{ name, message }` | `insertGuestbook(input: { name, message })` — ตรง |
| 201 | `res.ok` แล้ว reset + reload list | คืน 201 + row |
| 501 | แสดง "สมุดเยี่ยมยังไม่เปิดใช้งาน" | `NOT_IMPLEMENTED` → 501 ทั้ง GET/POST — สถานะ stub ถูกต้อง |
| XSS (D9) | สร้าง node ด้วย `textContent` ทั้งหมด ไม่มี `innerHTML` | ตรงตาม D9 |
| 400 | แยกข้อความ "ข้อมูลไม่ครบ…" | POST error อื่น → 400 |

### ⚠️ Mismatch / ช่องว่าง

1. **GET map error → 500 แต่ POST → 400** (สมมาตรผิดจาก contact ฝั่ง POST) — DB error จริงจะถูกส่งกลับเป็น "ข้อมูลไม่ครบหรือไม่ถูกต้อง" ต่อผู้ใช้
2. **honeypot + rate limit (D9) ยังไม่มีทั้งสองฝั่ง** — D9 กำหนดให้ OpenCode ทำทั้งคู่ "พร้อมกัน" โดย handoff ต้องระบุชื่อ field — ปัจจุบันไม่มี field ให้ระบุด้วยซ้ำ
3. **`maxlength` client-only** เหมือน Contact: name 80 / message 500 ต้องบังคับฝั่ง server ด้วย
4. **moderation (D9) ไม่มีที่ไหนเลย** — D9/Out-of-scope กำหนด guestbook เปิดจริงได้เมื่อมี moderation แต่ทั้ง API และหน้าเว็บยังไม่มีกลไก (หน้าเว็บ `noindex` และถอดจาก nav แล้ว — ถือว่าลดความเสี่ยงชั่วคราว ไม่ใช่ทางแก้)
5. Guestbook ตาม D9 **ไม่อยู่ใน v1** — การ implement POST จริงต้องรอ handoff ชัดเจน ไม่ใช่แค่ "ทำให้ lab05 เขียว"

### 💡 ข้อเสนอแนะ

- ใน handoff Lab 05 ให้ระบุครบต่อ D9: ชื่อ honeypot field · เพดาน rate limit · เงื่อนไข moderation — แล้ว FE (Claude) เพิ่ม honeypot field พร้อมกันตามชื่อใน handoff
- `GET /api/guestbook` ควรคงรูป `{ entries: [] }` (array ว่างได้) — FE รองรับแล้ว (`Array.isArray(data.entries) ? … : []`)
- จำกัดความยาว server-side: `name ≤ 80` · `message ≤ 500` และเพิ่มเคส limit ใน `tests/labs/`

## 3. สรุป

- **Contract หลักตรงกัน** ทั้ง Contact และ Guestbook — payload/response/status code สอดคล้อง `db.ts` stubs และ `tests/labs/lab05-api.test.ts`
- **ช่องว่างที่ต้องปิดใน handoff Lab 05** (เรียงตามความสำคัญ):
  1. แยก 400 / 500 ใน API routes ทั้งสอง
  2. validation ฝั่ง server: required · format · ความยาว (ตาม `maxlength` ของ FE + เผื่อ prefix)
  3. honeypot: ตกลงชื่อ field ใน handoff ก่อน implement สองฝั่ง (D9)
  4. เอกสาร convention `[worktype]` บรรทัดแรกของ `message` ให้ BE อ่านจาก handoff (ตอนนี้มีในคอมเมนต์ `contact.astro` เท่านั้น)
  5. error response ทั่วไปบน 5xx — อย่าคืนข้อความ DB ดิบ
- ตาม D7: ฟอร์ม Contact **ซ่อนอยู่** (`FORM_ENABLED = false`) — ทุก mismatch ข้างบนไม่ทำให้เว็บ v1 พัง แต่จะกลายเป็นปัญหาทันทีที่เปิด flag หลัง backend พร้อม