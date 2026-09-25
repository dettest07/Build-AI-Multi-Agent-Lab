# QA — Personal Site

> Lab 06


## E2E Playwright

- Date: 2026-09-25 · Tool: Playwright MCP (Chromium) · Runner: Claude
- Target: `http://127.0.0.1:4321` (`npm run dev` · PORT from `.env`) · branch `lab-05-backend`
- Demo data only (`Demo QA` / `demo@example.com`)

| # | Step | Expected | Result |
|---|---|---|---|
| 1 | Open `/` | Name and headline from PROFILE are shown | ✅ PASS · title `หน้าแรก · Suradech Leelakiatvanich` · name "Suradech Leelakiatvanich" + headline "นักพัฒนา .NET / C# ที่ออกแบบระบบให้เป็นระเบียบ…" appear · H1 = Tagline "ออกแบบก่อนเขียน ปลอดภัยก่อนส่ง" |
| 2 | nav on Home | 4 pages, no guestbook link | ✅ PASS · หน้าแรก / เกี่ยวกับ / ความสนใจ / ติดต่อ · no `/guestbook` link |
| 3 | `GET /about` | 200 | ✅ PASS · 200 `เกี่ยวกับ · …` |
| 4 | `GET /interests` | 200 | ✅ PASS · 200 `ความสนใจ · …` |
| 5 | `GET /contact` | 200 | ✅ PASS · 200 `ติดต่อ · …` |
| 6 | `GET /no-such-page` (control) | 404 | ✅ PASS · 404 (confirms the checks above actually catch 404s) |
| 7 | Contact UI form | Hidden while `FORM_ENABLED=false` (L12) · mailto link present | ✅ PASS (as expected) · 0 `<form>` · `mailto:` link from PROFILE present |
| 8 | `POST /api/contact` valid demo data | 201 row | ✅ PASS · 201 `{id:1, name:"Demo QA", …}` |
| 9 | `POST /api/contact` bad email | 400 generic | ✅ PASS · 400 `{"error":"invalid input"}` · no stack trace |
| 10 | `POST /api/contact` with honeypot `website` | fake 201, no persist | ✅ PASS · 201 `{"ok":true}` |
| 11 | `/guestbook` UI: fill in name + message `E2E demo <b>not bold</b>` → "ฝากข้อความ" | Success + entry appears in list | ✅ PASS · status "ขอบคุณสำหรับข้อความ" · entry shown |
| 12 | Guestbook XSS | HTML is shown as text | ✅ PASS · `<b>` rendered as text (0 `<b>` elements in `main`) — `textContent` works (L6) |
| 13 | Guestbook `noindex` | `meta robots=noindex` | ✅ PASS |
| 14 | `GET /api/guestbook` | 200 `{entries}` | ✅ PASS · 1 entry matching the UI |
| 15 | `POST /api/guestbook` empty name/message | 400 generic | ✅ PASS · 400 `{"error":"invalid input"}` |
| 16 | Console errors | None besides intentional test requests | ✅ PASS · only a 404 (step 6) and a 400 (step 15), both from intentional tests |

Screenshots: [`home.png`](screenshots/home.png) · [`contact.png`](screenshots/contact.png) · [`guestbook.png`](screenshots/guestbook.png)

Notes

- Screenshots come from dev mode, so the Astro dev toolbar shows at the bottom of the page. It is not in the production build.
- Demo rows were written to `./data/site.sqlite` (gitignored). Delete them by hand before using real data.
- The contact form can't be tested through the UI yet: waiting on L12 (`FORM_ENABLED` + honeypot field). Retest step 7 after it's enabled.
- `npm run test:e2e` (playwright/ spec) hasn't been run in this round. L13 stays open.
- a11y has not been checked in this round.

## a11y Debate

> Input: `## E2E Playwright` above + the Contact page (`/contact`) · measured on 2026-09-25 with Playwright MCP (computed style + WCAG contrast formula) · also looked at `/guestbook` because it's the only page with a working form right now

**Measured values**

| Check | Result |
|---|---|
| Text contrast | body `#475569`/white **7.58:1** · footer on `--bg` **7.24:1** · H1 **17.85:1** · white on `.btn` **6.70:1** · white on nav `.btn[aria-current]` **8.72:1**: all pass AA |
| Focus | Every link/button on Contact matches `:focus-visible` → outline solid `#1d4ed8` (**6.7:1** on white · **6.41:1** on `--bg`) |
| Input border (`#94a3b8` on white) | **2.56:1** ❌ fails WCAG 1.4.11 (UI components ≥ 3:1) |
| Heading order | `/` H1→H2×3 · `/about` H1→H2 · `/interests` `/contact` `/guestbook` H1 only: exactly one H1 per page, no skipped levels ✅ |
| Labels | Guestbook: `label[for]` ↔ `id` matches (snapshot shows textbox "ชื่อ" / "ข้อความ") ✅ · Contact form is hidden (`FORM_ENABLED=false`), but the source has a `label[for]` for every field |
| Skip link / landmark | No skip link · `<main>` has no `id` ❌ (2.4.1) |
| Target size | Nav text links **~57–77×22 px** (under 24px, but a 1.25rem gap means it passes the spacing exception in 2.5.8) · mailto/copy buttons **~50 px** ✅ |
| `lang` | `<html lang="th">` ✅ |

