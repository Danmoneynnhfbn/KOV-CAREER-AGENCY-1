# KOV Career Agency Backend Architecture

## Decision status

This is the architecture decision and implementation record for adding
private, database-backed account and operations features while keeping the
current public site in place. A first backend foundation and migration are
implemented, but no Supabase project, authentication tenant, private storage
bucket, Stripe account, or production credentials are configured. Production
use remains deployment-gated until those external resources and variables are
configured and the migration is applied.

## Verified current architecture

- The public website is a static collection of HTML, CSS, and JavaScript files.
  The project has no root `package.json` or frontend build command.
- `server.py` exposes a FastAPI application for Vercel, returns the existing
  `index.html`, serves selected static files, and provides `/api/v1/status`.
- `vercel.json` configures the Vercel Python runtime and sends unmatched routes
  to `server.py`.
- `requirements.txt` declares FastAPI, Uvicorn, Supabase Python SDK, and Resend.
- The backend foundation, migration, account navigation, `/profiles` page,
  `/toba` shell, and focused backend smoke/regression tests are now present.
- `README-blog-cms.md` documents a separate static/GitHub API blog workflow.
  Its browser-side GitHub token workflow is unrelated to candidate/employer
  authentication and must not be reused as account authentication.
- `assets/audience-nav.js` modifies the existing public header and footer.
  It is the shared integration point for the additive account link, which now
  points to the account page.
- No `96.4%` metric string was found in first-party HTML, JS, CSS, or Python
  source during this audit. The homepage was not modified for this backend
  work; locating that legacy metric remains an open verification item.
- No `.env` file or Supabase, Stripe, or email provider configuration was
  found. Only variable names are documented here; no secret values are stored.

## Selected architecture

Use the existing FastAPI/Vercel app as the only trusted application backend,
with Supabase Auth, PostgreSQL, and private Supabase Storage as the intended
identity/data/file services. This is the least disruptive path because the
Supabase SDK is already declared, it keeps the current static frontend and
Vercel route model, and it avoids migrating the website to a new framework.
Resend remains the intended email-provider integration because its SDK is
already declared. Stripe is the selected payment provider; its Checkout and
signature-verified webhook paths are implemented, but billing is disabled by
default and no Stripe credentials or approved live prices are configured.

The browser must never receive a Supabase service-role key or other privileged
secret. FastAPI must validate a Supabase access token, load role and company
state from trusted server-side records, and enforce authorization before
returning any private or directory data. PostgreSQL Row Level Security (RLS)
is a second enforcement boundary for direct Supabase access.

## Components and integration boundaries

- Existing public pages and static assets stay at their current paths.
- FastAPI continues to serve the current website and becomes the trusted API
  boundary for protected account, candidate, employer, and administrative
  operations.
- Supabase Auth owns password/session management, verification, and recovery.
- Supabase PostgreSQL owns application records and repeatable SQL migrations.
- Supabase Storage uses a private CV bucket; downloads must use authorized,
  short-lived signed URLs.
- Supabase Auth sends account-confirmation and password-recovery messages.
  Resend is declared as a dependency but transactional Resend delivery is not
  implemented yet.
- Stripe Checkout handles candidate/employer subscriptions and issued placement
  invoices; employer invoice listing is scoped to authenticated company membership.
  The account page displays the account's subscription state and eligible
  employer invoices, with buttons to resume/start checkout. Signed webhooks call
  an idempotent database function to update subscription and invoice state.
  Billing requires an explicit enable flag.
- A scheduled Vercel-compatible job or an external authenticated scheduler is
  required for 30-day inactive-CV cleanup. No scheduled job is currently
  configured.
- Stripe is selected for payments, but live charges remain disabled until
  approved pricing, credentials, migration execution, and webhook configuration
  have been verified.

## Implemented foundation and current status

- `backend_api.py` adds same-origin account registration/login/session,
  password recovery/update endpoints, candidate self-service, gated candidate
  directory access, administrator candidate/employer review and introduction
  workflows, invoice drafting, private PDF CV upload/signed links, placement
  metrics, and a secret-protected expired-CV cleanup endpoint.
- The migration at
  `supabase/migrations/202610110001_backend_foundation.sql` defines the account,
  candidate, employer, membership, verification, subscription, CV, placement,
  invoice, audit, and maintenance records; RLS policies; private storage
  policies; least-privilege browser grants; and transactional
  candidate/employer provisioning RPCs.
