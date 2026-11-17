#!/usr/bin/env bash
set -euo pipefail

# Requires Docker and a Cloudflare Workers Paid account with Containers enabled.
# This deploys the separate kov-career-api Worker. It does not attach a
# production hostname route; add that only after Workers.dev tests pass.
npx wrangler deploy --config wrangler.jsonc
