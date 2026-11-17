from pathlib import Path
import hashlib
import json
import re
import unicodedata
import zipfile

ROOT = Path(__file__).resolve().parents[1]
CROSSWALK = ROOT / "data/taxonomy/geonames-city-crosswalk.json"
ZIP = ROOT / "data/taxonomy/geonames-cities1000.zip"
WORLD = ROOT / "assets/world-cities.js"
ADMIN1 = ROOT / "assets/geonames-admin1.js"


def normalized(value):
    value = unicodedata.normalize("NFKD", value or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def js_json(path, marker):
    text = path.read_text(encoding="utf-8-sig")
    start = text.index(marker)
    start = text.index("[" if marker == "const worldCities =" else "{", start)
    depth = 0
    for end in range(start, len(text)):
        if text[end] in "[{":
            depth += 1
        elif text[end] in "]}":
            depth -= 1
            if depth == 0:
                return json.loads(text[start:end + 1])
    raise ValueError(f"Cannot parse JSON payload from {path}")


data = json.loads(CROSSWALK.read_text(encoding="utf-8"))
metadata = data["metadata"]
world_text = WORLD.read_text(encoding="utf-8-sig")
world_start = world_text.index("const worldCities =")
world_cities = js_json(WORLD, "const worldCities =")
admin_obj = js_json(ADMIN1, "const kovGeoNamesAdmin1 =")
division_ids = {
    (country["iso2"], division["geonameId"]): division
    for country in admin_obj["countries"]
    for division in country["divisions"]
}
world_index = {}
for city in world_cities:
    for city_name in {city.get("city", ""), city.get("city_ascii", "")}:
        world_index.setdefault((city["iso2"], normalized(city_name)), []).append(city)
geo_by_id = {}
with zipfile.ZipFile(ZIP) as archive, archive.open("cities1000.txt") as source:
    for line in source:
        fields = line.decode("utf-8").rstrip("\n").split("\t")
        if len(fields) >= 19:
            geo_by_id[int(fields[0])] = fields
admin2_by_code = {}
for line in (ROOT / "data/taxonomy/geonames-admin2Codes.txt").read_text(encoding="utf-8-sig").splitlines():
    fields = line.split("\t")
    if len(fields) >= 4:
        admin2_by_code[fields[0]] = (fields[1], int(fields[3]))

assert metadata["sourceCityCount"] == len(world_cities) == 50250
assert metadata["geonamesZipSha256"] == hashlib.sha256(ZIP.read_bytes()).hexdigest()
assert metadata["admin2FileSha256"] == hashlib.sha256((ROOT / "data/taxonomy/geonames-admin2Codes.txt").read_bytes()).hexdigest()
assert metadata["matchedCount"] == len(data["records"])
assert metadata["matchedCount"] + metadata["unmatchedCount"] == metadata["sourceCityCount"]
source_keys = set()
for row in data["records"]:
    source_key = (row["sourceIso2"], row["sourceCity"], row["sourceLat"], row["sourceLng"])
    assert source_key not in source_keys
    source_keys.add(source_key)
    matches = world_index.get((row["sourceIso2"], normalized(row["sourceCity"])), [])
    assert any(abs(city["lat"] - row["sourceLat"]) < 1e-5 and abs(city["lng"] - row["sourceLng"]) < 1e-5 for city in matches)
    geonames_row = geo_by_id[row["geoNamesId"]]
    assert geonames_row[8] == row["sourceIso2"]
    assert geonames_row[10] == (row.get("admin1Code") or "")
    assert geonames_row[11] == (row.get("admin2Code") or "")
    if row.get("admin1GeoNamesId"):
        division = division_ids[(row["sourceIso2"], row["admin1GeoNamesId"])]
        assert division["code"] == f"{row['sourceIso2']}.{row['admin1Code']}"
        assert division["name"] == row["admin1Name"]
    admin2_code = f"{row['sourceIso2']}.{row.get('admin1Code') or ''}.{row.get('admin2Code') or ''}"
    if row.get("admin2GeoNamesId"):
        assert admin2_by_code[admin2_code] == (row["admin2Name"], row["admin2GeoNamesId"])

assert sum(bool(row.get("admin1GeoNamesId")) for row in data["records"]) == metadata["matchedToGeoNamesAdmin1"]
assert sum(bool(row.get("admin2GeoNamesId")) for row in data["records"]) == metadata["matchedToGeoNamesAdmin2"]
print(json.dumps({"sourceCities": metadata["sourceCityCount"], "GeoNamesCityMatches": metadata["matchedCount"], "GeoNamesAdmin1Relationships": metadata["matchedToGeoNamesAdmin1"], "GeoNamesAdmin2Relationships": metadata["matchedToGeoNamesAdmin2"], "unmatched": metadata["unmatchedCount"], "ambiguous": metadata["ambiguousCount"], "matchedWithoutAdmin1": metadata["matchedCityRecordsWithoutFirstLevelParent"], "admin2CodesWithNoGeoNamesRecord": metadata["matchedCityRecordsWithUnresolvedAdmin2Code"], "withoutAdmin2Codes": metadata["matchedCityRecordsWithoutAdmin2Code"], "checks": "passed"}, indent=2))
