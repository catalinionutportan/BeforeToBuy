# Affiliate evidence checklist

**Last reviewed:** August 2026  
**Status:** Evidence tracker — unchecked items are incomplete

Use this before claiming a merchant is fully live for compliance/marketing.

## Network / programme

- [ ] Publisher / affiliate account active (AWIN / 2Performant)
- [ ] Programme acceptance email / dashboard status saved (no secrets in repo)
- [ ] DPA / contract location noted (**TODO:** link in private vault)
- [ ] Tracking IDs documented privately (publisher IDs, campaign uniques)

## Technical wiring

- [ ] Feed URL or API key configured in the NAS production environment (not committed)
- [ ] Merchant listed in `MERCHANT_FEEDS` with correct country/provider
- [ ] Image + commercial hosts present in `feed-url-policy` allowlists
- [ ] Sample fixture available for CI when remote feed disabled
- [ ] Outbound links gated on Affiliate consent in UI
- [ ] Soft-pause path tested if CDN/images fail (evoMAG pattern)

## Public copy

- [ ] Privacy processors list includes affiliate **networks** (AWIN, 2Performant) when live
- [ ] Catalogue **feeds** documented in `docs/compliance/PROCESSORS-AND-TRANSFERS.md` (not on `/privacy`)
- [ ] Policy “live feeds” section mentions merchant accurately
- [ ] Soft-paused merchants not marketed as fully live
- [ ] Public privacy lists show verified transfer summaries only (no account placeholders)

## Merchants (current intent)

| Merchant | Network | Expected status | Evidence TODO |
|----------|---------|-----------------|---------------|
| Rowenta | 2Performant | Configured RO | Confirm live vs import-only in prod |
| Scule365 | 2Performant | Configured RO | Confirm live vs import-only in prod |
| evoMAG | 2Performant | Soft-paused | Confirm pause reason & re-enable criteria |
| Seentat | AWIN | Live GB path | Confirm feed health |
| Ottocast | AWIN | Live US path | Confirm feed health |
