# BeforeToBuy.com — Operations Runbook

**Owner:** PortanX - Catalin Portan (`admin@portanx.com`)  
**Platform:** https://www.beforetobuy.com  
**Repo:** https://github.com/catalinionutportan/BeforeToBuy  
**Phase:** Beta/Demo (controlled launch)

---

## 1. Architecture snapshot

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 15 App Router, React 19, Tailwind |
| Hosting | Vercel (auto-deploy on push to `main`) |
| Product data | Demo catalog + multi-merchant sample/production feeds (CH) |
| APIs | `/api/products`, `/api/health`, `/api/contact`, `/api/geocode`, `/api/location` |

---

## 2. Deploy flow

1. Push to `main` → GitHub Actions CI (lint, typecheck, build, E2E)
2. Vercel auto-deploys on green push
3. Run production smoke:

```bash
npm run smoke:prod
```

4. Verify `/status` and `/api/health` return `healthy`

---

## 3. Rollback

**Vercel (fastest):**
1. Vercel Dashboard → Project → Deployments
2. Find last known-good deployment → **Promote to Production**

**Git:**
```bash
git revert <bad-commit-sha>
git push origin main
```

---

## 4. Environment variables (Vercel)

| Variable | Required | Purpose |
|----------|----------|---------|
| `CONSENT_SIGNING_SECRET` | **Required** | Signs the HttpOnly consent cookie enforced by `/api/location` and `/api/geocode` (minimum 32 characters) |
| `AWIN_FEED_URL_CH_BRACK` | Optional | Production AWIN CSV for Brack.ch |
| `AWIN_FEED_URL_CH` | Optional | Legacy alias for Brack production feed |
| `AWIN_FEED_URL_CH_MEDIAMARKT` | Optional | Production AWIN CSV for MediaMarkt CH |
| `AWIN_FEED_URL_CH_INTERDISCOUNT` | Optional | Production AWIN CSV for Interdiscount |
| `AWIN_FEED_URL_CH_FUST` | Optional | Production AWIN CSV for Fust |
| `GALAXUS_FEED_URL_CH_DIGITEC` | Optional | Production Galaxus merchant JSON for Digitec |
| `GALAXUS_FEED_URL_CH_GALAXUS` | Optional | Production Galaxus merchant JSON for Galaxus |
| `RESEND_API_KEY` | Optional | Contact form email delivery |
| `CONTACT_TO_EMAIL` | Optional | Contact form recipient |
| `CONTACT_FROM_EMAIL` | Optional | Contact form sender |

Without per-merchant feed URLs, sample files under `src/data/` are used for all six CH retailers.
Without `CONSENT_SIGNING_SECRET`, consent saving and location APIs fail closed in production.

---

## 5. Monitoring & health

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | JSON health (feed, products merge, integrations) |
| `GET /status` | Human-readable status page |
| GitHub Actions | CI on every push |
| `npm run smoke:prod` | Post-deploy production smoke |

**Alert manually if:**
- `/api/health` returns 503 or `status: unhealthy`
- Smoke script fails
- CI fails on `main`

---

## 6. Go-live checklist (Beta)

- [ ] CI green on `main`
- [ ] `npm run smoke:prod` passes
- [ ] `/api/health` → `healthy`
- [ ] Cookie banner + consent gating works
- [ ] Contact form validates (Resend optional)
- [ ] Legal pages accessible (`/legal`, `/privacy`, `/terms`)
- [ ] Beta/Demo disclaimers visible
- [ ] `AWIN_FEED_URL_CH` set when production feed ready
- [ ] Legal documents reviewed by lawyer (recommended)

---

## 7. Incident response (lightweight)

1. Check `/api/health` and Vercel deployment logs
2. If bad deploy → rollback in Vercel
3. If API abuse → rate limits in `src/lib/rate-limit.ts`; block IP in Vercel WAF if needed
4. Privacy incident → follow DSAR/complaints procedure (`/complaints`, `/privacy`)
5. Document incident + resolution in git commit or internal notes

---

## 8. Useful commands

```bash
npm run dev          # Local development
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm run build        # Production build
npm run test:e2e     # Playwright smoke tests (starts server)
npm run smoke:prod   # Production HTTP smoke checks
```

---

*Last updated: Phase 6 — August 2026. Initial ops draft, not certified SLAs.*
