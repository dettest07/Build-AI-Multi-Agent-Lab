# BE ↔ FE Integration Check — Contact / Guestbook (หลัง Lab 05)

> วันที่: 2026-09-25 · ผู้ตรวจ: Claude (frontend) · branch `lab-05-backend`
> แหล่งที่อ่าน: `docs/DECISIONS.md` (D7 · D9) · `docs/handoffs/04-claude-to-opencode.md` · `docs/handoffs/05-opencode-to-claude.md` · `docs/fe-be-contract-check.md` · `src/pages/contact.astro` · `src/pages/guestbook.astro` · `src/pages/api/contact.ts` · `src/pages/api/guestbook.ts` · `src/lib/db.ts` · `src/lib/ratelimit.ts`
> เอกสารวิเคราะห์เท่านั้น ไม่ได้แก้ไฟล์ใดใน `src/` · ไม่ได้รัน curl หรือ e2e (อ่านจากโค้ดอย่างเดียว)

## สรุปสั้น

- **สัญญาหลักตรงกัน:** field, HTTP method, `content-type`, 201/400 และการไม่แสดง error ดิบ ตรงกันทั้ง Contact และ Guestbook
- ช่องว่างจาก `fe-be-contract-check.md` ฝั่ง backend **ปิดครบแล้ว** ได้แก่ แยก 400/500 · validate ความยาวและรูปแบบฝั่ง server · ไม่ echo `err.message` · ประกาศชื่อ honeypot · มี rate limit
- **ต้องแก้ก่อนเปิด `FORM_ENABLED` (L12):** ฟอร์ม Contact สร้าง payload เองทีละ field ถ้าเพิ่มแค่ `<input name="website">` ค่านี้จะ**ไม่ถูกส่ง**ไป server เลย (ดู C-M1)
- **ความเสี่ยงตอน deploy:** rate limit ใช้ `clientAddress` ถ้าอยู่หลัง reverse proxy ของ Coolify ผู้ใช้ทุกคนอาจใช้ bucket เดียวกัน คือรวมกันได้ 5 ครั้งต่อนาที (ดู X-M1)

---

## 1. Contact — `POST /api/contact`

สถานะ UI: ฟอร์มยังซ่อน (`FORM_ENABLED = false` ที่ `src/pages/contact.astro:10`) ตอนนี้จึงยังไม่มี request จริงจาก UI

### ✅ Match

| ประเด็น | FE (`contact.astro`) | BE (`api/contact.ts` + `db.ts`) |
|---|---|---|
| Method / URL | `fetch('/api/contact', { method: 'POST' })` (:90–91) | export `POST` อย่างเดียว (:19) |
| Content-Type | `application/json` + `JSON.stringify(payload)` | `request.json()` · parse ไม่ได้หรือไม่ใช่ object → 400 (:24–25) |
| Field | `{ name, email, message }` (:83–87) | `insertContact({ name, email, message })` |
| ประเภทงาน (D7) | ต่อหน้า `message` เป็น `[ประเภทงาน]\n` · ไม่ส่ง `worktype` เป็น field แยก | ไม่มี field ใหม่ · handoff 05 ยืนยันว่าไม่ตัดหรือตีความ prefix |
| ความยาว `name` | `maxlength="80"` | `clean(…, 80)` |
| ความยาว `email` | `maxlength="120"` + `type="email"` | `clean(…, 120)` + `EMAIL_RE` |
| ความยาว `message` | `maxlength="1900"` + prefix ยาวสุด 36 ตัว (`[ที่ปรึกษา architecture / security]\n`) = 1,936 | `clean(…, 1950)` · ยังเหลือเผื่อ 14 ตัว |
| สำเร็จ | `res.ok` → "ได้รับแล้ว ผมจะติดต่อกลับทางอีเมล" + `form.reset()` | 201 + row |
| honeypot 201 ปลอม | `res.ok` ก็เป็น true กับ `{ ok: true }` · UI ไม่อ่าน body | 201 `{ ok: true }` และไม่บันทึกลง DB |
| 400 | "ข้อมูลไม่ครบหรือไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง" | `ValidationError` หรือ JSON เสีย → 400 `{ error: 'invalid input' }` |
| 500 / network | ใช้ข้อความสำรองที่ชี้ไปอีเมล (D7) | 500 `{ error: 'internal error' }` · log อยู่ฝั่ง server อย่างเดียว |
| error ดิบ (D7 · public-site-safe) | ไม่อ่าน `error` body | body เป็นข้อความทั่วไป ไม่มี SQL หรือ stack |
| นโยบายข้อมูล (L7) | ข้อความสำเร็จไม่ได้เคลมเรื่อง retention | v1 ไม่มี retention อัตโนมัติ ตรงกับที่ UI ไม่เคลม |

