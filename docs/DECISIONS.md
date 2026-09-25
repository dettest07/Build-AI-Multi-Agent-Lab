# Decisions — Personal Site

> Approved จาก `docs/DEBATE.md` (2026-09-25 · @reviewer ↔ @frontend 2 รอบ × 3 บทบาท) · แทนที่ชุดเดิม
> ข้อที่ยังรอเจ้าของตัดสินอยู่ใน `docs/OPEN_LOOPS.md` — ไม่ถือว่าอนุมัติจนกว่าจะปิด loop

## สรุปการโต้วาที

ทั้งสามมุมเห็นตรงกันว่า positioning ".NET ที่ออกแบบก่อนเขียน ปลอดภัยก่อนส่ง" ใช้ได้ แต่ตอนนี้เว็บยังสื่อไม่ได้ เพราะ parser ตัดเนื้อหาเหลือบรรทัดแรก tagline ไม่ขึ้นเว็บ และช่องทางติดต่อเดียวตอบ 501 Brand ให้ Tagline เป็น H1 นำด้วยงาน freelance และถอนคำเคลมที่ยังไม่มีตัวอย่าง UX ให้ Contact ใช้อีเมลเป็นช่องทางหลัก ซ่อนฟอร์มจนกว่า backend จะพร้อม และให้ UI เป็นไทยบน URL เดิม Devil's Advocate ชี้ว่าความเสี่ยงสูงสุดคือ guestbook XSS กับข้อความคอร์สที่หลุดใน meta ซึ่ง test ปัจจุบันจับไม่ได้ (R8) และขอให้ gate การ ship ด้วยการตัดสินใจของเจ้าของเรื่องอีเมลงานกับ repo public/private ประเด็นที่ frontend แย้งในรอบ 1 (honeypot ฝั่ง UI · ประกอบอีเมลด้วย JS) ยุติโดยยอมตาม reviewer ในรอบ 2

## การตัดสินใจ (ตาราง)

