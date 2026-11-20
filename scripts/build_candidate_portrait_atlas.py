#!/usr/bin/env python3
"""Build the candidate-directory sprite atlas from the supplied illustrative portraits."""
from pathlib import Path
from zipfile import ZipFile
from PIL import Image, ImageOps
import io

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / "assets" / "KOV_Candidate_Images_Compressed.zip"
OUTPUT = ROOT / "assets" / "candidate-project-directory-portrait-atlas.jpg"
TILE = 96
COLUMNS = 10
ROWS = 9
PORTRAIT_FILES = [
  "KOV Candidate 0001.jpg",
  "KOV Candidate 0002.jpg",
  "KOV Candidate 0003.jpg",
  "KOV Candidate 0004.jpg",
  "KOV Candidate 0006.jpg",
  "KOV Candidate 0008.jpg",
  "KOV Candidate 0009.jpg",
  "KOV Candidate 0010.jpg",
  "KOV Candidate 0011.jpg",
  "KOV Candidate 0112.jpg",
  "KOV Candidate 0113.jpg",
  "KOV Candidate 0114.jpg",
  "KOV Candidate 0115.jpg",
  "KOV Candidate 0116.jpg",
  "KOV Candidate 0317.jpg",
  "KOV Candidate 0318.jpg",
  "KOV Candidate 0319.jpg",
  "KOV Candidate 0320.jpg",
  "KOV Candidate 0321.jpg",
  "KOV Candidate 0322.jpg",
  "KOV Candidate 0323.jpg",
  "KOV Candidate 0324.jpg",
  "KOV Candidate 0325.jpg",
  "KOV Candidate 0326.jpg",
  "KOV Candidate 0327.jpg",
  "KOV Candidate 0330.jpg",
  "KOV Candidate 0331.jpg",
  "KOV Candidate 0334.jpg",
  "KOV Candidate 0336.jpg",
  "KOV Candidate 0339.jpg",
  "KOV Candidate 0340.jpg",
  "KOV Candidate 0341.jpg",
  "KOV Candidate 0343.jpg",
  "KOV Candidate 0344.jpg",
  "KOV Candidate 0346.jpg",
  "KOV Candidate 0348.jpg",
  "KOV Candidate 0350.jpg",
  "KOV Candidate 0351.jpg",
  "KOV Candidate 0355.jpg",
  "KOV Candidate 0531.jpg",
  "KOV Candidate 0532.jpg",
  "KOV Candidate 0533.jpg",
  "KOV Candidate 0545.jpg",
  "KOV Candidate 0551.jpg",
  "KOV Candidate 0553.jpg",
  "KOV Candidate 0632.jpg",
  "KOV Candidate 0633.jpg",
  "KOV Candidate 0649.jpg",
  "KOV Candidate 0650.jpg",
  "KOV Candidate 0651.jpg",
  "KOV Candidate 0652.jpg",
  "KOV Candidate 0653.jpg",
  "KOV Candidate 0654.jpg",
  "KOV Candidate 0669.jpg",
  "KOV Candidate 0670.jpg",
  "KOV Candidate 0671.jpg",
  "KOV Candidate 0757.jpg",
  "KOV Candidate 0759.jpg",
  "KOV Candidate 0760.jpg",
  "KOV Candidate 0761.jpg",
  "KOV Candidate 0763.jpg",
  "KOV Candidate 0764.jpg",
  "KOV Candidate 0767.jpg",
  "KOV Candidate 0768.jpg",
  "KOV Candidate 0769.jpg",
  "KOV Candidate 0770.jpg",
  "KOV Candidate 0771.jpg",
  "KOV Candidate 0773.jpg",
  "KOV Candidate 0774.jpg",
  "KOV Candidate 0775.jpg",
  "KOV Candidate 0779.jpg",
  "KOV Candidate 0780.jpg",
  "KOV Candidate 0781.jpg",
  "KOV Candidate 0783.jpg",
  "KOV Candidate 0784.jpg",
  "KOV Candidate 0785.jpg",
  "KOV Candidate 0786.jpg",
  "KOV Candidate 0788.jpg",
  "KOV Candidate 0791.jpg",
  "KOV Candidate 0792.jpg",
  "KOV Candidate 0793.jpg",
  "KOV Candidate 0794.jpg",
  "KOV Candidate 0795.jpg",
  "KOV Candidate 0796.jpg",
  "KOV Candidate 0799.jpg"
]

if len(PORTRAIT_FILES) != 85:
    raise SystemExit(f"Expected 85 portrait sources, got {len(PORTRAIT_FILES)}")

with ZipFile(ARCHIVE) as archive:
    atlas = Image.new("RGB", (COLUMNS * TILE, ROWS * TILE), "white")
    for index, name in enumerate(PORTRAIT_FILES):
        try:
            source = Image.open(io.BytesIO(archive.read(name))).convert("RGB")
        except KeyError as exc:
            raise SystemExit(f"Missing portrait source: {name}") from exc
        tile = ImageOps.fit(
            source, (TILE, TILE), method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.38)
        )
        atlas.paste(tile, ((index % COLUMNS) * TILE, (index // COLUMNS) * TILE))

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
atlas.save(OUTPUT, "JPEG", quality=82, optimize=True, progressive=True, subsampling=1)
print(f"Created {OUTPUT} ({OUTPUT.stat().st_size:,} bytes) from {len(PORTRAIT_FILES)} unique illustrative portraits")
