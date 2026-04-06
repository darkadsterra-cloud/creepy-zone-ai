# Deployment Notes

This project has two parts:

- Frontend: `artifacts/spark-gen`
- API: `artifacts/api-server`

For Vercel, this repo now includes API function entrypoints:

- `api/index.ts` (repo-root deployment)
- `artifacts/spark-gen/api/index.ts` (spark-gen root deployment)

## Required environment variables

Set these in Vercel Project Settings -> Environment Variables:

- `DATABASE_URL`
- `AI_INTEGRATIONS_OPENAI_BASE_URL`
- `AI_INTEGRATIONS_OPENAI_API_KEY`
- `VITE_API_BASE_URL` (optional when frontend and API are on same domain)

## Notes

- If `AI_INTEGRATIONS_OPENAI_*` vars are missing, auth/session endpoints still work, and generation endpoints return a clear `503` config error.
- Frontend now shows an in-app warning when backend health (`/api/healthz`) is unreachable.