| ID | หัวข้อ | ตัดสินใจ | เหตุผลสั้น | ใครเสนอ (Brand/UX/Devil) |
|----|--------|----------|------------|---------------------------|
| D1 | ลำดับ Hero | **H1 = Tagline** "ออกแบบก่อนเขียน ปลอดภัยก่อนส่ง" → Headline (ประโยครอง) → Proof line → CTA · tagline / proof แยกเป็น `## Tagline` / `## Proof` ใน PROFILE (ดู D13) | tagline คมและจำง่ายกว่า headline · ให้เห็นหลักฐานก่อนถูกขอให้กด · Tone เป็นโน้ตทีม ไม่ใช่เนื้อหาหน้าเว็บ | Brand (B1) + frontend ปรับโครงหัวข้อ |
| D2 | กลุ่มเป้าหมาย / บริการ | v1 **freelance .NET เป็นหลัก** · ที่ปรึกษา (architecture / security) เป็นการ์ดรอง · AI ไม่ขึ้น Hero และเป็นแค่ interest | สองกลุ่มต้องการต่างกัน · หลักฐานด้านที่ปรึกษายังชี้ไม่ได้ · ไม่มีผลงาน AI | Brand (B2, B4) + Devil (R4) |
| D3 | เสียง + Bio | ใช้ **"ผม" คุยกับ "คุณ"** ทั้งเว็บ · **Home ไม่แสดง Bio** จนกว่าเจ้าของเขียนใหม่เป็น "ผม" · About แสดง Bio เดิมชั่วคราว · คำใน `.astro` ("ฉัน" ฯลฯ) frontend แก้เอง | สองน้ำเสียงบนหน้าแรกเสียภาพมืออาชีพมากกว่าข้อความน้อย · About ว่างจะเสียกว่า | Brand (B3) · ตอบคำถาม frontend |
| D4 | คำเคลม | ห้ามคำเคลม / badge ที่ไม่มีตัวอย่างรองรับใน PROFILE (เช่น "secure-by-design", "Expert") · คง "ปลอดภัยก่อนส่ง" เพราะเป็นหลักการทำงาน · security พูดเป็น *ประเภท* ปัญหา ไม่ระบุลูกค้าหรือช่องโหว่จริง | กัน overclaim และความรับผิดชอบทางวิชาชีพ · กัน NDA | Devil (R4, R5) + Brand (B4) |
| D5 | IA + Navigation | 4 หน้า (หน้าแรก · เกี่ยวกับ · ความสนใจ · ติดต่อ) · **URL คงอังกฤษ** · nav / ปุ่ม / label / `<title>` เป็น**ไทย** รูปแบบ "หน้า · ชื่อ" · "ติดต่อ" ใน nav เด่นเป็นปุ่ม (คง `aria-current` · AA) · grid การ์ด Home ปรับตามจำนวนการ์ด | test / e2e / ลิงก์ผูกกับ path · Contact เป็น conversion เดียวของเว็บ | UX (U4, U6, U8, U9) |
| D6 | รูปแบบเนื้อหา + parser | `## Interests` และ `## Services` (หลัก 1 + รอง 1) แยกหัวข้อ แต่ใช้รูปแบบเดียวกัน `- ชื่อ — คำอธิบาย` และ helper ตัวเดียว (บรรทัดที่ไม่มี "—" แสดงเฉพาะชื่อ) · parser v1 แก้แค่: หลายบรรทัด (`src/lib/profile.ts:42`) · Tagline / Proof · Contact · Services · test ครอบ หลายบรรทัด / หัวข้อสุดท้าย / `\r\n` เขียนก่อนแก้ | สนใจ ≠ ขาย · จำกัด scope (R7) · parser เป็นต้นเหตุที่ทำให้เว็บแสดงข้อมูลไม่ครบ | UX (U1, U6) + Devil (R7) |
| D7 | Contact | **อีเมล `mailto:` ธรรมดาเป็นช่องทางหลัก** (อีเมลงานแยก · ปุ่มคัดลอกเป็นส่วนเสริม · ไม่ประกอบอีเมลด้วย JS) · **ฟอร์มซ่อน**ด้วย flag คงที่ในหน้าจนกว่า OpenCode ส่ง handoff · เมื่อเปิด: ประเภทงานเป็น select ต่อบรรทัดแรกของ `message` (ไม่แตะ API contract) · ไม่แสดง error ดิบ · ข้อความสำรองเมื่อเจอ 501 ชี้ไปอีเมล · ข้อความสำเร็จ "ได้รับแล้ว ผมจะติดต่อกลับทางอีเมล" (ไม่ใส่จำนวนวันจนเจ้าของยืนยัน) | ฟอร์มที่กดไม่ได้ดูเหมือนเว็บพัง · JS email เสีย a11y / no-JS · field ใหม่ใน API เป็นงาน OpenCode | UX (U2, U7) + Devil (R3, R6) |
| D8 | ราคา + CTA | ไม่แสดงตัวเลขราคา · CTA หลัก **"คุยเรื่องโปรเจกต์"** · ใช้ "(ประเมินฟรี)" / "ประเมินฟรีหลังคุย" **เฉพาะเมื่อเจ้าของยืนยัน** | ตัวเลขบนเว็บ = คำสัญญา · "ประเมินฟรี" ก็เป็นคำมั่น | Devil (Q1) + Brand (B6) · frontend ใส่เงื่อนไข |
| D9 | Guestbook | **ไม่อยู่ใน v1** — ถอดจาก nav และการ์ด Home · เก็บไฟล์หน้าไว้แต่เปลี่ยน `innerHTML` เป็นสร้าง node ด้วย `textContent` · honeypot + rate limit ทำโดย OpenCode ทั้งสองฝั่งพร้อมกัน โดย handoff ต้องระบุชื่อ field | stored XSS บนเว็บที่ขาย security = แบรนด์พัง · honeypot ที่ server ไม่ตรวจไม่มีผล | Devil (R1) · frontend ยอมตามในรอบ 2 |
| D10 | Visual + ข้อความภายใน | ธีม**สว่าง มินิมอล** ผ่าน CSS variables จุดเดียวใน `BaseLayout` · contrast AA · ลบ eyebrow "Personal branding site" · บรรทัด "Audience:" · ข้อความ endpoint (`/api/*`) · "อัปเดตเร็ว ๆ นี้" · default meta description ใช้ Headline แทนข้อความที่อ้างคอร์ส | ธีมมืดขัด Tone · ข้อความ dev / คอร์สหลุดทำลายความน่าเชื่อถือและขัด `public-site-safe` | UX (U3, U5) + Brand (B5) + Devil (R2) |
| D11 | Test กันหลุด | `tests/public-site.test.ts` ต้องจับข้อความใน frontmatter ด้วย (ชั้น 1: สแกน string literal ด้วยคำแคบ "multi-agent course" / "คอร์ส") และ render จริงด้วย Astro Container API (ชั้น 2 · ถ้าใช้ไม่ได้ย้ายไป e2e / QA) · เพิ่ม test ว่า `loadProfile()` บน PROFILE จริงไม่ตก `FALLBACK` (ไม่ assert ค่าเจาะจง) · frontend (Claude) ดูแล test นี้ — รอบันทึกใน Ownership | test ปัจจุบันตัด frontmatter ทิ้ง → meta ที่อ้างคอร์สหลุด (R8) · fallback ปลอมอาจขึ้นเว็บ (R9) | Devil (R8, R9) |
| D12 | Projects | ย้าย **Projects 3 ชิ้น → Nice** · v1 ใช้ "ประเภทปัญหาที่เคยแก้" 3–5 ข้อแบบไม่ระบุลูกค้า · tech stack รวมใน Proof line / About ไม่ทำ section แยก | ขึ้นกับการอนุญาตของลูกค้าที่ควบคุมไม่ได้ · เสี่ยง NDA | Devil (C1, C3, R5) |
| D13 | แก้ `docs/PROFILE.md` | ย้าย tagline และ proof line ออกจาก `## Tone` ไปเป็นหัวข้อ `## Tagline` / `## Proof` (ข้อความเดิมทุกตัวอักษร) · ส่วนอื่นไม่แตะ | ให้ parser อ่านได้ใน Lab 04 ตาม D1 · Bio / Audience / Services ต้องให้เจ้าของเขียนเอง | Facilitator (จาก D1) |
| D14 | Gate ก่อน ship | **ห้าม ship** จนกว่าปิด L3 (อีเมลงาน) · L4 (repo public/private — ถ้า public ต้องลบอีเมลส่วนตัวและ Brainstorm ออกจาก `docs/` ก่อน เพราะ Dockerfile copy `docs/` ลง image ด้วย) · L5 (Bio "ผม") · บันทึก gate ใน `docs/SHIP.md` (owner = human) · QA ต้อง view-source ทุกหน้า (meta · title · fallback) | เว็บที่ไม่มีช่องทางติดต่อไม่ทำหน้าที่ · การเปิด `docs/` เป็นเรื่อง privacy · frontend บังคับ gate เองไม่ได้ | Devil (R3, Q3, Q5) + frontend (ทางออกของ L4) |

