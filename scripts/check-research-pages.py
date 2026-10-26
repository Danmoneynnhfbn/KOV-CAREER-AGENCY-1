#!/usr/bin/env python3
"""Validate generated page lengths, FAQ uniqueness, and strict visible-copy overlap."""

from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from html.parser import HTMLParser
from itertools import combinations
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data" / "pages"
REPORT_PATH = ROOT / "VISIBLE-OVERLAP-AUDIT.md"
MINIMUM_WORDS = {"role": 2500, "pair": 1400, "industry": 2000}
MAXIMUM_WORDS = {"role": 3900, "pair": 3100, "industry": 4100}
SIMILARITY_LIMIT = 0.30
SHINGLE_SIZE = 8
TOKEN_PATTERN = re.compile(r"[a-z0-9]+")
VOID_TAGS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
    "meta", "param", "source", "track", "wbr",
}
IGNORED_TAGS = {"footer", "header", "nav", "noscript", "script", "style", "template"}
TEXT_BOUNDARIES = {
    "article", "blockquote", "button", "dd", "div", "dt", "h1", "h2", "h3",
    "h4", "h5", "h6", "li", "main", "p", "section", "summary", "td", "th",
}


class VisibleBodyText(HTMLParser):
    """Collect body text while excluding site chrome and non-visible markup."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.ignored_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        style = re.sub(r"\s+", "", attributes.get("style") or "").casefold()
        hidden = (
            "hidden" in attributes
            or attributes.get("aria-hidden") == "true"
            or "display:none" in style
            or "visibility:hidden" in style
        )
        if self.ignored_depth:
            if tag not in VOID_TAGS:
                self.ignored_depth += 1
            return
        if tag in IGNORED_TAGS or hidden:
            if tag not in VOID_TAGS:
                self.ignored_depth = 1
            return
        if tag in TEXT_BOUNDARIES:
            self.parts.append(" ")

    def handle_endtag(self, tag: str) -> None:
        if self.ignored_depth:
            if tag not in VOID_TAGS:
                self.ignored_depth -= 1
            return
        if tag in TEXT_BOUNDARIES:
            self.parts.append(" ")

    def handle_data(self, data: str) -> None:
        if not self.ignored_depth:
            self.parts.append(data)


def page_type(canonical: str) -> str | None:
    parts = [part for part in canonical.strip("/").split("/") if part]
    if len(parts) == 2 and parts[0] == "roles":
        return "role"
    if len(parts) == 3 and parts[0] == "roles" and parts[2].endswith(".html"):
        return "pair"
    if len(parts) == 2 and parts[0] == "industries":
        return "industry"
    return None


def page_words(text: str) -> list[str]:
    return TOKEN_PATTERN.findall(text.casefold())


def visible_text(html: str) -> str:
    parser = VisibleBodyText()
    parser.feed(html)
    return " ".join(parser.parts)


def word_shingles(words: list[str]) -> set[tuple[str, ...]]:
    return {
        tuple(words[index:index + SHINGLE_SIZE])
        for index in range(len(words) - SHINGLE_SIZE + 1)
    }


def similarity(left: set[tuple[str, ...]], right: set[tuple[str, ...]]) -> float:
    intersection_size = len(left & right)
    union_size = len(left) + len(right) - intersection_size
    return intersection_size / union_size if union_size else 0.0


def grouped_pairs(groups: dict[str, list[dict]]) -> tuple[list[dict], list[dict]]:
    summaries = []
    failures = []
    for label, pages in sorted(groups.items()):
        comparisons = []
        for left, right in combinations(pages, 2):
            score = similarity(left["shingles"], right["shingles"])
            comparison = {
                "score": score,
                "left": left["canonical"],
                "right": right["canonical"],
            }
            comparisons.append(comparison)
            if score > SIMILARITY_LIMIT:
                failures.append({**comparison, "group": label})
        summaries.append({
            "label": label,
            "pages": len(pages),
            "comparisons": len(comparisons),
            "average": (
                sum(item["score"] for item in comparisons) / len(comparisons)
                if comparisons else 0.0
            ),
            "worst": sorted(comparisons, key=lambda item: item["score"], reverse=True)[:20],
        })
    return summaries, failures


def write_report(
    role_summaries: list[dict],
    industry_summaries: list[dict],
    failures: list[dict],
    page_count: int,
    word_counts: dict[str, list[int]],
) -> None:
    comparisons = sum(
        group["comparisons"] for group in role_summaries + industry_summaries
    )
    all_scores = [
        item["score"]
        for group in role_summaries + industry_summaries
        for item in group["worst"]
    ]
    lines = [
        "# Strict Visible-Body Overlap Audit",
        "",
        f"- Page records audited: {page_count}",
        f"- Within-role and within-industry page comparisons: {comparisons}",
        f"- Pair comparisons over 30%: {len(failures)}",
        "- Text scope: all visible page-body copy, excluding only header, footer, navigation, and non-visible scripts/styles/hidden elements.",
        f"- Similarity: Jaccard overlap of exact contiguous {SHINGLE_SIZE}-word passages; any score above 30% is a failure.",
        "- Role groups contain the role hub and every generated pair page for that role. Industry groups contain the industry hub and every generated pair page for that industry.",
        "- Page word limits reflect the concise copy pass; minimum lengths and unique-FAQ checks remain enforced.",
        "",
        "## Word counts",
        "",
        "| Type | Pages | Required minimum | Observed visible-word range | Maximum cap |",
        "|---|---:|---:|---:|---:|",
    ]
    for kind in ("role", "pair", "industry"):
        counts = word_counts[kind]
        max_label = f"{MAXIMUM_WORDS[kind]:,}" if kind in MAXIMUM_WORDS else "not set"
        lines.append(
            f"| {kind} | {len(counts)} | {MINIMUM_WORDS[kind]:,} | "
            f"{min(counts, default=0):,}–{max(counts, default=0):,} | {max_label} |"
        )
    for title, groups in (("Within each role", role_summaries), ("Within each industry", industry_summaries)):
        lines.extend(["", f"## {title}", ""])
        for group in groups:
            lines.extend([
                f"### {group['label']}",
                "",
                f"Pages: {group['pages']}; comparisons: {group['comparisons']}; "
                f"average overlap: {group['average']:.2%}.",
                "",
                "| Rank | Overlap | Page A | Page B |",
                "|---:|---:|---|---|",
            ])
            for index, item in enumerate(group["worst"], 1):
                lines.append(
                    f"| {index} | {item['score']:.2%} | `{item['left']}` | "
                    f"`{item['right']}` |"
                )
            lines.append("")
    if failures:
        lines.extend(["## Every failing comparison", ""])
        lines.append("| Group | Overlap | Page A | Page B |")
        lines.append("|---|---:|---|---|")
        for item in sorted(failures, key=lambda row: row["score"], reverse=True):
            lines.append(
                f"| {item['group']} | {item['score']:.2%} | `{item['left']}` | "
                f"`{item['right']}` |"
            )
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    errors: list[str] = []
    faq_owner: dict[str, str] = {}
    role_groups: dict[str, list[dict]] = defaultdict(list)
    industry_groups: dict[str, list[dict]] = defaultdict(list)
    word_counts: dict[str, list[int]] = {kind: [] for kind in MINIMUM_WORDS}
    records_checked = 0

    for record_path in sorted(DATA_DIR.glob("*.json")):
        try:
            record = json.loads(record_path.read_text(encoding="utf-8"))
            canonical = record.get("canonical", "")
            kind = page_type(canonical)
            if not kind:
                continue
            html_path = ROOT / record["outputHtml"]
            body = visible_text(html_path.read_text(encoding="utf-8", errors="replace"))
        except (OSError, KeyError, json.JSONDecodeError) as error:
            errors.append(f"{record_path.name}: unable to load page record/HTML: {error}")
            continue

        records_checked += 1
        words = page_words(body)
        word_counts[kind].append(len(words))
        minimum = MINIMUM_WORDS[kind]
        if len(words) < minimum:
            errors.append(f"{canonical}: {len(words)} visible words; minimum is {minimum}.")
        maximum = MAXIMUM_WORDS.get(kind)
        if maximum and len(words) > maximum:
            errors.append(f"{canonical}: {len(words)} visible words; maximum is {maximum}.")

        for faq in record.get("faqs", []):
            normalized = " ".join(page_words(faq.get("question", "")))
            if not normalized:
                errors.append(f"{canonical}: FAQ question is empty.")
            elif normalized in faq_owner:
                errors.append(
                    f"{canonical}: repeated FAQ question also appears on "
                    f"{faq_owner[normalized]}: {faq.get('question')}"
                )
            else:
                faq_owner[normalized] = canonical

        parts = [part for part in canonical.strip("/").split("/") if part]
        page = {
            "canonical": canonical,
            "shingles": word_shingles(words),
        }
        if kind == "role":
            role_groups[parts[1]].append(page)
        elif kind == "pair":
            role_groups[parts[1]].append(page)
            industry_groups[parts[2][:-5]].append(page)
        elif kind == "industry":
            industry_groups[parts[1]].append(page)

    role_summaries, role_failures = grouped_pairs(role_groups)
    industry_summaries, industry_failures = grouped_pairs(industry_groups)
    failures = role_failures + industry_failures
    write_report(
        role_summaries, industry_summaries, failures, records_checked, word_counts
    )

    print(f"Research pages checked: {records_checked}")
    print(f"Unique FAQ questions checked: {len(faq_owner)}")
    print(f"Strict 8-word overlap comparisons: {sum(g['comparisons'] for g in role_summaries + industry_summaries)}")
    print(f"Comparisons over 30%: {len(failures)}")
    print(f"Detailed audit report: {REPORT_PATH}")
    if errors:
        print(f"RESEARCH CONTENT CHECK FAILED ({len(errors)} issue(s))")
        for error in errors:
            print(f"- {error}")
    else:
        print("All minimum and maximum visible-word limits pass.")
    if failures:
        print("OVERLAP CHECK FAILED")
        for item in sorted(failures, key=lambda row: row["score"], reverse=True):
            print(
                f"- {item['score']:.2%} [{item['group']}]: "
                f"{item['left']} <> {item['right']}"
            )
    elif not errors:
        print("STRICT VISIBLE-BODY OVERLAP CHECK PASSED.")
    return 1 if errors or failures else 0


if __name__ == "__main__":
    sys.exit(main())
