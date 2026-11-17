# KOV Career Agency: Cloudflare Python Worker

This repository is configured for Cloudflare's **Python Workers + FastAPI** runtime.
It is no longer configured to deploy the repository root as a static-assets-only Worker.

## Deployment architecture

- `cloudflare_worker.py` is the Python Worker entry point.
- `FastAPI` serves the existing API routes from `backend_api.py`.
- `public/` is generated at build time and contains only website-facing HTML, CSS,
  JavaScript, XML, JSON-LD and image assets.
- The `ASSETS` binding serves frontend files after FastAPI has had the opportunity
  to handle API routes.
- Protected administrator HTML pages are embedded into a generated Python module
  and remain behind the existing `_require_admin` check.
- The original `server.py` remains in place for the existing non-Workers runtime.

## Build and deploy

Cloudflare's Python Workers tooling uses `uv` and `pywrangler`, not plain
`npx wrangler deploy` for dependency packaging.

Use this as the Workers Builds **Deploy command**:

```bash
bash scripts/deploy-cloudflare.sh
```

The script:
1. Ensures `uv` is available.
2. Builds the public asset directory while excluding private folders and the oversized
   discovery catalogue.
3. Installs the Python project dependencies.
4. Deploys with `pywrangler`, which bundles Python dependencies for Workers.

The project root remains `/`. Do not set the repository root itself as the static
asset directory. The configured asset directory is `./public/`.

## Required Worker environment and secrets

Configure these in the Cloudflare Worker settings. Store credentials as **secrets**
and non-sensitive settings as plain-text variables. Never commit their values.

Required for the existing account routes:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_USER_ID`

Required for contact notifications:
- `RESEND_API_KEY` (secret)
- `RESEND_FROM_EMAIL` (plain-text variable)

Required only when enabling Stripe billing and webhooks:
- `STRIPE_SECRET_KEY` (secret)
- `STRIPE_WEBHOOK_SECRET` (secret)
- `STRIPE_EMPLOYER_MONTHLY_PRICE_ID` (plain-text variable)
- `STRIPE_BILLING_ENABLED` (set to `true` only after test-mode validation)

Other optional variables referenced by the backend:
- `KOV_COOKIE_SECURE` (set to `true` on the HTTPS production domain)
- `SUPABASE_CV_BUCKET`
- `CRON_SECRET`

Do not set `VERCEL` on Cloudflare. Do not place secret values in
`wrangler.jsonc`, GitHub, or build logs. Do not enable Stripe billing until the
existing approved Stripe configuration and webhook endpoint have been tested.

## Large discovery catalogue

`data/kov-discovery-catalog.jsonld` remains in GitHub and is not deleted. It is
excluded from static asset packaging because it is larger than Cloudflare's 25 MiB
per-file static asset limit. If a live website feature requests this exact file,
store it in Cloudflare R2 and add a protected/appropriate R2-backed route before
enabling that feature on the Worker.

## Validation checklist

Before attaching the production hostname:
- Confirm the Python dependency bundle builds successfully in the Cloudflare build
  environment.
- Test `/api/v1/status`.
- Test login, candidate/employer APIs, admin routes, Stripe checkout and Resend
  notification paths with non-production test credentials/data.
- Check that public pages, canonical redirects, `/profiles`, and `/faq/` work.
- Confirm that private admin pages cannot be fetched without authorization.
- Confirm that the large catalogue is served from its intended object-storage route
  if any frontend code depends on it.

Do not attach production routes until those checks pass.
