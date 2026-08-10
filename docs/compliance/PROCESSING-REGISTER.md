# Processing register (Art. 30 GDPR style — internal)

**Platform:** BeforeToBuy.com  
**Controller:** PortanX - Catalin Portan (`admin@portanx.com`)  
**Last reviewed:** August 2026  
**Status:** Working draft — **not** a completed compliance attestation

This register lists processing activities known from the application design. Fields marked **TODO** must be confirmed in vendor dashboards / DPAs before treating this as final.

| # | Activity | Categories of data | Data subjects | Purpose | Legal basis (draft) | Recipients / processors | Retention | TODOs |
|---|----------|-------------------|---------------|---------|---------------------|-------------------------|-----------|-------|
| 1 | Web request / hosting logs | IP, user-agent, URL, timestamps | Site visitors | Security, availability, debugging | Legitimate interest (security/ops) | Vercel | TODO: Vercel log retention | Confirm region & DPA in Vercel account |
| 2 | Consent cookie (Affiliate) | Preference boolean, signed token metadata | Visitors who set preferences | Record Affiliate consent | Consent | Self / Vercel edge | ~180 days (app config) | Confirm cookie inventory matches production |
| 3 | Contact form | Name, email, message | Form submitters | Respond to enquiries | Consent / contract steps | Resend (if configured), mailbox | TODO: mailbox retention | Confirm Resend region/DPA; confirm if unused in prod |
| 4 | Product catalogue | Merchant product metadata, prices, URLs, images | N/A (business data; not end-user PII) | Price comparison display | Legitimate interest / contract with merchants-networks | Supabase, feed networks | While feed active + soft-pause rules | Confirm Supabase project region & DPA |
| 5 | Rate limits / price history cache | IP-derived counters; offer price series | Visitors (IP); public offer IDs | Abuse control; price charts | Legitimate interest | Upstash Redis (if configured) | Short TTL / TODO | Confirm Upstash region & DPA |
| 6 | Optional analytics (RUM) | Technical performance events | Visitors who opt in | Stability monitoring | Consent (Analytics) | Datadog (if configured) | TODO: Datadog retention | Confirm Datadog site/region & DPA; replay disabled in app |
| 7 | Affiliate outbound click | Click occurs only after Affiliate consent; partner may set own cookies | Consenting visitors | Monetisation / referral | Consent | AWIN, 2Performant, merchants | Partner policies | Confirm publisher IDs & network DPAs |
| 8 | Essential catalogue images | Request metadata to approved CDN/merchant hosts | Visitors viewing catalogue | Display products | Legitimate interest / essential service | Approved image hosts (see feed-url-policy) | CDN logs: TODO per host | Document each host’s privacy notice |

## Explicit non-claims

- No invented processing countries beyond **TODO / verify in account/DPA**.
- evoMAG is soft-paused in catalogue behaviour; do not describe it as fully live until confirmed.
- Affiliate links remain blocked until Affiliate consent.
