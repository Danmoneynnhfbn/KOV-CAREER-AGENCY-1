export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname.toLowerCase() === "kovcareeragency.org") {
      url.hostname = "www.kovcareeragency.org";
      return Response.redirect(url.toString(), 308);
    }
    const compressedRoutes = new Map([
      ["/data/kov-discovery-catalog.jsonld", "/data/kov-discovery-catalog.jsonld.gz"],
      ["/data/taxonomy/verified-expanded-taxonomy.json", "/data/taxonomy/verified-expanded-taxonomy.json.gz"],
    ]);

    const compressedPath = compressedRoutes.get(url.pathname);
    if (compressedPath) {
      const assetUrl = new URL(compressedPath, url);
      const assetRequest = new Request(assetUrl, request);
      const asset = await env.ASSETS.fetch(assetRequest);
      if (!asset.ok) return asset;

      const headers = new Headers(asset.headers);
      headers.set("Content-Type", url.pathname.endsWith(".jsonld")
        ? "application/ld+json; charset=utf-8"
        : "application/json; charset=utf-8");
      headers.set("Content-Encoding", "gzip");
      headers.set("Cache-Control", "public, max-age=3600");
      headers.set("Vary", "Accept-Encoding");
      headers.delete("Content-Length");
      return new Response(asset.body, {
        status: asset.status,
        statusText: asset.statusText,
        headers,
      });
    }

    return env.ASSETS.fetch(request);
  },
};