### ⚠️ Mismatch

- **C-M1 · honeypot ไปไม่ถึง server (P1 · ปิดทางเปิด L12)**
  - `payload` ที่ `contact.astro:83–87` หยิบเฉพาะ `name`, `email` และ `message`
  - ถ้าเพิ่ม `<input name="website">` ตาม handoff 05 โดยไม่แก้ script ค่าจะหายตั้งแต่ฝั่ง client บอทที่กรอกช่องนี้จะถูกบันทึกลง DB เหมือนผู้ใช้ปกติ ทำให้ honeypot ไม่มีผล
  - Guestbook ไม่มีปัญหานี้ เพราะใช้ `Object.fromEntries(FormData)` ซึ่งส่งทุก field
- **C-M2 · 429 แสดงข้อความผิดความหมาย (P2)**
  - 429 ตกไปที่ `else` ซึ่งใช้ข้อความ "ตอนนี้ยังส่งผ่านฟอร์มไม่ได้ กรุณาส่งอีเมลถึง …"
  - ข้อความนี้ยังพาไปอีเมลได้ ไม่ผิด D7 แต่ผู้ใช้จะเข้าใจว่าฟอร์มพัง ทั้งที่แค่ส่งถี่เกินไป
  - Handoff 05 บอกว่า "ไม่ต้องแก้ UI" ซึ่งจริงในแง่การทำงาน แต่ยังไม่ดีในแง่ UX
- **C-M3 · ส่งได้ทั้งที่ข้อความว่าง (P2)**
  - Browser ถือว่า `required` ผ่านเมื่อกรอกแค่ช่องว่าง
  - UI ต่อ prefix แล้วได้ `"[อื่น ๆ]\n   "` ซึ่ง trim แล้วไม่ว่าง server จึงรับเป็นข้อความที่มีแต่ประเภทงาน
  - `name` ที่เป็นช่องว่างล้วนไม่มีปัญหานี้ เพราะ server ตอบ 400 ตามที่ควร
- **C-M4 · กฎอีเมลของ browser กับ server ไม่เท่ากัน (P3)**
  - `type="email"` รับ `a@b` (ไม่มีจุด) แต่ `EMAIL_RE` บังคับให้มีจุด
  - ผลคือได้ 400 และข้อความ "ข้อมูลไม่ครบหรือไม่ถูกต้อง" ซึ่งยอมรับได้ แต่ผู้ใช้ไม่รู้ว่าผิดที่ช่องไหน
- **C-M5 · กด submit ซ้ำได้ (P3)**
  - ระหว่างสถานะ "กำลังส่ง…" ปุ่มไม่ถูก disable
  - กดซ้ำจะได้แถวซ้ำใน DB และทำให้ชนเพดาน 5 ครั้งต่อนาทีเร็วขึ้น
- **C-M6 · เผื่อความยาวน้อย (P3)**
  - เหลือ margin แค่ 14 ตัวอักษร
  - ถ้าวันหน้าเพิ่มประเภทงานที่ชื่อยาวกว่า 48 ตัว หรือ browser นับขึ้นบรรทัดใหม่ต่างไปจากที่คาด (CRLF) ผู้ใช้ที่พิมพ์เต็ม 1,900 ตัวจะได้ 400 โดยไม่รู้สาเหตุ

### 💡 Suggestion (FE · Claude ทำเองได้ตอน L12)

1. เพิ่ม `website: String(fd.get('website') || '')` ใน `payload` พร้อมกับ input honeypot ตามสเปคใน handoff 05: `type="text"` · `tabindex="-1"` · `autocomplete="off"` · `hidden` · `aria-hidden="true"`
2. แยก `res.status === 429` ออกมาเป็นข้อความของตัวเอง เช่น "ส่งบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่" และคงข้อความสำรองที่ชี้ไปอีเมลไว้สำหรับ 5xx และ network error
3. ตรวจ `message.trim()` ก่อนต่อ prefix ถ้าว่างให้แสดงข้อความเดียวกับกรณี 400 และไม่ยิง request
4. Disable ปุ่มระหว่างรอ response แล้วเปิดกลับใน `finally`
5. อาจใส่ `pattern` ให้ `type="email"` ตรงกับ `EMAIL_RE` (มีจุดหลัง `@`) เพื่อให้ browser เตือนก่อนส่ง

