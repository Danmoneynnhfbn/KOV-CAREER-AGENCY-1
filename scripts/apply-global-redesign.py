"""Attach KOV's shared visual system and interactions to live HTML pages."""
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {"node_modules", ".git", ".venv", ".venv-newpc", "_design-reference", ".private_admin"}
CSS = '<link rel="stylesheet" href="/css/kov-global-redesign.css?v=21" data-kov-global-redesign>'
JS = '<script defer src="/assets/kov-global-interactions.js?v=10" data-kov-global-interactions></script>'
FOOTER = '<script defer src="/assets/uniform-footer.js?v=11" data-kov-uniform-footer></script>'
VERSION_UPDATES = {
    "/css/kov-global-redesign.css?v=1": "/css/kov-global-redesign.css?v=4",
    "/css/kov-global-redesign.css?v=2": "/css/kov-global-redesign.css?v=4",
    "/css/kov-global-redesign.css?v=3": "/css/kov-global-redesign.css?v=4",
    "/css/kov-global-redesign.css?v=4": "/css/kov-global-redesign.css?v=5",
    "/css/kov-global-redesign.css?v=5": "/css/kov-global-redesign.css?v=6",
    "/css/kov-global-redesign.css?v=6": "/css/kov-global-redesign.css?v=7",
    "/css/kov-global-redesign.css?v=7": "/css/kov-global-redesign.css?v=8",
    "/css/kov-global-redesign.css?v=8": "/css/kov-global-redesign.css?v=9",
    "/css/kov-global-redesign.css?v=9": "/css/kov-global-redesign.css?v=10",
    "/css/kov-global-redesign.css?v=10": "/css/kov-global-redesign.css?v=11",
    "/css/kov-global-redesign.css?v=11": "/css/kov-global-redesign.css?v=12",
    "/css/kov-global-redesign.css?v=12": "/css/kov-global-redesign.css?v=13",
    "/css/kov-global-redesign.css?v=13": "/css/kov-global-redesign.css?v=14",
    "/css/kov-global-redesign.css?v=14": "/css/kov-global-redesign.css?v=15",
    "/css/kov-global-redesign.css?v=15": "/css/kov-global-redesign.css?v=16",
    "/css/kov-global-redesign.css?v=16": "/css/kov-global-redesign.css?v=17",
    "/css/kov-global-redesign.css?v=17": "/css/kov-global-redesign.css?v=18",
    "/css/kov-global-redesign.css?v=18": "/css/kov-global-redesign.css?v=19",
    "/css/kov-global-redesign.css?v=19": "/css/kov-global-redesign.css?v=20",
    "/css/kov-global-redesign.css?v=20": "/css/kov-global-redesign.css?v=21",
    "/assets/kov-global-interactions.js?v=1": "/assets/kov-global-interactions.js?v=5",
    "/assets/kov-global-interactions.js?v=2": "/assets/kov-global-interactions.js?v=5",
    "/assets/kov-global-interactions.js?v=3": "/assets/kov-global-interactions.js?v=5",
    "/assets/kov-global-interactions.js?v=4": "/assets/kov-global-interactions.js?v=5",
    "/assets/kov-global-interactions.js?v=5": "/assets/kov-global-interactions.js?v=6",
    "/assets/kov-global-interactions.js?v=6": "/assets/kov-global-interactions.js?v=7",
    "/assets/kov-global-interactions.js?v=7": "/assets/kov-global-interactions.js?v=8",
    "/assets/kov-global-interactions.js?v=8": "/assets/kov-global-interactions.js?v=9",
    "/assets/kov-global-interactions.js?v=9": "/assets/kov-global-interactions.js?v=10",
    "/assets/kov-site-header.bundle.js?v=1": "/assets/kov-site-header.bundle.js?v=2",
    "/assets/kov-site-header.bundle.js?v=2": "/assets/kov-site-header.bundle.js?v=3",
    "assets/google-translate.js?v=6": "assets/google-translate.js?v=7",
    "assets/uniform-footer.js?v=10": "assets/uniform-footer.js?v=11",
    "assets/uniform-footer.js?v=9": "assets/uniform-footer.js?v=11",
    **{f"assets/uniform-footer.js?v={version}": "assets/uniform-footer.js?v=11" for version in range(1, 9)},
    "/css/kov-homepage.css?v=1": "/css/kov-homepage.css?v=6",
    "/css/kov-homepage.css?v=2": "/css/kov-homepage.css?v=6",
    "/css/kov-homepage.css?v=3": "/css/kov-homepage.css?v=6",
    "/css/kov-homepage.css?v=4": "/css/kov-homepage.css?v=6",
    "/css/kov-homepage.css?v=5": "/css/kov-homepage.css?v=6",
    "/css/kov-homepage.css?v=6": "/css/kov-homepage.css?v=7",
    "/css/kov-homepage.css?v=7": "/css/kov-homepage.css?v=8",
    "/css/kov-homepage.css?v=8": "/css/kov-homepage.css?v=9",
    "assets/site-search.js?v=5": "assets/site-search.js?v=6",
    "assets/site-search.js?v=6": "assets/site-search.js?v=7",
    "assets/site-search.js?v=7": "assets/site-search.js?v=8",
    "assets/site-search.js?v=8": "assets/site-search.js?v=9",
    "assets/site-search.js?v=9": "assets/site-search.js?v=10",
    "assets/design-components.js?v=5": "assets/design-components.js?v=6",
    "assets/kov-redesign.js?v=1": "assets/kov-redesign.js?v=2",
}


