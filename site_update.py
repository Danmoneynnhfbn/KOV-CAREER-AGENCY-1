from datetime import datetime, timezone
from pathlib import Path
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parent
SITE_URL = "https://www.kovcareeragency.org"
SITEMAP_PATH = ROOT / "sitemap.xml"
CORE_PAGES = (
    "index.html",
    "services.html",
    "global-talent-sourcer.html",
    "how-it-works.html",
    "pricing.html",
    "faqs.html",
    "blog.html",
    "about.html",
    "contact.html",
    "candidate-services.html",
    "company-services.html",
    "candidate-proof.html",
    "company-proof.html",
    "why-kov.html",
    "countries-we-serve.html",
    "glossary.html",
)
PAGE_CATEGORIES = ("services", "markets", "roles", "industries", "resources")
SITEMAP_NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9"


def build_sitemap() -> None:
    today = datetime.now(timezone.utc).date().isoformat()
    page_paths = []

    for filename in CORE_PAGES:
        page_path = ROOT / filename
        if not page_path.is_file():
            raise FileNotFoundError(f"Expected core page is missing: {page_path}")
        page_paths.append(page_path.relative_to(ROOT))

    for category in PAGE_CATEGORIES:
        category_path = ROOT / category
        if not category_path.is_dir():
            raise FileNotFoundError(f"Expected page category is missing: {category_path}")
        page_paths.extend(
            page.relative_to(ROOT)
            for page in sorted(category_path.glob("*.html"))
        )

    urls = [
        f"{SITE_URL}/" if page == Path("index.html")
        else f"{SITE_URL}/{page.as_posix()}"
        for page in page_paths
    ]
    if len(urls) != len(set(urls)):
        raise ValueError("Duplicate URLs found while building sitemap.")

    ET.register_namespace("", SITEMAP_NAMESPACE)
    urlset = ET.Element(f"{{{SITEMAP_NAMESPACE}}}urlset")
    for url in urls:
        entry = ET.SubElement(urlset, f"{{{SITEMAP_NAMESPACE}}}url")
        ET.SubElement(entry, f"{{{SITEMAP_NAMESPACE}}}loc").text = url
        ET.SubElement(entry, f"{{{SITEMAP_NAMESPACE}}}lastmod").text = today

    tree = ET.ElementTree(urlset)
    ET.indent(tree, space="  ")
    tree.write(SITEMAP_PATH, encoding="utf-8", xml_declaration=True)
    print(f"Updated {SITEMAP_PATH.name} with {len(urls)} page URLs.")


if __name__ == "__main__":
    build_sitemap()
