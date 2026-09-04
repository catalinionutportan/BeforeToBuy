# BeforeToBuy.com — Operations Runbook

**Owner:** PortanX - Catalin Portan (`admin@portanx.com`)  
**Platform:** https://www.beforetobuy.com  
**Repo:** https://github.com/catalinionutportan/BeforeToBuy  
**Phase:** Production (controlled rollout)
**Last reviewed:** 2026-09-04

---

## 1. Architecture snapshot

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 16 App Router, React 19, Tailwind |
| Hosting | Self-hosted QNAP/NAS container behind Cloudflare |
| Catalogue | Supabase Postgres (Prisma); RO offline 2Performant import; AWIN GB Seentat + US Ottocast |
| Cache | Self-hosted Redis/disk cache; Upstash only when explicitly configured |
| APIs | `/api/products`, `/api/health`, `/api/contact`, `/api/consent`, cron warm/snapshot |

Configured merchants include Rowenta, Scule365 (2Performant RO), Seentat (AWIN UK), Ottocast (AWIN US). evoMAG is soft-paused until image/CDN readiness. CH feeds remain disabled pending approval.

---

## 2. Deploy flow

1. Run lint, typecheck, unit tests and production build locally/CI.
2. Copy the source to a unique NAS release directory without `.git`, `node_modules`, build outputs, caches or secret files.
3. Copy the protected production environment and required warm cache into the candidate release.
4. Build the candidate image and verify it on a separate temporary port.
5. Create a recoverable backup of the live release, switch the live directory, then restart the application container.
6. Run production smoke:

```bash
npm run smoke:prod
```

7. Verify `/status` and public `/api/health` (cheap summary). Full diagnostics require the protected internal authorization token.

---

## 3. Rollback

**NAS release rollback:**
1. Stop the application container.
2. Restore the exact last known-good release directory from the pre-cutover backup.
3. Start the container and run the production smoke checks.

**Git:**
```bash
git revert <bad-commit-sha>
git push origin main
```

---

## 4. Environment variables (NAS runtime)

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
