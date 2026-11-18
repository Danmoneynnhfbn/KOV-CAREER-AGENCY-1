#!/usr/bin/env python3
"""Add a Google-hosted Maven Central mirror to generated Android Gradle repositories.

This is a CI resilience workaround for intermittent HTTP 429 responses from
repo.maven.apache.org. Google Maven remains first for Android artifacts.
"""
from pathlib import Path

root = Path(__file__).resolve().parents[1] / "android"
targets = [root / "settings.gradle", root / "build.gradle"]
mirror = 'maven { url "https://maven-central.storage-download.googleapis.com/maven2" }'

changed = []
for path in targets:
    if not path.exists():
        continue
    source = path.read_text()
    if mirror in source:
        continue
    if "mavenCentral()" not in source:
        continue
    path.write_text(source.replace("mavenCentral()", mirror + "\n            mavenCentral()"))
    changed.append(str(path.relative_to(root)))

if not changed:
    raise SystemExit("No generated Gradle Maven Central repository declarations found.")
print("Configured Google-hosted Maven Central mirror in: " + ", ".join(changed))