def live_page(path: Path) -> bool:
    return path.suffix.lower() == ".html" and not any(part in EXCLUDED for part in path.relative_to(ROOT).parts)


pages = []
for directory, subdirectories, filenames in os.walk(ROOT):
    subdirectories[:] = [name for name in subdirectories if name not in EXCLUDED]
    base = Path(directory)
    pages.extend(base / name for name in filenames if name.lower().endswith(".html"))
updated = 0
skipped = []
for path in pages:
    source = path.read_text(encoding="utf-8", errors="replace")
    changed = False
    for old, new in VERSION_UPDATES.items():
        updated_source = re.sub(re.escape(old) + r"(?![0-9])", lambda _match: new, source)
        changed = changed or updated_source != source
        source = updated_source
    normalized_css = re.sub(
        r'(/css/kov-global-redesign\.css\?v=)[0-9]+',
        r'\g<1>21',
        source,
        flags=re.IGNORECASE,
    )
    changed = changed or normalized_css != source
    source = normalized_css
    updated_homepage = re.sub(r'(/css/kov-homepage\.css\?v=)[0-9]+', r'\g<1>9', source)
    changed = changed or updated_homepage != source
    source = updated_homepage
    if "uniform-footer.js" in source:
        normalized_footer = re.sub(
            r'(<script\b[^>]*\bsrc=["\'])(?:/)?assets/uniform-footer\.js(?:\?v=[^"\']*)?(["\'][^>]*>)',
            r'\1/assets/uniform-footer.js?v=11\2',
            source,
            flags=re.IGNORECASE,
        )
        normalized_footer = re.sub(
            r'<script\b(?=[^>]*\bsrc=["\']/assets/uniform-footer\.js\?v=11["\'])[^>]*>',
            lambda match: re.sub(r'(?:\sdata-kov-uniform-footer)+', '', match.group(0))[:-1] + ' data-kov-uniform-footer>',
            normalized_footer,
            flags=re.IGNORECASE,
        )
        changed = changed or normalized_footer != source
        source = normalized_footer
    if "data-kov-global-redesign" not in source:
        head_end = source.lower().find("</head>")
        if head_end < 0:
            skipped.append((path, "missing head close"))
            continue
        source = source[:head_end] + CSS + source[head_end:]
        changed = True
    if "data-kov-global-interactions" not in source:
        body_end = source.lower().rfind("</body>")
        if body_end < 0:
            source += JS
        else:
            source = source[:body_end] + JS + source[body_end:]
        changed = True
    if "data-kov-uniform-footer" not in source:
        if "uniform-footer.js" not in source:
            body_end = source.lower().rfind("</body>")
            if body_end < 0:
                source += FOOTER
            else:
                source = source[:body_end] + FOOTER + source[body_end:]
            changed = True
    if changed:
        path.write_text(source, encoding="utf-8", newline="")
        updated += 1

print(f"Live HTML pages found: {len(pages)}")
print(f"Pages updated: {updated}")
print(f"Pages skipped: {len(skipped)}")
for path, reason in skipped[:20]:
    print(f"SKIPPED {path.relative_to(ROOT)}: {reason}")
