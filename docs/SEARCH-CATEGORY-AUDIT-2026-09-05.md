# Search and presentation-category follow-up — 2026-09-05

Scope: CH, DE, GB and US. Romania's feed additions, taxonomy/presentation work
and identical-product comparison are deferred at the owner's request. No
production feed import, product/offer rewrite or schema change in this batch.

## Correctness changes

- Natural-order text searches in the four markets compute exact matched count
  and page IDs from one materialized matching set instead of evaluating the
  expensive text predicates independently for count and page. Filters retain
  their existing same-offer semantics, including null totalPrice, delivery,
  merchant domain, brand, GTIN and category expansion. RO's query path is unchanged.
- Cold exact country counts narrow to the market first. Search/filter requests
  no longer start detached global metadata scans in these four markets. Redis
  background warming is restricted to unfiltered first browse pages, preserving
  the existing RO lifecycle. This reduces unnecessary work, not a latency SLA.
- A final browser run exposed a slow DE page-two Prisma scan. DE natural-order
  browsing now uses the same market-ID-first strategy already used by RO/GB/US,
  retaining exact counts, filters, order and offsets. The cancelled slow read was
  observed in the candidate and publication was paused for this correction.
- The CH wheel-classification SQL requires the Reifen classification offer itself
  to be active, matching the existing Prisma predicate.
- CH Hair Care (5,935) and Hair Styling (41) previously opened the same expanded
  5,976-product selection while presenting separate counts. One combined tile and
  label now represents that selection in the rail, search category options and
  desktop/mobile navigation. Legacy secondary IDs retain selection highlighting.
  The combined tile stays available when only the secondary member has stock or
  a cover. RO's separate categories are preserved.
- Search keyboard handling preserves the entered text after Escape (including
  preventing the native `type=search` clear action), dismisses stale hovered
  options synchronously and ignores late suggestion reopening for that query.
  The actual browser import-revision/navigation regression now passes.

## Audit coverage

The initial read-only audit covered 44 presentation categories (CH20/DE3/GB15/US6)
and sampled 1,547 products, at most 48 per category. Two CH presentation-count
differences were the shared Hair Care/Hair Styling selection above. Re-evaluating
the corrected resolver against the same live catalogue covered 43 presentation
categories (CH19/DE3/GB15/US6), sampled 1,499 products, with zero expanded-category
mismatches and zero presentation-count differences. This is not an exhaustive
semantic/manual-image audit of every product, nor a real-time stock attestation.

## Performance evidence and remaining limitation

Read-only SQL samples on CH: old unknown-term COUNT exceeded its 7-second SQL
budget; old page selection took 1,815ms; combined matching/count/page took 1,445ms.
Acer samples: old count 4,477ms plus old page 3,378ms; combined 2,407ms, with 413
matches and 48 returned IDs. These are individual samples, not user-visible timings.

Cold candidate API checks have been inconsistent. Early empty-cache requests
returned CH 503 at about 7.7 seconds, while subsequent Acer pages took 1.8 seconds.
After foreground metadata warming was removed, another first cold request still
returned 503. An instrumented fresh process later returned CH unknown 3,777ms,
CH Acer 1,779ms and DE unknown 3,113ms, all 200. The instrumentation showed the
query/count work, not cache lookup, accounting for most of the time. A separate
country-count sample ranged from 5,149ms to a 356ms database execution plan plus
connection/roundtrip overhead. No timeout was increased to hide this variability.

Additional simultaneous candidate browser/diagnostic activity produced slow US
reads (18–28 seconds after the HTTP deadline). A single-connection candidate also
timed out and was stopped, so no pool-limit change is proposed. A proposed cold
combined country+search query exceeded its read-only SQL budget and was rejected;
it is diagnostic code only, not part of the application query path.

The original application-level response timeouts did not cancel already-running
SQL. This batch adds bounded read-only transactions on the current NAS/no-Redis
path for CH/DE/GB/US foreground catalogue reads and API cached-page metadata
recovery. SQL statements are limited to 4,500ms; PostgreSQL 17+ bounds the
transaction at 5,500ms; Prisma allows 6,000ms with 500ms acquisition wait. The
transaction client is request-scoped; detached warming is excluded, including
lowercase country inputs. RO, remote-Redis configurations and standalone
cron/metadata helpers are not covered by this guard. Cache I/O inside it is local
on this NAS configuration.

The production database reports PostgreSQL 17.6. The isolated PostgreSQL 16 test
cancelled a 10-second statement in 4,520ms, verified zero remaining active probes,
reset timeout settings and a successful immediate read. Two sequential 3.2-second
probes exceeded Prisma's transaction deadline and terminated in 6,410ms with no
orphan. The PG17 server transaction-deadline branch is documented, but was not
tested with deliberate slow queries on production. Sources:
[PostgreSQL timeouts](https://www.postgresql.org/docs/17/runtime-config-client.html),
[Prisma transaction lifecycle](https://www.prisma.io/docs/orm/v6/prisma-client/queries/transactions).

The bounded candidate still returned a controlled 503 for its first unknown CH
search at 5,544ms; this is NOT recorded as a successful search. Subsequent requests
passed: CH Acer first page 3,155ms and page two 1,855ms (413 matches), DE unknown
3,491ms (zero matches), GB Arlo 818ms (75 matches), US DJI 707ms (881 matches).
The guard contains runaway work; it does not eliminate cold-search failures.
A measured cold/concurrent-read optimization remains follow-up work. At an idle
diagnostic snapshot there were no active/blocked application DB queries and no NAS
CPU/memory pressure. This snapshot does not rule out transient database pressure.

## Verification tools

- `scripts/verify-search-pagination.ts`: fixture writes restricted to isolated
  localhost PostgreSQL port 55439. Verifies all four search fields, exact counts,
  disjoint/beyond-end pages, combined filters, unknown query and active Reifen
  classification. All scenarios passed; fixtures removed afterward.
- `scripts/profile-search-reads.ts`: bounded read-only SQL samples and optional
  execution-plan/activity inspection. Experimental variants require an explicit
  operation argument and are never selected by the application.
- `src/scripts/audit-presentation-rails.ts`: sequential read-only category checks.
- `CATALOG_READ_TIMINGS=1`: opt-in country/stage/duration diagnostics; no search
  strings, product payloads or credentials are logged.

## Final candidate verification

81 unit-test files / 380 tests passed, one explicit integration case skipped in
the default suite. Lint, TypeScript and production builds passed. All 32 browser
tests passed, including the previously failing import-revision search sequence.
Isolated PostgreSQL pagination/filter/rim and cancellation checks passed.

Candidate browser flows passed for all four markets: 48 unique cards, modal close
preserves order and vertical position within 3px, page two disjoint from page one,
no overflow at 375/768/1440px. Rails have CH19/DE3/GB15/US6 categories. All 23 sitemap
shards served 210,178 URLs. No production affiliate links were clicked.

Publication status will be recorded after the controlled cutover. This is an
incremental correctness/containment release, not a claim that all performance,
taxonomy, stock or legal obligations have been fully audited or resolved.