### บันทึกการแก้ `docs/PROFILE.md` (D13)

- **ย้าย** `- Tagline: ออกแบบก่อนเขียน ปลอดภัยก่อนส่ง (D1)` จาก `## Tone` → หัวข้อใหม่ `## Tagline`
- **ย้าย** `- Proof line: Full-stack .NET / C# · SQL Server · ประสบการณ์ 10 ปี (D1)` จาก `## Tone` → หัวข้อใหม่ `## Proof`
- ไม่แก้ Name / Headline / Bio / Audience / Interests / Contact / ไม่แสดงบนเว็บ / Brainstorm
- parser ปัจจุบันยังไม่อ่านสองหัวข้อนี้ จึงไม่กระทบเว็บจนกว่าจะเริ่ม Lab 04

## สิ่งที่เลื่อนออก (Out of scope v1)

- Guestbook บนเว็บสาธารณะ (เปิดได้เมื่อมี `textContent` + honeypot / rate limit จาก OpenCode + moderation)
- Projects ที่ระบุชื่อลูกค้า / case study
- ตัวเลขราคา · ตัวเลขเวลาตอบกลับ (จนเจ้าของยืนยัน)
- ฟอร์ม Contact ที่ยิง API จริง (รอ OpenCode · Lab 05) · field ประเภทงานแยกใน API · นโยบายเก็บ / ลบข้อมูล (L7)
- บทความรายเดือน · ขั้นตอนการทำงานแบบละเอียด · Testimonial
- Security checklist ดาวน์โหลด · RSS / newsletter · ผลงาน AI · เว็บภาษาอังกฤษ
- ป้ายหรือ badge ความเชี่ยวชาญ · คำว่า "secure-by-design"
- CMS / login / แชทบอท

## เกณฑ์พร้อม Frontend (Lab 04)

