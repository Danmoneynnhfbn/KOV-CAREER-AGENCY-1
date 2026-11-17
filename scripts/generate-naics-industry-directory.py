from __future__ import annotations

import re
from pathlib import Path

from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parents[1]
WORKBOOK = ROOT / 'data' / 'taxonomy' / '2022_NAICS_Structure.xlsx'
OUTPUT = ROOT / 'assets' / 'industry-directory.js'

records = []
seen = set()
workbook = load_workbook(WORKBOOK, read_only=True, data_only=True)
worksheet = workbook['2022 NAICS Structure']

for row in worksheet.iter_rows(min_row=4, values_only=True):
    raw_code, raw_title = row[1], row[2]
    if raw_code is None:
        continue
    code = str(raw_code).strip()
    title = str(raw_title or '').strip()
    marker = 'T' if title.endswith('T') else ''
    name = title[:-1].rstrip() if marker else title
    if not code or not name or code in seen:
        continue
    seen.add(code)
    if str(code).isdigit():
        level = {2: 'Sector', 3: 'Subsector', 4: 'Industry group', 5: 'NAICS industry', 6: 'U.S. national industry'}.get(len(code), 'Sector')
    else:
        level = 'Sector'
    slug_base = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-') or code
    slug = f'{code}-{slug_base}' if slug_base != code else code
    records.append({
        'code': code,
        'name': name,
        'level': level,
        'sourceMarker': marker,
        'slug': slug,
    })

if len(records) != 2125:
    raise ValueError(f'Expected 2,125 NAICS records; found {len(records)}.')

lines = [
    'const industryDirectory = [',
]
for index, record in enumerate(records):
    suffix = ',' if index < len(records) - 1 else ''
    lines.append(f"  {{ code: {record['code']!r}, name: {record['name']!r}, level: {record['level']!r}, sourceMarker: {record['sourceMarker']!r}, slug: {record['slug']!r} }}{suffix}")
lines.append('];')
lines.extend([
    '',
    'function renderIndustryDirectory(target) {',
    '  if (!target) return;',
    '  const cards = industryDirectory.map((industry) => `',
    '    <li data-industry-card>',
    '      <article class="ceo-card">',
    '        <p class="ceo-label">${industry.code} · ${industry.level}</p>',
    '        <h3>${industry.name}</h3>',
    '        <p>Official NAICS industry taxonomy record from the 2022 U.S. Census classification structure.</p>',
    '        <a class="ceo-card-link" href="#${industry.slug}">View record</a>',
    '      </article>',
    '    </li>',
    '  `).join(\'\');',
    '  target.innerHTML = `<ul class="ceo-card-grid">${cards}</ul>`;',
    '}',
    '',
    "if (typeof window !== 'undefined') {",
    '  window.kovIndustryDirectory = industryDirectory;',
    "  if (document.readyState === 'loading') {",
    "    document.addEventListener('DOMContentLoaded', () => renderIndustryDirectory(document.getElementById('industry-directory')));",
    "  } else {",
    "    renderIndustryDirectory(document.getElementById('industry-directory'));",
    '  }',
    '}',
    '',
    "if (typeof module !== 'undefined') {",
    '  module.exports = { industryDirectory, renderIndustryDirectory };',
    '}',
])
OUTPUT.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print(f'Wrote {len(records)} NAICS industry records to {OUTPUT.relative_to(ROOT)}')
