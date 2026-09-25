# Open Loops

> คัดลอกเป็น `docs/OPEN_LOOPS.md` ใน Lab 00 · งานค้างที่ยังไม่ปิด · ลบแถวเมื่อเสร็จ  
> Owner = `Claude` | `OpenCode` | `human`

Last updated: 2026-09-25 14:50 +07:00 (OpenCode · Lab 05)

| ID | Task | Owner | Priority | Trigger / due | Notes |
|---|---|---|---|---|---|
| L1 | สร้าง STATUS + OPEN_LOOPS จาก example | human | P0 | Lab 00 | หลัง copy แล้วลบแถวนี้ |
| L3 | ยืนยันอีเมลใน `## Contact` ของ PROFILE (ช่องทางเดียว · แนะนำอีเมลงานแยก) + ลบบรรทัด github/linkedin "—" | human | P0 | ship gate | DECISIONS D7 · D14 · ตอนนี้หน้า Contact แสดงอีเมลจาก PROFILE ตรง ๆ |
| L4 | repo public หรือ private? `docs/` (อีเมล · Brainstorm · DEBATE) ถูกอ่านได้ถ้า public | human | P0 | ก่อน push PROFILE · ship gate | DECISIONS D14 · `docs/PROFILE.md` ยังไม่เคย commit — ตัดสินก่อน push |
| L5 | เขียน Bio ใหม่เป็น "ผม" · ปรับ Interests (security/AI + คำอธิบาย) · เพิ่ม `## Services` 1 หลัก + 1 รอง · ประเภทปัญหาที่เคยแก้ 3–5 ข้อ | human | P1 | ship gate (Bio) | DECISIONS D2–D4, D6, D12 · รูปแบบ `- ชื่อ — คำอธิบาย` · UI รองรับ Services แล้ว (Home แสดงเมื่อมีหัวข้อ) · "ประเภทปัญหาที่เคยแก้" ยังไม่มี parser/UI — ทำเมื่อเจ้าของเขียนเนื้อหา |
| L7 | ~~field ประเภทงานใน `POST /api/contact` + นโยบายเก็บ/ลบข้อมูล Contact~~ **ฝั่ง backend ปิดแล้ว (Lab 05)**: ประเภทงาน = บรรทัดแรกของ `message` (ไม่มี field แยก) · honeypot `website` + rate limit 5/min → 429 · นโยบาย v1 = เก็บใน `$DATA_DIR/site.sqlite` ลบด้วยมือ ไม่มี retention อัตโนมัติ — รายละเอียดใน `docs/handoffs/05-opencode-to-claude.md` · **เหลือ:** UI เพิ่ม field honeypot (ดู L12) | Claude | P2 | พร้อม L12 | D7 · D9 · UI อย่าเคลม retention ที่ระบบไม่ได้ทำ |
| L8 | ยืนยันคำว่า "ประเมินฟรี" / "ประเมินฟรีหลังคุย" และเวลาตอบกลับ (ถ้าจะใส่) | human | P2 | ก่อน ship | DECISIONS D7 · D8 · ตอนนี้ใช้ "คุยเรื่องโปรเจกต์" |
| L10 | บันทึก owner ของ `tests/public-site.test.ts` = frontend ในตาราง Ownership (`AGENTS.md`) | human | P2 | Lab 03 | DECISIONS D11 · ไฟล์กฎ ต้องให้เจ้าของอนุมัติ |
| L12 | เปิด `FORM_ENABLED` ใน `src/pages/contact.astro` + เพิ่ม honeypot field `website` (contact · ต้องก่อนจะโชว์ฟอร์มจริง) — backend ยืนยัน 201 แล้ว | Claude | P1 | หลัง merge `lab-05-backend` | D7 · D9 · spec honeypot + พฤติกรรม 201-fake ใน handoff กลับ |
| L13 | ติดตั้ง browser ของ Playwright (`npx playwright install chromium`) แล้วรัน `npm run test:e2e` | human | P2 | Lab 06 | spec อัปเดตแล้ว (mailto · ไม่มีลิงก์ guestbook ใน nav) · ยังไม่เคยรันผ่านบนเครื่องนี้ |

## ปิดแล้ว (ย่อ — ย้ายหรือลบได้เมื่อรก)

| ID | Task | Closed |
|---|---|---|
| L2 | parser อ่านแค่บรรทัดแรก → `sections()` ใหม่ + test หลายบรรทัด / หัวข้อสุดท้าย / `\r\n` | 2026-09-25 Lab 04 (#1) |
| L6 | Guestbook `innerHTML` → `textContent` · ถอดจาก nav/Home · noindex | 2026-09-25 Lab 04 (#8) |
| L9 | test จับข้อความคอร์สใน frontmatter + render จริง (Container API) + ไม่ตก FALLBACK | 2026-09-25 Lab 04 (#10) |
| L11 | implement `insertContact` / guestbook ใน `src/lib/db.ts` + validation — `test:labs` 2/2 เขียว · `npm test` 17/17 คงเดิม | 2026-09-25 Lab 05 (`lab-05-backend`) |

## กฎสั้น

- อย่าเก็บงานที่ปิดแล้วจำนวนมากในตารางบน
- เปลี่ยน owner เมื่อ handoff ข้าม harness (ดู `docs/handoffs/`)
- สอง agent ห้ามเป็น writer พร้อมกันบนไฟล์นี้ — single-writer ตาม `AGENTS.md`
