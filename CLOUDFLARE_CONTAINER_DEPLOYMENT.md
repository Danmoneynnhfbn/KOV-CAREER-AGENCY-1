# KOV Career Agency: Cloudflare Container Deployment

## Chosen architecture

KOV's existing application is a conventional FastAPI application in `server.py` with its API routes in `backend_api.py`. It uses synchronous FastAPI handlers and synchronous Supabase, Stripe, and HTTP calls.

The deployment target is therefore a **Cloudflare Container**, not a Python Worker. A Container provides a full Linux/Python runtime and can run the existing application without converting every route and integration to asynchronous APIs.

The Worker uses Cloudflare's direct Durable Object Container API (`cloudflare:workers` and `ctx.container`) rather than the older `@cloudflare/containers` helper. Cloudflare's current migration guidance marks that helper as deprecated in favor of the direct API.

- The existing `kov-career-agency-1` production Worker is not replaced by this configuration.
- The new Worker is named `kov-career-api`.
- The new Worker has Workers.dev enabled for testing.
- No production custom-domain route is configured in `wrangler.jsonc`.
- The Worker forwards requests to a single named Durable Object, which starts and proxies to the FastAPI container on port 8000.
- The container runs the existing `server:app`, preserving the existing page, API, authentication, admin, candidate, employer, and billing route definitions.

## Large discovery catalogue

The original `data/kov-discovery-catalog.jsonld` file is not rewritten, minified, or removed.

During the Docker image build, `scripts/compress_discovery_catalogue.py` creates a gzip copy with deterministic metadata and verifies:

```python
gzip.decompress(compressed) == original
```

The application serves the gzip copy only when the request advertises gzip support. The response uses `Content-Encoding: gzip` and the JSON-LD media type, so browsers and crawlers receive the original JSON-LD text after standard HTTP decompression. Requests without gzip support receive the original file.

This avoids the Workers Static Assets 25 MiB per-file limit. The catalogue is inside the container image, not uploaded as a single Static Asset.

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

## Production routing

After validation, attach the specific route:

```
www.kovcareeragency.org/*
```

to Worker `kov-career-api`. This more-specific route is intended to take precedence over the existing wildcard Worker route for the canonical `www` hostname. Leave the apex-host redirect in place so `kovcareeragency.org` continues redirecting to `www.kovcareeragency.org`.

Do not change the existing `kov-professional-discovery` Worker or its routes.

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
