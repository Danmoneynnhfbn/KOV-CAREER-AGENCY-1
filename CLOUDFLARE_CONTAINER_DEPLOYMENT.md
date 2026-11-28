# KOV Career Agency: Cloudflare Container Deployment

## Chosen architecture

KOV's existing application is a conventional FastAPI application in `server.py` with its API routes in `backend_api.py`. It uses synchronous FastAPI handlers and synchronous Supabase, Stripe, and HTTP calls.

The deployment target is therefore a **Cloudflare Container**, not a Python Worker. A Container provides a full Linux/Python runtime and can run the existing application without converting every route and integration to asynchronous APIs.

The Worker uses Cloudflare's direct Durable Object Container API (`cloudflare:workers` and `ctx.container`) rather than the older `@cloudflare/containers` helper. Cloudflare's current migration guidance marks that helper as deprecated in favor of the direct API.

- The intended Wrangler Worker name is `kov-career-api`.
- The repository is also linked to a Cloudflare Workers Builds configuration bound to the existing script tag for `kov-career-agency-1`. That build integration overrides the configured name and uploaded this Container version into `kov-career-agency-1`.
- Cloudflare confirms that `kov-career-agency-1` has Workers.dev enabled, but has no custom domain and no zone Worker routes. It is not currently connected to `kovcareeragency.org`.
- Automatic builds for the existing script have been paused by excluding all changed paths and disabling Previews. Do not re-enable them until a separate Worker/build configuration is created.
- The intended `kov-career-api` script has not yet been created as a separate Cloudflare Worker.
- The Worker forwards requests to a single named Durable Object, which starts and proxies to the FastAPI container on port 8000.
- The container runs the existing `server:app`, preserving the existing page, API, authentication, admin, candidate, employer, and billing route definitions.

## Large discovery catalogue

The original `data/kov-discovery-catalog.jsonld` file is not rewritten, minified, or removed.

During the Docker image build, `scripts/compress_discovery_catalogue.py` creates a gzip copy with deterministic metadata and verifies:

```python
gzip.decompress(compressed) == original
```

The application serves the gzip copy only when the request advertises gzip support. The response uses `Content-Encoding: gzip` and the JSON-LD media type, so browsers and crawlers receive the original JSON-LD text after standard HTTP decompression. Requests without gzip support receive the original file.

The verified Cloudflare build measured the source at 34,834,136 bytes and the gzip copy at 4,000,843 bytes, an 88.5% reduction. The original file remains unchanged. This avoids the Workers Static Assets 25 MiB per-file limit. The catalogue is inside the container image, not uploaded as a single Static Asset.

## Build and test

The GitHub Actions workflow builds the Docker image and runs smoke tests without deploying or changing Cloudflare production routes.

For a manual test deployment, use:

```bash
npx wrangler deploy --config wrangler.jsonc
```

Docker must be available to build the image. Cloudflare Workers Builds can also build and deploy the container when configured for this repository.

After deployment, test the new Worker on its Workers.dev URL:

- `/health`
- `/`
- `/api/v1/status`
- `/data/kov-discovery-catalog.jsonld` with gzip and without gzip
- `/profiles` and `/faq/`
- Authentication, candidate and employer APIs
- Protected admin pages
- CV upload and signed URL flows
- Stripe test-mode checkout and webhook handling
- Resend contact notification

Do not attach the production hostname until these tests pass.

## Current account state and blockers

**Verified from the Cloudflare API on 28 November 2026:**

- The Pages project `kov-career-agency` exists and its production branch is `master`.
- Its build command is `python3 scripts/build_cloudflare_pages.py`, with `dist` as the output directory.
- Both `kovcareeragency.org` and `www.kovcareeragency.org` are active custom domains on that Pages project.
- The account lists the Workers `kov-ai-app`, `kov-career-agency-1`, and `kov-professional-discovery`.
- The Worker Domains API returned no custom Worker domains for the account; the Container Applications API returned no provisioned Container applications.
- The Container usage endpoint currently reports zero running instances.

Therefore the production website is served through the existing Pages project. The separate FastAPI Container Worker is **not** currently attached to the public domain. Do not confuse the active Pages custom domains with Worker custom domains.

A read-only preview deployment was created for the Phase 2 branch during this work. It is a preview only, not a production release and not a backend route.

The repository's earlier Container provisioning attempt built the Docker image and verified the catalogue compression, then failed when Wrangler called the Containers API with an account-entitlement error: deploying Containers requires access to the Workers Paid plan. The account still has no Container application provisioned. Creating one would require a billable plan change; do not upgrade or enable paid billing without explicit approval.

The existing Pages production configuration has no Pages environment variables listed in its project configuration. The actual backend Container runtime is not provisioned, and its Supabase/Resend/Stripe endpoints cannot be considered publicly ready until the new API Worker, runtime secrets, routes and end-to-end tests are configured.

The previous statement that the Cloudflare account had no Pages projects is obsolete and has been replaced by the live account evidence above. The separate Worker has no custom domain configured.

## Production routing

After a separate Worker named `kov-career-api` has been created, its secrets are configured, and all Workers.dev tests pass, attach both routes to that Worker:

```
www.kovcareeragency.org/*
kovcareeragency.org/*
```

The application canonicalizes the apex hostname to `www.kovcareeragency.org`. The existing DNS A records are already proxied through Cloudflare, so a Worker route can intercept requests without changing those records. Do not add the routes before the tests pass.

Do not attach the live domain to the current `kov-career-agency-1` staging script, and do not change the existing `kov-professional-discovery` Worker or its routes.

## Required runtime secrets and variables

Configure these on the new `kov-career-api` Worker. Secret values must be entered through Cloudflare's secret controls, never committed to GitHub.

Secrets:
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY` (only if billing is being tested/enabled)
- `STRIPE_WEBHOOK_SECRET` (only if billing is being tested/enabled)

Variables:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `ADMIN_USER_ID`
- `RESEND_FROM_EMAIL`
- `KOV_COOKIE_SECURE=true` on the HTTPS production hostname
- `SUPABASE_CV_BUCKET` when the CV bucket name is confirmed
- `CRON_SECRET` when scheduled maintenance is enabled
- `STRIPE_EMPLOYER_MONTHLY_PRICE_ID` and `STRIPE_BILLING_ENABLED=true` only after Stripe test-mode verification

The Worker passes these values into the container at startup. Updating a secret takes effect when the container is restarted.

## Plan and cost requirement

Cloudflare Containers are available on the Workers Paid plan. Cloudflare documents a $5/month Workers Paid plan with included container usage, followed by usage-based charges when included allowances are exceeded. The configured initial instance type is `basic` (1 GiB memory) with one maximum instance.

Do not upgrade the account or enable paid billing without explicit approval. The account's billing entitlement must be confirmed in the Cloudflare dashboard before deployment.

## Safety

- Do not deploy this configuration over `kov-career-agency-1`.
- Do not attach the production route before the Workers.dev smoke tests pass.
- Do not enable Stripe live billing until the price ID, webhook signature, and full payment lifecycle have been verified in test mode.
- Keep the existing production Worker and DNS records available for rollback.
