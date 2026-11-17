#!/usr/bin/env bash
set -euo pipefail

# Cloudflare Workers Builds environments may not include uv by default.
if ! command -v uv >/dev/null 2>&1; then
  python -m pip install --user uv
  export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
fi

python scripts/prepare_cloudflare_assets.py
uv sync
uv run pywrangler deploy
