# Backup and restore

**Last reviewed:** August 2026  
**Status:** Draft — confirm vendor backup settings

## What matters

| Asset | Where | Backup owner | TODO |
|-------|-------|--------------|------|
| Product catalogue | Supabase Postgres | Supabase automated backups | Confirm PITR / snapshot schedule in project settings |
| App source | GitHub | Git history | Protected `main` |
| Secrets | NAS `.env.local` / protected runtime environment | Included only in protected operational backup | Never commit; document rotation owners |
| Redis cache | Upstash | Rebuildable via feed warm | Not a system of record |
| Price history | Upstash / storage | TODO | Confirm if durable beyond cache |

## Restore catalogue (high level)

1. Identify last known-good Supabase backup (**TODO:** exact console path).
2. Restore to staging first when possible.
3. Point `DATABASE_URL` / pooler settings carefully (see `.env.example` — no secret values here).
4. Re-run offline feed import if catalogue empty (`npm run feeds:import` with local secrets).
5. Warm heavy feeds if needed (`CRON_SECRET` only → `/api/cron/feeds-warm`).
6. Verify with `/api/health` (Bearer `INTERNAL_API_SECRET` for full diagnostics) and `npm run smoke:prod`.

## Secrets note

`CRON_SECRET` and `INTERNAL_API_SECRET` are separate. Do not use one as fallback for the other.