### Advocate

1. **Input borders are nearly invisible (2.56:1).** Low-vision users can't see where the field is, so they don't know where to click or type. It already affects Guestbook today, and it will hit the Contact form as soon as L12 turns it on. It's a one-line fix, so there's no reason to skip it.
2. **The honeypot `website` in L12 is a real a11y risk.** Hiding it only with CSS means a screen reader still reads the field, and a user who fills it in gets a fake 201: they see a success message but the message is silently thrown away. That's worse than a visible error. It must use `aria-hidden="true"` + `tabindex="-1"` + `autocomplete="off"` + an off-screen class. Do not use `display:none`, because some bots skip it.
3. **No skip link.** Keyboard users have to Tab through 5 links on every page (brand + 3 nav + the contact button). It's short, but a skip link is a basic requirement of 2.4.1.
4. **Guestbook `#entries` has `aria-live="polite"`.** When the page loads, a screen reader reads the whole list, and it repeats after every submit on top of `#gb-status`, which already says "ขอบคุณสำหรับข้อความ". That's too noisy.
5. **The Contact form (after L12) doesn't mark required fields visually and doesn't tie errors to fields.** A 400 only shows "ข้อมูลไม่ครบหรือไม่ถูกต้อง" without saying which field. The Advocate wants `aria-invalid` + `aria-describedby` on each field.
6. Minor: the brand link and "หน้าแรก" both go to `/` (duplicate link) · Guestbook `name` has no `autocomplete="name"`.

### Pragmatist

- **Accepted as pre-ship (P0):** #1 because it's one CSS line and a real failure. #2 because the Contact form won't open until L12 anyway, so the honeypot has to be done right the first time; otherwise a real customer's message gets lost silently. That's a business problem, not just a11y.
- **Pre-ship if there's time, otherwise the first round after ship (P1):** #3 skip link (~10 min · touches only BaseLayout) · #4 remove `aria-live` from `#entries` (2 min) · the required mark on the Contact form in #5, done together with L12.
- **Later (P2):** full per-field errors (`aria-invalid` per field), because the API returns a generic `{error}` and doesn't say which field (splitting it is backend work) · the duplicate link · bigger nav targets on mobile (it already passes 2.5.8) · an automated axe/Lighthouse scan in CI.
- **Reasoning:** text contrast, focus, headings and labels are all fine already. The site is 4 static pages plus one mailto channel (D7). The real risk is at the form entry points, so spend the 30 minutes there first.

**Summary of the debate:** they agree on #1 and #2 as P0. The Advocate wants #3 before ship, and the Pragmatist accepts it only if there's time. It's recorded as P1, so the owner decides at the ship gate.

## a11y Action items (prioritized P0/P1/P2)

| Pri | Item | WCAG | Files (owner) | Time | Status |
|---|---|---|---|---|---|
| **P0** | Input/textarea/select border `#94a3b8` → `#64748b` (≈ 4.76:1) | 1.4.11 | `src/layouts/BaseLayout.astro` (Claude) | 2 min | Diff proposed · waiting for approval |
| **P0** | L12 honeypot `website`: `aria-hidden="true"` · `tabindex="-1"` · `autocomplete="off"` · off-screen class (not `display:none`) · tell people "ห้ามกรอก" in the hidden label | 4.1.2 · 3.3 | `src/pages/contact.astro` (Claude) | 10 min | Do together with L12 |
| **P1** | Skip link "ข้ามไปเนื้อหา" as the first element in `<body>` + `<main id="main">` · visible on focus | 2.4.1 | `BaseLayout.astro` (Claude) | 10 min | Waiting |
| **P1** | Remove `aria-live` from `#entries` on Guestbook (`#gb-status` already announces) | 4.1.3 | `src/pages/guestbook.astro` (Claude) | 2 min | Waiting |
| **P1** | Contact form: mark required fields (text "จำเป็น", not colour alone) + `aria-describedby="status"` on the form | 3.3.2 | `contact.astro` (Claude) | 10 min | Do together with L12 |
| P2 | Per-field error messages + `aria-invalid`: needs the API to say which field failed | 3.3.1 | API (OpenCode) + UI | — | Send via handoff |
| P2 | Remove the duplicate link (brand vs "หน้าแรก") · `autocomplete="name"` on Guestbook · nav padding ≥ 24px on mobile | 2.4.4 · 1.3.5 · 2.5.8 | UI (Claude) | 10 min | After ship |
| P2 | Automated axe/Lighthouse scan + keyboard-only regression in `playwright/` | — | QA | 30 min | After L13 |