---

## 2. Guestbook — `GET / POST /api/guestbook`

สถานะ UI: หน้า `/guestbook` เปิดได้ผ่าน URL · `noindex` · ไม่มีใน nav (D9)

### ✅ Match

| ประเด็น | FE (`guestbook.astro`) | BE (`api/guestbook.ts` + `db.ts`) |
|---|---|---|
| GET method / URL | `fetch('/api/guestbook')` (GET เป็นค่า default) | export `GET` → 200 `{ entries }` |
| รูปร่าง entry | `type Entry = { name, message, created_at }` | `{ id, name, message, created_at }` · `id` ที่เพิ่มมาไม่กระทบ UI |
| ลำดับ | render ตามลำดับ array | `ORDER BY id DESC` คือใหม่สุดก่อน |
| กรณีไม่มีข้อมูล | `Array.isArray(data.entries)` แล้วแสดง "ยังไม่มีข้อความ" | คืน `[]` ได้ |
| POST method / body | `POST` + JSON จาก `Object.fromEntries(FormData)` → `{ name, message }` | `insertGuestbook({ name, message })` |
| ความยาว | `name` 80 · `message` 500 | `clean(…, 80)` · `clean(…, 500)` |
| honeypot | `Object.fromEntries` ส่ง `website` ไปเองเมื่อเพิ่ม input | ตรวจ `website` แล้วตอบ 201 ปลอม |
| 201 | reset ฟอร์มแล้ว `load()` ใหม่ | 201 + row |
| 400 | "ข้อมูลไม่ครบหรือไม่ถูกต้อง" | `ValidationError` หรือ JSON เสีย → 400 |
| XSS (D9) | ใช้ `textContent` และ `createElement` ทั้งหมด ไม่มี `innerHTML` | server เก็บข้อความตามที่รับมา (หลัง trim) ความปลอดภัยจึงขึ้นกับ FE ซึ่งทำถูกแล้ว |

### ⚠️ Mismatch

- **G-M1 · ข้อความสำรองล้าสมัย (P2)**
  - 429 และ 500 ของ POST, รวมถึง non-2xx ของ GET แสดง `UNAVAILABLE = 'สมุดเยี่ยมยังไม่เปิดใช้งาน'`
  - ตอนนี้ API ใช้งานได้จริงแล้ว ข้อความนี้จึงไม่ตรงกับความจริง โดยเฉพาะกรณี 429
- **G-M2 · หน้าเขียนข้อมูลได้จริงแล้วทั้งที่ D9 บอกว่าไม่อยู่ใน v1 (P1 · ต้องตัดสินใจ)**
  - ก่อน Lab 05 API ตอบ 501 หน้านี้จึงปิดโดยปริยาย
  - ตอนนี้ใครที่รู้ URL `/guestbook` จะโพสต์ได้และข้อความแสดงสาธารณะทันที ทั้งที่ยังไม่มี moderation
  - Handoff 05 ข้อ 3 บอกแค่ว่า "ไม่ได้ขอให้เปิดหน้าเว็บ" แต่ในทางปฏิบัติหน้าเปิดอยู่แล้ว
- **G-M3 · `created_at` แสดงเป็น UTC ดิบ (P3)**
  - SQLite `datetime('now')` คืนรูปแบบ `YYYY-MM-DD HH:MM:SS` ที่เป็น UTC และไม่มี timezone
  - UI แสดงสตริงนี้ตรง ๆ เวลาจึงช้ากว่าเวลาไทย 7 ชั่วโมง
- **G-M4 · ไม่มีสถานะ "กำลังส่ง" และปุ่มไม่ถูก disable (P3):** ปัญหาเดียวกับ C-M5
- **G-M5 · คอมเมนต์ล้าสมัย (P3):** `guestbook.astro:3` ยังเขียนว่า honeypot และ rate limit "not implemented" ไม่มีผลกับผู้ใช้ แต่ทำให้คนที่อ่านโค้ดเข้าใจผิด

