# Open Loops

> คัดลอกเป็น `docs/OPEN_LOOPS.md` ใน Lab 00 · งานค้างที่ยังไม่ปิด · ลบแถวเมื่อเสร็จ  
> Owner = `Claude` | `OpenCode` | `human`

Last updated: 2026-09-25 +07:00

| ID | Task | Owner | Priority | Trigger / due | Notes |
|---|---|---|---|---|---|
| L1 | สร้าง STATUS + OPEN_LOOPS จาก example | human | P0 | Lab 00 | หลัง copy แล้วลบแถวนี้ |
| L2 | `loadProfile()` อ่านได้แค่บรรทัดแรกของแต่ละหัวข้อ (Interests ได้ 1 ข้อ, Bio ได้ย่อหน้าแรก) — regex `$` + flag `m` ที่ `src/lib/profile.ts:42` | Claude | P1 | Lab 04 | พบตอน Lab 01 · ยังไม่แก้ · scope parser ตาม DECISIONS D6 |
| L3 | ยืนยันอีเมลใน `## Contact` ของ PROFILE (ช่องทางเดียว · แนะนำอีเมลงานแยก) + ลบบรรทัด github/linkedin "—" | human | P0 | ก่อน Lab 04 · ship gate | DECISIONS D7 · D14 · DEBATE R3 |
| L4 | repo public หรือ private? `docs/` (อีเมล · Brainstorm · DEBATE) ถูกอ่านได้ถ้า public | human | P0 | ก่อน Lab 08 · ship gate | DECISIONS D14 · ถ้า public ต้องลบอีเมลส่วนตัว/Brainstorm ออกจาก `docs/` |
| L5 | เขียน Bio ใหม่เป็น "ผม" · ปรับ Interests (security/AI + คำอธิบาย) · เพิ่ม `## Services` 1 หลัก + 1 รอง · ประเภทปัญหาที่เคยแก้ 3–5 ข้อ | human | P1 | Lab 04 · ship gate (Bio) | DECISIONS D2–D4, D6, D12 · รูปแบบ `- ชื่อ — คำอธิบาย` |
| L6 | Guestbook ใช้ `innerHTML` (`src/pages/guestbook.astro`) → `textContent` ก่อนเปิดใช้ · v1 ถอดออกจาก nav/Home | Claude | P1 | Lab 04 | DECISIONS D9 |
| L7 | field ประเภทงานใน `POST /api/contact` + นโยบายเก็บ/ลบข้อมูล Contact | OpenCode | P2 | Lab 05 (handoff) | DECISIONS D7 · D9 · v1 ใส่ในบรรทัดแรกของ `message` · handoff ต้องระบุ honeypot field + rate limit |
| L8 | ยืนยันคำว่า "ประเมินฟรี" / "ประเมินฟรีหลังคุย" และเวลาตอบกลับ (ถ้าจะใส่) | human | P2 | Lab 04 | DECISIONS D7 · D8 · ระหว่างรอใช้ "คุยเรื่องโปรเจกต์" |
| L9 | `tests/public-site.test.ts` ไม่จับข้อความใน frontmatter (meta อ้างคอร์สหลุด) + test ไม่ตก FALLBACK | Claude | P1 | Lab 04 | DECISIONS D10 · D11 · DEBATE R8/R9 |
| L10 | บันทึก owner ของ `tests/public-site.test.ts` = frontend ในตาราง Ownership (`AGENTS.md`) | human | P2 | Lab 03 | DECISIONS D11 · ไฟล์กฎ ต้องให้เจ้าของอนุมัติ |

## ปิดแล้ว (ย่อ — ย้ายหรือลบได้เมื่อรก)

| ID | Task | Closed |
|---|---|---|
| — | — | — |

## กฎสั้น

- อย่าเก็บงานที่ปิดแล้วจำนวนมากในตารางบน
- เปลี่ยน owner เมื่อ handoff ข้าม harness (ดู `docs/handoffs/`)
- สอง agent ห้ามเป็น writer พร้อมกันบนไฟล์นี้ — single-writer ตาม `AGENTS.md`
