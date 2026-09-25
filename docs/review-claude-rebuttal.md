# Rebuttal — Claude → OpenCode review of PR #14

> วันที่: 2026-09-25 · ผู้ตอบ: Claude (frontend) · Branch: `lab-06-qa-fix`  
> Input: `docs/review-opencode.md` · `docs/DECISIONS.md` · `docs/STATUS.md` · `docs/OPEN_LOOPS.md` · ไม่มี `docs/handoffs/07-opencode-to-claude.md`  
> ขอบเขต: แก้เฉพาะไฟล์ frontend (`src/pages/guestbook.astro` · `tests/public-site.test.ts`) · ไม่แตะ `src/pages/api/**` · `src/lib/db.ts` · `src/lib/ratelimit.ts` · ไม่เรียก OpenCode / ไม่ใช้ MCP ข้าม CLI

## Must fix

### Must 1 — `docs/PROFILE.md` (อีเมลจริง + `## Brainstorm`) ขึ้น GitHub — **ยอมรับว่าเป็นความเสี่ยงจริง · แก้ด้วยโค้ดไม่ได้ → ขอกัน merge จนกว่า human ปิด L4**

ตรวจแล้ว:
- `docs/PROFILE.md` ถูก track และ commit ใน `5c56941` (Lab 04) ซึ่ง push ขึ้น `origin/lab-04-frontend` แล้ว → reviewer พูดถูก: repo public เมื่อไหร่ก็อ่านได้ทันที ไม่ต้องรอ merge
- **ข้อมูลขัดกัน:** `docs/OPEN_LOOPS.md` L4 ยังเขียนว่า "`docs/PROFILE.md` ยังไม่เคย commit" — ไม่จริงแล้ว (writer รอบ 2 ต้องแก้)
- ยังไม่ได้ยืนยัน visibility ของ repo จริง (`gh repo view` รอ permission ในเซสชันนี้) — human ต้องเช็กเอง

ทำไมไม่แก้เองในรอบนี้: ลบ/แก้ไฟล์บน branch **ไม่ลบออกจาก git history** · การเลือกว่าจะ public/private และอีเมลไหนใช้บนเว็บเป็นการตัดสินของ human (D14 · L3 · L4) · frontend บังคับ gate เองไม่ได้

ทางเลือกเสนอ human (เรียงตามแนะนำ):
1. **ตั้ง repo เป็น private ทันที** (เร็วสุด · ย้อนกลับได้) — แล้วค่อยตัดสินข้ออื่นแบบไม่รีบ
2. **แยก PROFILE เป็น 2 ไฟล์:** `docs/PROFILE.md` เหลือเฉพาะหัวข้อที่ parser อ่าน (Name · Headline · Tagline · Proof · Bio · Interests · Services · Contact) · ย้าย `## Brainstorm` + โน้ตภายในไปไฟล์ที่ gitignore (เช่น `docs/_cli-profile-notes.md` — pattern `docs/_cli-*` ignore อยู่แล้ว) · ทำให้ Dockerfile ที่ copy `docs/` ไม่พาโน้ตภายในลง image ด้วย
3. **อีเมลงานแยก (L3):** อีเมลใน `## Contact` จะขึ้นหน้า `/contact` อยู่ดี (ตั้งใจตาม D7) — ปัญหาจริงคือ *อีเมลส่วนตัว* ไม่ใช่การที่มีอีเมล · ย้ายไป env ไม่ช่วยเรื่องความเป็นส่วนตัวบนเว็บ แค่ช่วยเรื่อง repo
4. ถ้าจะ **public และข้อมูลหลุดไปแล้ว** → ต้อง rewrite history (`git filter-repo`) + force-push ทุก branch — ทำลายย้อนไม่ได้ · human ตัดสินและลงมือเอง

ตอบคำถาม 2: **ขอกัน merge** PR #14 จนกว่า human จะปิด L4 (อย่างน้อยให้ทำข้อ 1 ก่อน) · ไม่รับความเสี่ยงไว้ก่อน

### Must 2 — Guestbook รับข้อมูลจริงโดยไม่มี moderation — **ยอมรับ · แก้แล้ว**

ตรวจแล้ว: backend (Lab 05) ทำ honeypot `website` + rate limit 5/min + validation แล้ว แต่ **moderation ไม่มีใครถือ** และไม่อยู่ใน OPEN_LOOPS · D9 / Out of scope ระบุชัดว่าต้องครบ 3 อย่างก่อนเปิด → หน้า `/guestbook` ที่ POST + โหลด list ได้เลยขัด D9 จริง (noindex + ไม่มีใน nav ไม่ใช่ gate — ใครรู้ URL ก็ใช้ได้)

แก้ใน `src/pages/guestbook.astro`:
- เพิ่ม flag `GUESTBOOK_ENABLED = false` (กลไกเดียวกับ `FORM_ENABLED` ใน contact) — ตอนปิด **ไม่ render ฟอร์มและ list** แสดงแค่ "สมุดเยี่ยมยังไม่เปิดใช้งาน"
- script ทำงานเฉพาะเมื่อมี element ครบ → ตอนปิดหน้า **ไม่ยิง `GET`/`POST /api/guestbook` เลย**
- เตรียม honeypot field `website` (ซ่อน · `tabindex="-1"`) ในฟอร์มไว้แล้ว ตาม spec ใน `src/pages/api/guestbook.ts`
- (ทำ Should 1 ไปด้วย) map `429` → "ส่งถี่เกินไป กรุณาลองใหม่ในอีกสักครู่" แยกจาก "ยังไม่เปิดใช้งาน"

Test: เพิ่ม `'/guestbook renders no form or entry list until moderation exists (D9)'` ใน `tests/public-site.test.ts` — render ด้วย Container API แล้ว assert ไม่มี `<form` และ `id="entries"`

