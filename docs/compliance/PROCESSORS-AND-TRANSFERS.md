# Processors and transfers — internal checklist

**Last reviewed:** 2026-09-04
**Source of truth (code):** `src/lib/processor-registry.ts`
**Public privacy list:** `src/lib/data-processors.ts` → `buildLocalizedDataProcessors()` (excludes `merchant_feed`)
**Catalogue feed transparency:** merchant feed rows below + `docs/compliance/AFFILIATE-EVIDENCE-CHECKLIST.md`

## Summary

| Status | Count | Notes |
|--------|------:|-------|
| Public privacy entries (all locales) | 8 | Processors, affiliate controllers, CDN recipients — no merchant feeds |
| Internal registry entries | 21 | Includes 13 server-side catalogue feeds |
| Project region confirmed for public pages | 1 | Supabase `AWS eu-west-1 (Ireland)` only |
| Infrastructure processors (DPA verified) | 5 | Cloudflare, Supabase, Upstash, Datadog, Resend |
| Affiliate networks (independent controllers) | 2 | 2Performant, AWIN |
| Merchant feeds (server-side only) | 13 | **Not listed on `/privacy`** |
| CDN image recipients (browser-facing) | 1 | Listed on `/privacy` |

## Public privacy policy (no placeholders)

Public pages show only verified fields per entry:

- Role label (processor / independent controller / recipient)
- Legal entity (when confirmed in official docs)
- Purpose
- **Project region** — only when account-verified (currently Supabase only)
- **Transfer summary** — only when transfer countries **and** mechanism are confirmed in official DPA/privacy docs
- Optional flag for Upstash, Datadog, Resend
- Link to official documentation when a single public URL exists

Merchant product feeds are **server-to-server catalogue imports** and are documented in this file only.

## Verified processors (official documentation)

### Cloudflare, Inc.

| Field | Value | Verified |
|-------|-------|----------|
| Legal entity | Cloudflare, Inc. | Yes |
| Role | Processor for Customer Logs/services under the Customer DPA | Yes |
| Project region | Global edge; Customer Metadata Boundary not confirmed | No |
| Transfer countries | Global; US and other service/sub-processor locations | Yes (DPA §6 + Annex 1) |
| Transfer mechanism | EU SCCs, UK Addendum, Swiss modifications and DPF where applicable | Yes |
| Retention | Service/account-specific; confirm enabled products | Partial |
| Official doc | https://www.cloudflare.com/cloudflare-customer-dpa/ | 2026-09-04 |
| Public privacy | Yes | Transfer summary published |

### Supabase Pte. Ltd.

| Field | Value | Verified |
|-------|-------|----------|
| Legal entity | Supabase Pte. Ltd. (Singapore) | Yes |
| Role | Processor | Yes |
| Project region | **AWS eu-west-1 (Ireland)** | Yes — local `DATABASE_URL` pooler hostname suffix `aws-1-eu-west-1.pooler.supabase.com` |
| Transfer countries | Supabase and sub-processor facilities worldwide | Yes (DPA §6.1) |
| Transfer mechanism | SCCs + UK/Swiss addenda (DPA §12) | Yes |
| Retention | Agreement term; deletion per DPA | Yes |
| Official doc | https://supabase.com/legal/dpa | 2026-08-10 |
| Public privacy | Yes | Region + transfer summary published |

### Upstash, Inc.

| Field | Value | Verified |
|-------|-------|----------|
| Legal entity | Upstash, Inc. (Delaware corporation) | Yes |
| Role | Processor | Yes |
| Project region | **TODO** — confirm Redis region in Upstash console if enabled | No |
| Transfer countries | Global; US recipient for European data | Yes (DPA §3) |
| Transfer mechanism | SCCs + UK Transfer Addendum | Yes |
| Retention | Per Agreement / DPA | Yes |
| Official doc | https://upstash.com/static/trust/dpa.pdf | 2026-08-10 |
| Public privacy | Yes (optional) | Transfer summary only |

### Datadog, Inc.

| Field | Value | Verified |
|-------|-------|----------|
| Legal entity | Datadog, Inc. (Delaware corporation) | Yes |
| Role | Processor | Yes |
| Project region | **TODO** — confirm Datadog site (`.com` vs `.eu`) in account | No |
| Transfer countries | Per sub-processors (global) | Yes (subprocessors list) |
| Transfer mechanism | SCCs, UK Transfer Addendum (DPA §10) | Yes |
| Retention | Per Agreement / DPA | Yes |
| Official doc | https://www.datadoghq.com/legal/data-processing-addendum/ | 2026-08-10 |
| Public privacy | Yes (optional) | Transfer summary only |

