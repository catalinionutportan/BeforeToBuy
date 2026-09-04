# Catalog/UI remediation — 2026-09-05

Scope: CH, DE, GB, US. Romania presentation redesign is deferred. This report
does not claim exhaustive manual validation of every product or affiliate URL.

## Changes

- Public sitemap no longer calls full-catalogue/feed loaders. An offline,
  sequential generator publishes immutable XML shards and an atomic index.
  Generated 210,020 eligible product URLs, 136 category URLs and 22 static URLs,
  across 23 files. Previous index survives errors or empty DB results.
- Production detail lookup uses the database only; missing products cannot
  trigger scans across every market. DB errors are not disguised as missing
  products. Feed-only products need importing before public detail pages work.
- Category/search loading hides stale cards; failed requests (including 429)
  show a retry notice instead of presenting old products as new results.
- Small complete catalogues are no longer rejected by a cache heuristic that
  demanded more results than the page contained.
- Closing the instant modal before product navigation commits now cancels the
  pending navigation instead of popping an unrelated browser-history entry.
  Late server enrichment cannot reopen a dismissed preview. Return URLs retain
  market and language as well as filters/page.
- All configured eligible rail tiles are reachable, rather than only the first
  12. CH now exposes 20, GB 15; DE 3 and US 6 in the audited catalogue.
- Four proven mismatched covers replaced by verified product/category images:
  Mavic drone, Osmo Action camera, RS stabilizer, Sisley lipstick. URLs returned
  images and the rendered pixels were inspected.
- Mobile pagination controls added above results; both pagination locations
  have accessible button names. Sort label contrast improved. Desktop still
  uses four columns; responsive column rules unchanged.
- Conservative mapping changes prevent 100 misclassification proposals on
  future imports. Current DB rows already correct: **zero DB writes**. See the
  separate classification dry-run report for exact IDs and limitations.

## Verification

- ESLint and production builds pass locally and on NAS.
- 301 unit tests pass. 31 browser tests pass with checked-in sample feeds,
  including delayed-navigation close and failed-search regression cases.
- Real-catalogue candidate at NAS port 3002: CH/DE/GB/US each rendered 48
  products; page 2 had no overlapping product IDs; modal close retained exact
  order and viewport position within 3px. No horizontal page overflow at
  375px, 768px, 1440px. Reproduce with `AUDIT_BASE_URL=... node
  scripts/verify-catalog-audit.mjs`.
- All 23 generated sitemap shards served successfully: 210,178 URLs total.
- Candidate local-network samples, not Core Web Vitals or load tests: sitemap
  142ms first request / 15ms repeat; missing-product response 206ms; health 16ms.
  Missing-product streamed HTML had `noindex` and not-found content but HTTP
  200; proper HTTP 404-before-streaming remains an SEO follow-up.

## Still open

- No claim that all external merchant pages, images, buttons, taxonomy leaves,
  or individual products were manually tested. Affiliate destinations were not
  clicked in the real-catalogue candidate audit.
- Ambiguous product taxonomy (ordinary watches, generic cables/batteries,
  beauty accessories) needs a dedicated review, not bulk remapping by keyword.
- Mobile still returns 48 products per page; top pagination improves access,
  but a consistent configurable page-size design remains a separate change.
- Offline sitemap generation must be run after imports; no recurring scheduler
  was added. Historical shards are retained and need an explicit retention plan.
- These changes remove identified expensive request paths, not a guarantee
  against every possible latency cause. Ongoing real-user performance metrics
  and a controlled non-production load test are still needed.
