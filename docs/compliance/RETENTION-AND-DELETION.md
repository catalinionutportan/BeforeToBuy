# Retention and deletion

**Last reviewed:** 2026-09-04
**Status:** Draft — vendor retention values are TODOs

| Data set | System | Intended retention | Deletion / anonymisation | TODO |
|----------|--------|--------------------|--------------------------|------|
| Affiliate consent cookie | App / browser | Up to ~180 days (app config) | User clears cookies / withdraws consent | Confirm production cookie names/TTLs |
| Market/language prefs | localStorage / cookies | Up to ~1 year | User clear site data | — |
| Contact messages | Resend / inbox | TODO | Manual delete on request | Confirm mailbox policy |
| Edge request logs | Cloudflare | Service/account-specific | Provider TTL | Confirm enabled products and dashboard retention |
| Origin logs | Self-hosted application/NAS | Operational minimum | Rotation/manual deletion | Implement and document rotation schedule |
| RUM events | Datadog | TODO | Opt-out stops new collection | Confirm Datadog retention |
| Rate-limit keys | Upstash | Short TTL | Auto-expire | Confirm TTLs |
| Price-history series | Upstash / storage | TODO product decision | Job/manual purge | Document target window |
| Product catalogue | Supabase | While commercially needed | Soft-pause or delete offers/products | Soft-pause used for evoMAG |
| In-tab catalogue cache | sessionStorage | Maximum 15 minutes / tab session | Auto-expire or close tab | — |
| Feed caches | Redis/disk | Hours–days (code TTLs) | Overwrite on warm | — |

## Deletion principles

1. Prefer soft-pause for merchant catalogue issues when re-enable is likely (evoMAG pattern).
2. Hard-delete personal contact data on validated DSAR erasure.
3. Do not keep secrets or raw feed URLs with credentials in tickets/docs.
