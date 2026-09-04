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

Imported merchants include Acer, baby-walz, Belando, Gigasport and Reifen.com CH;
Reifen DE; Arlo, Geepas and Seentat GB; DJI and Ottocast US. RO includes Rowenta
and Scule365; evoMAG remains soft-paused pending image/CDN readiness. Import
configuration is distinct from public request-time reads: production browsing
uses the imported PostgreSQL catalogue only, never the merchant feed pipeline.

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

## 7. File-based sitemaps (2026-09-05)

Public `/sitemap.xml` and `/sitemaps/*` read completed files only. They must never
load merchant feeds or build a full catalogue. Missing index files return a small
static-page sitemap; missing shards return 404.

After successful catalogue imports, run `npm run sitemap:generate` in the NAS
release directory with its protected `.env.local`. This is an offline job, not a
public API. It queries the database sequentially in 2,000-product batches with
query timeouts, writes immutable 10,000-URL shards, then atomically replaces the
index. Empty results or failures preserve the previous index. No cron scheduler
has been added by this change: existing import operators must include this step.

Preserve `.cache/sitemaps` during deployments and rollback. `SITEMAP_DIRECTORY`
can instead point to a persistent mounted directory. Retain prior-generation
shards for cached indexes; do not clean them during publication. If generation
crashes and leaves `.generation-lock`, first confirm no generator is running,
then remove only that empty lock directory and retry.

Production product pages perform one indexed DB lookup. Missing IDs render the
not-found page with `noindex` (Next.js streamed responses can retain HTTP 200);
database errors surface as errors, never a full cross-market feed scan. Feed-only
products must be imported into the database before they can have a public detail
page. Sample-mode tests retain the checked-in feed lookup.

## 8. Atomic catalogue imports and cache freshness (2026-09-05)

All 11 CH/DE/GB/US merchant import scripts use the shared atomic import helper.
An empty, inconsistent or failed import must preserve the previous committed
catalogue. Do not replace this with delete-then-create calls outside a transaction.
Products are upserted, not deleted, so other merchants' offers are not cascaded
away. ROMANIA imports are outside this migration.

Atomic database publication does not invalidate every browse cache immediately.
Metadata expires after 24h, lead IDs after 12h, first-page JSON after 2h and browser
session pages after 15min; HTTP/CDN caches have additional short freshness windows.
Restarting alone does not clear disk/Redis cache and must not extend its expiry.
`BROWSE_CACHE_DIRECTORY` optionally isolates persistent browse cache from `.cache`.
Do not delete `.cache` wholesale: it also holds the generated sitemap files.
See `docs/CATALOG-STABILITY-2026-09-05.md` for evidence and remaining limitations.
