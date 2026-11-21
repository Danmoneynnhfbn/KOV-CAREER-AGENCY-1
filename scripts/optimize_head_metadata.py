#!/usr/bin/env python3
"""Lossless HTML HEAD optimization for Cloudflare Pages output.

Preserves page bodies and all existing HEAD content, including canonical,
robots, social metadata, scripts, stylesheets and unrelated attributes. It
only moves existing charset declarations to the beginning of HEAD and
compacts/repositions the generated KOV discovery JSON-LD.
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
SCRIPT_STYLE_RE = re.compile(
    r"(<script\b[^>]*>[\s\S]*?</script\s*>|<style\b[^>]*>[\s\S]*?</style\s*>)",
    re.I,
)
ATTR_RE = re.compile(r"""([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))""", re.I)


def attrs(tag: str) -> dict[str, str]:
    return {
        match.group(1).lower(): next(
            value for value in match.groups()[1:] if value is not None
        )
        for match in ATTR_RE.finditer(tag)
    }


def markup_parts(head: str) -> list[str]:
    return SCRIPT_STYLE_RE.split(head)


def transform_markup(head: str, transform) -> str:
    parts = markup_parts(head)
    for index in range(0, len(parts), 2):
        parts[index] = transform(parts[index])
    return "".join(parts)


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

    head = transform_markup(head, lambda segment: META_RE.sub(replace_tag, segment))
    if not found:
        head += f'\n<meta {attr_name}="{escape_attr(key)}" content="{escape_attr(value)}">'
    return head, found


def read_meta(head: str, key: str, *, prop: bool = False) -> str:
    attr_name = "property" if prop else "name"
    for segment in markup_parts(head)[::2]:
        for match in META_RE.finditer(segment):
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
    for match in re.finditer(r"<link\b[^>]*>", SCRIPT_STYLE_RE.sub("", head), re.I):
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

    # Preserve existing HEAD metadata byte-for-byte. Only relocate charset tags
    # and compact/reposition the generated KOV JSON-LD script.
    charset_tags = []
    def take_charset(m: re.Match[str]) -> str:
        tag = m.group(0)
        if re.search(r"\bcharset\s*=", tag, re.I):
            charset_tags.append(tag)
            return ""
        return tag
    head = transform_markup(head, lambda segment: META_RE.sub(take_charset, segment))
    if not charset_tags:
        charset_tags = ['<meta charset="utf-8">']
    head = "".join(charset_tags) + head

    head, script_count, saved = compact_and_move_jsonld(head)
    updated = original[:match.start(2)] + head + original[match.end(2):]

    after_body = BODY_RE.search(updated)
    after_body_text = after_body.group(0) if after_body else ""
    if before_body_text != after_body_text:
        raise ValueError(f"BODY changed: {path.relative_to(root)}")

    def managed_head(value: str) -> str:
        head_match = HEAD_RE.search(value)
        if not head_match:
            raise ValueError(f"Missing HEAD during preservation check: {path.relative_to(root)}")
        inner = SCRIPT_RE.sub("", head_match.group(2))
        def remove_charset(segment: str) -> str:
            return META_RE.sub(
                lambda item: "" if re.search(r"\bcharset\s*=", item.group(0), re.I) else item.group(0),
                segment,
            )
        inner = transform_markup(inner, remove_charset)
        # JSON-LD is intentionally moved to the end of HEAD; ignore only trailing whitespace
        # left around that managed script, while comparing all remaining markup exactly.
        return head_match.group(1) + inner.rstrip() + head_match.group(3)

    if managed_head(original) != managed_head(updated):
        raise ValueError(
            f"Unrelated HEAD content changed, including social metadata, scripts, stylesheets or other attributes: {path.relative_to(root)}"
        )

    def outside_head(value: str) -> str:
        if not HEAD_RE.search(value):
            raise ValueError(f"Missing HEAD during document preservation check: {path.relative_to(root)}")
        return HEAD_RE.sub("<!-- KOV_HEAD_BLOCK -->", value, count=1)

    if outside_head(original) != outside_head(updated):
        raise ValueError(f"HTML outside HEAD changed: {path.relative_to(root)}")

    def charset_declarations(value: str) -> list[str]:
        head_match = HEAD_RE.search(value)
        if not head_match:
            return []
        tags = []
        for segment in markup_parts(head_match.group(2))[::2]:
            tags.extend(
                item.group(0) for item in META_RE.finditer(segment)
                if re.search(r"\bcharset\s*=", item.group(0), re.I)
            )
        return tags

    before_charset = charset_declarations(original)
    after_charset = charset_declarations(updated)
    expected_charset = before_charset or ['<meta charset="utf-8">']
    if after_charset != expected_charset:
        raise ValueError(f"Charset declaration value or attributes changed: {path.relative_to(root)}")

    def kov_jsonld_values(value: str) -> list[object]:
        head_match = HEAD_RE.search(value)
        if not head_match:
            return []
        result = []
        for script_match in SCRIPT_RE.finditer(head_match.group(2)):
            script = script_match.group(0)
            opening = re.match(r"<script\b[^>]*>", script, re.I).group(0)
            closing = re.search(r"</script\s*>$", script, re.I).group(0)
            result.append(json.loads(script[len(opening):len(script) - len(closing)]))
        return result

    if kov_jsonld_values(original) != kov_jsonld_values(updated):
        raise ValueError(f"KOV JSON-LD content changed during optimization: {path.relative_to(root)}")

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
        "description_added": False,
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
