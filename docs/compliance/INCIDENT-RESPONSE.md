# Incident response — internal playbook

**Owner:** PortanX - Catalin Portan (`admin@portanx.com`)  
**Last reviewed:** August 2026  
**Status:** Operational draft — vendor contacts listed where known

## 1. Detect

- Vercel deployment alerts + GitHub Dependabot/CodeQL notifications
- Upstash / Supabase dashboard alerts (configure email to `admin@portanx.com`)
- `/status` public health + authorized `/api/health` diagnostics
- User reports to `admin@portanx.com`

## 2. Triage (severity)

| Severity | Examples | Initial action |
|----------|----------|----------------|
| Sev-1 | Data breach, secret leak, mass XSS/RCE | Contain → revoke secrets → assess notification duty |
| Sev-2 | Auth bypass on internal APIs, feed SSRF | Disable endpoint/env → patch |
| Sev-3 | Partial outage, single merchant feed down | Fail soft → status note |

## 3. Contain

1. Rotate `CRON_SECRET`, `INTERNAL_API_SECRET`, `CONSENT_SIGNING_SECRET`, DB passwords as relevant (never commit values).
2. Revoke compromised feed URLs / API keys in AWIN / 2Performant dashboards (owner: `admin@portanx.com`).
3. Vercel rollback to last known-good deployment if needed.

## 4. Eradicate & recover

- Patch root cause; add regression test where applicable.
- Restore from backup only using `BACKUP-RESTORE.md` procedure.
- Re-run `npm run smoke:prod` after recovery.

## 5. Notify — supervisory authority & data subjects

Use the official thresholds below as an **internal decision checklist**. This is not legal advice or a certification of compliance.

### EU GDPR (when EU/EEA data subjects are affected)

| Step | Threshold (Art. 33 / 34) | Internal action |
|------|--------------------------|-----------------|
| Supervisory authority | Notify **within 72 hours** of becoming aware of a breach **likely to result in a risk** to rights and freedoms | [ ] Sev-1 confirmed? [ ] Risk to individuals assessed? [ ] DPA notified ≤ 72h if required |
| Data subjects | Communicate **without undue delay** when breach **likely to result in a high risk** | [ ] High-risk factors documented? [ ] User notice drafted if required? |

### Switzerland (FADP / FDPIC guidance)

| Step | Threshold | Internal action |
|------|-----------|-----------------|
| FDPIC notification | Required when the breach is **likely to result in a high risk** to personality or fundamental rights | [ ] High-risk assessment recorded? [ ] FDPIC notified if threshold met |
| Data subjects | Inform affected persons **as soon as possible** when necessary for their protection | [ ] Notice channel chosen (email/site banner) |

### Internal log (all severities)

- [ ] Incident ID, date/time detected, systems affected, data categories (no unnecessary PII in tickets)
- [ ] Containment actions and timestamps
- [ ] Notification decision (authority / users / none) with brief rationale
- [ ] Owner sign-off: `admin@portanx.com`

## 6. Post-incident

- Update this playbook and processor contacts if a vendor gap caused delay.
- Schedule follow-up within **14 days**.
- Track open actions until closed or accepted as residual risk.
