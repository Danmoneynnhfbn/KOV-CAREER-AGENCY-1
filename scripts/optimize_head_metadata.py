#!/usr/bin/env python3
"""Lossless HTML HEAD optimization for Cloudflare Pages output.

Preserves every page body and every existing JSON-LD data node. It only
reformats the generated KOV discovery JSON-LD, normalizes social metadata,
adds a description when one is absent, and moves charset/JSON-LD to safe
positions in the HEAD.
"""
from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path
from urllib.parse import urljoin

SITE = "https://www.kovcareeragency.org"
DEFAULT_IMAGE = SITE + "/preview.png"
MARKER = 'data-kov="discovery"'
META_RE = re.compile(r"<meta\b[^>]*>", re.I)
SCRIPT_RE = re.compile(
    r"<script\b(?=[^>]*\bdata-kov\s*=\s*(['\"])discovery\1)[^>]*>[\s\S]*?</script\s*>",
    re.I,
)
HEAD_RE = re.compile(r"(<head\b[^>]*>)([\s\S]*?)(</head\s*>)", re.I)
BODY_RE = re.compile(r"<body\b[^>]*>[\s\S]*?</body\s*>", re.I)
ATTR_RE = re.compile(r"""([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))""", re.I)


def attrs(tag: str) -> dict[str, str]:
    return {
        match.group(1).lower(): next(
            value for value in match.groups()[1:] if value is not None
        )
        for match in ATTR_RE.finditer(tag)
    }


def meta_matches(tag: str, key: str, value: str) -> bool:
    a = attrs(tag)
    return a.get(key.lower(), "").casefold() == value.casefold()


def escape_attr(value: str) -> str:
    return html.escape(value, quote=True)


def set_content(tag: str, value: str) -> str:
    replacement = 'content="' + escape_attr(value) + '"'
    if re.search(r"\bcontent\s*=", tag, re.I):
        return re.sub(
            r"""\bcontent\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)""",
            lambda _: replacement,
            tag,
            count=1,
            flags=re.I,
        )
    return tag[:-1].rstrip() + " " + replacement + ">"


def set_meta(head: str, key: str, value: str, *, prop: bool = False) -> tuple[str, int]:
    attr_name = "property" if prop else "name"
    found = 0

    def replace_tag(match: re.Match[str]) -> str:
        nonlocal found
        tag = match.group(0)
        if meta_matches(tag, attr_name, key):
            found += 1
            return set_content(tag, value)
        return tag

    head = META_RE.sub(replace_tag, head)
    if not found:
        head += f'\n<meta {attr_name}="{escape_attr(key)}" content="{escape_attr(value)}">'
    return head, found


def read_meta(head: str, key: str, *, prop: bool = False) -> str:
    attr_name = "property" if prop else "name"
    for match in META_RE.finditer(head):
        a = attrs(match.group(0))
        if a.get(attr_name, "").casefold() == key.casefold():
            return html.unescape(a.get("content", "")).strip()
    return ""


def plain_text(value: str) -> str:
    value = re.sub(r"(?is)<(script|style)\b[^>]*>.*?</\1\s*>", " ", value)
    value = re.sub(r"(?s)<[^>]+>", " ", value)
    value = html.unescape(value)
    return re.sub(r"\s+", " ", value).strip()


def first_text(html_text: str, tag: str) -> str:
    match = re.search(
        rf"(?is)<{tag}\b[^>]*>(.*?)</{tag}\s*>", html_text
    )
    return plain_text(match.group(1)) if match else ""


def shorten(value: str, limit: int = 158) -> str:
    value = re.sub(r"\s+", " ", value).strip()
    if len(value) <= limit:
        return value
    clipped = value[: limit - 1]
    if " " in clipped:
        clipped = clipped.rsplit(" ", 1)[0]
    return clipped.rstrip(" ,;:-") + "…"


def canonical_url(head: str, relative_path: str) -> str:
    for match in re.finditer(r"<link\b[^>]*>", head, re.I):
        tag = match.group(0)
        a = attrs(tag)
        if "canonical" in a.get("rel", "").lower().split() and a.get("href"):
            return urljoin(SITE + "/", html.unescape(a["href"]))
    normalized = relative_path.replace("\\", "/")
    if normalized == "index.html":
        return SITE + "/"
    if normalized.endswith("/index.html"):
        normalized = normalized[:-10]
    return SITE + "/" + normalized.lstrip("/")


def compact_and_move_jsonld(head: str) -> tuple[str, int, int]:
    scripts = []

    def compact(match: re.Match[str]) -> str:
        whole = match.group(0)
        opening = re.match(r"<script\b[^>]*>", whole, re.I).group(0)
        closing = re.search(r"</script\s*>$", whole, re.I).group(0)
        raw = whole[len(opening):len(whole) - len(closing)]
        parsed = json.loads(raw)
        compact_json = json.dumps(
            parsed, ensure_ascii=False, separators=(",", ":"), allow_nan=False
        )
        scripts.append(opening + compact_json + closing)
        return ""

    before_bytes = len(head.encode("utf-8"))
    head = SCRIPT_RE.sub(compact, head)
    if scripts:
        head = head.rstrip() + "\n" + "\n".join(scripts) + "\n"
    after_bytes = len(head.encode("utf-8"))
    return head, len(scripts), max(0, before_bytes - after_bytes)