- The migration revokes default browser access to private tables, applies
  explicit column-level grants, and keeps screening/legal-hold notes and
  company verification notes out of browser-readable columns.
- Stripe Checkout endpoints use server-configured Price IDs, same-origin
  authenticated account checks, and verify each recurring Price's
  amount/currency/interval against the approved server-side subscription plan
  before creating a session. Invoice checkout reserves a server-generated
  idempotency key transactionally, so client retries and concurrent checkout
  requests reuse the same Stripe session.
  The webhook endpoint verifies Stripe signatures before forwarding events to
  a service-role-only database function. That function records event IDs,
  applies subscription status/period updates, validates invoice amount and
  currency, and records payment transactions within one database transaction.
- Draft placement invoices must be explicitly issued by an administrator
  before an employer member can create a hosted payment session. Successful
  and failed payment events update both invoice and introduction payment state.
- Checkout reservations and partial unique indexes prevent parallel open
  subscriptions for the same account and plan. Stripe request idempotency is
  tied to the reservation ID so a retried provider call reuses the same session.
- Invoice checkout reservations are stored on the invoice and included in Stripe
  session metadata; webhook processing verifies that reservation before changing
  invoice payment state.
- Invoice drafting, issuance, introduction payment-state changes, and their
  audit records are committed by database RPCs rather than separate API writes.
- Candidate and employer database provisioning uses a single RPC per account
  so related records are inserted atomically. These functions are restricted
  to the server's service role.
- `account.html`, `profiles.html`, and `toba.html` are additive frontend
  surfaces. The account page handles provider redirect tokens without
  persisting them in the URL, and the operations console includes candidate
  review, company verification, introduction creation/update, and invoice-draft
  controls. The account page includes subscription checkout and employer invoice
  payment links. The public homepage content, URLs, and existing metric have
  not been changed by this work.
- `tests/test_backend_api.py` checks public page availability, anonymous
  authorization failures, missing-configuration behavior, same-origin
  enforcement, cookie clearing on failed logout/refresh, password recovery
  session flows, provisioning RPC contracts, Stripe Checkout configuration
  and idempotency, signature verification and event-RPC calls, and migration
  privilege intent.
- This foundation is not a complete operating backend yet: email delivery,
  atomic audit/workflow writes for some administrator actions, production
  migration execution, real RLS/auth/storage/Stripe integration, and scheduled
  cleanup orchestration still require implementation or external setup.

## Data model and identity

The versioned migration will establish internal UUID primary keys and separate
human-readable identifiers. Candidate IDs use the `KOV-C-` prefix; employer
IDs use `KOV-E-`. Independent PostgreSQL sequences and unique constraints
provide concurrency-safe generation. Public identifiers are display values,
never authentication credentials or relationship keys.

The schema will include user profiles/roles, public candidate profiles,
private candidate data, employers, employer memberships and verification
records, configurable subscription plans and subscriptions, private CV
metadata, introductions, introduction history, invoices, payment-provider
event/transaction records, and administrative audit records. The mandatory
introductions table references candidate and employer UUIDs and constrains
status to Pending, Interviewing, Placed, or Rejected. Placement invoices are
only eligible after a confirmed Placed status and use a due date 30 calendar
days after the recorded placement start date.

Public candidate directory fields are isolated from contact information,
legal name, resume location, and screening notes. Employers must have both
verified company status and an active employer subscription to access the
paginated directory.

## Commercial configuration

Plan rows will keep candidate and employer plans distinct: free candidate
registration, a proposed candidate premium plan at $500/month, and a proposed
employer plan at $15/month. The candidate retainer amount remains NULL pending
approval. Placement fees are per-introduction configurable amounts, with the
proposed $2,500–$15,000+ range represented as guidance rather than a fixed
charge. Plan and payment states, company verification, candidate vetting, and
account roles remain separate.

These are proposed terms, not authorization to charge. Stripe billing remains
disabled unless `STRIPE_BILLING_ENABLED=true` is deliberately configured after
commercial approval, Stripe Price IDs and secrets are configured, the
migration is applied, and a signed webhook endpoint is verified in Stripe.

## Authentication and authorization

- Supabase Auth user UUID is the trusted identity.
- Roles are stored server-side; clients cannot set or promote their own role.
- Candidate self-service is limited to the authenticated user's own records.
- Employer access is scoped to verified company memberships and permitted
  company records.