### Resend (Plus Five Five, Inc.)

| Field | Value | Verified |
|-------|-------|----------|
| Legal entity | Plus Five Five, Inc. | Yes |
| Role | Processor | Yes |
| Project region | **TODO** — confirm in Resend dashboard when live | No |
| Transfer countries | US and sub-processor locations | Yes (subprocessors list) |
| Transfer mechanism | EU SCCs + UK addendum (DPA §6) | Yes |
| Retention | Return/delete after Services (DPA §2.4) | Yes |
| Official doc | https://resend.com/legal/dpa | 2026-08-10 |
| Public privacy | Yes (optional) | Transfer summary only |

### 2Performant Network S.A.

| Field | Value | Verified |
|-------|-------|----------|
| Legal entity | 2Performant Network S.A. (Romania) | Yes |
| Role | **Independent controller** (affiliate tracking) | Yes |
| Project region | **TODO** — publisher/advertiser contract | No |
| Transfer mechanism | **TODO** — review publisher agreement | No |
| Official doc | https://2performant.com/privacy-policy/ | 2026-08-10 |
| Public privacy | Yes | Role + purpose + official link only |

### AWIN AG

| Field | Value | Verified |
|-------|-------|----------|
| Legal entity | AWIN AG (Germany) | Yes |
| Role | **Independent controller** (affiliate tracking) | Yes |
| Project region | **TODO** — publisher account processing map | No |
| Transfer mechanism | **TODO** — review Awin publisher contract | No |
| Official doc | https://www.awin.com/gb/legal/privacy-policy | 2026-08-10 |
| Public privacy | Yes | Role + purpose + official link only |

## Server-side catalogue feeds (internal / commercial transparency)

These integrations import product catalogues **server-to-server**. They are **not** visitor-data recipients and are **excluded** from `/privacy`.

| ID | Merchant | Network | Status | TODO |
|----|----------|---------|--------|------|
| feed-rowenta-2p | Rowenta.ro | 2Performant | Active import path | Confirm feed hosting region |
| feed-scule365-2p | Scule365.ro | 2Performant | Active import path | Confirm feed hosting region |
| feed-seentat-awin | Seentat UK | AWIN | Active import path | Confirm AWIN datafeed region |
| feed-geepas-awin | Geepas UK | AWIN | Active import path | Confirm AWIN datafeed region |
| feed-arlo-awin | Arlo Security UK | AWIN | Active import path | Confirm AWIN datafeed region |
| feed-ottocast-awin | Ottocast US | AWIN | Active import path | Confirm AWIN datafeed region |
| feed-dji-awin | DJI US & CA | AWIN | Active import path | Confirm AWIN datafeed region |
| feed-belando-awin | Belando CH | AWIN | Active import path | Confirm AWIN datafeed region |
| feed-evomag-2p | evoMAG | 2Performant | Soft-paused | Confirm re-enable criteria |

## CDN image hosts (public privacy — browser-facing)

| ID | Category | Public privacy | TODO |
|----|----------|----------------|------|
| merchant-cdn-images | merchant_cdn | Yes — recipient | Per-host allowlist review (`feed-url-policy`) |

## Self-hosted production secrets (read-only check)

**Runtime status (2026-09-04):** production runs from the self-hosted NAS release. Secret values must remain outside Git and must not be copied into audit output.

**Operator checklist (dashboard):**

1. Inspect the NAS application environment without printing secret values.
2. Verify names/presence/length only:
   - `CRON_SECRET` — present, length ≥ 32, distinct
   - `INTERNAL_API_SECRET` — present, length ≥ 32, distinct
   - `CONSENT_SIGNING_SECRET` — present, length ≥ 32, distinct
3. Confirm Cloudflare DNS/proxy/security settings separately in the Cloudflare dashboard.

**Local env (2026-08-10):** `CRON_SECRET`, `INTERNAL_API_SECRET`, `CONSENT_SIGNING_SECRET` — all **missing** (expected locally).

## Operational blockers before deploy

1. **Cloudflare retention unconfirmed** — record enabled products and dashboard retention.
2. **Origin log retention unconfirmed** — implement and record rotation/deletion on NAS.
3. **Affiliate contracts need review** — confirm roles and redirect tracking for AWIN/2Performant.

## Transfer rules of thumb (not legal advice)

1. Do not assert “EU-only” or adequacy without dashboard/DPA evidence.
2. Distinguish **processors** (Cloudflare, Supabase, …) from **independent controllers** (AWIN, 2Performant), **CDN recipients** (browser), and **server-side feeds** (not on privacy page).
3. Update `processor-registry.ts` first, then public copy follows via `data-processors.ts`.
