# KOV Career Agency implementation roadmap

## Current state and preserved functionality

This repository remains a Vercel-compatible FastAPI deployment around a mostly static marketing site. The public experience continues to live in static HTML assets and the shared `server.py` entry point serves pages and assets without altering the existing site structure.

The backend foundation already includes:

- same-origin account registration and login flows for candidate and employer accounts
- cookie-based session handling and refresh/logout support
- protected account endpoints for role-based access control
- candidate and employer provisioning through transactional database RPC calls
- employer directory access gated by company verification and active subscription
- subscription checkout and invoice checkout flows using Stripe Checkout
- secure webhook processing and idempotent invoice/subscription state updates
- private CV upload and signed-link generation
- admin review, introduction management, placement analytics, and expired-CV cleanup hooks

These capabilities are additive to the existing public website and are intentionally isolated from the static frontend implementation.

## Verified gaps and known deployment requirements

The following items remain required before production use:

1. Supabase project credentials and database migration execution must be configured.
2. A real Stripe account, approved price IDs, and webhook secret must be supplied.
3. A CV storage bucket and any private storage policies must be configured in Supabase.
4. The cron secret for expired-CV cleanup must be set in the deployment environment.
5. The site needs a real operational review for privacy, legal text, and audit logging before launch.

The project already documents these conditions in `docs/architecture/backend-architecture.md` and in the live backend configuration helpers.

## Proposed implementation sequence

### Phase 1: Foundation hardening

- keep the public static site intact
- keep the FastAPI boundary as the trusted API layer
- validate same-origin access and authorization for all sensitive routes
- confirm service-role use is restricted to backend-only code paths

### Phase 2: Candidate and employer operations

- finalize digital onboarding and verification flows
- ensure candidate directory visibility is driven by explicit admin approvals
- keep private screening notes and company verification notes out of browser-readable surfaces
- validate subscription state and plan gating for premium features

### Phase 3: Payment and billing

- continue enforcing explicit Stripe billing enablement
- retain idempotency keys for checkout reservations
- verify webhook event signatures and process them through a single database function
- keep invoice and subscription updates atomic and auditable

### Phase 4: Document retention and maintenance

- enforce expiry timestamps on uploaded CV records
- add cleanup jobs with secret-based authorization
- record background maintenance outcomes in operational tables
- retain human review when a cleanup step fails

### Phase 5: QA and release readiness

- run the backend unit tests after every significant change
- verify admin, employer, and candidate routes under success and denial conditions
- confirm no public page regressions and no missing static asset routes
- use a staged deployment with credential gating before enabling production billing

## Completed work in this repository

- account and backend API foundation completed
- migration scaffold and architecture documentation added
- public static routes preserved
- backend regression tests established and passing under the configured local Python environment
- operational cleanup guardrails implemented for expired CV maintenance

## Remaining work

- production credentials and supabase configuration
- live Stripe and webhook validation
- real email delivery provider configuration
- scheduled cleanup job registration in the deployment environment
- release review and product acceptance testing with real data
