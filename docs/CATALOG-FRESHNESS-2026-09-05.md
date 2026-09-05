# Catalogue freshness and cold reads — 2026-09-05

Scope: stabilize CH/DE/GB/US/RO catalogue reads and import publication. Romania's
presentation-card redesign, every product's taxonomy, merchant live-stock
verification and legal certification are not included in this batch.

## Changes

- Per-country `CatalogRevision` is published in the same database transaction as
  a merchant catalogue. Old/new/shared product markets are included. Request-local
  revision scopes prevent a read begun before an import from poisoning a later
  revision's cache. First pages, metadata, lead IDs, pending request coalescing,
  category pages and background warming use the same revision boundary.
- Browser navigations reach the origin instead of reusing tab-local snapshots;
  HTTP/CDN responses use no-store. Active grid state remains untouched when a
  product opens/closes or an import happens. Re-confirming the same market during
  hydration no longer creates a new location object and triggers a duplicate load.
- Merchant import guard rejects unusually incomplete feeds after acquiring the
  merchant lock: fewer than 70% of previous products OR offers, with a drop of at
  least five. Smaller reductions remain possible. A deliberate reduction requires
  an explicit reason for that operation; no global disable switch.
- RO 2Performant importer stages all slices before database publication. Its
  100,000-row and 64 MiB normalized-JSON budgets reject overlarge feeds rather than
  publishing truncated output. Identical offer duplicates are merged, conflicting
  duplicates reject the operation. Shared product identity/countries/offers are
  preserved; stale merchant offers are replaced within the transaction.
- RO/GB/US natural-order queries select matching market IDs with the existing GIN
  country index before sorting/paging. Price-filter semantics are unchanged,
  including null totalPrice. CH lead ordering and explicit price/newest sorts are
  separate existing paths.
- Cold category and brand aggregations also narrow to the market before grouping
  visible products. They preserve exact counts, including the CH wheel split.

## Evidence so far

- Production read-only SQL diagnosis: old RO first-24 query scanned/rejected
  approximately 202,263 other-market products and exceeded 7 seconds. Market-first
  SQL took about 56 ms; offset 2400 about 52 ms versus 5.22 seconds previously.
  RO Rowenta SQL about 160 ms versus 1.03 seconds. These are database samples,
  not end-to-end page timings or guaranteed user performance.
- 78 unit-test files / 351 tests passed (the explicit PostgreSQL integration case
  is skipped in the default suite and passes when enabled); lint, TypeScript and
  production builds passed. All 32 browser tests passed. Browser import simulation asserts
  unchanged card order/position on modal close, then updated content on new browse.
- Isolated PostgreSQL tests verify commit, full rollback after an injected write
  failure, preserved foreign offers/countries, revision publication/rollback,
  guarded 8-to-2 reduction and concurrent imports checking the post-lock baseline.
- RO importer tests include a failed second slice (zero publication), duplicates,
  GTIN identity, foreign minimum price and real transactional 8-to-1 rejection.
  Fixture writes are restricted to localhost:55439, never production.
- Read-only RO baseline: Aqualine 986 active/986 total offers; Rowenta 382/382;
  Scule365 1,194/1,253; evoMAG 5,229/5,634. Legacy inactive offers alone do not
  cause a below-70% rejection for these merchants. Incoming feeds still require
  actual validation; no production feed was imported during this audit.
- Initial NAS candidate with empty application cache still returned 503 for cold
  first pages. This candidate was not published: faster product-ID selection alone
  did not eliminate cold metadata aggregation delays. Further cold verification
  is required before claiming the complete request is fixed.
- After the metadata SQL correction, a NEW empty candidate cache returned first
  requests successfully: RO limit24 1,638ms; CH limit48 2,845ms; DE 1,613ms;
  GB 1,026ms; US 839ms. All responses were 200/cache-miss with full expected counts
  7,791/115,528/84,265/1,575/895. RO offset2400 took 908ms, Rowenta search 792ms.
  The 7-second request timeout was not increased. These are application-cold,
  NAS-to-database samples, not cold database-buffer or real-user/CWV measurements.
- Infrastructure read-only observations found no NAS memory/CPU pressure, OOM,
  blocked transactions or concurrent imports. PostgreSQL roundtrip alone was
  approximately 161–165ms from the NAS, so external latency remains material.

## Operational limits

The version table is additive and can remain during application rollback. Manual
maintenance outside the atomic helper needs an explicit revision publication;
see RUNBOOK section 8. Old cache-generation files are ineligible but may remain on
disk pending targeted retention. Offline sitemap generation remains a separate
post-import step. No stock realtime guarantee, full taxonomy review, uniform
latency guarantee or Core Web Vitals score is claimed.
An unknown CH text search still took approximately 5.3 seconds in one candidate
sample (honest empty result, no unrelated cards). Broad text-search optimization
remains a separate follow-up; the faster first page does not mean every filter
is now sub-second. Romania's existing broad `electronics` classification and
presentation-card redesign are intentionally deferred.

Follow-up: `SEARCH-CATEGORY-AUDIT-2026-09-05.md` records partial text-search
optimization, bounded self-hosted SQL reads and the remaining cold-search failures.

## Publication

Runtime commit `2f8443c` published on the NAS and public domain after successful
final candidate verification. Prior live release preserved at
`/share/Container/beforetobuy-backup-pre-freshness-20260905-0255`.
Container-mounted source and BUILD_ID hashes match the deployed release.

Final candidate AND public browser flows passed for CH/DE/GB/US: 48 unique cards,
same order and vertical card position (within 3px) after modal close, page 2
disjoint from page 1, no horizontal overflow at 375/768/1440px. Presentation rails
remain above products with 20/3/15/6 categories. All 23 sitemap shards served
210,178 URLs. No production affiliate links were clicked.

Targeted checks: CH Hair Care with Belando returned 24 products from Hair Care /
Hair Styling and total 5,976 (1,910ms); GB VR returned exactly one VR product;
unknown CH search returned an honest empty result. RO deep-page and search
samples are recorded above; RO visual taxonomy was not redesigned.

All nine public smoke checks passed on the first post-cutover run, including the
previously problematic RO limit24 request and pagination metadata, plus consent
save/clear. Public warmed limit48 API samples: RO 643ms, CH 427ms, DE 221ms,
GB 238ms, US 222ms. Every response was 200 with expected counts, origin cache hit,
Cloudflare DYNAMIC and HTTP no-store; origin caches remain revision-scoped.

No production products/offers were imported, deleted or rewritten during this
audit. The only database schema change was the additive version table with RLS.
The stopped temporary candidate container was removed after verification; the
isolated local PostgreSQL service was stopped with its fixture directory retained.