ข้อจำกัดที่ต้องบอกตรง ๆ: UI gate **ไม่กัน**คนยิง `POST /api/guestbook` ตรง ๆ — ข้อมูลยังถูกเก็บได้ (แต่ไม่มีหน้าไหนแสดง จึงไม่มี stored XSS ต่อผู้เข้าชม) · การปิด endpoint ฝั่ง server เป็นงาน OpenCode → follow-up F1

ตอบคำถาม 1: กลไก = flag คงที่ในหน้า + ไม่ render · **เสนอเปิด loop moderation ใหม่** (ดู F2) — writer รอบ 2 เป็นคนเพิ่มลง OPEN_LOOPS

## Should / Nit / คำถามอื่น

| ข้อ | ผล | หมายเหตุ |
|---|---|---|
| Should 1 — map 429 | **ยอมรับ · แก้แล้ว** | ใน guestbook (ด้านบน) · contact ส่ง 429 ไป fallback อีเมลอยู่แล้ว ถือว่าถูกต้อง |
| Should 2 — script `/api/contact` ถูก bundle ตอน `FORM_ENABLED = false` | **ปฏิเสธ (ตีความ D10)** | D10 = ห้ามแสดง path/endpoint ใน *ข้อความที่ผู้เข้าชมเห็น* · path ใน JS bundle ไม่ใช่ความลับ (เป็น public API อยู่แล้ว) และ handler เป็น no-op เมื่อไม่มีฟอร์ม · จะหมดไปเองเมื่อเปิด L12 |
| Should 3 — `interestItems` ของ FALLBACK ไม่ถูก assert | **ยอมรับ · follow-up F3** | ไม่ใช่ blocker · PROFILE ปัจจุบันมี `## Interests` |
| Nit 1 — หัวข้อซ้ำ = ตัวแรกชนะ | follow-up F4 (คอมเมนต์) | |
| Nit 2 — `listLines(get('Interests'))` ซ้ำ | follow-up F4 | |
| คำถาม 3 — `workTypes` hardcode | **ตั้งใจ** | เป็น constant ฝั่ง UI ตาม D7 (ระบุแค่ select) · ย้ายไป PROFILE เมื่อเจ้าของต้องการแก้เอง |

## Follow-up (เสนอ — writer รอบ 2 ตัดสินว่าจะลง OPEN_LOOPS ไหม)

- **F1 · OpenCode:** ปิด `POST /api/guestbook` ฝั่ง server จนกว่ามี moderation (เช่น env flag → 501 / 404) — ไม่งั้น UI gate อย่างเดียวยังรับข้อมูลได้
- **F2 · human + OpenCode:** Moderation สำหรับ guestbook (queue อนุมัติก่อนแสดง หรือ column `approved`) — เงื่อนไขที่ 3 ของ D9 · จนกว่าปิด `GUESTBOOK_ENABLED` ต้องเป็น `false`
- **F3 · Claude:** เพิ่ม `FALLBACK.interestItems` ในชุด assert "ไม่ตก FALLBACK"
- **F4 · Claude:** คอมเมนต์ "first wins" ใน `sections()` + เรียก `listLines` ครั้งเดียวใน `parseProfile`
- **F5 · Claude/QA:** `docs/QA.md` แถว 11 (guestbook UI submit) จะไม่ผ่านแล้วโดยตั้งใจ — ต้องอัปเดตเป็น "ปิดตาม D9" ในรอบ QA ถัดไป
- **F6 · writer รอบ 2:** แก้ L4 ใน OPEN_LOOPS — PROFILE ถูก commit + push แล้ว (`5c56941`)

## Verification

- ⚠️ **ยังไม่ได้รัน** `npm test` · `npm run test:labs` · `npm run build` — คำสั่ง npm/npx ถูกบล็อกด้วย permission ในเซสชันนี้ · ต้องรันก่อน commit
- ที่คาดไว้: `test:labs` ไม่ควรเปลี่ยน (แตะแค่ `src/lib/db.ts` ผ่าน API — ไม่ได้แก้) · `npm test` +1 test ใหม่

## สรุป round-trip (ร่างสำหรับวางบน PR)

- OpenCode มองจากฝั่ง backend จึงเห็นว่า guestbook "ใช้ได้จริงแล้ว" หลัง Lab 05 — ซึ่งฝั่ง frontend ที่เขียนหน้าไว้ตอน API ยังเป็น 501 มองข้ามไป · ข้อ moderation ของ D9 ไม่มีใครถืออยู่จนรีวิวนี้ชี้
- รีวิวข้ามโมเดลทำให้ต้อง **ตรวจกับของจริง** ไม่ใช่เชื่อ docs — เจอว่า OPEN_LOOPS L4 บอกว่า PROFILE "ยังไม่เคย commit" แต่จริง ๆ push ไปแล้ว
- ต่างคนต่างแก้ในเขตตัวเอง (UI gate ฝั่ง Claude · server gate ฝั่ง OpenCode) และส่งต่อผ่านไฟล์ใน `docs/` — ได้ทั้ง defense in depth และไม่มีใครแก้โค้ดของอีกฝั่ง

## Canonical state updated

- [ ] docs/STATUS.md — ไม่แตะ (single-writer รอบนี้ไม่ใช่ Claude · รอ Round 2)
- [ ] docs/OPEN_LOOPS.md — ไม่แตะ (ข้อเสนอ F1–F6 ด้านบน รอ writer รอบ 2)
- [ ] docs/DECISIONS.md (ถ้ามี decision ใหม่) — ไม่แตะ · ไม่มี decision ใหม่ (Must 2 ทำตาม D9 เดิม · Must 1 รอ human)
