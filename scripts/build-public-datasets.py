#!/usr/bin/env python3
"""Build complete public feeds and a rights-aware JSON-LD data catalog."""

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "town-role-insitutution"
OUTPUT = ROOT / "datasets"
BASE_URL = "https://www.kovcareeragency.org"
CATALOG_URL = f"{BASE_URL}/datasets/catalog.jsonld"


def write_json(path: Path, value: dict) -> None:
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def read_job_titles() -> list[str]:
    path = SOURCE / "job-titles.txt"
    records = path.read_text(encoding="utf-8-sig").splitlines()
    if not records or any(not item or item != item.strip() for item in records):
        raise ValueError(f"{path.name} contains empty or padded records.")
    if len(records) != len(set(records)):
        raise ValueError(f"{path.name} contains duplicate records.")
    return records


def read_occupations() -> list[str]:
    path = SOURCE / "occupations.csv"
    with path.open(encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        if reader.fieldnames != ["Occupations"]:
            raise ValueError(f"Unexpected columns in {path.name}: {reader.fieldnames}")
        records = [row["Occupations"] for row in reader]
    if not records or any(not item or item != item.strip() for item in records):
        raise ValueError(f"{path.name} contains empty or padded records.")
    if len(records) != len(set(records)):
        raise ValueError(f"{path.name} contains duplicate records.")
    return records


def read_city_count() -> int:
    path = SOURCE / "town -cities" / "worldcities.csv"
    with path.open(encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        expected = {
            "city", "city_ascii", "lat", "lng", "country", "iso2", "iso3",
            "admin_name", "capital", "population", "id",
        }
        if set(reader.fieldnames or ()) != expected:
            raise ValueError(f"Unexpected columns in {path.name}: {reader.fieldnames}")
        records = list(reader)
    ids = [row["id"] for row in records]
    if not records or any(not value for value in ids) or len(ids) != len(set(ids)):
        raise ValueError("City records must have distinct, non-empty source IDs.")
    return len(records)


def dataset_node(
    identifier: str,
    name: str,
    description: str,
    count: int,
    distribution_url: str | None = None,
) -> dict:
    node = {
        "@type": "Dataset",
        "@id": f"{CATALOG_URL}#{identifier}",
        "name": name,
        "description": description,
        "isPartOf": {"@id": f"{CATALOG_URL}#catalog"},
        "numberOfItems": count,
    }
    if distribution_url:
        node["distribution"] = {
            "@type": "DataDownload",
            "contentUrl": distribution_url,
            "encodingFormat": "application/json",
        }
    return node


def main() -> None:
    job_titles = read_job_titles()
    occupations = read_occupations()
    city_count = read_city_count()
    OUTPUT.mkdir(exist_ok=True)

    job_title_url = f"{BASE_URL}/datasets/job-titles.json"
    occupation_url = f"{BASE_URL}/datasets/occupations.json"
    write_json(
        OUTPUT / "job-titles.json",
        {
            "name": "KOV supplied job-title list",
            "records": job_titles,
            "numberOfItems": len(job_titles),
        },
    )
    write_json(
        OUTPUT / "occupations.json",
        {
            "name": "KOV supplied occupations list",
            "records": occupations,
            "numberOfItems": len(occupations),
        },
    )

    city_node = dataset_node(
        "cities-and-towns",
        "Cities and towns source data (not publicly distributed)",
        (
            f"The supplied source contains {city_count:,} records with unique IDs. "
            "Its accompanying Simplemaps/Pareto license prohibits public bulk "
            "redistribution without prior written permission, so no record feed "
            "is provided."
        ),
        city_count,
    )
    city_node["citation"] = (
        "Pareto Software, LLC (Simplemaps) source-data license, effective "
        "February 5, 2026."
    )
    city_node["variableMeasured"] = [
        "city",
        "country",
        "iso2",
        "iso3",
        "admin_name",
        "lat",
        "lng",
    ]
    city_node["conditionsOfAccess"] = (
        "Complete records are withheld from public distribution under the supplied "
        "license. Written redistribution permission is required."
    )

    nodes = [
        {
            "@type": "DataCatalog",
            "@id": f"{CATALOG_URL}#catalog",
            "name": "KOV Career Agency data catalog",
            "url": CATALOG_URL,
            "description": (
                "Catalog of supplied geographic and occupational data. The city "
                "source is described but not distributed; no institution dataset "
                "was present in the supplied project files."
            ),
            "dataset": [
                {"@id": city_node["@id"]},
                {
                    "@id": f"{CATALOG_URL}#job-titles",
                },
                {
                    "@id": f"{CATALOG_URL}#occupations",
                },
            ],
        },
        city_node,
        dataset_node(
            "job-titles",
            "Supplied job titles",
            (
                "Complete job-title list from the supplied project file "
                "job-titles.txt. The file did not include source attribution or "
                "license metadata."
            ),
            len(job_titles),
            job_title_url,
        ),
        dataset_node(
            "occupations",
            "Supplied occupations",
            (
                "Complete occupations list from the supplied project file "
                "occupations.csv. The file did not include source attribution or "
                "license metadata."
            ),
            len(occupations),
            occupation_url,
        ),
    ]
    (OUTPUT / "catalog.jsonld").write_text(
        json.dumps(
            {"@context": "https://schema.org", "@graph": nodes},
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(
        "Built complete feeds: "
        f"{len(job_titles):,} job titles, {len(occupations):,} occupations; "
        f"catalogued {city_count:,} city records without publishing them."
    )


if __name__ == "__main__":
    main()
