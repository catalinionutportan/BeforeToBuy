# DSAR procedure (access / erasure / etc.)

**Contact:** `admin@portanx.com`  
**Last reviewed:** August 2026  
**Status:** Operational procedure — identity verification steps below

## Scope

BeforeToBuy is a price comparison platform **without end-user accounts**. Typical personal data:

- Contact-form submissions (if Resend/mailbox configured)
- Consent cookies / local preference storage (client-side + signed HttpOnly cookie)
- Server logs (IP/UA) at hosting/monitoring vendors
- Affiliate network records **after** outbound consent (held by AWIN/2Performant/merchants)

## Intake

1. Receive request at `admin@portanx.com` (subject: DSAR).
2. Log request ID, date, locale, request type (access, erasure, rectification, restriction, objection, portability).
3. Verify identity proportionate to the request (see checklist below).

### Identity verification (low-volume controller)

Use the minimum necessary to avoid wrongful disclosure:

- [ ] **Request channel:** reply only to the same email address that submitted the form, unless the data subject proves control of another address on file.
- [ ] **Proportionality:** for access/erasure tied to a known contact-form message, match name + email + approximate date of submission; do not request government ID by default.
- [ ] **Escalation:** if the request is broad (all data categories), ambiguous, or third-party submitted, pause fulfilment and ask one clarifying question before releasing data.
- [ ] **Record:** note verification method and date in the request log (no copies of ID documents stored unless strictly required).

## Fulfilment checklist

| System | What to search | Notes |
|--------|----------------|-------|
| Mailbox / Resend | Contact messages | Search by requester email and date window |
| Vercel logs | IP/time windows | Confirm retention/export path in Vercel dashboard (see manual checklist below) |
| Supabase | Product catalogue only — no user profile tables | Confirm schema matches expectation |
| Upstash | Ephemeral counters | Confirm no durable PII keys |
| Datadog | RUM sessions if opted in | Only when analytics consent was given — confirm project settings |
| AWIN / 2Performant | Publisher dashboards | Direct data subject to partners if held there |

**Manual confirmation required (do not assume regions/DPA from this doc):** see operator checklist reported separately when onboarding processors.

### Internal confirmation before sending a response

- [ ] Request type and statutory deadline recorded
- [ ] Identity verification completed (method noted)
- [ ] Data export or erasure actions listed per system above
- [ ] Response sent from `admin@portanx.com` with request ID referenced
- [ ] If partially refused, lawful basis for limitation documented (see below)

## Response timing (official thresholds)

Apply the deadlines that match the controller’s situation. **This section is an operational checklist, not legal advice or certification.**

| Framework | Standard deadline | Extension | Internal trigger |
|-----------|-------------------|-----------|------------------|
| **EU GDPR** (Art. 12(3)) | **1 month** from receipt | Up to **2 further months** if complex/voluminous — inform the data subject within the first month with reasons | Start clock on verified receipt; target reply **≤ 25 days** internally |
| **Swiss FADP / FDPIC practice** | **30 days** as a reasonable period for uncomplicated requests | Additional time only when justified — inform promptly | Same internal 25-day target where feasible |

If the statutory deadline cannot be met, document why before the first-month notice and send a short status update to the requester.

## Refusal / limitation

Document lawful reasons if a request is limited (e.g. unable to identify, disproportionate, manifestly unfounded). Do not over-collect identity documents. Typical internal grounds to record:

- [ ] Cannot verify identity after one proportionate follow-up
- [ ] Request concerns data held exclusively by an affiliate/merchant (refer to their privacy notice)
- [ ] Erasure would impair freedom of expression or legal claims (rare for this service)

## Record retention for DSAR log

Keep the request log (request ID, dates, type, verification method, outcome) for **24 months** after closure, then delete unless a dispute is open.