- **Parser:** `loadProfile()` คืนทุกบรรทัดของ Bio / Interests และอ่าน `## Tagline` · `## Proof` · `## Contact` · `## Services` ได้ · test ครอบ หลายบรรทัด / หัวข้อสุดท้าย / `\r\n` และ "ไม่ตก FALLBACK" ผ่าน (D6 · D11)
- **Home:** Tagline (H1) → Headline → Proof → CTA "คุยเรื่องโปรเจกต์" → `/contact` · ไม่มี Bio · ไม่มี AI · ไม่มีการ์ด Guestbook และ grid ไม่มีช่องว่าง (D1 · D3 · D5 · D9)
- **Contact:** อีเมล `mailto:` แสดงบนสุดและใช้ได้โดยไม่ต้องใช้ JS · ฟอร์มซ่อนด้วย flag · ไม่มี error ดิบหรือ path `/api/*` ในหน้าใดเลย (D7 · D10)
- **ภาษา + ธีม:** nav / ปุ่ม / label / `<title>` ไทยทุกหน้า · ธีมสว่างผ่าน CSS variables ผ่าน contrast AA · "ติดต่อ" ใน nav เด่นเป็นปุ่ม (D5 · D10)
- **Test:** `npm test` และ `npm run build` ผ่าน · test ใหม่จับข้อความอ้างคอร์สใน frontmatter / meta ได้ · view-source ทุกหน้าไม่มีข้อความคอร์ส (D10 · D11)

## GitHub Issues (Lab 03 · 2026-09-25)

| Issue # | Title | มาจาก Decision |
|---|---|---|
| [#1](https://github.com/dettest07/Build-AI-Multi-Agent-Lab/issues/1) | [D6] Parser: อ่านหลายบรรทัด + Tagline / Proof / Contact / Services | D6 (+D13 · D11 · L2) |
| [#2](https://github.com/dettest07/Build-AI-Multi-Agent-Lab/issues/2) | [D1] Hero หน้าแรก: Tagline เป็น H1 → Headline → Proof → CTA | D1 (+D13 · D8) |
| [#3](https://github.com/dettest07/Build-AI-Multi-Agent-Lab/issues/3) | [D2][D4] กลุ่มเป้าหมาย / บริการ และคำเคลมบนเว็บ | D2 + D4 (L5) |
| [#4](https://github.com/dettest07/Build-AI-Multi-Agent-Lab/issues/4) | [D3] น้ำเสียง "ผม" คุยกับ "คุณ" + การแสดง Bio | D3 (L5 · D14) |
| [#5](https://github.com/dettest07/Build-AI-Multi-Agent-Lab/issues/5) | [D5] IA + Navigation: 4 หน้า · label ไทย · URL อังกฤษ | D5 (+D9) |
| [#6](https://github.com/dettest07/Build-AI-Multi-Agent-Lab/issues/6) | [D7] Contact: อีเมล mailto เป็นช่องทางหลัก · ซ่อนฟอร์มจนกว่า backend พร้อม | D7 (L3 · L7) |
| [#7](https://github.com/dettest07/Build-AI-Multi-Agent-Lab/issues/7) | [D8] ราคา + CTA: ไม่แสดงตัวเลขราคา · CTA "คุยเรื่องโปรเจกต์" | D8 (L8) |
| [#8](https://github.com/dettest07/Build-AI-Multi-Agent-Lab/issues/8) | [D9] Guestbook ไม่อยู่ใน v1 · เปลี่ยน innerHTML เป็น textContent | D9 (L6 · L7) |
| [#9](https://github.com/dettest07/Build-AI-Multi-Agent-Lab/issues/9) | [D10] Visual ธีมสว่าง + ลบข้อความภายในที่หลุดขึ้นเว็บ | D10 |
| [#10](https://github.com/dettest07/Build-AI-Multi-Agent-Lab/issues/10) | [D11] Test กันหลุด: จับข้อความคอร์สใน frontmatter + ไม่ตก FALLBACK | D11 (L9 · L10) |
| [#11](https://github.com/dettest07/Build-AI-Multi-Agent-Lab/issues/11) | [D12] Projects → "ประเภทปัญหาที่เคยแก้" 3–5 ข้อ (ไม่ระบุลูกค้า) | D12 (L5) |
| [#12](https://github.com/dettest07/Build-AI-Multi-Agent-Lab/issues/12) | [D13] PROFILE: แยก ## Tagline / ## Proof ออกจาก ## Tone | D13 (L4) |
| [#13](https://github.com/dettest07/Build-AI-Multi-Agent-Lab/issues/13) | [D14] Gate ก่อน ship: ปิด L3 / L4 / L5 + QA view-source ทุกหน้า | D14 |
