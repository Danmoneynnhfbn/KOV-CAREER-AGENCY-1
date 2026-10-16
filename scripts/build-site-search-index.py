import json
import re
import xml.etree.ElementTree as ET
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
SITEMAP = ROOT / "sitemap.xml"
OUTPUT = ROOT / "assets" / "site-search-index.js"
SKIPPED_TAGS = {"script", "style", "noscript", "template", "svg"}
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
SEO_PAGE_GROUPS = {
    "services": "Core services",
    "markets": "Geography and markets",
    "roles": "Seniority and roles",
    "resources": "Proof and next steps",
}


class VisibleTextParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.hidden_depth = 0
        self.parts = []
        self.description = ""

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        hidden = (
            tag in SKIPPED_TAGS
            or "hidden" in attributes
            or attributes.get("aria-hidden", "").lower() == "true"
            or attributes.get("type", "").lower() == "application/ld+json"
            or "kov-topic-nav" in attributes.get("class", "").split()
        )
        if self.hidden_depth:
            if tag not in VOID_TAGS:
                self.hidden_depth += 1
            return
        if hidden:
            if tag not in VOID_TAGS:
                self.hidden_depth = 1
            return

        if tag in {"br", "hr", "p", "div", "section", "article", "li", "h1", "h2", "h3", "h4", "tr"}:
            self.parts.append(" ")
        if tag == "img" and attributes.get("alt"):
            self.parts.append(attributes["alt"])
        if tag == "input" and attributes.get("placeholder"):
            self.parts.append(attributes["placeholder"])
        if tag == "meta" and attributes.get("name", "").lower() == "description":
            self.description = attributes.get("content", "")

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID_TAGS:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if self.hidden_depth:
            self.hidden_depth -= 1
            return
        if tag in {"br", "hr", "p", "div", "section", "article", "li", "h1", "h2", "h3", "h4", "tr"}:
            self.parts.append(" ")

    def handle_data(self, data):
        if not self.hidden_depth:
            self.parts.append(data)

    def text(self):
        return re.sub(r"\s+", " ", " ".join(self.parts)).strip()


def local_page(location):
    path = urlparse(location).path.strip("/")
    if not path or path == "blog":
        return "index.html" if not path else "blog.html"
    return path if path.endswith(".html") else f"{path}.html"


def extract_array(source, name):
    declaration = f"const {name} = ["
    start = source.index(declaration) + len(declaration) - 1
    depth = 0
    quote = None
    escaped = False
    for index in range(start, len(source)):
        character = source[index]
        if quote:
            if escaped:
                escaped = False
            elif character == "\\":
                escaped = True
            elif character == quote:
                quote = None
            continue
        if character in {"'", '"', "`"}:
            quote = character
        elif character == "[":
            depth += 1
        elif character == "]":
            depth -= 1
            if depth == 0:
                return source[start:index + 1]
    raise ValueError(f"Unclosed JavaScript array: {name}")


def javascript_strings(source):
    values = []
    index = 0
    while index < len(source):
        quote = source[index]
        if quote not in {"'", '"', "`"}:
            index += 1
            continue
        index += 1
        value = []
        while index < len(source):
            character = source[index]
            if character == "\\" and index + 1 < len(source):
                value.append(source[index + 1])
                index += 2
            elif character == quote:
                index += 1
                break
            else:
                value.append(character)
                index += 1
        values.append("".join(value))
    return " ".join(values)


def build_index():
    sitemap = ET.parse(SITEMAP).getroot()
    namespace = {"site": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    content = {}
    seo_pages = []

    for location in sitemap.findall("site:url/site:loc", namespace):
        page_name = local_page(location.text or "")
        page_path = ROOT / page_name
        if not page_path.is_file():
            continue
        source = page_path.read_text(encoding="utf-8-sig")
        parser = VisibleTextParser()
        parser.feed(source)
        content[page_name] = f"{parser.description} {parser.text()}".strip()
        category = Path(page_name).parts[0] if len(Path(page_name).parts) > 1 else ""
        if category in SEO_PAGE_GROUPS:
            title_match = re.search(r"<title[^>]*>(.*?)</title>", source, re.IGNORECASE | re.DOTALL)
            title = unescape(re.sub(r"\s+", " ", title_match.group(1)).strip()) if title_match else Path(page_name).stem
            seo_pages.append({
                "href": page_name.replace("\\", "/"),
                "title": title,
                "summary": parser.description,
                "terms": f"{title} {parser.description} {SEO_PAGE_GROUPS[category]}",
                "category": category,
            })

    proof_data = (ROOT / "assets" / "proof-library-data.js").read_text(encoding="utf-8-sig")
    candidate_data = " ".join(javascript_strings(extract_array(proof_data, name)) for name in ("candidateRows", "candidateProfiles"))
    content["candidate-proof.html"] = f"{content['candidate-proof.html']} {candidate_data}".strip()
    OUTPUT.write_text(
        "window.kovSiteSearchContent = "
        + json.dumps(content, ensure_ascii=True, separators=(",", ":"))
        + ";\nwindow.kovSeoPageCatalog = "
        + json.dumps(seo_pages, ensure_ascii=True, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    print(
        f"Indexed visible text for {len(content)} sitemap pages and "
        f"{len(seo_pages)} clustered landing pages into {OUTPUT.relative_to(ROOT)}"
    )


if __name__ == "__main__":
    build_index()
