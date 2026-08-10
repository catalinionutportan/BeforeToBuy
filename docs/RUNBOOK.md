# BeforeToBuy.com — Operations Runbook

**Owner:** PortanX - Catalin Portan (`admin@portanx.com`)  
**Platform:** https://www.beforetobuy.com  
**Repo:** https://github.com/catalinionutportan/BeforeToBuy  
**Phase:** Production (controlled rollout)
**Last reviewed:** August 2026

---

## 1. Architecture snapshot

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 16 App Router, React 19, Tailwind |
| Hosting | Vercel (auto-deploy on push to `main`) |
| Catalogue | Supabase Postgres (Prisma); RO offline 2Performant import; AWIN GB Seentat + US Ottocast |
| Cache | Upstash Redis for feed warm / rate limits / price history (when configured) |
| APIs | `/api/products`, `/api/health`, `/api/contact`, `/api/consent`, cron warm/snapshot |

Configured merchants include Rowenta, Scule365 (2Performant RO), Seentat (AWIN UK), Ottocast (AWIN US). evoMAG is soft-paused until image/CDN readiness. CH feeds remain disabled pending approval.

---

## 2. Deploy flow

1. Push to `main` → GitHub Actions CI (lint, typecheck, build, E2E)
2. Vercel auto-deploys on green push
3. Run production smoke:

```bash
npm run smoke:prod
```

4. Verify `/status` and public `/api/health` (cheap summary). Full diagnostics require `Authorization: Bearer $INTERNAL_API_SECRET`.

---

## 3. Rollback

**Vercel (fastest):**
1. Vercel Dashboard → Project → Deployments
2. Find last known-good deployment → **Promote to Production**

**Git:**
```bash
git revert <bad-commit-sha>
git push origin main
```

---

## 4. Environment variables (Vercel)

See `.env.example` for the full template. Critical separation:

| Variable | Purpose |
|----------|---------|
| `CRON_SECRET` | **Only** `/api/cron/*` (feeds-warm, price-snapshot). No fallback to INTERNAL. |
| `INTERNAL_API_SECRET` | **Only** full health diagnostics, mapping report, integrations status. No fallback to CRON. |
| `CONSENT_SIGNING_SECRET` | Signs Affiliate consent HttpOnly cookie |
| `DATABASE_URL` / `DIRECT_URL` | Supabase Postgres |
| Feed URL / `AWIN_API_KEY` vars | Merchant feeds (treat as secrets) |
| Upstash / Resend / Datadog | Optional |

Never commit secret values. Confirm processor regions in vendor accounts / DPAs (see `docs/compliance/`).

---

## 5. Monitoring & health

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | Public: cheap cached summary (no commit/env/product counts). Internal Bearer: full diagnostics |
| `GET /status` | Human-readable public status |
| GitHub Actions | CI, CodeQL, Dependabot, cron warm/import, prod smoke |
| `npm run smoke:prod` | Post-deploy production smoke |

**Alert manually if:** public health is degraded/unhealthy, smoke fails, or feed import/warm fails.

---

## 6. Compliance docs

Internal drafts (with TODOs — not completed attestations) live under `docs/compliance/`.
