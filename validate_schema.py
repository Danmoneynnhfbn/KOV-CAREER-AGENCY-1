import json
import re
from pathlib import Path

root = Path(r"c:\Users\USER\Downloads\kov career agency")
pages = sorted(root.rglob('*.html'))
print(f'HTML pages: {len(pages)}')
bad = []
for p in pages:
    if p.name.endswith('.bak'):
        continue
    txt = p.read_text(encoding='utf-8')
    # Support both legacy and new loaders
    blocks = re.findall(r'<script\s+type=["\']application/ld\+json["\'][^>]*>\s*(\{.*?\})\s*</script>', txt, re.S)
    print(f'{p.name}: blocks={len(blocks)}')
    if len(blocks) == 0:
        bad.append((p.name, 'no JSON-LD'))
        continue
    for idx, block in enumerate(blocks, 1):
        try:
            json.loads(block)
        except Exception as exc:
            bad.append((p.name, f'parse fail {idx}: {exc}'))
    if txt.count('data-kov="core"') > 1 or txt.count('data-kov="page"') > 1:
        bad.append((p.name, 'duplicate core/page markers'))

print(f'BAD_COUNT {len(bad)}')
for item in bad:
    print(item)
