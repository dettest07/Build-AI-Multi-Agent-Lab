# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

Node ≥ 22.12 · Windows/PowerShell is the primary environment.

```powershell
npm run dev                          # astro dev → http://localhost:4321
npm test                             # vitest: tests/**/*.test.ts, EXCLUDES tests/labs (CI runs this + build)
npm run test:labs                    # vitest --config vitest.labs.config.ts → tests/labs only
npx vitest run tests/smoke.test.ts   # single file ( -t "<name>" for a single test )
npx vitest run --config vitest.labs.config.ts tests/labs/lab05-api.test.ts
npm run test:e2e                     # playwright/ against PLAYWRIGHT_BASE_URL (default 127.0.0.1:4321) — start the server first
npm run build && npm start           # SSR build → node ./dist/server/entry.mjs
```

No linter is configured.

## Architecture

- **Astro SSR** (`output: 'server'`, `@astrojs/node` standalone). API routes in `src/pages/api/*.ts` set `prerender = false`.
- **Profile content is file-driven:** `src/lib/profile.ts` `loadProfile()` parses `## Name / Headline / Bio / Audience / Interests` sections of `docs/PROFILE.md` at request time, falling back to a hard-coded `FALLBACK`. Pages and `GET /api/interests` both use it — so editing `docs/PROFILE.md` changes the live site, and the Dockerfile copies `docs/` into the runtime image for this reason. Known parser bug: see `docs/OPEN_LOOPS.md` (L2).
- **Persistence (OpenCode-owned):** `src/lib/db.ts` — `better-sqlite3`, DB at `$DATA_DIR/site.sqlite` (default `./data`, `/data` volume in Docker); tables created lazily in `getDb()`. `insertContact` / `listGuestbook` / `insertGuestbook` are stubs throwing `NOT_IMPLEMENTED…` until Lab 05; the API routes map that prefix to **501**, other errors to 400/500.
- **API contract** (all JSON; error body `{ error: string }`):

  | Route | Success | Error mapping |
  |---|---|---|
  | `GET /api/interests` | 200 `{ interests: string[], source: 'profile' }` | — |
  | `POST /api/contact` `{name,email,message}` | 201 row | `NOT_IMPLEMENTED*` → 501 · else 400 |
  | `GET /api/guestbook` | 200 `{ entries: GuestbookEntry[] }` | 501 · else 500 |
  | `POST /api/guestbook` `{name,message}` | 201 row | 501 · else 400 |

  Frontend forms must target this contract; changing it is an OpenCode (backend) task — request via handoff, don't edit `src/pages/api/*` or `src/lib/db.ts` from Claude.
- **DB singleton gotcha:** `getDb()` caches the connection module-wide, so `DATA_DIR` must be set before the first call (the lab05 test relies on this).
- **Pages:** `src/pages/{index,about,interests,contact,guestbook}.astro` all wrap `src/layouts/BaseLayout.astro`.
- **Env** (`.env.example` → `.env`, gitignored): `STUDENT_SLUG`, `SITE_URL`, `HOST`/`PORT` (127.0.0.1:4321), `DATA_DIR`, `GITHUB_PERSONAL_ACCESS_TOKEN` (GitHub MCP), `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`, `COOLIFY_DEPLOY_WEBHOOK`. Also gitignored: `.mcp.json`, `.claude/settings.local.json`, `data/`, `docs/_cli-*`.
- **Test split:** `tests/labs/` is intentionally **RED on a fresh template** (lab05 goes green when db stubs are implemented) and is kept out of `npm test`/CI. `tests/public-site.test.ts` fails if rendered markup in any `src/**/*.astro|html` (frontmatter + HTML comments stripped) matches `lab <N>` / `แล็บ` — never put course/lab references in visible UI text; code comments in `.ts` are fine.
- **Deploy:** Dockerfile (multi-stage, builds native `better-sqlite3`) → Coolify at `SITE_URL`. `astro.config.mjs` reads `SITE_URL`.
- Course scaffolding lives outside `src/`: `labs/` (lab instructions), `.github/course-issues/` + `scripts/create-course-issues.mjs`, `.claude/agents|skills`, `.opencode/agents|skills`, `docs/*.example` templates.

# Claude Code — seed คอร์ส (อย่าลบตอน /init)

หลัง Lab 00 ให้ `/init` **merge** — เก็บกฎด้านล่างไว้เสมอ

## สี่เสา (ย่อ)

1. Multi-Agent แยกหน้าที่/ความจำ · 2. Sub-Agent ใช้แล้วทิ้ง · 3. ประสานผ่าน docs/PR · 4. Swarm เพดาน **20 turns**

## Ownership (บังคับ)

| Artifact | Owner |
|---|---|
| UI | Claude · `.claude/agents/frontend.md` |
| API + SQLite | OpenCode · `.opencode/agents/backend.md` |
| docs PROFILE / DEBATE / DECISIONS | Claude (Lab 01–02) |
| Hot state STATUS / OPEN_LOOPS | ผู้ถืองานรอบนั้น (single-writer) |

**Frontend = Claude · Backend = OpenCode** — Claude ไม่แก้ `src/lib/db.ts` / `src/pages/api/*` เว้นแต่ handoff โอนงานชัดเจน

## Canonical context (อ่านก่อน · อย่าคัดลอกซ้ำในไฟล์นี้)

ก่อนลงมือ:

1. `docs/STATUS.md`
2. `docs/OPEN_LOOPS.md`
3. handoff ล่าสุดใน `docs/handoffs/` (ถ้ามี)
4. ตามงาน: `docs/PROFILE.md` · `docs/DECISIONS.md`

สรุป Goal / Latest D-id / Open loops / Blockers **ไม่เกิน 8 บรรทัด**  
ห้ามสมมุติจากแชท OpenCode ถ้าไม่มีใน `docs/`  
จบงานที่เปลี่ยนสถานะ → อัปเดต STATUS / OPEN_LOOPS · สลับ harness → เขียน handoff จาก [`docs/handoffs/TEMPLATE.md`](docs/handoffs/TEMPLATE.md)

## กฎสั้น

- Root เท่านั้น · plugin **project scope**
- Skill **`public-site-safe`**
- Agent ถาวรใช้ `memory: project` (harness) — ตรวจใน Lab 00 · ห้ามสร้าง memory bus เอง
- **ห้ามใช้ MCP เป็นท่อส่งงาน** — MCP ไม่ใช่ท่อ Claude ↔ OpenCode (ท่อ = ไฟล์ใน `docs/`) · Cross-CLI เฉพาะ Lab 07
- **ห้าม commit `.env`** (รวม PAT / webhook / `.mcp.json`) · PR เข้า learner repo เท่านั้น
- Swarm: หยุดเมื่อ done หรือครบ 20 turns
- STATUS/OPEN_LOOPS = single-writer · commit ก่อนสลับ harness

## Labs

ดู [`labs/README.md`](labs/README.md) · เริ่ม [`lab-00-project-init`](labs/lab-00-project-init/README.md)
