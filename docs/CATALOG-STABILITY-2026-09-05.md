# Catalogue stability — second remediation batch, 2026-09-05

Historical release record. Follow-up revision-based freshness, incomplete-feed
guard and RO import/cold-read work are documented in
`CATALOG-FRESHNESS-2026-09-05.md`; the limitations below describe this earlier release.

Scope: CH, DE, GB, US. Romania presentation redesign remains deferred. This
batch addresses confirmed faults, not an exhaustive certification of every
product, merchant destination or legal requirement.

## Confirmed faults corrected

- `/api/products` no longer substitutes the general first page for a failed
  search, category, price/brand filter or later page. Empty results stay empty;
  failures return a retryable 503 without unrelated products. Any fallback must
  match the exact cacheable country/category/limit request.
- Homepage SSR follows the same exact selection, including search/store/brand/
  prices/sort/page; no category-to-All or legacy-cache fallback can seed a wrong
  cache key. Filtered initial data cannot seed the browser's All catalogue key.
- Production catalogue reads use PostgreSQL only, even when empty or failing.
  They cannot start the full merchant feed pipeline. Sample mode is explicit.
- Identical pending catalogue reads share one operation; pending keys are bounded
  to 64. Errors are not cached, and retries can start again after completion.
- Category covers use SQL DISTINCT ON with deterministic ordering, returning one
  row per category. Brands use SQL grouping. This removes large result transfers
  caused by Prisma 5 client-side distinct processing.
- A cold filtered request now obtains the actual country count instead of zero.
- Cold All browsing and metadata warming reuse the sum of category leaf counts
  instead of duplicating the full-country COUNT. The redundant CH count took
  11.5s in one bounded candidate diagnostic; category aggregation took 2.9s.
- Related-leaf filters obtain their complete matching count rather than using
  a single leaf's cached count, which could prematurely truncate pagination.
- Cache promotion between disk/Redis/process memory preserves the original
  expiry. Disk writes use a temporary file and atomic rename. Process cache is
  bounded. Browser session pages expire after 15 minutes even without reload;
  API-version mismatch rejects obsolete stored pages.
- All 11 CH/DE/GB/US importers now use a single PostgreSQL transaction with
  validation, merchant advisory lock, bounded timeouts and bulk product upserts.
  Only the importing merchant's offers are replaced. Product rows are never
  deleted as an import step, protecting other merchants' offers; target-country
  membership is merged. Empty/duplicate/inconsistent payloads are rejected.
- The canonical `gaming-vr` leaf no longer resolves to all Electronics. Occupied
  leaves outside compact hubs are included in the category menu. CH Beauty/Baby
  shortcuts retain their merchant filter. Hair Care no longer includes unrelated
  Cosmetics.

## Evidence and reproduction

- 74 unit-test files / 332 tests pass; ESLint and TypeScript pass.
- 31 browser tests pass, including a 375px delayed product-navigation close,
  exact grid restoration, failed searches, consent and accessible detail views.
- A separate PostgreSQL database on localhost:55439 was initialized with the
  project schema, never production credentials or copied user data.
- Real transaction integration checks passed: commit; injected failure after
  offer deletion rolls back both products and offers; another merchant's offer
  survives; shared product target countries remain CH + DE.
  Reproduce with `ATOMIC_IMPORT_TEST_DATABASE_URL=postgresql://...@127.0.0.1:55439/postgres?sslmode=disable
  node --import tsx scripts/verify-atomic-import.ts`; the script refuses other
  hosts/ports and only cleans its exact fixture IDs.
- Synthetic fixture: 202,263 products/offers, matching the four market sizes
  (115,528 CH; 84,265 DE; 1,575 GB; 895 US), not their real product distributions.
  `scripts/fixtures/catalog-load-test.sql` and
  `scripts/verify-isolated-catalog-load.mjs` are restricted to the isolated test
  ports. No stress requests were sent to production.
