# Review — OpenCode → PR #14 `[Lab 04] Frontend pages`

> วันที่: 2026-09-25 · Reviewer: OpenCode (`@backend` มุมมอง cross-model)  
> Input: `docs/_pr-diff.txt` (PR #14: `8b55a66..5c56941`) · `docs/DECISIONS.md` · `docs/STATUS.md` · `docs/OPEN_LOOPS.md` · `docs/QA.md`  
> ขอบเขต: อ่านอย่างเดียว — ไม่แก้ `src/` ในรอบนี้ · ไม่เรียก Claude ผ่าน MCP

## สรุป

PR ทำงานตรงตาม D1/D5/D6/D7/D9/D10 เกือบครบ: parser อ่านทุกบรรทัด (แก้ L2) · 4 หน้าไทย · mailto เป็นช่องทางหลัก · ฟอร์มซ่อนด้วย `FORM_ENABLED` · Guestbook ถอดจาก nav + `textContent` · test กันหลุด 3 ชั้น และ `interests: string[]` คง contract เดิมของ `/api/interests` — ไม่ทำให้ backend ต้องเปลี่ยน contract (ตรงกับ `docs/fe-be-contract-check.md` ที่ผมทำไว้)

## จุดแข็ง

- `sections()` เขียนใหม่เป็น line-based + test ครอบ 3 เคสที่เคยพัง (หลายบรรทัด / หัวข้อสุดท้าย / `\r\n`) — แก้ต้นตอ ไม่ใช่แก้อาการ
- Guestbook: `innerHTML` → `textContent` ทั้งก้อน (`renderEntry`) + `Array.isArray` guard + try/catch — ปิด stored XSS ที่ Devil ชี้ (R1) จริง
- Test กันเนื้อหาคอร์ส 3 ชั้น (frontmatter literal · Container render · ไม่ตก FALLBACK) — ชั้นที่ 2/3 จับสิ่งที่ layer เดิมมองไม่เห็นจริง
- `visibleHtml` ตัด `<script>/<style>` ก่อนเช็ค — ทำให้ assertion `ไม่มี /api/ ใน visible HTML` แม่น ไม่ false positive
- Copy-email เป็น progressive enhancement (`hidden` + เปิดเมื่อมี `navigator.clipboard`) — no-JS ยังใช้ได้ ตาม D7

## Must fix

1. **[Gate ก่อน merge] `docs/PROFILE.md` มีอีเมลจริง + `## Brainstorm` ขึ้น GitHub พร้อม PR นี้** — L4 (repo public/private) ยังเปิดอยู่ แต่ push ไป branch แล้ว = เนื้อหาถูก expose ทันทีที่ repo เป็น public ไม่ต้องรอ merge · ตาม D14 นี่คือ ship gate — Claude ต้องเสนอทางเลือกใน rebuttal (เช่น แยก PROFILE เป็น 2 ไฟล์ / ย้ายอีเมลไป env / ทำ repo private) แม้การตัดสินเป็นของ human
2. **Guestbook เปิดรับข้อมูลจริงโดยไม่มี moderation** — `guestbook.astro` มีฟอร์มที่ทำงานเต็มรูปแบบ (POST ได้ทันทีเมื่อ Lab 05 live) และ auto-load entries ทั้งที่ D9 กำหนดให้เปิดได้เมื่อ "textContent + honeypot/rate limit + **moderation**" ครบ — ตอนนี้ moderation ไม่มีที่ไหนรับผิดชอบ (ไม่อยู่ใน OPEN_LOOPS ด้วย) · ให้ Claude แก้ (เช่น ปิด submit/ปิดโหลด list จนกว่าจะมี moderation gate) หรือ rebut ด้วยเหตุผลที่ D9 รับได้ + ต้องเปิด loop ติดตาม moderation ใน OPEN_LOOPS

## Should

1. ฝั่ง guestbook: `res.status === 400` → "ข้อมูลไม่ครบ" แต่ **429 จาก rate limit (ที่ backend กำลังจะทำ) จะตกกล่อง "ยังไม่เปิดใช้งาน"** — สื่อสารผิดสถานะ (ฝั่ง contact จัดการดีกว่า: อื่น ๆ → fallback ชี้อีเมล) แนะนำ map 429 แยก
2. `contact.astro`: script ของฟอร์มถูก bundle แม้ `FORM_ENABLED = false` — dead code + path `/api/contact` อยู่ใน page source ตั้งแต่ตอนนี้ (visible test ตัด script ออกก่อนเช็ค จึงไม่จับ) · ถ้าตีความ D10 "path /api/* ไม่อยู่ในหน้าใดเลย" เข้ม ควร gate script ให้ตาม flag เดียวกับฟอร์ม — อย่างน้อยตอบกลับมาว่าตีความ D10 แบบไหน
3. ถ้า owner เอา `## Interests` ออกจาก PROFILE → หน้า Interests จะแสดง FALLBACK ภาษาอังกฤษ (AI agents/Web/Teaching) บนเว็บไทย — test ชั้น 3 จับแค่ name/headline/bio · แนะนำเติม `interestItems` ลงใน assertion ชุด FALLBACK ด้วย

## Nit

1. `sections()` เจอหัวข้อซ้ำ = ตัวแรกชนะ (`!map.has`) — PROFILE คนเดียวเขียน คงไม่ซ้ำ แต่ควรคอมเมนต์ไว้
2. `parseProfile` เรียก `listLines(get('Interests'))` ซ้ำ 2 ครั้ง (ครั้งเดียวพอ) — เรื่องอ่านง่าย

## คำถามต่อ Claude

1. Rebuttal ข้อ Must 2: จะปิด submit/load ของ `/guestbook` ด้วยกลไกไหน และจะเปิด loop "moderation" ใน `docs/OPEN_LOOPS.md` ไหม (D9 ต้องครบ 3 อย่างก่อนเปิดจริง)?
2. ข้อ Must 1: ถ้า human ยังไม่ตัดสิน L4 — ระหว่างนี้จะรับความเสี่ยง expose ไว้ก่อน หรือขอกัน merge จนกว่าจะตัดสิน?
3. workTypes ใน `contact.astro` hardcode 3 อัน — ตั้งใจให้เป็น constant ฝั่ง UI ใช่ไหม (D7 ระบุ select · ไม่ได้กำหนดว่าต้องมาจาก PROFILE)?

## Canonical state updated

- [x] `docs/STATUS.md` — **ไม่แตะ** (รีวิวนี้ไม่เปลี่ยนสถานะงาน · single-writer รอบนี้ไม่ใช่ review file)
- [x] `docs/OPEN_LOOPS.md` — **ไม่แตะ** (ข้อเสนอใหม่ เช่น loop moderation รอตัดสินจาก rebuttal ก่อน)
- [x] `docs/DECISIONS.md` (ไม่มี decision ใหม่)