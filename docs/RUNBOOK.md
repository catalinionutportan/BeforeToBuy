# BeforeToBuy.com — Operations Runbook

**Owner:** PortanX - Catalin Portan (`admin@portanx.com`)  
**Platform:** https://www.beforetobuy.com  
**Repo:** https://github.com/catalinionutportan/BeforeToBuy  
**Phase:** Production (controlled rollout)
**Last reviewed:** 2026-09-05

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

All 11 CH/DE/GB/US merchant import scripts and the RO 2Performant pipeline use
the shared atomic import helper.
An empty, inconsistent or failed import must preserve the previous committed
catalogue. Do not replace this with delete-then-create calls outside a transaction.
Products are upserted, not deleted, so other merchants' offers are not cascaded
away. RO downloads and validates every slice before publication, with a
100,000-row / 64 MiB normalized staging budget. Identical duplicate offers are
deduplicated; conflicting duplicates and over-budget feeds are rejected whole.

Before running this release or any of its import scripts, install the additive
version table once from the release directory:

```bash
node --env-file=.env.local --import tsx src/scripts/install-catalog-revision.ts --apply
```

This applies only `scripts/migrations/20260905-catalog-revision.sql`; it does not
rewrite Product/Offer data or synchronize unrelated schema/index drift. Do not
substitute a blanket `prisma db push`. The table has RLS enabled without anonymous
policies; the trusted Prisma database owner must retain read/write access.

Each successful import updates affected markets' `CatalogRevision` in the SAME
transaction, including markets of shared/previous products. Failed transactions
leave both data and revision unchanged. Origin cache keys and pending reads are
revision-scoped. New browse navigations check the committed revision; HTTP/CDN
product responses use `no-store`. The currently open grid is not polled, reordered
or replaced by an import. New deployment URLs use a bumped browse API version to
avoid responses cached under the previous deployment's URL.

Unexpected product OR offer reductions below 70% of the previous merchant total,
with an absolute drop of at least five, abort publication. The baseline is read
after acquiring the merchant lock. A deliberate reduction requires a one-off
`reductionOverride: { reason: "specific verified reason" }` at that import's
callsite; never add a permanent global bypass. Keep the reason/count comparison
in the operator's import record. This guard does not prove feed completeness or
stock accuracy, and does not catch every smaller drop.

Legacy/manual database maintenance scripts are NOT automatically versioned. After
an authorized maintenance operation, explicitly publish every affected market:

```bash
node --env-file=.env.local --import tsx src/scripts/publish-catalog-revision.ts --country=CH --country=DE --apply
```

This command only changes catalogue revisions, not products. Ordinary imports
must use their transactional publication instead of this separate command.

Metadata expires after 24h, lead IDs after 12h and first-page JSON after 2h, but
old revisions are no longer eligible after publication. Obsolete revision files
may remain on disk until an explicit targeted cache-retention operation; they are
not a fallback for the new catalogue. Restarting must not extend any entry's expiry.
`BROWSE_CACHE_DIRECTORY` optionally isolates persistent browse cache from `.cache`.
Do not delete `.cache` wholesale: it also holds the generated sitemap files.
See `docs/CATALOG-STABILITY-2026-09-05.md` and
`docs/CATALOG-FRESHNESS-2026-09-05.md` for evidence and remaining limitations.
