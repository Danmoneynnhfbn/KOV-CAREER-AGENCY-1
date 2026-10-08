from pathlib import Path

root = Path(r"c:\Users\USER\Downloads\kov career agency")

for p in sorted(root.glob("*.html")):
    if p.name.endswith(".bak"):
        continue
    text = p.read_text(encoding="utf-8")
    if 'countries-we-serve.html' not in text:
        if '</footer>' in text:
            text = text.replace('</footer>', '<a href="countries-we-serve.html">Countries We Serve</a></footer>', 1)
        elif '</body>' in text:
            text = text.replace('</body>', '<a href="countries-we-serve.html">Countries We Serve</a></body>', 1)
        p.write_text(text, encoding="utf-8")

sitemap = root / 'sitemap.xml'
sitemap.write_text(
    '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://kovcareeragency.org/</loc><lastmod>2026-10-08</lastmod></url>
  <url><loc>https://kovcareeragency.org/services.html</loc><lastmod>2026-10-08</lastmod></url>
  <url><loc>https://kovcareeragency.org/global-talent-sourcer.html</loc><lastmod>2026-10-08</lastmod></url>
  <url><loc>https://kovcareeragency.org/how-it-works.html</loc><lastmod>2026-10-08</lastmod></url>
  <url><loc>https://kovcareeragency.org/pricing.html</loc><lastmod>2026-10-08</lastmod></url>
  <url><loc>https://kovcareeragency.org/faqs.html</loc><lastmod>2026-10-08</lastmod></url>
  <url><loc>https://kovcareeragency.org/about.html</loc><lastmod>2026-10-08</lastmod></url>
  <url><loc>https://kovcareeragency.org/contact.html</loc><lastmod>2026-10-08</lastmod></url>
  <url><loc>https://kovcareeragency.org/candidate-services.html</loc><lastmod>2026-10-08</lastmod></url>
  <url><loc>https://kovcareeragency.org/company-services.html</loc><lastmod>2026-10-08</lastmod></url>
  <url><loc>https://kovcareeragency.org/candidate-proof.html</loc><lastmod>2026-10-08</lastmod></url>
  <url><loc>https://kovcareeragency.org/company-proof.html</loc><lastmod>2026-10-08</lastmod></url>
  <url><loc>https://kovcareeragency.org/why-kov.html</loc><lastmod>2026-10-08</lastmod></url>
  <url><loc>https://kovcareeragency.org/countries-we-serve.html</loc><lastmod>2026-10-08</lastmod></url>
</urlset>
''',
    encoding='utf-8'
)

print('patched footers and sitemap')