def optimize_file(path: Path, root: Path) -> dict:
    original = path.read_text(encoding="utf-8")
    match = HEAD_RE.search(original)
    if not match:
        raise ValueError(f"Missing HEAD element: {path.relative_to(root)}")

    before_body = BODY_RE.search(original)
    before_body_text = before_body.group(0) if before_body else ""
    head = match.group(2)

    # Move the existing charset declaration to the first position in HEAD.
    charset_tags = []
    def take_charset(m: re.Match[str]) -> str:
        tag = m.group(0)
        if re.search(r"\bcharset\s*=", tag, re.I):
            charset_tags.append(tag)
            return ""
        return tag
    head = META_RE.sub(take_charset, head)
    if not charset_tags:
        charset_tags = ['<meta charset="utf-8">']
    head = "\n" + "\n".join(charset_tags) + head.lstrip()

    title = first_text(head, "title") or first_text(original, "h1")
    description = read_meta(head, "description")
    if not description:
        h1 = first_text(original, "h1")
        paragraph = first_text(original, "p")
        subject = h1 or title or path.stem.replace("-", " ").title()
        if paragraph and len(paragraph) > 35:
            description = shorten(paragraph)
        else:
            description = shorten(
                f"{subject}. Explore relevant career information and services from KOV Career Agency."
            )
        head, _ = set_meta(head, "description", description)

    title = title or path.stem.replace("-", " ").title()
    description = read_meta(head, "description") or description
    canonical = canonical_url(head, path.relative_to(root).as_posix())
    og_image = read_meta(head, "og:image", prop=True) or DEFAULT_IMAGE

    # Keep an existing page-specific image; synchronize Twitter to the OG image.
    social = [
        ("og:site_name", "KOV Career Agency", True),
        ("og:url", canonical, True),
        ("og:title", title, True),
        ("og:description", description, True),
        ("og:image", og_image, True),
        ("og:image:alt", "KOV Career Agency", True),
        ("og:locale", "en_US", True),
        ("twitter:card", "summary_large_image", False),
        ("twitter:title", title, False),
        ("twitter:description", description, False),
        ("twitter:image", og_image, False),
        ("twitter:site", "@KOVCareerAgency", False),
    ]
    # Do not replace an existing Open Graph type (e.g. article); add only if absent.
    if not read_meta(head, "og:type", prop=True):
        social.insert(0, ("og:type", "website", True))

    changed_tags = 0
    for key, value, is_property in social:
        head, _ = set_meta(head, key, value, prop=is_property)

    head, script_count, saved = compact_and_move_jsonld(head)
    updated = original[:match.start(2)] + head + original[match.end(2):]

    after_body = BODY_RE.search(updated)
    after_body_text = after_body.group(0) if after_body else ""
    if before_body_text != after_body_text:
        raise ValueError(f"BODY changed: {path.relative_to(root)}")

    final_head_match = HEAD_RE.search(updated)
    final_head = final_head_match.group(2) if final_head_match else ""
    first_head_content = final_head.lstrip()
    if not re.match(r"<meta\b[^>]*\bcharset\s*=", first_head_content, re.I):
        raise ValueError(f"Charset declaration is not first in HEAD: {path.relative_to(root)}")
    if updated.lower().find("charset=") > 1024:
        raise ValueError(f"Charset declaration is beyond the first 1,024 bytes: {path.relative_to(root)}")

    before_robots = re.findall(
        r"<meta\b[^>]*\bname\s*=\s*(['\"])robots\1[^>]*>", original, re.I
    )
    after_robots = re.findall(
        r"<meta\b[^>]*\bname\s*=\s*(['\"])robots\1[^>]*>", updated, re.I
    )
    if before_robots != after_robots:
        raise ValueError(f"Robots directive changed: {path.relative_to(root)}")

    if updated != original:
        path.write_text(updated, encoding="utf-8", newline="")
    return {
        "file": path.relative_to(root).as_posix(),
        "original_bytes": len(original.encode("utf-8")),
        "final_bytes": len(updated.encode("utf-8")),
        "jsonld_scripts": script_count,
        "jsonld_head_bytes_saved": saved,
        "description_added": not bool(read_meta(match.group(2), "description")),
    }


def optimize_tree(root: Path) -> dict:
    root = root.resolve()
    pages = sorted(root.rglob("*.html"))
    reports = [optimize_file(path, root) for path in pages]
    return {
        "pages": len(reports),
        "jsonld_scripts": sum(item["jsonld_scripts"] for item in reports),
        "jsonld_head_bytes_saved": sum(item["jsonld_head_bytes_saved"] for item in reports),
        "bytes_before": sum(item["original_bytes"] for item in reports),
        "bytes_after": sum(item["final_bytes"] for item in reports),
        "descriptions_added": sum(item["description_added"] for item in reports),
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("root", nargs="?", default="dist")
    args = parser.parse_args()
    result = optimize_tree(Path(args.root))
    print(json.dumps(result, indent=2))
