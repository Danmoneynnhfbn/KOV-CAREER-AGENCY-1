function gzipIsAcceptable(header) {
  if (header == null) return true;
  const entries = header.split(",").map((part) => {
    const [coding, ...parameters] = part.trim().toLowerCase().split(";");
    const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith("q="));
    const quality = qualityParameter ? Number(qualityParameter.trim().slice(2)) : 1;
    return { coding, quality: Number.isFinite(quality) ? quality : 0 };
  });
  const explicit = entries.find((entry) => entry.coding === "gzip");
  if (explicit) return explicit.quality > 0;
  const wildcard = entries.find((entry) => entry.coding === "*");
  return Boolean(wildcard && wildcard.quality > 0);
}

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
      ["/data/catalogues/audiences.json", "/data/catalogues/audiences.json.gz"],
      ["/data/catalogues/job-titles.json", "/data/catalogues/job-titles.json.gz"],
      ["/data/catalogues/occupations.json", "/data/catalogues/occupations.json.gz"],
      ["/data/catalogues/industries.json", "/data/catalogues/industries.json.gz"],
      ["/data/catalogues/skills.json", "/data/catalogues/skills.json.gz"],
      ["/data/catalogues/qualifications.json", "/data/catalogues/qualifications.json.gz"],
      ["/data/catalogues/professional-terms.json", "/data/catalogues/professional-terms.json.gz"],
      ["/data/catalogues/job-functions.json", "/data/catalogues/job-functions.json.gz"],
      ["/data/catalogues/seniority-levels.json", "/data/catalogues/seniority-levels.json.gz"],
      ["/data/catalogues/employment-types.json", "/data/catalogues/employment-types.json.gz"],
      ["/data/catalogues/career-challenges.json", "/data/catalogues/career-challenges.json.gz"],
      ["/data/catalogues/career-search-intents.json", "/data/catalogues/career-search-intents.json.gz"],
      ["/data/catalogues/faqs.json", "/data/catalogues/faqs.json.gz"],
      ["/data/catalogues/languages.json", "/data/catalogues/languages.json.gz"],
      ["/data/catalogues/countries.json", "/data/catalogues/countries.json.gz"],
      ["/data/catalogues/cities.json", "/data/catalogues/cities.json.gz"],
      ["/data/catalogues/towns-localities.json", "/data/catalogues/towns-localities.json.gz"],
      ["/data/catalogues/institutions.json", "/data/catalogues/institutions.json.gz"],
    ]);

    const compressedPath = compressedRoutes.get(url.pathname);
    if (compressedPath) {
      const assetUrl = new URL(compressedPath, url);
      // Fetch the stored .gz asset as-is. If the internal ASSETS subrequest also
      // negotiates gzip, it can add a second compression layer around the .gz file.
      const assetHeaders = new Headers(request.headers);
      assetHeaders.set("Accept-Encoding", "identity");
      const assetRequest = new Request(assetUrl, {
        method: request.method,
        headers: assetHeaders,
      });
      const asset = await env.ASSETS.fetch(assetRequest);
      if (!asset.ok) return asset;

      const headers = new Headers(asset.headers);
      const assetEncoding = (headers.get("Content-Encoding") || "").trim().toLowerCase();
      const contentType = url.pathname.endsWith(".jsonld")
        ? "application/ld+json; charset=utf-8"
        : "application/json; charset=utf-8";
      headers.set("Content-Type", contentType);
      headers.set("Cache-Control", "public, max-age=3600");
      const vary = new Set((headers.get("Vary") || "").split(",").map((value) => value.trim()).filter(Boolean));
      vary.add("Accept-Encoding");
      headers.set("Vary", [...vary].join(", "));
      headers.delete("Content-Length");

      // Remove any HTTP-level encoding applied by the Pages asset binding.
      // The underlying .gz file is itself the representation we want to serve.
      let body = request.method === "HEAD" ? null : asset.body;
      if (body && assetEncoding === "gzip") {
        body = body.pipeThrough(new DecompressionStream("gzip"));
      } else if (assetEncoding && assetEncoding !== "identity") {
        return new Response("Unsupported catalogue asset encoding", {
          status: 502,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
      headers.delete("Content-Encoding");

      if (gzipIsAcceptable(request.headers.get("Accept-Encoding"))) {
        headers.set("Content-Encoding", "gzip");
        return new Response(body, {
          status: asset.status,
          statusText: asset.statusText,
          headers,
        });
      }

      const decodedBody = body ? body.pipeThrough(new DecompressionStream("gzip")) : null;
      return new Response(decodedBody, {
        status: asset.status,
        statusText: asset.statusText,
        headers,
      });
    }

    return env.ASSETS.fetch(request);
  },
};
