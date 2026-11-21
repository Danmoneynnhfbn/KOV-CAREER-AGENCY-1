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
      const assetRequest = new Request(assetUrl, request);
      const asset = await env.ASSETS.fetch(assetRequest);
      if (!asset.ok) return asset;

      const headers = new Headers(asset.headers);
      const contentType = url.pathname.endsWith(".jsonld")
        ? "application/ld+json; charset=utf-8"
        : url.pathname.endsWith(".js")
          ? "text/javascript; charset=utf-8"
          : url.pathname.endsWith(".txt")
            ? "text/plain; charset=utf-8"
            : "application/json; charset=utf-8";
      headers.set("Content-Type", contentType);
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