- The candidate directory is denied to anonymous users, candidates,
  unverified companies, and companies without an active subscription.
- Administrative actions require an explicit server-side administrator role;
  no first-user or email-address-based promotion is permitted.
- Every private endpoint performs authorization before data retrieval or
  response construction.

## Required environment variables

- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_ANON_KEY`: Supabase public/anon key, used only server-side for
  authentication-bound operations.
- `SUPABASE_SERVICE_ROLE_KEY`: privileged server-side database/storage key;
  never expose it to browser code.
- `SUPABASE_CV_BUCKET`: private CV storage bucket name.
- `RESEND_API_KEY`: transactional email provider credential.
- `RESEND_FROM_EMAIL`: verified transactional sender.
- `STRIPE_BILLING_ENABLED`: must be explicitly set to `true` after commercial
  approval; absent or false keeps Checkout endpoints disabled.
- `STRIPE_SECRET_KEY`: Stripe API secret key, server-side only.
- `STRIPE_WEBHOOK_SECRET`: signing secret for the configured Stripe webhook.
- `STRIPE_CANDIDATE_PREMIUM_PRICE_ID`: Stripe recurring Price ID for the
  approved candidate premium plan.
- `STRIPE_EMPLOYER_MONTHLY_PRICE_ID`: Stripe recurring Price ID for the
  approved employer plan.
- `CRON_SECRET`: secret for authenticating scheduled cleanup requests.

No values are committed. Missing required configuration must fail closed with
a service-unavailable response rather than enabling fake or insecure behavior.
Set `SUPABASE_CV_BUCKET` to `candidate-cvs`, the private bucket created by the
migration. Configure Supabase Auth's site URL and allowed redirect list to
include `https://www.kovcareeragency.org/account.html` before enabling confirmation
or password-recovery emails.

Provision the first administrator only after creating and verifying the
intended Auth user. A trusted database operator must update that user's exact
UUID in `public.app_users` to `administrator`; there is no public role-change
endpoint or automatic first-user promotion.

## Migration, rollback, and deployment

Migrations are additive and version-controlled under `supabase/migrations/`.
Apply first to a non-production Supabase project and take a database backup
before production rollout. Roll back by restoring the pre-migration backup or
by a separately reviewed compensating migration; do not automatically drop
application tables or existing user data.

Deployment requires a configured Supabase project, applying migrations,
creating a private CV bucket and policies, configuring Vercel environment
variables, and setting up an authenticated scheduled invocation for cleanup.
Authentication email templates/redirect URLs and Resend sender verification
must be configured separately. Stripe must be configured in test mode first:
create the approved recurring Prices, register
`https://www.kovcareeragency.org/api/v1/billing/stripe/webhook` for subscription
created/updated/deleted, invoice payment failed/succeeded/paid, and Checkout
completed/asynchronous success/asynchronous failure/expired events, then
verify signatures and state transitions in a real Supabase test project.
Keep `STRIPE_BILLING_ENABLED` unset until business approval and end-to-end
verification; use Stripe test credentials during validation.

## Security, testing, and known limitations

The implementation must use strict request validation, explicit response
schemas, bounded pagination, no public CV URLs, server-side role checks, RLS,
audit records for privileged changes, idempotent provider events, safe error
responses, and no secrets in browser bundles or logs.

Local tests validate Python route behavior, mocked Checkout and webhook
contracts, and provisioning RPC intent. They cannot establish that the SQL
migration runs, Supabase Auth/RLS/storage policies, Stripe signature exchange,
real payment state transitions, email delivery, or scheduled cleanup work
against live services until external configuration and integration tests are
available.

## Assumptions and open decisions

- Supabase is the selected data/auth/storage provider and Stripe is the
  selected payment provider; no live project/account configuration was
  detected.
- The account experience should remain additive and must not redirect logged-in
  visitors away from public pages.
- Proposed plan prices and placement fee ranges are configurable business
  settings, not active payment authorization.
- The exact retention/legal-hold policy for CV cleanup and the applicable
  privacy jurisdiction need owner review before production deletion is enabled.
- The legacy 96.4% homepage metric was not found by source search. Preserve the
  homepage unchanged and identify the source/component before adding a separate
  operational placement metric.
- The exact form entry points for candidate and employer intake require further
  review before connecting them to live data collection.
