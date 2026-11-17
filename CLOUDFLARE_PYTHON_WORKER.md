# Deprecated: Python Worker deployment

This file describes an earlier Python Workers deployment experiment. It is **not the active KOV deployment architecture** and must not be used to deploy or change the production Worker.

The active architecture is the Cloudflare Container deployment documented in [CLOUDFLARE_CONTAINER_DEPLOYMENT.md](CLOUDFLARE_CONTAINER_DEPLOYMENT.md).

The active entry point is `cloudflare-api/worker.ts`, which starts the existing FastAPI application from `server.py` inside the Docker image defined by `Dockerfile`. The active Wrangler configuration is `wrangler.jsonc`.

Do not use `cloudflare_worker.py`, `scripts/prepare_cloudflare_assets.py`, or the old `pywrangler` instructions in this file for deployment. The Python Worker experiment is retained in the repository for historical reference only.

The discovery catalogue is already handled by the active container build through `scripts/compress_discovery_catalogue.py`. The original JSON-LD file is preserved and the gzip copy is verified byte-for-byte before the image is built.
