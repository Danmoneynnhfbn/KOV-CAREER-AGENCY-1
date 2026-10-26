"""Validate official NAICS/SOC workbooks and prepare the first eight page records."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any
from unicodedata import normalize

ROOT = Path(__file__).resolve().parents[1]
TAXONOMY = ROOT / "data" / "taxonomy"
SEO_DATA = ROOT / "data" / "seo-pages.json"
LEVELS = ("Major", "Minor", "Broad", "Detailed")
LEVEL_LABELS = {
    "Major": "Major group",
    "Minor": "Minor group",
    "Broad": "Broad occupation",
    "Detailed": "Detailed occupation",
}
EXPECTED_NAICS = {2: 17, 3: 96, 4: 308, 5: 689, 6: 1012}
EXPECTED_SOC = {"Major": 23, "Minor": 98, "Broad": 459, "Detailed": 867}
SECTOR_RANGES = ("31-33", "44-45", "48-49")
ENTITY_DATASET_PATH = ROOT / "data" / "seo-entity-datasets.jsonld"
ENTITY_DATASET_BASE_URL = (
    "https://www.kovcareeragency.org/data/seo-entity-datasets.jsonld"
)
ENTITY_DATASET_MINIMUMS = {
    "cities": ("Place", 1000),
    "towns": ("Place", 1323),
    "professional-roles": ("Occupation", 1095),
    "institutions": ("Organization", 486),
    "job-functions": ("DefinedTerm", 200),
}


def validate_entity_datasets() -> None:
    schema = json.loads(ENTITY_DATASET_PATH.read_text(encoding="utf-8"))
    graph = schema.get("@graph") if isinstance(schema, dict) else None
    if (
        not isinstance(schema, dict)
        or schema.get("@context") != "https://schema.org"
        or not isinstance(graph, list)
    ):
        raise ValueError("Shared entity catalog must be a Schema.org JSON-LD graph.")
    nodes_by_id: dict[str, dict[str, Any]] = {}
    for node in graph:
        if not isinstance(node, dict) or not isinstance(node.get("@id"), str):
            raise ValueError("Every catalog graph node must have a stable @id.")
        if node["@id"] in nodes_by_id:
            raise ValueError(f"Duplicate catalog @id: {node['@id']}")
        nodes_by_id[node["@id"]] = node

    catalog_id = f"{ENTITY_DATASET_BASE_URL}#catalog"
    catalog = nodes_by_id.get(catalog_id)
    if not catalog or catalog.get("@type") != "DataCatalog":
        raise ValueError("Shared entity catalog is missing its DataCatalog node.")
    expected_dataset_ids = {
        f"{ENTITY_DATASET_BASE_URL}#{dataset_id}"
        for dataset_id in ENTITY_DATASET_MINIMUMS
    }
    catalog_dataset_ids = {
        item.get("@id") for item in catalog.get("hasPart", [])
        if isinstance(item, dict)
    }
    if catalog_dataset_ids != expected_dataset_ids:
        raise ValueError("DataCatalog does not reference exactly the complete datasets.")

    for dataset_id, (expected_type, minimum) in ENTITY_DATASET_MINIMUMS.items():
        node = nodes_by_id.get(f"{ENTITY_DATASET_BASE_URL}#{dataset_id}")
        if not node or node.get("@type") != "Dataset":
            raise ValueError(f"Missing Schema.org Dataset node: {dataset_id}.")
        records = node.get("about")
        if not isinstance(records, list):
            raise ValueError(f"{dataset_id} must reference its complete records via about.")
        record_ids = [record.get("@id") for record in records if isinstance(record, dict)]
        if len(record_ids) < minimum or len(record_ids) != len(set(record_ids)):
            raise ValueError(
                f"{dataset_id} expected at least {minimum} unique records; found {len(record_ids)}."
            )
        if node.get("numberOfItems") != len(record_ids):
            raise ValueError(f"{dataset_id} numberOfItems does not match its record references.")
        for record_id in record_ids:
            record = nodes_by_id.get(record_id)
            if not record or record.get("@type") != expected_type:
                raise ValueError(f"{dataset_id} has a missing or mis-typed record: {record_id}.")
        labels = [
            normalize(
                "NFKC",
                re.sub(r"\s+", " ", str(nodes_by_id[record_id].get("name", ""))).strip(),
            ).casefold()
            for record_id in record_ids
        ]
        if any(not label for label in labels):
            raise ValueError(f"{dataset_id} contains a record without a name.")
        if dataset_id in {"professional-roles", "institutions", "job-functions"}:
            if len(labels) != len(set(labels)):
                raise ValueError(f"{dataset_id} contains duplicate normalized names.")
        if not node.get("license") or not node.get("creator"):
            raise ValueError(f"{dataset_id} is missing source attribution or license.")
        print(f"{dataset_id}: {len(record_ids)} unique {expected_type} records.")


def read_naics() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    from openpyxl import load_workbook

    workbook = load_workbook(
        TAXONOMY / "2022_NAICS_Structure.xlsx", read_only=True, data_only=True
    )
    sheet = workbook["2022 NAICS Structure"]
    records: list[dict[str, Any]] = []
    for row in sheet.iter_rows(min_row=4, values_only=True):
        raw_code, raw_title = row[1], row[2]
        if raw_code is None:
            continue
        code = str(raw_code).strip()
        title = str(raw_title or "").strip()
        marker = "T" if title.endswith("T") else ""
        name = title[:-1].rstrip() if marker else title
        records.append({"code": code, "name": name, "sourceMarker": marker})

    codes = {record["code"] for record in records}
    if len(records) != 2125 or len(codes) != 2125:
        raise ValueError(f"NAICS expected 2,125 unique records; found {len(records)}.")
    counts = Counter(
        len(record["code"])
        for record in records
        if record["code"].isdigit()
    )
    if dict(counts) != EXPECTED_NAICS:
        raise ValueError(f"NAICS code-level counts do not match: {dict(counts)}")
    range_codes = {record["code"] for record in records if not record["code"].isdigit()}
    if range_codes != set(SECTOR_RANGES):
        raise ValueError(f"Unexpected NAICS grouped sectors: {sorted(range_codes)}")
    if sum(counts.values()) + len(range_codes) != len(records):
        raise ValueError("NAICS records do not reconcile with level counts.")

    for record in records:
        code = record["code"]
        if len(code) == 3:
            parent = code[:2]
            if parent not in codes:
                parent = next(
                    (
                        range_code
                        for range_code in range_codes
                        if int(range_code[:2]) <= int(parent) <= int(range_code[-2:])
                    ),
                    "",
                )
        elif code.isdigit() and len(code) > 3:
            parent = code[:-1]
        else:
            parent = ""
        if parent and parent not in codes:
            raise ValueError(f"Missing NAICS parent {parent} for {code}.")
        record["parentCode"] = parent
        record["level"] = "Sector" if not code.isdigit() else {
            2: "Sector",
            3: "Subsector",
            4: "Industry group",
            5: "NAICS industry",
            6: "U.S. national industry",
        }.get(len(code), "Sector")

    sectors = [record for record in records if record["level"] == "Sector"]
    if len(sectors) != 20:
        raise ValueError(f"NAICS expected 20 sectors; found {len(sectors)}.")
    return records, sectors


def read_soc() -> tuple[list[dict[str, Any]], dict[str, dict[str, Any]]]:
    from openpyxl import load_workbook

    structure = load_workbook(
        TAXONOMY / "soc_structure_2018.xlsx", read_only=True, data_only=True
    )["2018 Structure"]
    definitions = load_workbook(
        TAXONOMY / "soc_2018_definitions.xlsx", read_only=True, data_only=True
    )["2018 SOC"]

    structure_records: list[dict[str, str]] = []
    for row in structure.iter_rows(min_row=9, values_only=True):
        title = str(row[4] or "").strip()
        for column, level in enumerate(LEVELS):
            code = row[column]
            if code:
                structure_records.append(
                    {"level": level, "code": str(code).strip(), "name": title}
                )

    definition_records: dict[str, dict[str, str]] = {}
    counts: Counter[str] = Counter()
    for row in definitions.iter_rows(min_row=9, values_only=True):
        level, code, title, definition = row[:4]
        if not code:
            continue
        code = str(code).strip()
        level = str(level).strip()
        counts[level] += 1
        definition_records[code] = {
            "level": level,
            "name": str(title or "").strip(),
            "definition": str(definition or "").strip(),
        }

    if dict(counts) != EXPECTED_SOC:
        raise ValueError(f"SOC level counts do not match: {dict(counts)}")
    if len(definition_records) != 1447:
        raise ValueError(
            f"SOC expected 1,447 unique codes; found {len(definition_records)}."
        )
    structure_map = {entry["code"]: (entry["level"], entry["name"]) for entry in structure_records}
    definitions_map = {
        code: (entry["level"], entry["name"])
        for code, entry in definition_records.items()
    }
    if structure_map != definitions_map:
        raise ValueError("SOC structure and definitions workbooks disagree.")
    if any(
        not entry["definition"]
        for entry in definition_records.values()
        if entry["level"] == "Detailed"
    ):
        raise ValueError("A detailed SOC occupation is missing its definition.")

    current_codes: dict[str, str] = {}
    for record in structure_records:
        code, level = record["code"], record["level"]
        level_index = LEVELS.index(level)
        parent = current_codes.get(LEVELS[level_index - 1], "") if level_index else ""
        if parent and parent not in structure_map:
            raise ValueError(f"Missing SOC parent {parent} for {code}.")
        if level_index and not parent:
            raise ValueError(f"Missing preceding SOC parent row for {code}.")
        record["parentCode"] = parent
        record["definition"] = definition_records[code]["definition"]
        current_codes[level] = code
        for child_level in LEVELS[level_index + 1 :]:
            current_codes.pop(child_level, None)

    return structure_records, definition_records


def section(
    eyebrow: str,
    title: str,
    paragraphs: list[str],
    *,
    table: dict[str, Any] | None = None,
    scenario: bool = False,
    bullets: list[str] | None = None,
) -> dict[str, Any]:
    value: dict[str, Any] = {
        "eyebrow": eyebrow,
        "title": title,
        "paragraphs": paragraphs,
    }
    if table:
        value["table"] = table
    if scenario:
        value["scenario"] = True
    if bullets:
        value["bullets"] = bullets
    return value


def market_table(rows: list[list[str]]) -> dict[str, Any]:
    return {
        "caption": "Market comparison framework — verify current role and location facts before acting",
        "columns": ["Market", "Sector or role lens", "Questions to verify"],
        "rows": rows,
    }


def page_slug(value: str) -> str:
    value = value.lower().replace("&", "and")
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", value)).strip("-")


def records_below(
    records: list[dict[str, Any]], parent_code: str
) -> list[dict[str, Any]]:
    by_code = {record["code"]: record for record in records}
    included = {parent_code}
    descendants: list[dict[str, Any]] = []
    for record in records:
        code = record["code"]
        if code == parent_code:
            descendants.append(record)
            continue
        parent = record["parentCode"]
        if parent in included:
            included.add(code)
            descendants.append(record)
        elif parent:
            ancestor = by_code.get(parent)
            if ancestor and parent in included:
                included.add(code)
                descendants.append(record)
    return descendants


def named(records: list[dict[str, Any]], level: str, limit: int = 4) -> str:
    values = [record["name"] for record in records if record["level"] == level]
    return ", ".join(values[:limit]) if values else "the official hierarchy"


NAICS_CONTEXT: dict[str, tuple[str, list[str]]] = {
    "11": ("Agriculture, forestry, fishing, and hunting leadership connects biological production with land, water, labor, equipment, and markets. A candidate should identify the particular resource, production cycle, and operating constraints involved, then explain how planning, safety, stewardship, and commercial decisions fit together. Seasonal timing and location can matter to a mandate, but they should be confirmed for the target employer rather than assumed from the sector code.", ["Agribusiness general manager", "Farm or forestry operations leader", "Supply-chain or commodities executive"]),
    "21": ("Mining, quarrying, and oil and gas extraction roles can involve asset-intensive operations and technical, environmental, safety, and community considerations. Senior candidates should separate direct operational accountability from corporate oversight, specify the commodities or assets they know, and describe lifecycle decisions in terms they are authorized to share. Permits and regulatory obligations vary by activity and jurisdiction; confirm them with official sources and qualified advisers.", ["Extraction business leader", "Asset or field operations executive", "Safety, environment, or technical leader"]),
    "22": ("Utilities leadership should be evaluated against the service delivered, assets operated, and authority assigned to the role. Reliability, capital planning, maintenance, customer service, technology, and emergency readiness may intersect, but their ownership depends on the organization and jurisdiction. Candidates should explain the scale and boundaries of their responsibility without making unverified claims about service performance, rates, or regulatory approval.", ["Utility general manager", "Network or generation operations executive", "Infrastructure or reliability leader"]),
    "23": ("Construction organizations may deliver work through projects, contracts, specialist trades, or ongoing services. A senior mandate therefore needs a clear account of project type, delivery model, client, subcontractor relationships, and the decisions the executive controlled. Candidates should distinguish estimating, execution, safety, quality, and commercial responsibility, and should not imply that a project outcome was solely theirs when it depended on a wider team.", ["Construction business-unit leader", "Project delivery executive", "Safety, quality, or commercial leader"]),
    "31-33": ("Manufacturing brings together many production models, products, and supply chains. For a leadership search, clarify the product and process, plant or network scope, quality system, supplier dependencies, and the balance between production, engineering, and customer requirements. Evidence is strongest when it identifies the candidate's own decisions about capacity, workforce, quality, investment, or change without disclosing protected process or customer information.", ["Manufacturing general manager", "Plant or production executive", "Quality, engineering, or supply-chain leader"]),
    "42": ("Wholesale trade leadership often sits between suppliers and business customers, making the distribution model important to role fit. Clarify whether the mandate concerns product range, inventory, purchasing, sales channels, logistics, or customer service, and how those responsibilities interact. A candidate moving from retail or manufacturing should explain the transferable commercial capability while testing differences in customer type, fulfillment, and decision authority.", ["Wholesale distribution leader", "Commercial or category executive", "Procurement or logistics leader"]),
    "44-45": ("Retail trade combines customer-facing activity with merchandising, sourcing, store or digital channels, and service operations. The target role may emphasize a particular format, product category, customer segment, or geography. Candidates should describe the channels and teams they actually led, distinguish revenue ownership from supporting influence, and use dated, approved evidence for claims about growth, customer behavior, or operating performance.", ["Retail or regional operations executive", "Merchandising or buying leader", "Digital commerce or customer executive"]),
    "48-49": ("Transportation and warehousing leadership depends on the movement, handling, or storage activity and the network it supports. Compare asset ownership, service model, geography, customer commitments, and the role's responsibility for operations, safety, technology, or capacity. Candidates should be precise about their own scope and verify applicable operating rules with the relevant authorities instead of assuming that experience transfers unchanged across modes or borders.", ["Transportation or logistics executive", "Fleet, terminal, or network operations leader", "Supply-chain technology or safety executive"]),
    "53": ("Real estate and rental activity spans property, equipment, leasing, and related services with different capital and operating profiles. A senior role may focus on asset strategy, development, leasing, facilities, portfolio operations, or customer service. Candidates should name the assets and decisions they handled, distinguish ownership from management or brokerage, and avoid implying investment performance that they cannot substantiate or disclose.", ["Property or portfolio executive", "Development or asset-management leader", "Leasing or property-operations executive"]),
    "55": ("Management of companies and enterprises concerns establishments primarily engaged in managing or holding the securities of companies and enterprises. Senior roles in these settings may support governance, portfolio coordination, shared services, or central oversight, but the code alone cannot identify the organization's ownership model or an individual's authority. Candidates should distinguish parent-level responsibilities from operating-company decisions and explain how they influenced results across entities.", ["Enterprise or group executive", "Corporate strategy or portfolio leader", "Shared-services or governance executive"]),
    "56": ("Administrative and support, waste management, and remediation services spans varied service operations. Leadership fit depends on the service delivered, contract model, workforce deployment, customer commitments, and any environmental or safety responsibilities. Candidates should identify which activities they led and how they handled service quality, field operations, compliance, or client relationships; broad claims about the whole sector obscure important differences in mandate.", ["Business services general manager", "Field or contract operations executive", "Environmental, safety, or service-quality leader"]),
    "61": ("Educational services organizations differ in learner population, educational model, governance, and delivery setting. A leadership role may emphasize academic programs, student services, operations, technology, finance, or access, and the authority attached to each function varies. Candidates should make clear which learners and programs they served, how decisions were shared with academic or governing bodies, and which outcomes they can responsibly evidence.", ["Education organization executive", "Academic or program leader", "Student services or operations executive"]),
    "71": ("Arts, entertainment, and recreation organizations may depend on creative production, venues, events, participation, rights, or visitor experience. Leadership candidates should identify the operating context and whether their responsibility was artistic, commercial, technical, audience-facing, or administrative. Explain how you balanced program quality and organizational requirements, while treating audience, revenue, or participation figures as claims requiring a source and clear attribution.", ["Arts or venue executive", "Production or programming leader", "Audience, commercial, or recreation executive"]),
    "72": ("Accommodation and food services is shaped by the service format, guest or customer experience, workforce, operating hours, and distribution channels. Senior candidates should specify whether they led a property, food operation, brand, region, or enabling function, and how service standards and commercial decisions interacted. Compare the target's model with your own evidence rather than assuming that experience in one format transfers directly to another.", ["Hospitality or property operations executive", "Food-service or culinary operations leader", "Guest experience or commercial executive"]),
    "81": ("Other services is a broad classification category whose individual activities may have very different customers and operating models. That makes precise employer research especially important: identify the actual service, membership or customer relationship, delivery setting, and revenue or funding context. Candidates should avoid treating the sector as one profession and instead show how their leadership experience maps to the particular establishment and mandate.", ["Service organization general manager", "Customer or member operations leader", "Professional or field-services executive"]),
    "92": ("Public administration leadership operates within a public mandate and governance structure that may include statutory responsibilities, public accountability, procurement, and coordination with elected or appointed bodies. The precise framework differs by jurisdiction and agency. Candidates should explain their delegated authority, service population, and decision process, protect sensitive information, and confirm any public-sector eligibility or ethics requirements with the employer and appropriate authority.", ["Public agency or department executive", "Public-service program leader", "Finance, policy, or administrative executive"]),
}

SOC_CONTEXT: dict[str, tuple[str, list[str]]] = {
    "17-0000": ("Architecture and engineering leadership connects technical judgment with design, delivery, safety, and lifecycle performance. Candidates should identify the discipline, project or product context, standards applied, and decisions reserved to licensed professionals where applicable. Seniority is demonstrated through the scope of technical authority, coordination, and accountability—not by the SOC group alone. Confirm credentials and jurisdictional rules directly with the employer and relevant licensing body.", ["Chief engineer or engineering director", "Architecture or design authority", "Program engineering executive"]),
    "19-0000": ("Life, physical, and social science occupations include distinct research and applied disciplines. Leadership assessment should clarify the methods, population or system studied, evidence standards, and whether the role centers on research, analysis, policy, or service. Candidates should explain how they supervised or used evidence, managed uncertainty, and protected data or research integrity, while being careful not to overstate causation or claim findings beyond the source.", ["Research institute or laboratory director", "Chief science or analytics leader", "Research operations executive"]),
    "21-0000": ("Community and social service roles are shaped by the population served, service model, funding context, and professional boundaries. Senior candidates should distinguish program leadership from direct practice, explain how safeguarding and referral responsibilities were handled, and provide evidence of service design or delivery without disclosing private case information. Credential and statutory requirements vary; verify them for the specific role and jurisdiction.", ["Community services executive", "Social-service program director", "Safeguarding or partnership leader"]),
    "25-0000": ("Educational instruction and library occupations span teaching, learning support, library services, and related work. Leadership pathways may involve curriculum, faculty or staff development, student support, collections, access, or institutional operations. Candidates should identify the learners and setting, describe how responsibilities were shared with governing or academic bodies, and use appropriate evidence of program quality without presenting a single metric as a complete measure of learning.", ["Academic or education executive", "Library or learning-services director", "Curriculum or student-support leader"]),
    "27-0000": ("Arts, design, entertainment, sports, and media work can be project-based and portfolio-led, with creative, technical, commercial, and audience responsibilities overlapping. Senior candidates should identify their actual creative or operating authority, the collaborators involved, and how rights, production, distribution, or participation were handled. Attribute outcomes accurately and avoid sharing unreleased work or confidential commercial arrangements.", ["Creative or design executive", "Media or production leader", "Sports, talent, or audience executive"]),
    "29-0000": ("Healthcare practitioners and technical occupations involve clinical or technical work whose scope is governed by training, credentials, and local rules. Leadership candidates should distinguish clinical authority from administrative management, name the service context, and explain quality, safety, or workforce decisions within their remit. Never infer licensure from a SOC code; confirm current requirements with the employer and relevant professional authority.", ["Clinical or professional-services executive", "Medical or technical department leader", "Quality, safety, or care-operations executive"]),
    "31-0000": ("Healthcare support occupations contribute to service delivery in roles distinct from licensed practitioner work. A leader should understand staffing, supervision, safety, workflow, and the boundaries between support functions and clinical decision-making. Candidates moving into broader operations should show how they improved coordination or service delivery while respecting scope-of-practice rules and the responsibilities of licensed colleagues.", ["Healthcare support services director", "Patient-services operations leader", "Workforce or service-quality executive"]),
    "33-0000": ("Protective service occupations operate within public-safety or security mandates that can carry formal authority, training, and accountability. Senior role comparisons should examine the jurisdiction, population served, command structure, incident responsibilities, and policy framework. Candidates should separate operational command from advisory or corporate security work, protect sensitive information, and verify appointment, clearance, or certification requirements.", ["Public safety or security executive", "Emergency operations leader", "Protective services or risk director"]),
    "35-0000": ("Food preparation and serving occupations center on safe, consistent service in settings with different customer flows, menus, teams, and operating constraints. Leadership candidates should identify whether their experience is culinary, multi-site operations, service design, or supply and quality management. Evidence should clarify responsibility for standards, workforce, and customer experience without implying that one location's results apply to an entire organization.", ["Food-service operations executive", "Culinary or production leader", "Restaurant or guest-services director"]),
    "37-0000": ("Building and grounds cleaning and maintenance work supports safe, usable facilities through scheduled services, responsive maintenance, and vendor or workforce coordination. Senior candidates should identify building types, service levels, contract or in-house delivery, and the authority they held over safety and continuity. A transition into broader facilities leadership should be grounded in evidence of planning, oversight, and service outcomes.", ["Facilities or workplace executive", "Building operations director", "Grounds or environmental services leader"]),
    "39-0000": ("Personal care and service occupations cover work where trust, client experience, and service standards can be central. The exact requirements and risks vary by occupation and jurisdiction. Leaders should identify the service model, client group, staff responsibilities, and any professional boundaries, while ensuring that public career materials do not disclose personal information or imply qualifications not held.", ["Personal services business leader", "Client experience or service director", "Care or workforce operations leader"]),
    "41-0000": ("Sales and related occupations vary by product, channel, customer, and sales cycle. Leadership candidates should distinguish direct revenue ownership from enablement, account stewardship, or channel support, and explain the market segment and team they actually led. Use properly attributed, dated evidence and clarify whether targets or results were individual, team, or organization-wide; avoid unsupported performance claims.", ["Chief commercial or sales executive", "Regional or channel sales leader", "Strategic accounts director"]),
    "43-0000": ("Office and administrative support occupations underpin workflows, records, coordination, and service processes across many organizations. Senior transitions should identify the process or function, the controls and systems involved, and whether the leader had authority over operations, policy, or transformation. Candidates should demonstrate reliability, confidentiality, and process improvement with evidence while protecting sensitive employee, customer, and organizational records.", ["Business operations executive", "Administrative services director", "Process or shared-services leader"]),
    "45-0000": ("Farming, fishing, and forestry occupations connect field expertise with natural resources, production cycles, equipment, and stewardship. The detailed work differs substantially across those activities, so candidates should name the resource and operating setting rather than rely on the major-group label. Leadership evidence may concern safe operations, planning, conservation, or supply coordination; confirm permits and credential needs for each location.", ["Resource operations executive", "Agriculture or forestry program leader", "Field operations or stewardship director"]),
    "47-0000": ("Construction and extraction occupations include distinct site, trade, and resource activities. Leadership candidates should describe the work environment, project or asset scope, contractor relationships, and responsibilities for scheduling, safety, quality, or delivery. Experience in one trade or extraction setting should not be presented as equivalent to another without evidence; verify required licenses, training, and local rules.", ["Construction or extraction operations executive", "Project or site delivery leader", "Safety, quality, or workforce director"]),
    "49-0000": ("Installation, maintenance, and repair occupations focus on equipment, systems, and service restoration across varied settings. Leadership roles may be measured by safe work planning, service coverage, asset availability, technical standards, and parts or vendor coordination. Candidates should identify the systems they know and the level of authority held, and should avoid claiming technical qualification based solely on a leadership title.", ["Maintenance and reliability executive", "Technical field-services director", "Asset or service operations leader"]),
    "51-0000": ("Production occupations involve making or processing goods through defined methods, equipment, and quality controls. Senior leaders should distinguish production supervision from broader manufacturing strategy and explain their responsibility for scheduling, workforce, process control, quality, or continuous improvement. Use specific examples tied to the candidate's actual authority and avoid disclosing protected formulas, process details, or customer specifications.", ["Production or manufacturing executive", "Plant operations director", "Quality or process-improvement leader"]),
    "53-0000": ("Transportation and material moving occupations support the movement, handling, and coordination of people or goods. Leadership experience should specify the mode, network, equipment, customer obligation, and safety or dispatch responsibilities involved. Candidates should explain which parts of the operation they owned, verify any certification or operating authority for the target jurisdiction, and avoid treating logistics experience as identical across modes.", ["Transport or logistics executive", "Fleet or network operations director", "Distribution or mobility leader"]),
    "55-0000": ("Military specific occupations are defined by military work and must be read in the context of service structure, rank, assignment, and jurisdiction. Translating experience to civilian leadership requires explaining the actual function, scale, decision authority, and outcomes in language employers can evaluate. Protect classified or restricted information, do not imply civilian credentials from service experience alone, and verify any clearance or eligibility conditions.", ["Military operations or program executive", "Defense or mission-support leader", "Veteran transition or readiness director"]),
}


def generated_detail_page(
    category: str,
    group: dict[str, Any],
    rows: list[dict[str, Any]],
) -> dict[str, Any]:
    title = group["name"]
    code = group["code"]
    slug = page_slug(title)
    is_industry = category == "industries"
    counts = Counter(record["level"] for record in rows)

    if is_industry:
        subsectors = named(rows, "Subsector", 5)
        groups = named(rows, "Industry group", 5)
        five_digit = counts["NAICS industry"]
        six_digit = counts["U.S. national industry"]
        description = (
            f"Browse the verified 2022 NAICS hierarchy for {title} ({code}), "
            f"including {counts['Subsector']} subsectors, {counts['Industry group']} "
            f"industry groups, {five_digit} five-digit industries, and "
            f"{six_digit} six-digit U.S. national industries."
        )
        summary = (
            f"Official 2022 NAICS reference for sector {code}, {title}. The directory "
            f"contains {len(rows)} source records across its complete hierarchy."
        )
        heading = f"{title}: understand the activity behind the sector code."
        intro = (
            f"This reference follows sector {code} through every official NAICS level "
            "in the 2022 Census structure. It distinguishes five-digit NAICS industries "
            "from six-digit U.S. national industries and shows each record's parent code."
        )
        overview = [
            f"The 2022 NAICS classification places {title} in sector {code}. Its "
            f"subsector structure includes {subsectors}. Those official labels are useful "
            "for identifying the establishment activity a classification describes; "
            "they are not a measure of company size, prestige, hiring demand, or a "
            "candidate's occupational specialty. Begin with the business activity shown "
            "in the source table, then confirm that it matches the actual entity and "
            "operations under consideration.",
            f"Inside this sector, the industry-group level includes {groups}. That range "
            "of labels gives a more precise starting point than using the sector name "
            "alone. For a senior search, compare the employer's products or services, "
            "customers, revenue model, operating footprint, ownership, and governance "
            "with the specific activity represented by its code. The classification "
            "does not describe an executive's remit, so verify accountability through "
            "the job description, reporting line, decision rights, and employer "
            "disclosures rather than inferring them from NAICS.",
            "Leadership work should be evaluated through decisions and evidence. A "
            "finance leader may need to explain planning, reporting, capital, or "
            "stewardship responsibilities; an operations leader may need to establish "
            "the service, production, delivery, or control scope they owned. These are "
            "questions to investigate, not assumptions about every employer in the "
            "sector. Candidates should distinguish their own contribution from team "
            "results, define the period and scale of any figures they share, and avoid "
            "disclosing confidential commercial, employee, customer, or transaction "
            "information.",
            f"Transitions within {title} can involve materially different operating "
            f"contexts even when the businesses sit in one sector. Compare the "
            f"subsector names—such as {subsectors}—with the target organization's "
            "activity and the role's actual mandate. A transferable capability is "
            "strongest when the candidate can show how it was applied, which stakeholders "
            "were affected, and what responsibility they held. Where the target requires "
            "a credential, regulated approval, technical background, or local experience, "
            "confirm the requirement through the employer and relevant official authority.",
            f"The directory reports {five_digit} five-digit industries and "
            f"{six_digit} six-digit U.S. national industries beneath this sector. These "
            "are distinct levels in the official structure; the U.S. national detail "
            "should not be collapsed into or substituted for the five-digit count. "
            "Parent codes make the relationships auditable and the source marker T, "
            "where displayed, records the workbook's trilateral-agreement indicator. "
            "Use the code table as a research map, not as a ranking of employers or a "
            "forecast of market conditions.",
            "For a location comparison, first define the target job and employing entity, "
            "then check the organization's activity, operating geography, role "
            "requirements, work authorization, and decision authority. The United States, "
            "Canada, United Kingdom, UAE, Saudi Arabia, and Australia do not share one "
            "industry classification or one set of employment rules. Current market "
            "facts must be verified against dated employer disclosures and official "
            "sources. This guide does not claim current vacancies, compensation levels, "
            "regulatory status, or relative demand.",
            "KOV Career Agency provides candidate-side career representation and "
            "individual career services. Depending on the written engagement, support "
            "can include defining target organizations, researching role context, "
            "positioning verified experience, and coordinating applications or outreach "
            "approved by the professional. The candidate retains approval of external "
            "activity, and employers retain hiring decisions. Scope, deliverables, fees, "
            "and reporting are agreed before work begins; no interview, offer, job, or "
            "timeline is guaranteed.",
            f"For a practical {title} search, keep a short evidence file linking each "
            "target organization to its verified activity, the role's stated remit, and "
            "the experience that supports your fit. Record open questions separately "
            "from confirmed facts. This helps prevent a broad sector label from "
            "substituting for due diligence and makes conversations more specific "
            "without exposing confidential employer information.",
            f"Use the hierarchy for sector {code} as a set of progressively more specific "
            "questions. First confirm the establishment's primary activity; then check "
            "whether a subsidiary, business unit, or separate location has a different "
            "classification. Next compare that activity with the role's stated scope and "
            "the organization's own public descriptions. A code can support a consistent "
            "research note, but it cannot replace due diligence on ownership, customers, "
            "services, operating model, or the accountability attached to a particular "
            "executive position.",
        ]
        role_rows = [
            ["Chief executive or business-unit leader", f"Clarify the mandate across the actual {title} activity.", "Establish organization scope, decision rights, operating context, and accountable outcomes."],
            ["Finance executive", "Confirm the financial-stewardship remit and stakeholder expectations.", "Separate personal accountability from team results and disclose only approved evidence."],
            ["Operations executive", f"Identify whether the role covers activities represented by {groups}.", "Map operating scale, service or delivery responsibilities, controls, and transformation scope."],
            ["Technology or data executive", "Determine whether technology supports customer products, internal systems, or core operations.", "Describe platform, security, data, reliability, and governance responsibility precisely."],
            ["People or commercial executive", "Test the people, customer, and growth remit against the employing entity.", "Show relevant team or customer scope without implying unverified market outcomes."],
        ]
        scenario = [
            f"A transition within {title} calls for more than a shared sector label. Compare the target employer's classified activity, customers, delivery model, and executive authority with the professional's experience before deciding whether the move is credible.",
            "Review the relevant NAICS hierarchy and the employer's own description, then compare the role's decisions with documented experience. Identify transferable strengths, knowledge to verify, and evidence that can be discussed while protecting confidential information.",
        ]
        market_rows = [
            [market, f"Map the target employer's {title} activity to its local entity and operating footprint.", "Verify the role mandate, location, work authorization, employer disclosures, and dated official market evidence."]
            for market in ["United States", "Canada", "United Kingdom", "UAE", "Saudi Arabia", "Australia"]
        ]
        directory = {
            "classification": "North American Industry Classification System (NAICS), 2022",
            "sourceLabel": "OFFICIAL NAICS 2022 HIERARCHY",
            "heading": f"Complete NAICS 2022 directory for {title}",
            "description": (
                f"The table reproduces all {len(rows)} code/title records in sector {code} "
                "from the official Census Bureau structure workbook, including every "
                "subsector, industry group, five-digit industry, and six-digit U.S. "
                "national industry. Parent codes show the hierarchy."
            ),
            "sourceName": "U.S. Census Bureau, 2022 NAICS Structure",
            "sourceUrl": "https://www.census.gov/naics/2022NAICS/2022_NAICS_Structure.xlsx",
            "sourceNote": "Source file: data/taxonomy/2022_NAICS_Structure.xlsx. Five-digit NAICS industries and six-digit U.S. national industries are separate levels; titles and parent relationships follow the official workbook.",
            "quickFacts": [
                {"label": label, "value": str(value)}
                for label, value in [
                    ("Sector code", code),
                    ("Sector title", title),
                    ("Subsectors", counts["Subsector"]),
                    ("Industry groups", counts["Industry group"]),
                    ("Five-digit industries", five_digit),
                    ("Six-digit U.S. national industries", six_digit),
                    ("Total listed records", len(rows)),
                ]
            ],
            "entries": rows,
        }
        focus_eyebrow = "SECTOR OVERVIEW"
        overview_title = f"How {title} is classified and led"
        role_columns = ["Role family", "Mandate questions", "Career evidence to clarify"]
        scenario_title = f"Assess a transition within {title}"
        market_title = "Compare markets through the actual employer and mandate"
        category_faqs = [
            (f"What activities are included in NAICS sector {code}?", f"The official 2022 structure groups {title} into {counts['Subsector']} subsectors. The complete codes and titles appear in the directory table."),
            (f"How should I use the {title} subsector codes?", f"Use the code hierarchy to identify classified establishment activity, then verify the employer's actual operations and the job's remit."),
            (f"Does NAICS sector {code} define an executive occupation?", "No. NAICS classifies establishments by economic activity. It does not classify executive job titles or determine role seniority."),
            (f"How many five- and six-digit industries are in sector {code}?", f"The verified workbook lists {five_digit} five-digit industries and {six_digit} six-digit U.S. national industries as distinct levels."),
            (f"Can an executive move between {title} subsectors?", "Assess the target's business model, decision authority, relevant experience, and any verified credential or jurisdiction requirements rather than relying on the shared sector label."),
            (f"Does this {title} directory show hiring demand or salaries?", "No. It is a classification reference, not a vacancy, compensation, or demand dataset."),
        ]
        image = "assets/kov-global-grid.svg"
        image_alt = f"Industry research framework for {title}."
        service_cta = "Discuss Your Industry Search"
        service_heading = "Connect industry context to your next career move."
        service_copy = "Share the sectors, functions, and markets you are considering. KOV can discuss whether candidate-side support fits and agree the scope directly."
        related = [
            ("industries", "NAICS industry directory"),
            ("roles", "SOC occupation directory"),
            ("executive-career-representation", "Executive Career Representation"),
            ("executive-job-search-support", "Executive Job Search Support"),
            ("executive-job-search-uae", "Executive Job Search Support in the UAE"),
        ]
    else:
        minor = named(rows, "Minor", 5)
        broad = named(rows, "Broad", 5)
        detailed = counts["Detailed"]
        description = (
            f"Explore the official SOC 2018 hierarchy for {title} ({code}), with "
            f"{counts['Minor']} minor groups, {counts['Broad']} broad occupations, "
            f"and {detailed} detailed occupations and definitions."
        )
        summary = (
            f"Official SOC 2018 reference for major group {code}, {title}. The complete "
            f"hierarchy contains {len(rows)} source records and detailed definitions."
        )
        heading = f"{title}: compare work, scope, and leadership responsibility."
        intro = (
            f"This directory follows SOC major group {code} through every minor, broad, "
            "and detailed occupation in the official 2018 hierarchy. Detailed definitions "
            "are reproduced from the companion BLS workbook."
        )
        overview = [
            f"The 2018 Standard Occupational Classification places {title} in major "
            f"group {code}. Its minor groups include {minor}. The hierarchy then "
            f"distinguishes broad occupations such as {broad}. Those classifications "
            "describe work performed; they do not establish an employer's exact job "
            "title, organizational seniority, professional eligibility, or a person's "
            "qualifications. Read the official definition at the level that matches the "
            "work, and compare it with the employer's written responsibilities.",
            f"The detailed records under {title} span {detailed} occupations. Their "
            "definitions can help candidates and employers discuss the substance of a "
            "role when familiar titles are used differently. A useful comparison asks "
            "what outputs the person owns, which decisions they make, whom they advise "
            "or lead, and what specialized knowledge or credentials are required. A "
            "classification is a reference point, not a substitute for the job "
            "description or applicable licensing and qualification rules.",
            "Senior positions often combine several kinds of work, while the SOC "
            "hierarchy groups occupations by their primary work concepts. A senior "
            "leader should therefore explain the actual remit in plain language: "
            "functional authority, team or stakeholder relationships, budget or service "
            "scope where disclosable, and the evidence behind claimed outcomes. Do not "
            "assume that a management title maps to one code or that an individual "
            "contributor code indicates limited organizational impact. Validate the "
            "occupation against duties and employer context.",
            f"Career transitions within {title} should be tested against the specific "
            f"minor group and detailed occupations, not just the major-group label. "
            f"Compare the target duties with examples such as {broad}, identify the "
            "skills and outcomes that transfer, and make any gaps explicit. Where a role "
            "has a statutory credential, professional registration, clearance, or "
            "jurisdiction-specific requirement, confirm it through the employer and "
            "relevant official authority. The SOC source does not certify individual "
            "eligibility.",
            f"This page includes the complete major-group record and all "
            f"{counts['Minor']} minor, {counts['Broad']} broad, and {detailed} detailed "
            "records. Detailed occupation definitions come from the official BLS "
            "definitions workbook; parent codes follow the BLS structure worksheet "
            "sequence rather than an assumed code-prefix rule. This makes the table "
            "traceable to both source workbooks and helps distinguish similar titles "
            "whose work concepts differ.",
            "For international career planning, map the duties to the relevant local "
            "occupational classification rather than assuming that a U.S. SOC code "
            "translates directly. Compare the employing entity, target role, actual "
            "responsibility, location, work authorization, and credential requirements. "
            "Current market evidence should be dated and sourced to official statistics "
            "or employer disclosures. The table is not a demand or salary ranking and "
            "does not claim that one country has more opportunities than another.",
            "KOV Career Agency provides candidate-side career representation and "
            "individual career services. Depending on the written engagement, support "
            "may help define target roles, organize evidence, research organizations, "
            "and coordinate applications or outreach approved by the professional. "
            "Candidates retain approval of external activity; employers retain hiring "
            "decisions. Scope, deliverables, fees, and reporting are agreed directly "
            "before work begins. No interview, offer, employment outcome, or timing is "
            "guaranteed.",
            f"For a practical {title} search, keep the target job description beside "
            "the relevant official definitions and note where the duties agree or "
            "differ. Record credential questions separately for confirmation with the "
            "employer or relevant authority. This makes the classification useful as a "
            "research aid without presenting it as proof of an individual's experience "
            "or professional eligibility.",
            f"Use major group {code} as the beginning of a role comparison, then move "
            "through the official hierarchy until the specific work concept is relevant. "
            "When a position spans several specialties, document the primary duties and "
            "the additional responsibilities rather than selecting a code from the title "
            "alone. This distinction is particularly useful in executive searches, where "
            "titles can be broad and authority varies widely. A written comparison keeps "
            "the discussion grounded in the work, the evidence, and the requirements "
            "confirmed with the prospective employer.",
        ]
        role_rows = [
            ["Functional executive", f"Clarify whether the target remit aligns with work in {title}.", "Connect leadership decisions with the official work concepts without treating SOC as a title list."],
            ["Department or practice leader", f"Compare the team's work with the relevant minor group, including {minor}.", "Explain scope, standards, stakeholders, and evidence of accountable leadership."],
            ["Senior specialist", f"Test the detailed duties against occupations such as {broad}.", "Show depth, judgment, and outcomes while distinguishing specialist work from management."],
            ["Cross-functional executive", "Identify which responsibilities span multiple occupational families.", "Separate direct ownership from coordination and ensure claims reflect actual authority."],
            ["People or operations leader", "Check whether the role's primary work and reporting relationships match the target.", "Describe workforce, service, and governance responsibilities with verifiable context."],
        ]
        scenario = [
            f"Broad leadership titles can span several work concepts within SOC major group {code}. For a role connected to {named(rows, 'Broad', 1)}, compare the employer's stated responsibilities with the official definitions instead of relying on the title alone.",
            f"Review the job description alongside the definitions for {minor}, identify the responsibilities the professional has actually owned, and flag credential or jurisdiction questions for confirmation. A concise account of relevant decisions and evidence makes the fit easier to assess; the SOC code itself does not establish qualifications.",
        ]
        market_rows = [
            [market, f"Map the duties in {title} to the local occupational system and actual employer role.", "Verify required credentials, role scope, location, work authorization, and dated official market evidence."]
            for market in ["United States", "Canada", "United Kingdom", "UAE", "Saudi Arabia", "Australia"]
        ]
        directory = {
            "classification": "2018 Standard Occupational Classification (SOC)",
            "sourceLabel": "OFFICIAL SOC 2018 HIERARCHY",
            "heading": f"Complete SOC 2018 directory for {title}",
            "description": (
                f"The table reproduces all {len(rows)} records under major group {code}: "
                f"{counts['Minor']} minor groups, {counts['Broad']} broad occupations, "
                f"and {detailed} detailed occupations. Official detailed definitions "
                "come from the companion BLS definitions workbook. Parent codes follow "
                "the structure worksheet hierarchy."
            ),
            "sourceName": "U.S. Bureau of Labor Statistics, 2018 SOC",
            "sourceUrl": "https://www.bls.gov/soc/2018/home.htm",
            "sourceNote": "Source files: data/taxonomy/soc_structure_2018.xlsx and data/taxonomy/soc_2018_definitions.xlsx. Definitions are official BLS text; SOC describes work, not seniority, credentials, or employer-specific titles.",
            "quickFacts": [
                {"label": label, "value": str(value)}
                for label, value in [
                    ("Major group code", code),
                    ("Major group title", title),
                    ("Minor groups", counts["Minor"]),
                    ("Broad occupations", counts["Broad"]),
                    ("Detailed occupations", detailed),
                    ("Total listed records", len(rows)),
                ]
            ],
            "entries": [
                {**record, "level": LEVEL_LABELS[record["level"]]}
                for record in rows
            ],
        }
        focus_eyebrow = "OCCUPATION-GROUP OVERVIEW"
        overview_title = f"What distinguishes {title}"
        role_columns = ["Leadership role", "Mandate questions", "Career evidence to clarify"]
        scenario_title = f"Compare leadership responsibilities across {title}"
        market_title = "Compare local occupation systems and role requirements"
        category_faqs = [
            (f"What does SOC major group {code} classify?", f"It classifies work concepts in {title}. The official minor, broad, and detailed hierarchy appears in the directory."),
            (f"How many detailed occupations are in SOC {code}?", f"The verified BLS 2018 structure lists {detailed} detailed occupations under this major group."),
            (f"Which minor groups fall under {title}?", f"The official minor groups include {minor}. The table lists every minor group and its descendant occupations."),
            (f"Are SOC {code} codes equivalent to employer job titles?", "No. SOC codes classify work performed; employers may use different titles or combine responsibilities."),
            (f"Can I use a {title} code to prove professional eligibility?", "No. The classification is not a credential or eligibility determination. Confirm requirements with the employer and relevant authority."),
            (f"Does this {title} page compare job demand across countries?", "No. It provides the U.S. SOC 2018 structure and a market-research checklist, not current vacancy, salary, or demand comparisons."),
        ]
        image = "assets/kov-search-grid.svg"
        image_alt = f"Occupation research framework for {title}."
        service_cta = "Discuss Your Role Search"
        service_heading = "Translate your experience into a clear role target."
        service_copy = "Share your leadership scope, target functions, and markets. KOV can discuss whether candidate-side search support fits and agree the scope directly."
        related = [
            ("roles", "SOC occupation directory"),
            ("industries", "NAICS industry directory"),
            ("executive-career-representation", "Executive Career Representation"),
            ("executive-job-search-support", "Executive Job Search Support"),
            ("executive-job-search-uae", "Executive Job Search Support in the UAE"),
        ]

    faq_list = [{"question": question, "answer": answer} for question, answer in category_faqs]
    return {
        "slug": slug,
        "path": f"{category}/{slug}.html",
        "category": category,
        "newPage": True,
        "newTaxonomyPage": True,
        "parentHub": category,
        "title": (
            f"{title} (NAICS {code}) Industry Directory | KOV"
            if is_industry
            else f"{title}: SOC 2018 Directory | KOV"
        ),
        "description": description,
        "summary": summary,
        "eyebrow": (
            "NAICS 2022 · INDUSTRY REFERENCE"
            if is_industry else "SOC 2018 · OCCUPATION REFERENCE"
        ),
        "heading": heading,
        "lead": intro,
        "introduction": intro,
        "image": image,
        "imageAlt": image_alt,
        "cta": service_cta,
        "ctaHeading": service_heading,
        "ctaCopy": service_copy,
        "directory": directory,
        "sections": [
            section(focus_eyebrow, overview_title, overview),
            section(
                "SENIOR ROLE AND CAREER-PATH TABLE",
                "Leadership titles require remit-level comparison",
                ["These role families provide a career-planning framework, not official NAICS or SOC classifications. Responsibilities differ by employer; verify the reporting line, authority, requirements, and evidence behind each mandate."],
                table={
                    "caption": "General career guidance — verify the employer's role description",
                    "columns": role_columns,
                    "rows": role_rows,
                },
            ),
            section("CAREER TRANSITION STRATEGY", scenario_title, scenario, scenario=True),
            section(
                "MARKET COMPARISON",
                market_title,
                ["This is a research framework, not a current demand, salary, vacancy, or country ranking. Confirm dated facts using official sources and the target employer."],
                table=market_table(market_rows),
            ),
            section(
                "KOV-SPECIFIC GUIDANCE",
                "Candidate-side representation with clear boundaries",
                [
                    "KOV works for the professional, not the employer. Depending on agreed scope, candidate-side support may include target definition, organization research, positioning, approved applications, outreach, interview preparation, and offer support. The professional reviews and approves external activity.",
                    "Classification codes help organize research but do not establish fit or guarantee an employer response. Engagement scope, deliverables, approvals, fees, and reporting are agreed directly and in writing. KOV does not promise interviews, offers, employment, or timing.",
                ],
                bullets=[
                    "Define target organizations and adjacent role or industry contexts",
                    "Connect verified experience to the actual mandate",
                    "Confirm approvals and practical constraints before outreach",
                ],
            ),
        ],
        "faqs": faq_list,
        "related": [{"slug": target, "label": label} for target, label in related],
    }


CONTENT: dict[str, dict[str, Any]] = {
    "professional-scientific-and-technical-services": {
        "category": "industries",
        "title": "Professional, Scientific and Technical Services (NAICS 54) | KOV",
        "description": "Explore the official NAICS 54 hierarchy for Professional, Scientific, and Technical Services, including subsectors, industry groups, industries, and U.S. national industries.",
        "summary": "NAICS 54 groups establishments providing specialized professional, scientific, and technical services. This reference includes the full 2022 NAICS hierarchy recorded under sector 54.",
        "heading": "Professional expertise is the product—and the leadership challenge.",
        "lead": "Explore NAICS 54 from its nine subsectors through every official industry and U.S. national industry in the 2022 classification.",
        "introduction": "Professional, Scientific, and Technical Services is a business-activity classification, not a list of occupations. The directory below preserves the Census Bureau's 2022 codes and titles at every level and distinguishes shared NAICS industries from U.S.-specific six-digit detail.",
        "focus": [
            "NAICS 54 covers a wide range of establishments whose primary activity is providing specialized professional, scientific, or technical services. The sector's breadth is visible in its nine subsectors, which include professional services such as legal and accounting, architecture and engineering, design, computer-related services, consulting, research, advertising, and other specialist activities. A code describes an establishment's primary economic activity; it does not describe every service that the organization offers or every role it employs.",
            "Leadership in a knowledge-service organization often involves balancing expertise, client trust, delivery quality, and commercial sustainability. The actual balance differs substantially between a regulated professional practice, a project-based technical consultancy, a research organization, and a large multi-service firm. A senior title alone therefore provides little evidence of scale. Useful context includes client type, project size, recurring versus one-off work, the delivery model, the degree of professional regulation, and the leader's authority over people, pricing, and risk.",
            "Hiring processes in this sector can be mandate-led: an employer may need someone to deepen a technical practice, expand a client portfolio, improve delivery discipline, lead a geographic team, or integrate a service after organizational change. Those are possible search questions, not claims that any particular market currently has demand. Candidates should identify which business problem they have actually addressed and support the claim with verifiable examples, while protecting confidential client information.",
            "Career transitions can cross subsector boundaries when the candidate can explain how their expertise transfers. A leader moving from a specialist advisory practice into an in-house role may need to translate client-facing recommendations into ownership of internal execution. Someone moving from a technical delivery business to a broader services company may need to show how they managed cross-functional teams, service economics, quality controls, and customer outcomes. The classification helps organize research but does not establish role equivalence.",
            "A strong industry narrative connects the work performed to the operating environment. It identifies the services delivered, who relied on them, the complexity and constraints involved, the leader's decisions, and what changed as a result. Avoid describing a whole firm as belonging to one subsector without checking its primary activity. Equally, avoid presenting the NAICS label as proof of expertise: a professional's work history and specific responsibilities remain the evidence for a credible senior-career story.",
        ],
        "roleRows": [
            ["Managing partner or practice leader", "Sets practice direction, client priorities, quality expectations, and leadership capacity.", "Clarify ownership or partnership status, governance, book-of-business expectations, and personal contribution."],
            ["Chief executive or business-unit leader", "Aligns service portfolio, delivery, talent, and commercial priorities.", "Show the scale led, decision rights, operating model, and measurable outcomes."],
            ["Chief technology or digital leader", "Connects technology strategy, product or service delivery, security, and operating needs.", "Separate enterprise leadership from hands-on expertise; describe architecture, teams, and risk remit."],
            ["Chief financial or operations leader", "Supports planning, controls, utilization, service operations, and resource decisions.", "Explain how financial and delivery measures informed decisions without disclosing client data."],
            ["Research or technical director", "Guides specialist teams, methods, quality, and technical credibility.", "Make the contribution and governance clear; distinguish technical authority from line management."],
        ],
        "scenario": [
            "A move from engineering consultancy leadership into a national practice role requires evidence of technical quality, client development, team leadership, and delivery across disciplines. Compare the target firm's service mix and the role's authority before treating prior experience as a match.",
            "A disciplined preparation would map the target firm's actual service mix, identify which of the candidate's projects are comparable, establish team and budget scope, and prepare examples of quality decisions, client outcomes, and collaboration across disciplines. The candidate would also test the new role's authority, professional requirements, and expectations before approving any outreach.",
        ],
        "marketRows": [
            ["United States", "Compare the employer's NAICS activity with its actual service portfolio.", "Verify primary establishment activity, role scope, client segment, professional licensing, and current hiring facts."],
            ["Canada", "Separate national firm structure from province-specific professional requirements.", "Check the relevant regulator, province, client base, and whether credentials transfer."],
            ["United Kingdom", "Distinguish a specialist practice from a multi-service professional firm.", "Verify professional status, legal entity, geography covered, and employer-specific mandate."],
            ["UAE", "Confirm whether the role serves a local entity, regional practice, or cross-border portfolio.", "Check employing entity, reporting line, work authorization, client mix, and required local credentials."],
            ["Saudi Arabia", "Test the actual delivery model and scope rather than assuming all sector firms are alike.", "Verify client and project context, employer entity, credential requirements, and relocation conditions."],
            ["Australia", "Map the target service to the employer's operating and professional context.", "Confirm state or territory requirements, work eligibility, team remit, and the source date for market data."],
        ],
        "faqs": [
            ["What businesses are in NAICS 54?", "NAICS 54 covers establishments primarily providing professional, scientific, or technical services. Its detailed codes separate different kinds of activities; consult the directory and official source for exact titles."],
            ["Does NAICS 54 classify professional occupations?", "No. NAICS classifies establishments by economic activity. Occupations are classified separately in SOC."],
            ["How many 2022 NAICS industries are listed under sector 54?", "The downloaded Census structure workbook contains 35 five-digit NAICS industries and 49 six-digit U.S. national industries beginning with 54, alongside their parent levels."],
            ["Can I move from consulting to an in-house executive role?", "Potentially, but the title alone does not establish fit. Explain how your client work, decisions, and outcomes translate to ownership inside the target organization."],
            ["Does this directory show where firms are hiring?", "No. It is a classification reference, not a vacancy feed or a measure of hiring demand."],
            ["What should I include in a senior-services leadership story?", "Describe the service, client or user context, team and decision scope, quality or risk constraints, and evidence of your contribution. Protect confidential client information."],
        ],
        "related": [
            ["industries", "NAICS industry directory"],
            ["roles", "SOC occupation directory"],
            ["reverse-recruiting", "Private Career Representation"],
            ["executive-job-search-uae", "Executive Job Search Support in the UAE"],
        ],
    },
    "finance-and-insurance": {
        "category": "industries",
        "title": "Finance and Insurance Industry Directory (NAICS 52) | KOV",
        "description": "Browse the complete 2022 NAICS 52 Finance and Insurance hierarchy, from five subsectors through official industries and U.S. national detail.",
        "summary": "NAICS 52 organizes establishments engaged in finance and insurance activities. This page reproduces the complete sector hierarchy in the 2022 Census structure.",
        "heading": "Finance leadership is shaped by the balance sheet, risk, and trust.",
        "lead": "Use the official NAICS 52 hierarchy to distinguish the diverse businesses grouped under Finance and Insurance.",
        "introduction": "The official directory below includes all five subsectors, industry groups, five-digit NAICS industries, and six-digit U.S. national industries recorded beneath sector 52. Classification identifies business activity; it does not imply a role's mandate, regulatory status, or current demand.",
        "focus": [
            "Finance and Insurance (NAICS 52) brings together several business models: monetary authorities and depository institutions, credit intermediation and related activities, securities and investment activity, insurance carriers, agencies and brokerages, and funds or other financial vehicles. These are not interchangeable settings. Each can place different weight on funding, assets, distribution, underwriting, customer relationships, technology, controls, and regulatory obligations. The directory's hierarchy is a reliable starting point for naming the employer's activity more precisely.",
            "Senior leadership scope is best understood through the decisions owned. For a finance executive, that may involve capital allocation, liquidity, planning, reporting, or investor communication; for a risk leader, it may involve risk appetite, controls, remediation, or governance; for a business leader, it may center on a product, customer segment, or distribution channel. These are role lenses rather than universal definitions. The job description, reporting line, and applicable regulator determine the actual remit.",
            "The sector makes evidence and trust especially important in a career narrative. Candidates should explain the scale and context of decisions, the safeguards applied, and their own contribution. Avoid unsupported claims about assets, portfolio performance, compliance outcomes, customer growth, or regulatory standing. If figures are confidential or were produced by a team, state the boundaries and attribute the work accurately.",
            "A transition between financial subsectors can be possible when the leader can connect common capabilities—such as governance, customer service, data, or enterprise operations—to the new business model. It still requires careful testing. A leader from insurance distribution may not have the same experience as someone accountable for underwriting or claims. A finance executive in a corporate treasury role is not automatically interchangeable with a senior leader in a regulated financial institution.",
            "Market comparisons should focus on the actual employing entity, permission to operate, product, customers, role authority, and applicable jurisdiction. A global organization can have locally distinct entities and responsibilities. Use official employer disclosures and regulator registers when relevant, and seek qualified legal or compliance advice for questions outside career representation. This page provides classification context, not regulatory advice or current hiring data.",
        ],
        "roleRows": [
            ["Chief financial officer or finance director", "Leads financial stewardship, planning, reporting, and decision support within the agreed remit.", "Distinguish regulated-institution experience from corporate finance; state entity and decision scope."],
            ["Chief risk officer", "Oversees risk governance, risk appetite, controls, and escalation mechanisms as assigned.", "Name the risk domains, committee relationships, and accountability boundaries."],
            ["Chief operating officer", "Coordinates business operations, service delivery, and cross-functional execution.", "Show operational scale, control environment, customer impact, and transformation ownership."],
            ["Chief technology or information officer", "Leads technology, data, resilience, or information systems under the organization's governance.", "Explain platform scope, security and resilience remit, team, and regulated constraints."],
            ["Investment or insurance business leader", "Leads a product, portfolio, underwriting, distribution, or client-facing unit.", "Clarify decision authority and distinguish personal responsibilities from investment or underwriting results."],
        ],
        "scenario": [
            "A move from finance leadership in insurance to a CFO role at a credit institution calls for careful comparison of regulatory responsibilities, capital structure, governance, and reporting lines.",
            "Before moving forward, the candidate would compare the official business classifications, identify the target entity and applicable oversight, map their own accountability against the role description, and prepare a precise account of controls and outcomes. Any gap in licensing, approval, or regulated experience should be disclosed and tested rather than concealed by a similar title.",
        ],
        "marketRows": [
            ["United States", "Identify the financial activity and legal entity, not just the parent brand.", "Verify regulator, charter or permission, product scope, reporting line, and current role requirements."],
            ["Canada", "Check federal versus provincial responsibilities relevant to the particular organization.", "Confirm employing entity, jurisdiction, regulator, authorization, and experience expectations."],
            ["United Kingdom", "Distinguish financial activity, product, and entity-level accountability.", "Use current regulator and employer disclosures; confirm role permissions and governance responsibilities."],
            ["UAE", "Determine the relevant onshore or financial-centre entity and the job's actual authority.", "Verify employing jurisdiction, regulator, role approval requirements, and work authorization."],
            ["Saudi Arabia", "Examine the regulated activity, local entity, and executive accountability described by the employer.", "Confirm current local rules with the relevant official regulator and qualified advisers."],
            ["Australia", "Compare the business's activity and responsible-person obligations with the candidate's experience.", "Check regulator, product, entity, role scope, and current employer requirements."],
        ],
        "faqs": [
            ["Which businesses fall under NAICS 52?", "The sector includes several finance and insurance activities, separated into five subsectors in the 2022 classification. The official codes and titles in the table define the coverage."],
            ["Does a finance title establish regulated experience?", "No. Verify the employing entity, activity, applicable oversight, and the candidate's actual responsibilities."],
            ["How many NAICS 52 industries are in the source workbook?", "The verified 2022 Census workbook has 27 five-digit industries and 35 six-digit U.S. national industries beginning with code 52."],
            ["Can a CFO move between financial subsectors?", "A move should be assessed against the target entity, accounting and governance requirements, regulatory accountability, and the candidate's demonstrated scope."],
            ["Does this page report finance-sector hiring trends?", "No. It is an official classification directory. It does not measure current openings, compensation, or demand."],
            ["What financial details should I avoid disclosing publicly?", "Do not reveal confidential client, portfolio, transaction, risk, or employer information. Use approved, accurately contextualized evidence."],
        ],
        "related": [
            ["industries", "NAICS industry directory"],
            ["roles", "SOC occupation directory"],
            ["executive-negotiation-support", "Executive Offer and Negotiation Support"],
            ["executive-job-search-uae", "Executive Job Search Support in the UAE"],
        ],
    },
    "information": {
        "category": "industries",
        "title": "Information Industry Directory (NAICS 51) | KOV",
        "description": "Explore the full 2022 NAICS 51 Information hierarchy, including subsectors, industry groups, industries, and U.S. national industry codes.",
        "summary": "NAICS 51 classifies establishments in information-related activities. The page reproduces the full 2022 sector hierarchy from the verified Census structure workbook.",
        "heading": "Information businesses connect content, networks, and technology.",
        "lead": "Explore every official NAICS 51 classification level and use the codes to make industry research more precise.",
        "introduction": "NAICS 51 is an industry classification for establishments, not a role taxonomy. This directory includes each code and title beneath the 2022 Information sector, including six-digit U.S. national detail.",
        "focus": [
            "The Information sector (NAICS 51) includes establishments associated with publishing, motion pictures and sound recording, broadcasting, telecommunications, data processing and hosting, and other information services. The official hierarchy distinguishes these activities rather than treating all digital or media businesses as one industry. A platform company, a connectivity provider, a content producer, and a data-hosting business may share technology and customers yet operate under different business models and constraints.",
            "Leadership roles in information businesses can sit at the intersection of content, product, infrastructure, customer experience, revenue, and risk. The relevant balance depends on the specific establishment and role. For example, a technology executive may own internal systems, a customer platform, network operations, or product engineering; a commercial leader may focus on advertising, subscriptions, enterprise accounts, or distribution. Candidates should use the job mandate—not the sector label—to define what they have led.",
            "Business changes in information organizations can make the boundaries between disciplines less obvious. A senior candidate may have led a digital transition within a traditional publisher or content strategy within a technology business. The strongest evidence separates what changed, who made the decisions, which teams were involved, how customers or users were affected, and which results can be supported. Avoid vague claims such as 'transformed digital' without showing the work and the level of accountability.",
            "A career transition across subsectors can require translating operating context. Infrastructure reliability, editorial independence, content rights, data stewardship, advertising economics, and product iteration are different concerns; not every role carries each one. Candidates should identify which of these they have actually managed and where a new employer's requirements may differ. The six-digit U.S. classification detail can help name an establishment's activity, but does not prove a particular role is comparable.",
            "For cross-border searches, establish the employing entity, customer base, service footprint, and exact role before interpreting the market. A global brand can have local operations with distinct authority and priorities. Current employment conditions and legal requirements must be checked with up-to-date, jurisdiction-specific sources. NAICS codes are stable reference labels for the 2022 edition, not a real-time description of every organization's portfolio or current hiring plans.",
        ],
        "roleRows": [
            ["Chief executive or country leader", "Sets the mandate and aligns commercial, operating, and stakeholder priorities.", "Show business model, geography, revenue responsibility, and decision rights."],
            ["Chief technology or engineering leader", "Leads the technology remit specified by the organization, from enterprise systems to customer-facing platforms.", "Clarify architecture, reliability, security, teams, and product versus internal-systems scope."],
            ["Chief product or digital leader", "Connects customer needs, product direction, delivery, and business outcomes.", "Describe product ownership, discovery, prioritization, adoption evidence, and team relationships."],
            ["Content or media executive", "Leads content, rights, production, editorial, or distribution responsibilities as assigned.", "Distinguish creative direction from commercial, operational, and editorial accountability."],
            ["Commercial or customer executive", "Leads sales, marketing, partnerships, subscriptions, or customer operations.", "State channel, customer type, lifecycle, and the evidence behind claimed growth."],
        ],
        "scenario": [
            "A transition from subscription publishing to product leadership in data hosting may draw on digital product experience while requiring deeper understanding of enterprise reliability, infrastructure, and data services.",
            "The candidate would compare the employer's actual NAICS activity with its product offering, map the target responsibilities against their evidence, and identify skills to learn or validate. A useful conversation would clarify whether product owns technical operations, how customer outcomes are measured, and what security or resilience responsibilities sit with the role.",
        ],
        "marketRows": [
            ["United States", "Distinguish content, communications, software, and hosting activities.", "Verify establishment activity, product scope, customer type, and the role's technical or commercial authority."],
            ["Canada", "Compare the employer's content or connectivity operations with the specific target remit.", "Check the actual employing entity, coverage, applicable policy or licensing, and role requirements."],
            ["United Kingdom", "Separate media, telecommunications, and information-service activities in target research.", "Confirm service footprint, employer entity, content or network obligations, and work eligibility."],
            ["UAE", "Determine whether the role leads a local service, a regional hub, or cross-border operations.", "Verify employer structure, customer footprint, technology remit, and local employment requirements."],
            ["Saudi Arabia", "Assess the employer's actual digital, media, or connectivity activity and decision authority.", "Confirm the local entity, operating scope, current requirements, and any sector-specific obligations."],
            ["Australia", "Map the role to the organization's actual information activity and customer base.", "Check service scope, local operating requirements, location, and evidence date for market claims."],
        ],
        "faqs": [
            ["What kinds of businesses are included in NAICS 51?", "The sector includes several information-related activities, organized into subsectors and more detailed industry codes. Use the official code and title rather than a broad 'tech' label."],
            ["Is a software company always classified in NAICS 51?", "No. Classification depends on the establishment's primary economic activity and the applicable 2022 NAICS rules; do not infer a code from a product description alone."],
            ["How many NAICS 51 industries are in this directory?", "The official 2022 structure workbook contains 24 five-digit industries and 29 six-digit U.S. national industries under code 51."],
            ["Can media leadership experience transfer into technology?", "It may, but explain the specific responsibilities and evidence that transfer. Content, platform, infrastructure, customer, and risk mandates are not automatically equivalent."],
            ["Does the sector table show digital hiring demand?", "No. It provides classification codes and titles, not live vacancies or employment forecasts."],
            ["How should I describe a digital transformation?", "State the baseline, your decisions, the people or systems involved, your accountability, and supportable outcomes. Avoid broad claims that cannot be substantiated."],
        ],
        "related": [
            ["industries", "NAICS industry directory"],
            ["roles", "SOC occupation directory"],
            ["linkedin-optimization-executives", "LinkedIn Optimization for Executives"],
            ["executive-job-search-london", "Executive Job Search in London"],
        ],
    },
    "health-care-and-social-assistance": {
        "category": "industries",
        "title": "Health Care and Social Assistance Industry Directory (NAICS 62) | KOV",
        "description": "Browse the complete 2022 NAICS 62 hierarchy for Health Care and Social Assistance, including official industry and U.S. national industry codes.",
        "summary": "NAICS 62 groups establishments providing health care and social assistance. This page includes all official 2022 hierarchy records under sector 62.",
        "heading": "Health and social care leadership works across complex systems.",
        "lead": "Use the verified NAICS 62 hierarchy to distinguish care settings, service models, and related business activities.",
        "introduction": "The official directory below follows the 2022 NAICS structure from sector 62 through subsectors, industry groups, five-digit industries, and six-digit U.S. national industries. It classifies establishments, not clinical professions or individual jobs.",
        "focus": [
            "Health Care and Social Assistance (NAICS 62) includes ambulatory health care services, hospitals, nursing and residential care facilities, and social assistance. The activities differ in how services are delivered, how organizations are structured, and which professionals, communities, or institutions they serve. Classification gives a common language for describing establishment activity, but the code alone cannot tell a reader whether a provider is public, private, nonprofit, large, small, or integrated with other services.",
            "Senior leadership in this sector can involve a broad set of operational and professional considerations: service access, workforce capacity, quality, safety, finance, technology, facilities, patient or client experience, and governance. The exact accountability depends on the organization and job. A clinical leader may have professional responsibilities not held by a general operations executive; a social assistance organization may have a different delivery model from a hospital or outpatient group. Candidates must state their remit accurately.",
            "Hiring for leadership roles may be shaped by a specific organizational challenge, such as improving access, coordinating services, stabilizing operations, upgrading systems, or strengthening governance. These are common mandate questions, not claims about current vacancies. A candidate should be ready to explain the conditions under which their experience was gained, what constraints applied, and what outcomes they personally influenced. Where outcomes depend on care teams or external funding, attribute contributions carefully.",
            "Career transitions between health settings can be valuable but require context. Experience in a single-site clinical environment may not directly demonstrate leadership across a multi-site network; a social service executive may bring strong community delivery experience but need to show how it maps to a regulated clinical organization. Senior professionals should identify transferable capabilities and make non-transferable credentials or experience gaps visible early.",
            "For international moves, confirm how the role is classified by the employer, what professional registration or authorization is required, and whether the role is clinical, operational, corporate, or advisory. Requirements vary by jurisdiction and profession, so rely on the relevant official regulator and qualified advisers. This directory is a NAICS reference only and does not provide clinical, licensing, legal, or employment advice.",
        ],
        "roleRows": [
            ["Chief executive or system leader", "Sets organizational direction, governance, service priorities, and executive accountability.", "State organization type, sites or programs, population served, and board or ownership relationship."],
            ["Chief operating officer", "Coordinates service operations, access, workforce, facilities, and cross-functional delivery.", "Describe operating scale and distinguish direct authority from clinical governance."],
            ["Chief medical or nursing leader", "Leads professional practice and clinical responsibilities as defined by the organization.", "Identify current registration and professional scope; do not imply credentials you do not hold."],
            ["Chief financial or transformation leader", "Leads financial stewardship, planning, transformation, or enabling functions.", "Connect financial and operating choices to service constraints and verified outcomes."],
            ["Social assistance executive", "Leads programs and support services aligned to the organization's mandate.", "Explain the population and service model, funding context, partnerships, and safeguarding remit."],
        ],
        "scenario": [
            "A transition from community-care operations to a regional hospital role requires a clear distinction between operational leadership and clinical authority.",
            "A careful search would establish whether the target role is operational or clinical, identify the sites and services within scope, and compare the candidate's operating evidence with the actual requirements. The candidate would not represent clinical authority they do not have; instead, they would show how they partner with licensed professionals and manage operational decisions responsibly.",
        ],
        "marketRows": [
            ["United States", "Separate provider type and service setting from the executive role's true remit.", "Verify facility or program scope, professional licensing, employer requirements, and current official data."],
            ["Canada", "Check the relevant province or territory and the care setting before comparing roles.", "Confirm registration, employer entity, service model, and whether scope crosses jurisdictions."],
            ["United Kingdom", "Distinguish the organization type, service, and professional responsibilities.", "Check the relevant regulator, registration needs, role accountability, and employer's current requirements."],
            ["UAE", "Identify the local health authority and the employing provider or service organization.", "Verify professional licensing, facility type, service scope, and work authorization with official sources."],
            ["Saudi Arabia", "Clarify the service setting, employer entity, and whether the role carries clinical responsibilities.", "Confirm credential recognition, current regulator requirements, and the employer's role specification."],
            ["Australia", "Determine state or territory requirements and the organization's care or support model.", "Verify registration, service scope, location, and evidence date before relying on market information."],
        ],
        "faqs": [
            ["What activities does NAICS 62 cover?", "The sector covers health care and social assistance establishments, organized under four subsectors and increasingly specific industry codes in the official 2022 structure."],
            ["Does NAICS 62 identify clinical occupations?", "No. NAICS classifies establishments; SOC classifies occupations. A sector code does not establish a worker's profession or registration."],
            ["How many NAICS 62 industries are included?", "The Census 2022 workbook lists 30 five-digit industries and 39 six-digit U.S. national industries under sector 62."],
            ["Can a hospital operations leader move into social assistance?", "Potentially, if the candidate can explain which operating, workforce, and governance capabilities transfer and how the service context differs."],
            ["Does this directory provide licensing advice?", "No. Registration and licensing requirements are jurisdiction- and profession-specific and should be checked with the relevant official regulator."],
            ["Are market hiring levels compared here?", "No. The market table is a structured checklist for research and does not claim current vacancy or demand levels."],
        ],
        "related": [
            ["industries", "NAICS industry directory"],
            ["roles", "SOC occupation directory"],
            ["interview-coaching-executives", "Executive Interview Coaching"],
            ["executive-career-support-australia", "Executive Career Support in Australia"],
        ],
    },
    "management-occupations": {
        "category": "roles",
        "title": "Management Occupations: SOC 2018 Directory | KOV",
        "description": "Explore the complete SOC 2018 Management Occupations hierarchy, with all minor groups, broad occupations, detailed occupations, and official definitions.",
        "summary": "The SOC 2018 Management Occupations major group is 11-0000. This page reproduces its full official hierarchy and detailed occupation definitions.",
        "heading": "Management is a work family—not a single executive title.",
        "lead": "Explore every SOC 2018 occupation under Management Occupations, from major group 11-0000 to detailed definitions.",
        "introduction": "SOC 2018 classifies work performed. The directory below includes the Management Occupations major group and its official minor, broad, and detailed occupations, with BLS definitions where supplied.",
        "focus": [
            "Management Occupations (SOC 11-0000) is a broad occupational major group, not an executive-title directory. It includes top executives, operations specialties managers, managers in functions such as advertising, sales, and human resources, and other management occupations. The structure is useful for consistent occupational coding, but it does not impose a company-wide hierarchy or determine how a particular employer uses titles such as director, vice president, chief officer, or general manager.",
            "Senior roles within the major group can vary in their authority and breadth. One role may lead a whole organization; another may own a specialized function; another may coordinate a multi-location operation. To assess fit, compare the actual work: decisions made, resources controlled, teams led, reporting relationships, and accountability for outcomes. The SOC code helps name the occupational family, while the employer's description and the candidate's evidence establish the particular remit.",
            "A credible management career story shows progression in responsibility rather than relying on title sequence. Explain what changed as the scope grew: the size and composition of teams, budget or operating responsibility, complexity of stakeholders, level of governance, and degree of independent decision-making. Where a role was advisory or project-based rather than line management, say so directly. Accurate distinctions make experience easier to compare and avoid overstating people or operational responsibility.",
            "Transitions between functional management roles are strongest when the candidate can show both transferable leadership practice and relevant domain knowledge. A general manager moving into a specialized function may need evidence of functional judgment; a specialist manager moving toward an enterprise role may need examples of broader integration, trade-offs, and executive governance. The detailed SOC definitions in this page can help identify adjacent occupational concepts, but a code match alone is not a qualification or selection decision.",
            "Search preparation should begin with mandate and environment. Candidates can ask what the role is expected to change, which decisions it owns, how performance is evaluated, and where authority sits relative to the board, CEO, or functional leaders. Confidentiality is important when describing sensitive organizational changes. Use only verifiable evidence, distinguish individual contributions from team outcomes, and do not claim a reporting line or level of authority that the role did not have.",
        ],
        "roleRows": [
            ["Chief executive / managing director", "Leads overall organizational direction and executive coordination when that is the stated mandate.", "Explain board relationship, organization scale, strategy, operating accountability, and decision rights."],
            ["Chief operating officer / operations executive", "Coordinates operational functions and execution across the scope assigned.", "Show functions, locations, teams, performance measures, and authority boundaries."],
            ["Functional vice president / director", "Leads a defined function or business area; scope varies by employer.", "Describe functional ownership, reporting line, resources, and cross-functional influence."],
            ["General manager / business-unit leader", "Leads a unit or operating area, often combining multiple responsibilities.", "Clarify P&L or budget remit, services/products, customers, and size of operation."],
            ["People or commercial executive", "Leads an assigned people, sales, marketing, or other management function.", "Distinguish functional strategy from execution and support claims with attributable evidence."],
        ],
        "scenario": [
            "A move from regional managing director to COO depends on whether the target role owns enterprise operations, coordinates functions under a CEO, or leads a defined business area.",
            "The candidate would compare the official SOC hierarchy with the target job's duties, then prepare evidence about decision authority, teams, operating scale, board interaction, and results. Before proceeding, they would clarify what the CEO retains, which functions report to the COO, and how success is measured. This avoids treating similar titles as interchangeable.",
        ],
        "marketRows": [
            ["United States", "Compare duties and employer scope; titles alone are not standardized across companies.", "Verify reporting line, organization scale, decision rights, and any occupation or industry data's reference year."],
            ["Canada", "Separate enterprise title from province-specific responsibilities or regulated duties.", "Confirm employer mandate, location, reporting relationship, and evidence of equivalent operating scope."],
            ["United Kingdom", "Check how the employer defines the executive role and governance relationship.", "Verify legal entity, board interaction, role duties, and current employment authorization."],
            ["UAE", "Establish whether a title covers a local business, regional unit, or wider group.", "Confirm employing entity, decision authority, location, and operational remit."],
            ["Saudi Arabia", "Compare the stated role mandate with the actual organization and reporting structure.", "Verify legal employer, functional scope, work authorization, and current requirements."],
            ["Australia", "Test title equivalence against duties, organization size, and governance.", "Confirm location, operating scope, reporting relationships, and current employer criteria."],
        ],
        "faqs": [
            ["Does SOC 11-0000 mean C-suite executive?", "No. The major group covers many management occupations at different levels. The detailed work and employer mandate determine the role's actual scope."],
            ["How many detailed management occupations are in SOC 2018?", "The verified BLS structure workbook contains 38 detailed occupations under major group 11-0000."],
            ["Are vice president and director titles SOC codes?", "No. They are employer titles that can describe different duties and seniority. SOC codes classify occupations by work performed."],
            ["Can operations leaders move into CEO roles?", "It depends on evidence of enterprise-level leadership, governance, strategy, and accountability relative to the target mandate."],
            ["Does this page rank management roles by seniority?", "No. It reproduces the official occupational hierarchy and provides career-planning context; it is not a ranking."],
            ["Can KOV guarantee an executive interview?", "No. KOV can discuss agreed candidate-side support, but employers control interview invitations and hiring decisions."],
        ],
        "related": [
            ["roles", "SOC occupation directory"],
            ["industries", "NAICS industry directory"],
            ["reverse-recruiting-ceos", "Private Career Representation for CEOs"],
            ["career-representation-coos", "Career Representation for COOs"],
            ["executive-job-search-vps", "Executive Job Search Support for VPs"],
            ["career-strategy-senior-leaders", "Career Strategy for Senior Leaders"],
        ],
    },
    "legal-occupations": {
        "category": "roles",
        "title": "Legal Occupations: SOC 2018 Directory | KOV",
        "description": "Browse every SOC 2018 Legal Occupations code and detailed definition, including minor groups, broad occupations, and detailed occupations.",
        "summary": "The SOC 2018 Legal Occupations major group is 23-0000. The page reproduces its official hierarchy and detailed occupation definitions.",
        "heading": "Legal leadership depends on jurisdiction, mandate, and judgment.",
        "lead": "Use the official SOC 2018 hierarchy to understand the occupational family and distinguish its detailed legal roles.",
        "introduction": "The directory includes major group 23-0000 and every minor, broad, and detailed occupation within Legal Occupations, with official BLS definitions for detailed occupations.",
        "focus": [
            "Legal Occupations (SOC 23-0000) includes lawyers and judges, legal support occupations, and other roles identified in the 2018 SOC structure. It is an occupational classification, not a statement that every person in the group is authorized to practice law in every jurisdiction. The detailed definitions clarify the work category; professional admission, licensing, and permitted scope must be confirmed with the relevant regulator and employer.",
            "Senior legal roles can be organized around advice, transactions, disputes, governance, compliance, public service, or legal operations. The title General Counsel is not itself a SOC code and can carry different authority across employers. A candidate's experience should clarify whether they advised, decided, managed external counsel, led a department, appeared in court, negotiated transactions, or held a formal officer role. Those distinctions help employers understand both capability and limits.",
            "A legal executive's leadership story should make the jurisdiction, subject matter, and organizational context legible without revealing privileged or confidential information. Describe the kinds of matters handled at a high level, the decision process, the stakeholder relationships, and the governance contribution. Do not disclose client identity or sensitive legal advice. Where outcomes were shared with a team, describe the individual responsibility precisely rather than claiming a result on behalf of the whole organization.",
            "Transitions can cross private practice, in-house work, government, and legal-support functions, but they involve distinct duties and qualification requirements. A strong move rationale identifies transferable judgment and stakeholder skills while addressing the new role's jurisdiction, admission, subject-matter, or public-service requirements. SOC's hierarchy can aid comparison, but does not certify equivalence, professional standing, or eligibility to practice.",
            "For a cross-border search, verify where the work will be performed, which entity the role supports, the governing jurisdiction, and whether admission or another authorization is required. Titles, professional qualifications, and reserved activities differ between countries. Use official professional bodies or regulators and qualified legal advisers for those questions. KOV's role is candidate-side career support and positioning, not legal advice or recruitment on behalf of an employer.",
        ],
        "roleRows": [
            ["General Counsel", "Leads the legal function and advises organizational leadership within the defined authority.", "State jurisdictions, team scope, governance role, and what responsibilities remain with outside counsel."],
            ["Chief legal officer", "May combine legal leadership with broader governance or executive responsibilities.", "Specify board access, officer status, reporting line, and the exact enterprise remit."],
            ["Deputy or associate general counsel", "Leads a portfolio or supports the head of legal across assigned matters.", "Identify subject areas, team leadership, decision authority, and escalation responsibilities."],
            ["Legal operations executive", "Leads processes, systems, resourcing, or service delivery for a legal function.", "Quantify the scope responsibly and clarify whether the role includes practicing-law duties."],
            ["Public-sector legal leader", "Provides legal leadership in a government or public institution context.", "Describe statutory remit, jurisdiction, appointment requirements, and public accountability."],
        ],
        "scenario": [
            "A move from regional legal leadership in technology to a financial-services General Counsel role may add board governance, regulatory engagement, and a different jurisdictional footprint.",
            "Preparation would compare the target's written responsibilities, employing entity, jurisdictions, board expectations, and professional requirements. The candidate would identify relevant experience, distinguish direct accountability from advisory support, and flag gaps transparently. Any discussion of prior matters would avoid privileged facts and confidential client or employer information.",
        ],
        "marketRows": [
            ["United States", "Check state admissions and whether the role covers one or multiple jurisdictions.", "Verify active credentials, employer entity, practice scope, and any role-specific admission requirement."],
            ["Canada", "Confirm provincial or territorial law-society requirements and the role's practice scope.", "Check credential recognition, employer expectations, and permitted activities."],
            ["United Kingdom", "Determine the relevant legal qualification, regulator, and work type.", "Verify admission, reserved activities, employer structure, and jurisdiction served."],
            ["UAE", "Clarify whether the role supports local-law, common-law-centre, or cross-border work.", "Confirm applicable professional requirements, employing entity, and role's permitted legal activities."],
            ["Saudi Arabia", "Identify the governing legal setting and any local registration or qualification needs.", "Verify requirements through official professional and government sources and seek qualified advice."],
            ["Australia", "Check state or territory admission requirements and the work performed.", "Confirm admission status, recognition pathway if relevant, employer jurisdiction, and role scope."],
        ],
        "faqs": [
            ["Does SOC 23-0000 mean everyone is a lawyer?", "No. The major group includes several legal occupations, including legal support work. Use the detailed official code and definition."],
            ["Does a General Counsel title establish bar admission?", "No. Verify the individual's admission and the target role's jurisdictional and practice requirements."],
            ["How many detailed occupations are listed under Legal Occupations?", "The BLS 2018 SOC workbook contains eight detailed occupations under major group 23-0000."],
            ["Can an in-house lawyer move between countries?", "Potentially, but professional admission, reserved activities, employer needs, and permitted scope must be independently verified."],
            ["Can I share examples of confidential matters in an interview?", "Use anonymized, non-privileged descriptions and follow applicable confidentiality duties; seek qualified legal advice if uncertain."],
            ["Does KOV provide legal career or licensing advice?", "KOV can help organize career positioning and search questions, but is not a substitute for legal, regulatory, or licensing advice."],
        ],
        "related": [
            ["roles", "SOC occupation directory"],
            ["industries", "NAICS industry directory"],
            ["executive-negotiation-support", "Executive Offer and Negotiation Support"],
            ["interview-coaching-executives", "Executive Interview Coaching"],
            ["executive-career-support-saudi-arabia", "Executive Career Support in Saudi Arabia"],
        ],
    },
    "business-and-financial-operations-occupations": {
        "category": "roles",
        "title": "Business and Financial Operations: SOC 2018 Directory | KOV",
        "description": "Explore the complete SOC 2018 Business and Financial Operations hierarchy, with all official detailed occupation definitions.",
        "summary": "The SOC 2018 Business and Financial Operations major group is 13-0000. This directory includes its complete minor, broad, and detailed hierarchy.",
        "heading": "Business and finance operations turn analysis into accountable decisions.",
        "lead": "Explore the official occupations in SOC 13-0000 and distinguish adjacent specialties by their actual work.",
        "introduction": "The directory below reproduces the 2018 SOC hierarchy for Business and Financial Operations, including all detailed occupations and BLS definitions.",
        "focus": [
            "Business and Financial Operations Occupations (SOC 13-0000) spans work such as finance, accounting, analysis, compliance, human resources, project management, procurement, and related organizational functions. The 2018 classification provides a structured way to distinguish the work; it does not determine an individual's seniority or how a company organizes its departments. The full hierarchy below allows readers to explore minor, broad, and detailed occupational concepts using official codes and definitions.",
            "Senior leaders in these functions commonly need to translate specialist knowledge into decisions that other executives can use. A finance leader may explain financial performance and trade-offs; a risk or compliance leader may clarify exposure and controls; an HR executive may align workforce strategy and operating needs; a procurement or project leader may coordinate resources and delivery. These examples are functional lenses, not a claim that every role carries the same duties.",
            "The strongest career evidence makes the scale and decision context visible. Describe what information or process you owned, who relied on it, how your analysis informed action, and which outcomes can be attributed to your work. For controls, compliance, finance, or people matters, maintain confidentiality and avoid implying that a process had a regulatory outcome unless that is documented and within your remit. Distinguish line leadership from advisory, specialist, and project contributions.",
            "Transitions between specialties are possible when the candidate can explain the bridge. A finance transformation leader moving toward enterprise operations should show cross-functional delivery and governance, not only system implementation. A compliance leader moving into broader risk leadership should demonstrate the risk domains and committee relationships actually covered. A project leader moving into a permanent business role should explain sustained accountability beyond a temporary initiative.",
            "The SOC labels can help a candidate choose clear language, but they should not be treated as job descriptions. Employers combine and rename functions, and a single title may cover different work in different organizations. Compare the target responsibilities, reporting relationships, systems, stakeholders, and measures of success. For international roles, verify local requirements and market context with current official sources; this directory itself does not measure employment demand.",
        ],
        "roleRows": [
            ["Chief financial officer / finance director", "Leads planning, reporting, financial stewardship, and decision support within the role's mandate.", "Clarify organization scale, finance team, decision rights, and regulated versus corporate context."],
            ["Chief human resources officer", "Leads the people function and workforce-related priorities assigned by the employer.", "Explain population, operating model, labor context, people systems, and governance boundaries."],
            ["Chief compliance or risk executive", "Oversees defined compliance or risk responsibilities and related governance.", "Name the covered domains, reporting relationships, and direct accountability."],
            ["Chief procurement or supply-chain executive", "Leads purchasing, supplier strategy, or related operational functions as scoped.", "Show category and spend scope only where disclosable; detail risk, supplier, and team remit."],
            ["Chief transformation or program leader", "Coordinates cross-functional initiatives and change governance.", "Distinguish sponsorship, delivery ownership, budget authority, and measurable contribution."],
        ],
        "scenario": [
            "A transition from finance transformation in retail to enterprise operations in health services can extend beyond systems and process change to ongoing service delivery and workforce accountability.",
            "The candidate would map the target remit against the SOC definitions and the employer's job description, then separate transformation achievements from recurring operational ownership. They would prepare evidence of stakeholder decisions, controls, adoption, and outcomes, while identifying areas where the new sector's requirements need further research.",
        ],
        "marketRows": [
            ["United States", "Check how the employer separates corporate finance, compliance, HR, and operations.", "Verify role scope, applicable licenses or credentials, entity, and the age of any labor-market evidence."],
            ["Canada", "Confirm jurisdiction where employment rules or professional requirements vary.", "Check provincial context, employer entity, credential expectations, and the actual reporting line."],
            ["United Kingdom", "Compare functional accountability and governance requirements in the target employer.", "Verify role duties, professional expectations, location, and current employer requirements."],
            ["UAE", "Clarify local versus regional scope and the role's relationship to the legal employing entity.", "Check functional remit, work authorization, reporting structure, and current regulatory context."],
            ["Saudi Arabia", "Test how the target organization defines the function and decision authority.", "Verify employer entity, local requirements, role scope, and current official market information."],
            ["Australia", "Compare the target function's scope and the employer's operating context.", "Confirm state or territory, role requirements, location, and the date/source of market data."],
        ],
        "faqs": [
            ["What does SOC 13-0000 cover?", "It is the major group for Business and Financial Operations occupations, with the official hierarchy listed in this directory."],
            ["Does the group include only accountants?", "No. It contains several business and financial specialties. Consult the official code and definition for the precise occupation."],
            ["How many detailed occupations are included?", "The verified BLS structure and definitions workbooks list 35 detailed occupations under SOC 13-0000."],
            ["Can a finance leader move into broader operations?", "Potentially, if they can show sustained operating scope, cross-functional decisions, and outcomes beyond financial analysis."],
            ["Are these codes job titles?", "They are occupational classifications, not a guarantee that an employer uses that exact title or combines duties the same way."],
            ["Does KOV represent employers hiring these roles?", "No. KOV provides candidate-side services to professionals; employers make their own hiring decisions."],
        ],
        "related": [
            ["roles", "SOC occupation directory"],
            ["industries", "NAICS industry directory"],
            ["executive-resume-strategy", "Executive Resume Strategy"],
            ["executive-negotiation-support", "Executive Offer and Negotiation Support"],
            ["executive-job-search-uae", "Executive Job Search Support in the UAE"],
        ],
    },
    "computer-and-mathematical-occupations": {
        "category": "roles",
        "title": "Computer and Mathematical Occupations: SOC 2018 Directory | KOV",
        "description": "Browse all SOC 2018 Computer and Mathematical occupation codes and official detailed definitions in the complete 15-0000 hierarchy.",
        "summary": "The SOC 2018 Computer and Mathematical Occupations major group is 15-0000. This page reproduces all official levels and detailed definitions.",
        "heading": "Technology leadership requires clarity about the work behind the title.",
        "lead": "Use SOC 2018 major group 15-0000 to explore computer and mathematical occupations and their official distinctions.",
        "introduction": "The directory includes every minor, broad, and detailed occupation under Computer and Mathematical Occupations, with official BLS definitions for detailed occupations.",
        "focus": [
            "Computer and Mathematical Occupations (SOC 15-0000) includes computer and information research, software development, data and mathematical work, systems analysis, security, network and systems administration, and related technical occupations. The official hierarchy separates occupational concepts by work performed, not by technology brand, employer industry, or seniority. A code cannot tell a reader whether a role is an individual contributor, a people manager, or an executive; the specific responsibilities and reporting relationships must be examined.",
            "Senior technology titles are particularly variable. A CTO may lead product engineering, enterprise technology, research, security, or a combination; a CIO may focus on internal systems or data; a chief data officer may hold governance, analytics, or platform responsibilities. Those titles are not SOC categories by themselves. Candidates should specify whether they owned architecture, delivery, reliability, security, product direction, internal platforms, or technical strategy, and show how their authority related to the rest of the organization.",
            "Strong technical leadership evidence connects technical decisions with organizational context. Describe the problem, constraints, architecture or method at a level that can be shared, the teams and stakeholders involved, and the trade-offs made. Explain reliability, security, data quality, customer, or cost outcomes only when the evidence is accurate and disclosable. Avoid describing a team result as an individual achievement or claiming broad transformation without stating what was actually changed.",
            "Career transitions across technical specialties depend on scope and fundamentals. A software leader moving toward data infrastructure may need evidence of platform reliability and governance; a security executive moving into enterprise technology should explain broader operating responsibilities; a researcher moving into product leadership should show how research translated into a roadmap or user outcome. The detailed definitions can guide role comparisons, while the target employer's systems, scale, and risk profile determine the actual fit.",
            "International role research should distinguish a global remit from local employment and authority. Confirm the legal entity, reporting line, customer or internal user base, security obligations, and expected operating hours or location. Requirements and labor-market conditions change; use current official sources for each market and avoid treating the SOC hierarchy as a forecast. This page is a classification resource and candidate-career guide, not a technical audit or hiring-demand report.",
        ],
        "roleRows": [
            ["Chief technology officer", "Leads the technology remit defined by the organization, potentially spanning product, engineering, or platforms.", "Clarify customer-facing versus internal scope, architecture, delivery, security, and executive authority."],
            ["Chief information officer", "Leads information technology, systems, and digital capabilities assigned by the employer.", "Describe enterprise systems, service delivery, data, resilience, and governance scope."],
            ["Chief information security officer", "Leads information-security governance and response within the stated remit.", "Specify risk ownership, reporting, controls, incident responsibilities, and team scope."],
            ["Chief data or analytics executive", "Leads data strategy, governance, analytics, or platforms as defined by the organization.", "Distinguish data stewardship from analytics delivery and describe the authority held."],
            ["Engineering or product executive", "Leads technical teams and product or engineering delivery in the employer's operating model.", "Show product lifecycle, team scale, delivery practices, and measurable customer or business evidence."],
        ],
        "scenario": [
            "A move from enterprise CIO in manufacturing to CTO in a software company may require direct product-engineering and customer-platform leadership in addition to large-scale systems, security governance, and vendor management.",
            "Preparation would compare the detailed SOC concepts with the job's actual responsibilities, map the candidate's technical and executive evidence, and identify gaps in product ownership or engineering delivery. The candidate would ask how architecture decisions are made, who owns security and reliability, and what the CTO can decide independently.",
        ],
        "marketRows": [
            ["United States", "Separate software, infrastructure, data, security, and internal IT mandates.", "Verify employer activity, product scope, technical authority, location, and current role criteria."],
            ["Canada", "Check whether the role leads a local team, a national platform, or a distributed function.", "Confirm employer entity, team location, security requirements, and work eligibility."],
            ["United Kingdom", "Compare product engineering and enterprise technology responsibilities explicitly.", "Verify customer or internal scope, governance expectations, location, and current data source."],
            ["UAE", "Establish whether the remit is local, regional, or group-wide and how it is staffed.", "Check entity, decision rights, platform and security scope, and location or authorization constraints."],
            ["Saudi Arabia", "Assess the target's actual technology mandate and leadership authority.", "Verify local employer, technical remit, current role requirements, and work authorization."],
            ["Australia", "Distinguish technical leadership from engineering management or enterprise IT.", "Confirm team and platform scope, location, current employer requirements, and data reference period."],
        ],
        "faqs": [
            ["Does SOC 15-0000 mean executive technology roles?", "No. It is a major occupational group covering technical work at different levels. Executive titles require separate analysis of duties and authority."],
            ["How many detailed occupations are in Computer and Mathematical Occupations?", "The verified BLS 2018 SOC workbooks contain 21 detailed occupations under major group 15-0000."],
            ["Are CTO, CIO, and CISO SOC codes?", "No. They are employer titles. The appropriate occupational classification depends on the work actually performed."],
            ["Can an enterprise CIO move into a software-company CTO role?", "Potentially, if their experience supports the target's product, engineering, platform, security, and leadership requirements."],
            ["Does this directory report current technology demand?", "No. It provides official classification codes and definitions, not live vacancies or a demand forecast."],
            ["How can I describe technical outcomes confidentially?", "Use non-sensitive context and approved metrics, distinguish your decisions from team outcomes, and avoid exposing proprietary architecture or incident details."],
        ],
        "related": [
            ["roles", "SOC occupation directory"],
            ["industries", "NAICS industry directory"],
            ["reverse-recruiting-ctos", "Private Career Representation for CTOs"],
            ["executive-resume-strategy", "Executive Resume Strategy"],
            ["executive-job-search-dubai", "Executive Job Search Support in Dubai"],
        ],
    },
}

LONGFORM_EXTRA: dict[str, list[str]] = {
    "professional-scientific-and-technical-services": [
        "The sector also includes organizations with different talent and governance models: sole or small practices, partner-led firms, project consultancies, research establishments, and larger networks. A senior candidate should identify how the target earns or funds its work, whether client relationships belong to an individual or a firm, and how quality is reviewed. These distinctions affect the meaning of business development, utilization, practice leadership, and succession. They should be researched for the specific organization rather than assumed from the NAICS code.",
        "Technology and automation can change how a professional service is delivered, but a claim about innovation should identify the underlying work. Explain whether you selected systems, changed a process, led a product or service, improved review and quality, or simply used a tool within a team. For advisory or research work, describe methods and decision influence without disclosing confidential client material. Employers need to understand both the expertise involved and the candidate's accountability for implementing or governing it.",
        "Some senior professionals consider moving into a board, advisory, or independent consulting portfolio. Those paths involve different expectations for independence, conflicts, time commitment, fiduciary obligations, and business development. They should not be presented as automatic next steps from practice leadership. A candidate considering one should examine the appointment or engagement terms, the organization’s governance, and any professional duties that continue to apply.",
    ],
    "finance-and-insurance": [
        "The sector includes both institutions that hold or intermediate financial assets and organizations that support financial activity, as well as insurance businesses and investment vehicles. The exact boundaries matter when a role description refers to balance-sheet accountability, product governance, customer suitability, underwriting, or portfolio oversight. Candidates should identify the legal entity and the business line they served. Where an organization has multiple regulated subsidiaries, explain which one employed the candidate and where their authority began and ended.",
        "Data, technology, and operational resilience are increasingly visible in financial leadership discussions, but candidates should not use these themes as generic claims. Specify the system or process, business owners, risks addressed, and the candidate's role in approving or delivering the change. If an initiative involved third-party providers or shared services, distinguish governance and oversight from direct engineering or operational ownership. This precision supports credible conversations with boards, regulators, and hiring leaders.",
        "Financial achievements need careful attribution. Revenue, investment returns, loss reduction, customer acquisition, and capital outcomes may depend on markets, teams, and external conditions. A candidate can describe decisions, controls, and contribution without claiming sole causation. When using metrics, preserve context and confidentiality and be ready to explain the measurement period. This is especially important when a transition crosses asset classes, financial products, or regulated entities.",
    ],
    "information": [
        "The Information sector is not synonymous with the entire technology economy. Establishment classification follows defined economic activity, while product portfolios and modern business models can span classifications. A company may offer software, content, advertising, connectivity, or data services from different entities. For a senior search, map the target's real business and customer proposition, then describe the role against that operating context. If the public NAICS code is not known, state the uncertainty rather than assigning one from a brand description.",
        "Leadership evidence in this environment benefits from clear product and operational boundaries. State whether you were accountable for discovery, roadmaps, editorial or rights decisions, service availability, network performance, customer operations, or internal systems. Explain key dependencies and decision forums. A digital product may connect several functions without giving one leader authority over all of them, so describe collaboration and escalation honestly rather than implying complete ownership.",
        "Cross-border work can introduce distinct issues around content rights, privacy, security, infrastructure location, communications permissions, or service availability. Not every role is responsible for those matters, and requirements vary by activity and jurisdiction. Candidates should identify which responsibilities they held and which belonged to legal, security, or regulatory teams. For a target role, check current official requirements and the employer's own disclosures before presenting a market or compliance claim.",
    ],
    "health-care-and-social-assistance": [
        "The classification combines establishments with different service and funding arrangements. A hospital, outpatient practice, residential facility, and community assistance provider can have different governance, professional roles, capital needs, and measures of service. An executive comparing them should identify who receives the service, how it is delivered, which entities control it, and which external bodies influence requirements. The NAICS hierarchy helps name the establishment category, while organization-specific research reveals how the service operates.",
        "Workforce planning, capacity, and service continuity are recurring leadership questions in care and support settings, but candidates should anchor any example in a specific mandate. Explain the baseline, constraints, decisions, and contribution of multidisciplinary partners. Quality or safety statements require particular care: describe the governance process and evidence accurately, and do not imply clinical authority if the role was operational or administrative. Confidential patient, client, employee, and provider information must remain protected.",
        "Technology change can affect scheduling, records, care coordination, analytics, and service access. An executive who led a digital program should clarify their relationship to clinicians, service users, privacy teams, vendors, and operational owners. A transformation result is stronger when it describes implementation and adoption as well as system selection. If outcome evidence is sensitive or not independently attributable, present the process and scope without overstating a clinical or social result.",
    ],
    "management-occupations": [
        "Management is a mode of work rather than a single level in every employer's structure. Some managers direct people and budgets; others manage projects, programs, or a functional specialty. A senior title may involve strategy and governance without direct reports, while a general manager may carry extensive operational responsibility. The SOC definitions provide occupational distinctions, but they do not impose a universal career ladder. Compare duties and the organizational context before inferring equivalence.",
        "When preparing for a senior transition, build an evidence inventory around decisions and scope. Record the teams and functions involved, the decisions made independently, the decisions escalated, the resources controlled, and the outcomes that can be supported. Separate formal authority from influence, and indicate whether a result was achieved personally or collectively. This makes the difference between enterprise leadership, functional leadership, and project contribution clear without inflating a title.",
        "Confidential searches for senior management roles can require careful communication about current employers, board relationships, and succession plans. Establish exclusions and approval boundaries before outreach. A candidate should not imply that an employer has approved a transition or disclose sensitive organizational plans. The right process preserves the candidate's control of disclosures while keeping the career narrative specific enough for a potential employer to assess.",
    ],
    "legal-occupations": [
        "Legal leadership combines professional judgment with organizational governance, but the balance differs by employer. Some general counsel roles are focused on advice and risk; others include company-secretary, compliance, government-relations, or broader executive duties. A job title does not establish board membership, officer status, or authority over every legal matter. Candidates should define the reporting relationship, decision rights, jurisdictions served, and use of external counsel, then compare that scope with the target position.",
        "The distinction between practicing law and leading a legal operation is important in cross-functional or international transitions. A legal operations leader may manage systems, budgets, outside counsel, and service design without holding the same professional duties as an admitted lawyer. Conversely, an experienced lawyer may need to demonstrate team leadership and commercial judgment for an executive role. The SOC hierarchy identifies occupational categories but does not determine admission or reserved activities.",
        "Interview examples should protect privilege and confidentiality. Candidates can explain the nature of a challenge, their process for assessing risk, how they advised decision-makers, and the general outcome without naming parties or revealing legal advice. If an example cannot be discussed safely, choose another. For any uncertainty about disclosure obligations, professional duties, or admission, consult a qualified lawyer or regulator rather than treating career guidance as legal advice.",
    ],
    "business-and-financial-operations-occupations": [
        "The major group includes both analytical specialties and operational disciplines. A senior function may be responsible for interpreting information, setting policies, managing controls, or executing services. These are distinct contributions even where the same employer combines them under one department. Candidates should identify the main decisions the role enables, who owns the resulting action, and whether the candidate advises, approves, or operates the process.",
        "Enterprise leadership in finance, human resources, compliance, procurement, and project delivery often depends on influence across functions. Evidence should describe how the candidate aligned stakeholders, handled competing priorities, and established accountability. Where data or measurement was used, define the baseline and period. Avoid implying a causal outcome when many teams or external conditions contributed. The detailed SOC definitions can help frame the occupational language, but an employer's specific remit remains decisive.",
        "Some transitions move from a specialist role into a broader executive remit. That step usually requires evidence beyond technical knowledge: resource decisions, governance, communication with senior stakeholders, team leadership, and responsibility after a recommendation was made. Candidates can use examples of sustained ownership, not only one-off projects, to show readiness. If a target role adds regulated, professional, or jurisdiction-specific responsibilities, identify those requirements early and verify them independently.",
    ],
    "computer-and-mathematical-occupations": [
        "Technical occupations span research, software, systems, security, data, networks, and mathematical work. The detailed SOC hierarchy distinguishes these types of work but does not encode architecture choices, programming languages, operating scale, or management level. A career profile should therefore connect the code to the work: systems built or governed, users served, risk handled, team structure, and the decisions for which the candidate was accountable.",
        "Executive technology roles also differ in how close they are to product delivery, enterprise IT, infrastructure, data, or security governance. A candidate should describe the technical and organizational boundary of their remit and how it related to peers in product, operations, finance, risk, and commercial functions. State what you directly owned and what you influenced. This avoids a common mismatch in which one executive title is assumed to carry the same technical authority across organizations.",
        "Security, privacy, and resilience examples can be sensitive. Discuss the governance, decision process, and high-level result without exposing exploitable system detail, confidential incidents, or proprietary architecture. If a metric is used, explain the scope and period without suggesting a guarantee of future performance. For an international search, confirm the target's regulatory and operational expectations with current official sources and the employer, rather than relying on a general SOC label.",
    ],
}

LONGFORM_FINISHER: dict[str, str] = {
    "professional-scientific-and-technical-services": "In every comparison, keep the establishment classification separate from the professional's own occupation. A consulting firm can employ lawyers, analysts, engineers, software specialists, and executives at the same time; the NAICS code describes its business activity, not the whole workforce.",
    "finance-and-insurance": "A precise description also helps distinguish corporate finance experience from work inside a financial intermediary or insurer. State the entity, product, and control environment before drawing conclusions about transferability; avoid treating a familiar title as evidence of identical accountability. For senior searches, document who approved key decisions and how oversight worked, without disclosing restricted information.",
    "information": "Because services and products can cross conventional boundaries, record the source and date of any industry mapping. If a target's primary activity is unclear, keep the classification provisional and focus the career discussion on the role's actual products, customers, and operating responsibilities.",
    "health-care-and-social-assistance": "Keep establishment classification separate from profession and licensure. The same provider can employ clinicians, administrators, technology leaders, finance professionals, and social-service teams; the NAICS code does not describe each person's role or qualify anyone to deliver care. Use those distinctions when reviewing a target's role requirements.",
    "management-occupations": "Use the table of official definitions as a vocabulary aid, then return to the employer's actual duties. A carefully explained scope is more useful than claiming a code or title that implies authority the candidate did not hold.",
    "legal-occupations": "Classification must remain separate from professional status. SOC describes occupational work; it does not grant admission, verify good standing, authorize cross-border practice, or replace the rules of a court, bar, law society, or regulator. A precise account of jurisdiction and responsibility helps prevent readers from inferring a qualification that has not been established. Candidates should make those limits clear in public profiles and private discussions.",
    "business-and-financial-operations-occupations": "The definitions are reference material, not a substitute for the target employer's job description. Use both to identify overlap and difference, then support the candidate's fit with examples that can be verified and safely disclosed. Explain the decision context and where accountability sat, especially when functions were shared among several leaders. Be specific about the actual contribution.",
    "computer-and-mathematical-occupations": "Treat the SOC definition as an occupational reference, not as a technical specification. Validate the target's actual platform, team, scale, and accountability before equating two roles or presenting an experience match.",
}


HUB_CONTENT = {
    "industries": {
        "summary": "A guide to all 20 NAICS 2022 sectors and their classification hierarchy. NAICS classifies establishments; the directory is a reference, not a forecast of hiring demand.",
        "sections": [
            section(
                "READ THE CLASSIFICATION",
                "From sector to the specific activity of an establishment",
                [
                    "The North American Industry Classification System groups establishments by economic activity. Its hierarchy moves from sectors to subsectors, industry groups, and industry codes. The Census Bureau's 2022 structure workbook contains 20 sector headings, 96 subsectors, 308 industry groups, 689 five-digit NAICS industries, and 1,012 six-digit U.S. national industries. The five-digit and six-digit counts describe distinct levels; neither should be substituted for the other.",
                    "The workbook presents three sector ranges as grouped rows: Manufacturing (31-33), Retail Trade (44-45), and Transportation and Warehousing (48-49). Those are three rows in the structure file but represent nine two-digit sectors in the 20-sector total. The full official codes and titles are listed in the table above. A marker in the source title indicates trilateral agreement and is preserved as a note in this directory.",
                    "Classification is based on establishment activity, not simply the brand name, job title, or every product a company sells. A diversified organization may include establishments with different activities. When a code matters, check the official definitions and apply the classification rules to the establishment being described rather than inferring a code from a marketing label.",
                    "Use the hierarchy to narrow research. Start with a broad sector, identify the relevant subsector and industry group, then review both five-digit and six-digit codes where U.S. national detail matters. Parent codes help show how an activity fits into the larger structure. This supports consistent terminology in market research, resumes, and career conversations, but it does not measure how many employers or jobs exist in a category.",
                    "The current first-batch detail pages provide deeper directories for Professional, Scientific, and Technical Services; Finance and Insurance; Information; and Health Care and Social Assistance. Other sectors remain visible in the official top-level listing and will receive detail pages in subsequent verified batches. No missing sector URL is presented as live until its page has been built and checked.",
                ],
            ),
            section(
                "SENIOR LEADERSHIP LENS",
                "Compare the business mandate behind the sector label",
                [
                    "The following role families are a practical way to frame questions about decision scope and operating context; titles and reporting lines vary by employer and should be verified against the actual role."
                ],
                table={
                    "caption": "General career guidance — confirm each employer's remit",
                    "columns": ["Leadership lens", "Questions to compare"],
                    "rows": [
                        ["Enterprise executive", "What does the organization deliver, who does it serve, and which decisions sit with this executive?"],
                        ["Practice or business-unit leader", "Which services, locations, clients, or operating units are in scope?"],
                        ["Functional executive", "What function is led, how does it partner with other leaders, and what resources are controlled?"],
                        ["Technical or professional leader", "What qualifications, quality controls, or technical decisions are part of the role?"],
                    ],
                },
            ),
            section(
                "COMPARE SECTORS WITH CARE",
                "Industry context informs a career decision; it does not decide it",
                [
                    "A leadership title can conceal a different operating reality from one sector to another. Before comparing opportunities, document the employer's business model, customer or beneficiary, revenue or funding context, operating footprint, governance, and the actual role mandate. Then identify which parts of your experience transfer and what evidence a new audience will need.",
                    "Market comparisons should be treated as research questions rather than generic country rankings. Validate the employing entity, local requirements, work authorization, decision authority, and current employer facts using dated sources. The same sector code does not guarantee the same regulation, hiring process, compensation, or role scope across countries.",
                    "A useful career brief records the target role, industry codes where relevant, acceptable adjacent sectors, exclusions, location constraints, and evidence needed to support the move. This keeps the search specific while leaving room to recognize credible alternatives.",
                ],
                table=market_table([
                    ["United States", "Check whether the establishment uses five-digit NAICS or six-digit U.S. national detail.", "Verify the establishment and date before comparing employer activity or labor data."],
                    ["Canada", "The shared NAICS framework is used with national statistical products and local context.", "Confirm the applicable release, province, establishment, and data reference period."],
                    ["United Kingdom", "Do not assume NAICS labels map one-to-one to local industrial classifications.", "Use the appropriate official classification and confirm employer activity."],
                    ["UAE", "Industry labels may be broad; verify the legal entity and actual operating activity.", "Check local registration, employing entity, and target role scope."],
                    ["Saudi Arabia", "Separate sector language from the employer's registered activity and operating mandate.", "Confirm the relevant official data source, entity, and date."],
                    ["Australia", "Compare industry concepts carefully across classification systems.", "Verify the applicable Australian classification and establishment before mapping codes."],
                ]),
            ),
            section(
                "INDUSTRY TRANSITION STRATEGY",
                "Turning a broad industry interest into a testable target",
                [
                    "When considering a move from professional services into a technology-enabled health business, compare each employer's primary activity, customer group, delivery model, and the target role's actual responsibilities rather than relying on broad labels such as 'services' or 'technology'.",
                    "Build a focused brief around transferable leadership evidence, sector-specific knowledge to validate, and questions about the target entity and mandate. This gives research and outreach a practical basis without assuming that either sector is hiring.",
                ],
                scenario=True,
            ),
            section(
                "KOV AND INDUSTRY RESEARCH",
                "Use official classifications to make candidate-side search more precise",
                [
                    "KOV's Private Career Representation is a candidate-side service. Where included in an agreed scope, support can involve defining target employers and roles, researching relevant organizations, positioning verified experience, and coordinating client-approved applications or outreach. The professional retains approval and decision authority; employers make their own hiring decisions.",
                    "This directory does not represent any employer, list current vacancies, or promise an interview or placement. Engagement scope, deliverables, communication, and fees are discussed directly and agreed in writing before work begins. For regulated, legal, immigration, tax, or financial questions, consult the appropriate qualified professional.",
                ],
            ),
        ],
        "faqs": [
            ["What does NAICS classify?", "NAICS classifies establishments by economic activity, not occupations or individual workers."],
            ["Why does the Census workbook show only 17 standalone two-digit sector rows?", "It groups three sector ranges—31-33, 44-45, and 48-49—into single rows. Counted as the represented two-digit sectors, those ranges bring the total to 20."],
            ["Are 689 and 1,012 competing totals?", "No. The 689 count is five-digit NAICS industries; 1,012 is six-digit U.S. national industry detail."],
            ["Does this hub show job openings by industry?", "No. It is a classification directory and does not contain current vacancy or hiring-demand data."],
            ["Can a company have more than one NAICS code?", "Different establishments or activities may be classified differently. Apply the official rules to the establishment and activity in question."],
        ],
    },
    "roles": {
        "summary": "A reference to all 23 SOC 2018 major groups and the occupation hierarchy. SOC classifies work performed, not employer industry or executive seniority.",
        "sections": [
            section(
                "READ THE OCCUPATION STRUCTURE",
                "Major groups organize occupations by the work performed",
                [
                    "The 2018 Standard Occupational Classification organizes occupations into major groups, minor groups, broad occupations, and detailed occupations. The official BLS structure and definitions workbooks contain 23 major groups, 98 minor groups, 459 broad occupations, and 867 detailed occupations. This hub lists all major groups; the classification is useful for consistent reference, but it is not a directory of employer job titles.",
                    "The hierarchy helps readers narrow from a broad occupational family to a more specific description. The detailed definition is the most useful check when titles vary or a role combines several kinds of work. A code should be selected based on responsibilities and the official classification rules, not merely because a title sounds similar.",
                    "The major group table reproduces the official SOC code and title. Each group contains a different number of subordinate occupations. The SOC 2018 structure and definitions files are both included in the local source directory; the detailed occupation definitions have been checked against the structure codes and titles.",
                    "Management, Legal, Business and Financial Operations, and Computer and Mathematical are among the first occupation-group pages with full official directories. They show how one major group branches into its minor, broad, and detailed occupations. Other groups remain in the top-level listing until their own detail pages are built and validated.",
                    "SOC is not a seniority scale. A detailed occupation can describe work performed at different levels, while one executive title may combine responsibilities from several occupational families. To describe a senior role, pair the SOC concept with the employer's mandate, reporting line, decision rights, team and budget scope, and the outcomes for which the person was accountable.",
                ],
            ),
            section(
                "SENIOR LEADERSHIP LENS",
                "Executive titles do not replace occupational analysis",
                [
                    "A title such as CEO, CFO, CTO, partner, or vice president may draw on more than one occupational family. Use the duties, reporting relationship, and actual accountability to describe the work; the examples below are not extra SOC codes."
                ],
                table={
                    "caption": "Leadership responsibilities to compare with SOC work concepts",
                    "columns": ["Leadership lens", "Questions to compare"],
                    "rows": [
                        ["Enterprise leader", "What strategy, governance, and organization-wide decisions are actually owned?"],
                        ["Functional executive", "Which discipline, teams, resources, and policies fall within the remit?"],
                        ["Technical or professional executive", "What specialized decisions and credentials are required?"],
                        ["Operating or business-unit leader", "What services, products, locations, or customers are in scope?"],
                    ],
                },
            ),
            section(
                "COMPARE ROLE FAMILIES",
                "Use occupational codes alongside industry and employer context",
                [
                    "A person's occupation and an organization's industry answer different questions. SOC describes the work performed; NAICS describes the establishment's economic activity. One employer can hire people across many SOC groups, and the same occupation can appear in many industries. Comparing both dimensions can make target research clearer without implying that a code alone captures an entire role.",
                    "For career planning, identify the tasks and decisions that define the target role, then compare them with your own evidence. Include relevant professional credentials, team leadership, functional scope, operating context, and constraints. If a move crosses occupational groups, explain the bridge rather than relying on a title match.",
                    "Market observations must be current and local. Validate role requirements, licensing, work authorization, reporting relationships, and employer-specific titles directly. The directory makes no claim about current vacancies or the relative demand for any occupation.",
                ],
                table=market_table([
                    ["United States", "Use SOC concepts to describe work; distinguish them from employer titles.", "Check the SOC definition, job duties, location, and data year."],
                    ["Canada", "Do not assume SOC codes map directly to the Canadian NOC.", "Use the current official Canadian occupational classification and verify duties."],
                    ["United Kingdom", "Compare role responsibilities with the applicable UK occupation and job framework.", "Verify the local code, professional requirements, and employer mandate."],
                    ["UAE", "Titles may reflect local or regional organization design rather than SOC structure.", "Confirm actual responsibilities, employing entity, and work authorization."],
                    ["Saudi Arabia", "Check the specific occupation, employer, and applicable requirements.", "Use current official sources for local credentials, work status, and role scope."],
                    ["Australia", "Map SOC concepts cautiously to the applicable Australian occupation classification.", "Confirm the current local code, skills assessment needs, and job duties."],
                ]),
            ),
            section(
                "SOC ROLE COMPARISON",
                "Distinguishing a title from the occupation behind it",
                [
                    "A Chief Digital Officer role may span product strategy, information systems, analytics, and transformation. The title alone does not identify one SOC detailed occupation.",
                    "Compare the official SOC definitions with the role's actual duties, decisions, and accountability, then describe the combined mandate clearly. This gives prospective employers a more useful picture than forcing a single-code label.",
                ],
                scenario=True,
            ),
            section(
                "KOV AND ROLE POSITIONING",
                "Translate experience accurately for a candidate-led search",
                [
                    "KOV can discuss candidate-side support to clarify target roles, organize evidence, and coordinate agreed search activity. The relevant occupational code may help structure research, but the professional's actual achievements and responsibilities remain central. KOV does not represent employers through this directory or guarantee access to jobs.",
                    "Any external applications or outreach are subject to the agreed scope and client approvals. For professional licensing, credential recognition, immigration, legal, tax, or compensation advice, consult a qualified source in the relevant jurisdiction.",
                ],
            ),
        ],
        "faqs": [
            ["What does SOC 2018 classify?", "It classifies occupations according to work performed, not employer industries or executive seniority."],
            ["Are all detailed occupations listed here?", "The hub lists all 23 major groups. The four priority group pages currently provide full detailed directories; the remaining group pages are being built in verified batches."],
            ["Does SOC map directly to every company's title?", "No. Employers use titles differently, and one title can span several kinds of work."],
            ["How is SOC different from NAICS?", "SOC classifies occupations; NAICS classifies establishments by economic activity."],
            ["Does this directory rank jobs by demand or pay?", "No. It is a classification reference and contains no live vacancies, demand ranking, or compensation data."],
        ],
    },
}


def make_detail_pages(
    naics_records: list[dict[str, Any]],
    soc_records: list[dict[str, str]],
) -> list[dict[str, Any]]:
    pages: list[dict[str, Any]] = []
    sector_targets = {
        "professional-scientific-and-technical-services": ("54", "industries"),
        "finance-and-insurance": ("52", "industries"),
        "information": ("51", "industries"),
        "health-care-and-social-assistance": ("62", "industries"),
    }
    for slug, (prefix, parent) in sector_targets.items():
        meta = CONTENT[slug]
        rows = [record.copy() for record in naics_records if record["code"].startswith(prefix)]
        expected = {
            "54": {2: 1, 3: 1, 4: 9, 5: 35, 6: 49},
            "52": {2: 1, 3: 5, 4: 11, 5: 27, 6: 35},
            "51": {2: 1, 3: 6, 4: 11, 5: 24, 6: 29},
            "62": {2: 1, 3: 4, 4: 18, 5: 30, 6: 39},
        }[prefix]
        found = Counter(len(record["code"]) for record in rows if record["code"].isdigit())
        if dict(found) != expected:
            raise ValueError(f"{prefix} sector code counts mismatch: {dict(found)}")
        title = next(record["name"] for record in rows if len(record["code"]) == 2)
        count_labels = [
            ("Subsectors", found[3]),
            ("Industry groups", found[4]),
            ("Five-digit industries", found[5]),
            ("Six-digit U.S. national industries", found[6]),
        ]
        pages.append({
            "slug": slug,
            "path": f"industries/{slug}.html",
            "category": "industries",
            "newPage": True,
            "newTaxonomyPage": True,
            "parentHub": parent,
            "title": meta["title"],
            "description": meta["description"],
            "summary": meta["summary"],
            "eyebrow": "NAICS 2022 · INDUSTRY REFERENCE",
            "heading": meta["heading"],
            "lead": meta["lead"],
            "introduction": meta["introduction"],
            "image": "assets/kov-global-grid.svg",
            "imageAlt": f"Industry research framework for {title}.",
            "cta": "Discuss Your Industry Search",
            "ctaHeading": "Connect industry context to your next career move.",
            "ctaCopy": "Share the sectors, functions, and markets you are considering. KOV can discuss whether candidate-side support fits and agree the scope directly.",
            "directory": {
                "classification": "North American Industry Classification System (NAICS), 2022",
                "sourceLabel": "OFFICIAL NAICS 2022 HIERARCHY",
                "heading": f"Complete NAICS 2022 directory for {title}",
                "description": f"The table reproduces all {len(rows)} code/title records in sector {prefix} from the official Census Bureau structure workbook, including the sector, every subsector, industry group, five-digit industry, and six-digit U.S. national industry. Parent codes show the hierarchy. A source marker T means trilateral agreement in the workbook.",
                "sourceName": "U.S. Census Bureau, 2022 NAICS Structure",
                "sourceUrl": "https://www.census.gov/naics/2022NAICS/2022_NAICS_Structure.xlsx",
                "sourceNote": "Source file: data/taxonomy/2022_NAICS_Structure.xlsx. Five-digit NAICS industries and six-digit U.S. national industries are separate levels; official titles and hierarchy are reproduced from the workbook.",
                "quickFacts": [
                    {"label": label, "value": str(value)}
                    for label, value in [
                        ("Sector code", prefix),
                        ("Sector title", title),
                        *count_labels,
                        ("Total listed records", len(rows)),
                    ]
                ],
                "entries": rows,
            },
            "sections": [
                section("SECTOR OVERVIEW", "How this sector is organized and led", meta["focus"] + LONGFORM_EXTRA[slug] + [LONGFORM_FINISHER[slug]]),
                section(
                    "SENIOR ROLE AND CAREER-PATH TABLE",
                    "Leadership roles to compare by actual remit",
                    ["These leadership role families are a career-planning framework, not NAICS occupations. Responsibilities vary by organization; compare the target job's authority and requirements."],
                    table={
                        "caption": "General career guidance — verify the employer's role description",
                        "columns": ["Role family", "Typical remit to investigate", "Evidence and transition questions"],
                        "rows": meta["roleRows"],
                    },
                ),
                section("INDUSTRY TRANSITION STRATEGY", "Assess a transition through this sector", meta["scenario"], scenario=True),
                section("MARKET COMPARISON", "Questions to test before comparing locations", ["This is a market-research checklist, not a comparative hiring or compensation claim. Confirm current facts using dated official sources and the target employer's own disclosures."], table=market_table(meta["marketRows"])),
                section("KOV-SPECIFIC GUIDANCE", "Candidate-side representation with clear boundaries", [
                    "KOV works for the professional, not the employer. Depending on agreed scope, candidate-side support may include target definition, organization research, positioning, approved applications, recruiter or hiring-manager outreach, interview preparation, and offer support. The professional reviews and approves external activity.",
                    "Sector codes help organize research, but do not establish role fit or guarantee an employer response. Engagement scope, deliverables, approvals, reporting, and fees are agreed directly and in writing. KOV does not promise interviews, employment, or timing.",
                ], bullets=["Define target organizations and adjacent sectors", "Connect verified experience to the actual mandate", "Confirm approvals and practical constraints before outreach"]),
            ],
            "faqs": [{"question": q, "answer": a} for q, a in meta["faqs"]],
            "related": [{"slug": target, "label": label} for target, label in meta["related"]],
        })

    soc_targets = {
        "management-occupations": "11-0000",
        "legal-occupations": "23-0000",
        "business-and-financial-operations-occupations": "13-0000",
        "computer-and-mathematical-occupations": "15-0000",
    }
    for slug, major_code in soc_targets.items():
        meta = CONTENT[slug]
        rows = [record.copy() for record in soc_records if record["code"][:2] == major_code[:2]]
        counts = Counter(record["level"] for record in rows)
        expected = {
            "11-0000": {"Major": 1, "Minor": 4, "Broad": 30, "Detailed": 38},
            "23-0000": {"Major": 1, "Minor": 2, "Broad": 4, "Detailed": 8},
            "13-0000": {"Major": 1, "Minor": 2, "Broad": 23, "Detailed": 35},
            "15-0000": {"Major": 1, "Minor": 2, "Broad": 12, "Detailed": 21},
        }[major_code]
        if dict(counts) != expected:
            raise ValueError(f"{major_code} SOC counts mismatch: {dict(counts)}")
        title = next(record["name"] for record in rows if record["level"] == "Major")
        pages.append({
            "slug": slug,
            "path": f"roles/{slug}.html",
            "category": "roles",
            "newPage": True,
            "newTaxonomyPage": True,
            "parentHub": "roles",
            "title": meta["title"],
            "description": meta["description"],
            "summary": meta["summary"],
            "eyebrow": "SOC 2018 · OCCUPATION REFERENCE",
            "heading": meta["heading"],
            "lead": meta["lead"],
            "introduction": meta["introduction"],
            "image": "assets/kov-search-grid.svg",
            "imageAlt": f"Occupation research framework for {title}.",
            "cta": "Discuss Your Role Search",
            "ctaHeading": "Translate your experience into a clear role target.",
            "ctaCopy": "Share your leadership scope, target functions, and markets. KOV can discuss whether candidate-side search support fits and agree the scope directly.",
            "directory": {
                "classification": "2018 Standard Occupational Classification (SOC)",
                "sourceLabel": "OFFICIAL SOC 2018 HIERARCHY",
                "heading": f"Complete SOC 2018 directory for {title}",
                "description": f"The table reproduces the official major group, all {counts['Minor']} minor groups, {counts['Broad']} broad occupations, and {counts['Detailed']} detailed occupations in the BLS 2018 structure workbook. Detailed occupation definitions are taken verbatim from the companion definitions workbook. Parent codes show the hierarchy.",
                "sourceName": "U.S. Bureau of Labor Statistics, 2018 SOC",
                "sourceUrl": "https://www.bls.gov/soc/2018/home.htm",
                "sourceNote": "Source files: data/taxonomy/soc_structure_2018.xlsx and data/taxonomy/soc_2018_definitions.xlsx. Definitions are official BLS text; occupation titles and codes do not establish seniority, credentials, or job-title equivalence.",
                "quickFacts": [
                    {"label": label, "value": str(value)}
                    for label, value in [
                        ("Major group code", major_code),
                        ("Major group title", title),
                        ("Minor groups", counts["Minor"]),
                        ("Broad occupations", counts["Broad"]),
                        ("Detailed occupations", counts["Detailed"]),
                        ("Total listed records", len(rows)),
                    ]
                ],
                "entries": [
                    {
                        **record,
                        "level": LEVEL_LABELS[record["level"]],
                        "definition": record["definition"] or "",
                    }
                    for record in rows
                ],
            },
            "sections": [
                section("OCCUPATION-GROUP OVERVIEW", "What distinguishes this occupational family", meta["focus"] + LONGFORM_EXTRA[slug] + [LONGFORM_FINISHER[slug]]),
                section(
                    "SENIOR ROLE AND CAREER-PATH TABLE",
                    "Leadership titles require remit-level comparison",
                    ["These executive role families are a career-planning framework, not additional SOC codes. Titles vary across employers; verify reporting relationships, duties, and professional requirements."],
                    table={
                        "caption": "General career guidance — not an official SOC title list",
                        "columns": ["Leadership role", "Responsibilities to clarify", "Transition evidence"],
                        "rows": meta["roleRows"],
                    },
                ),
                section("SOC ROLE COMPARISON", "Compare the role's actual duties", meta["scenario"], scenario=True),
                section("MARKET COMPARISON", "Questions to validate in each target market", ["This comparison is a research framework, not a current demand, salary, or vacancy ranking. Occupational classifications differ by country; map duties to the local official system before relying on cross-country comparisons."], table=market_table(meta["marketRows"])),
                section("KOV-SPECIFIC GUIDANCE", "Position the work accurately; retain candidate control", [
                    "KOV provides candidate-side career representation and individual career services. Depending on the engagement, support may help define a target, organize evidence, research organizations, and coordinate approved applications or outreach. The professional remains the decision-maker, and employers control selection.",
                    "SOC is a reference for work performed, not proof of a candidate's qualifications or a promise of access to a role. Scope, deliverables, approvals, and fees are agreed in writing before work begins. No interview, offer, or employment outcome is guaranteed.",
                ], bullets=["Compare duties with the official SOC definitions", "Use evidence to explain transferable leadership scope", "Verify credentials and local requirements with the appropriate authority"]),
            ],
            "faqs": [{"question": q, "answer": a} for q, a in meta["faqs"]],
            "related": [{"slug": target, "label": label} for target, label in meta["related"]],
        })

    existing_sector_codes = {"54", "52", "51", "62"}
    for sector in naics_records:
        if sector["level"] != "Sector" or sector["code"] in existing_sector_codes:
            continue
        pages.append(
            generated_detail_page(
                "industries", sector, records_below(naics_records, sector["code"])
            )
        )

    existing_major_codes = {"11-0000", "23-0000", "13-0000", "15-0000"}
    for major in soc_records:
        if major["level"] != "Major" or major["code"] in existing_major_codes:
            continue
        pages.append(
            generated_detail_page(
                "roles", major, records_below(soc_records, major["code"])
            )
        )
    return pages


def directory_matches(
    existing: dict[str, Any], generated: dict[str, Any]
) -> bool:
    old_entries = existing.get("directory", {}).get("entries", [])
    new_entries = generated.get("directory", {}).get("entries", [])
    if len(old_entries) != len(new_entries):
        return False
    by_code = {entry.get("code"): entry for entry in old_entries}
    if len(by_code) != len(old_entries):
        return False
    for current in new_entries:
        previous = by_code.get(current["code"])
        if not previous:
            return False
        for field in ("name", "level", "parentCode", "sourceMarker", "definition"):
            if previous.get(field, "") != current.get(field, ""):
                return False
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--validate-entity-datasets",
        action="store_true",
        help="validate the shared JSON-LD catalog without changing SEO source data",
    )
    args = parser.parse_args()
    if args.validate_entity_datasets:
        validate_entity_datasets()
        print("Shared entity datasets validated; SEO source files were not modified.")
        return

    naics_records, sectors = read_naics()
    soc_records, _definitions = read_soc()
    pages = json.loads(SEO_DATA.read_text(encoding="utf-8"))
    by_slug = {page["slug"]: page for page in pages}
    if "industries" not in by_slug or "roles" not in by_slug:
        raise ValueError("Expected the existing industries and roles hubs.")

    industries_hub = by_slug["industries"]
    industries_hub.update({
        "updateExistingNewPage": True,
        "summary": HUB_CONTENT["industries"]["summary"],
        "directory": {
            **industries_hub["directory"],
            "entries": [
                {
                    "code": sector["code"],
                    "name": sector["name"],
                    "level": "Sector",
                    "parentCode": "",
                    "sourceMarker": sector["sourceMarker"],
                }
                for sector in sectors
            ],
        },
        "sections": HUB_CONTENT["industries"]["sections"],
        "faqs": [{"question": q, "answer": a} for q, a in HUB_CONTENT["industries"]["faqs"]],
        "directoryLinks": [],
        "related": [],
    })
    roles_hub = by_slug["roles"]
    major_groups = [
        record for record in soc_records if record["level"] == "Major"
    ]
    if len(major_groups) != 23:
        raise ValueError(f"Expected 23 SOC major groups; found {len(major_groups)}.")
    roles_hub.update({
        "updateExistingNewPage": True,
        "summary": HUB_CONTENT["roles"]["summary"],
        "directory": {
            **roles_hub["directory"],
            "entries": [
                {
                    "code": record["code"],
                    "name": record["name"],
                    "level": "Major group",
                    "parentCode": "",
                }
                for record in major_groups
            ],
        },
        "sections": HUB_CONTENT["roles"]["sections"],
        "faqs": [{"question": q, "answer": a} for q, a in HUB_CONTENT["roles"]["faqs"]],
        "directoryLinks": [],
        "related": [],
    })

    detail_pages = make_detail_pages(naics_records, soc_records)
    if len(detail_pages) != 43 or len({page["slug"] for page in detail_pages}) != 43:
        raise ValueError("Expected 43 unique NAICS and SOC detail pages.")
    industry_pages_from_source = [
        page for page in detail_pages if page["category"] == "industries"
    ]
    occupation_pages_from_source = [
        page for page in detail_pages if page["category"] == "roles"
    ]
    if len(industry_pages_from_source) != 20 or len(occupation_pages_from_source) != 23:
        raise ValueError("Source data did not produce 20 sectors and 23 major groups.")
    all_page_paths = [page["path"] for page in detail_pages]
    if len(set(all_page_paths)) != 43:
        raise ValueError("Taxonomy detail pages contain duplicate output paths.")
    naics_page_codes = [
        entry["code"]
        for page in industry_pages_from_source
        for entry in page["directory"]["entries"]
    ]
    soc_page_codes = [
        entry["code"]
        for page in occupation_pages_from_source
        for entry in page["directory"]["entries"]
    ]
    expected_naics_codes = {record["code"] for record in naics_records}
    expected_soc_codes = {record["code"] for record in soc_records}
    if (
        len(naics_page_codes) != len(set(naics_page_codes))
        or set(naics_page_codes) != expected_naics_codes
    ):
        raise ValueError("NAICS detail pages do not provide exact source coverage.")
    if (
        len(soc_page_codes) != len(set(soc_page_codes))
        or set(soc_page_codes) != expected_soc_codes
    ):
        raise ValueError("SOC detail pages do not provide exact source coverage.")
    for page in detail_pages:
        first_section = page["sections"][0]
        word_count = len(" ".join(first_section["paragraphs"]).split())
        if not 600 <= word_count <= 900:
            raise ValueError(
                f"{page['slug']} overview has {word_count} words; expected 600-900."
            )
        if len(page["faqs"]) < 6 or len({faq["question"] for faq in page["faqs"]}) != len(page["faqs"]):
            raise ValueError(f"{page['slug']} must have six distinct FAQs.")
        role_section = page["sections"][1]
        if len(role_section.get("table", {}).get("rows", [])) < 5:
            raise ValueError(f"{page['slug']} has an incomplete senior-role table.")
        if not any(section_value.get("scenario") for section_value in page["sections"]):
            raise ValueError(f"{page['slug']} is missing its career-planning section.")

    old_taxonomy = {
        page["slug"]: page for page in pages if page.get("newTaxonomyPage")
    }
    selected_detail_pages: list[dict[str, Any]] = []
    for generated in detail_pages:
        existing = old_taxonomy.get(generated["slug"])
        if existing and directory_matches(existing, generated):
            generated["newPage"] = True
        selected_detail_pages.append(generated)

    generated_slugs = {page["slug"] for page in detail_pages}
    pages = [
        page
        for page in pages
        if not (
            page.get("newTaxonomyPage")
            and page["slug"] in generated_slugs
        )
    ]
    pages.extend(selected_detail_pages)

    industry_pages = [
        page for page in selected_detail_pages if page["category"] == "industries"
    ]
    occupation_pages = [
        page for page in selected_detail_pages if page["category"] == "roles"
    ]
    industries_hub["directoryLinks"] = [
        {"slug": page["slug"], "label": page["directory"]["heading"]}
        for page in industry_pages
    ]
    roles_hub["directoryLinks"] = [
        {"slug": page["slug"], "label": page["directory"]["heading"]}
        for page in occupation_pages
    ]
    industries_hub["related"] = [
        *industries_hub["directoryLinks"],
        {"slug": "reverse-recruiting", "label": "Private Career Representation"},
        {"slug": "roles", "label": "SOC occupation directory"},
    ]
    roles_hub["related"] = [
        *roles_hub["directoryLinks"],
        {"slug": "reverse-recruiting", "label": "Private Career Representation"},
        {"slug": "industries", "label": "NAICS industry directory"},
    ]

    # Keep the existing JSON's LF convention and Unicode text.
    serialized = json.dumps(pages, ensure_ascii=False, indent=2) + "\n"
    json.loads(serialized)
    SEO_DATA.write_text(serialized, encoding="utf-8", newline="\n")
    generated_count = sum(page["newPage"] for page in selected_detail_pages)
    print(
        f"Validated source data; retained or prepared {len(selected_detail_pages)} "
        f"taxonomy detail pages, with {generated_count} requiring generation."
    )
    for page in selected_detail_pages:
        print(
            f"{page['slug']}: {len(page['directory']['entries'])} official "
            f"directory records; {len(page['faqs'])} FAQs; "
            f"{'generate' if page['newPage'] else 'preserve existing'}."
        )
    print(
        "NAICS hierarchy: 20 sectors, 96 subsectors, 308 industry groups, "
        "689 five-digit industries, 1,012 six-digit U.S. national industries."
    )
    print(
        "SOC hierarchy: 23 major groups, 98 minor groups, 459 broad occupations, "
        "867 detailed occupations."
    )
    print(f"NAICS source records: {len(naics_records)}; sectors: {len(sectors)}.")
    print(f"SOC source records: {len(soc_records)}; major groups: {len(major_groups)}.")


if __name__ == "__main__":
    main()