### 💡 Suggestion

1. **(human หรือ D9)** ตัดสินว่าจะปิดหน้า guestbook ระหว่าง v1 หรือไม่ ถ้าปิด FE ใส่ flag แบบเดียวกับ `FORM_ENABLED` เพื่อซ่อนฟอร์ม หรือ BE ปิด `POST` ไว้ชั่วคราว ควรบันทึกเป็น loop ใน `OPEN_LOOPS`
2. แยกข้อความตาม status ได้แก่ 429 "ส่งบ่อยเกินไป…" · 5xx "ระบบขัดข้อง กรุณาลองใหม่ภายหลัง" · และใช้ "ยังไม่เปิดใช้งาน" เฉพาะเมื่อตั้งใจปิดจริง
3. แปลง `created_at` เป็นเวลาไทย เช่น `new Date(s.replace(' ', 'T') + 'Z').toLocaleString('th-TH')` และถ้า parse ไม่ได้ให้ fallback เป็นสตริงเดิม
4. เพิ่ม honeypot `website` ในฟอร์ม guestbook (ไม่ต้องแก้ script) และอัปเดตคอมเมนต์บรรทัด 3

---

## 3. ประเด็นข้ามทั้งสอง route (ส่งต่อ OpenCode · backend)

- **X-M1 · rate limit หลัง reverse proxy (P1 ก่อน ship)**
  - `ip = clientAddress || x-forwarded-for` จะใช้ `clientAddress` ก่อนเสมอ
  - บน Coolify (Traefik) ค่านี้น่าจะเป็น IP ของ proxy ผู้ใช้ทุกคนจึงอาจแชร์ bucket เดียว คือรวมกันได้ 5 ครั้งต่อนาทีทั้งเว็บ
  - ถ้าสลับไปเชื่อ `x-forwarded-for` ตรง ๆ ก็ปลอมค่าได้
  - แนะนำให้ BE ตรวจใน QA (Lab 06) หรือหลัง deploy และเลือกอ่าน header จาก proxy ที่เชื่อถือได้เท่านั้น
  - ในมุม FE ถ้าเกิดปัญหานี้ ผู้ใช้จะเห็นข้อความสำรองที่ชี้ไปอีเมลบ่อยผิดปกติ (หรือข้อความ 429 ถ้าทำตามข้อเสนอ C-2)
- **X-M2 · สัญญาใน `CLAUDE.md` ล้าสมัย (P2 · เอกสาร)**
  - ตาราง API contract ยังเขียนว่า `NOT_IMPLEMENTED* → 501` และ "stubs throwing…"
  - โค้ดจริงไม่คืน 501 แล้ว แต่มี 429 และ 500 แยกจาก 400
  - ควรอัปเดตตารางให้ตรงกับ handoff 05 (ไฟล์กฎ ต้องให้ human อนุมัติ)
- **X-M3 · honeypot ตอบ body คนละรูป (ไม่ใช่ปัญหา):** 201 ปลอมคืน `{ ok: true }` ส่วน 201 จริงคืน row · UI ทั้งสองหน้าดูแค่ `res.ok` จึงไม่กระทบ แต่ถ้าวันหน้า UI อ่าน `id` จาก response ต้องระวังกรณีนี้

## 4. ลำดับงานที่แนะนำ

| # | งาน | Owner | ผูกกับ |
|---|---|---|---|
| 1 | Contact: เพิ่ม input `website` **และ** ส่ง `website` ใน `payload` แล้วค่อยเปิด `FORM_ENABLED` | Claude | L12 · C-M1 |
| 2 | ตัดสินว่าหน้า guestbook จะรับโพสต์ใน v1 หรือไม่ | human | D9 · G-M2 |
| 3 | ตรวจ IP ของ rate limit หลัง proxy | OpenCode | X-M1 · Lab 06/08 |
| 4 | ข้อความ 429 · ตรวจข้อความว่าง · disable ปุ่ม · เวลาไทย | Claude | C-M2..5 · G-M1, G-M3..5 |
| 5 | อัปเดตตาราง contract ใน `CLAUDE.md` | human | X-M2 |
| 6 | ทดสอบด้วย curl หรือ e2e: 201 · 400 · 429 · honeypot 201 ที่ไม่บันทึกลง DB | QA | L13 · Lab 06 |