- First local run: market requests 193/59/33/28ms; 10 identical concurrent reads
  26–28ms; 10 distinct pages 57–71ms. All returned 48 products; distinct pages had
  480 unique IDs. Unknown search returned zero products. Repeat after process
  restart with preserved disk cache passed (first pages 2–71ms).
- Final-code synthetic rerun with a new empty cache also passed: first pages
  CH/DE/GB/US 182/46/26/25ms, ten identical requests 22–24ms and ten distinct
  pages 23–34ms.
- These timings measure a local synthetic test, not real-user performance, mobile
  radio speed, Core Web Vitals or a production latency guarantee. Chrome DevTools
  performance tooling was unavailable; no Lighthouse/CWV score is claimed.

## Remaining work / operational limits

- Imported changes are atomic in the database, but existing browse caches still
  have bounded freshness windows: metadata 24h, lead IDs 12h, first-page JSON 2h,
  browser session 15min, plus HTTP/CDN freshness. Immediate end-to-end invalidation
  after an import is NOT implemented. A future per-country catalogue generation
  must cover all cache layers and preserve the user's open page/order, rather than
  reshuffling an active grid automatically.
- Import validation does not prove that a nonempty feed is complete or accurately
  classified. Large unexpected count reductions need a dedicated import guard.
- Product rows no longer offered by a merchant are retained (no destructive
  cleanup); browse filters require an in-stock offer. Shared product descriptive
  fields still follow the last importer, while offers/countries are preserved.
- Rims/complete-wheel taxonomy remains a legacy combined interpretation and
  requires separate refinement; this batch does not bulk-reclassify real rows.
- GB has 34 stored `unmapped` products, intentionally absent from category tiles.
  Individual external product URLs, all image pixels and every taxonomy assignment
  have not been manually validated. No production affiliate clicks in this audit.
- Romania cold-start behaviour and its presentation cards remain separate work.
  Offline sitemap generation after imports still follows the existing runbook.

## Publication

Runtime commit `5a5e29a` published on the NAS and public domain after candidate
build, tests and real-catalogue verification. Previous live release preserved at
`/share/Container/beforetobuy-backup-pre-stability-20260905-0205`. Container-mounted
source/build fingerprints match the deployed release. Temporary candidate
container removed; isolated local PostgreSQL stopped. No production catalogue
rows were deleted, imported or rewritten during this audit.

The initial candidate (before removal of the redundant country count) returned
503 for cold CH/DE. It was not published. After that correction, a new empty
application-cache directory returned 200 for all markets on their first request:
CH 5,792ms; DE 1,788ms; GB 481ms; US 336ms; RO 1,643ms. Each returned 48 products
and the expected totals. These are NAS-to-database application-cold samples, not
a claim that the database's own buffer cache was cold. CH cold startup remains
slower than desired; the seven-second failure boundary has not been increased.

Final candidate browser check passed for CH/DE/GB/US: 48 cards each; exact order
and position restored within 3px after modal close; page 2 has no duplicate IDs
from page 1; no horizontal overflow at 375/768/1440px. Rail category counts:
20/3/15/6. All 23 sitemap shards served 210,178 URLs.

Targeted real-catalogue API checks: CH Hair Care + Belando returned only Hair
Care/Hair Styling (5,976 total); GB VR returned exactly one VR product, not the
general electronics catalogue; an unknown CH search returned zero products.

After candidate restart with disk cache preserved, all five markets returned 48
products with cache hits (13–239ms, local network). Public warmed API samples after
cutover: CH 144ms; DE 112ms; GB 62ms; US 63ms, all 200 with expected totals.

Public browser verification repeated successfully for all four markets, including
modal position/order, disjoint page 2, responsive widths and all sitemap shards.
The first public RO request at the separate 24-product page size returned the
known 7-second timeout/503. The next full smoke run passed all 9 checks, including
RO catalogue and consent. RO cold-start timeout is therefore still OPEN, not
declared fixed by its successful retry. No guarantee of uniformly fast cold
queries is made.
