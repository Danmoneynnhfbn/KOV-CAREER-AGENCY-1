import csv
import json
import subprocess
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEVELOPMENT = ROOT / "development"


def read_csv(relative_path):
    with (DEVELOPMENT / relative_path).open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


class MobilityResearchBatchTests(unittest.TestCase):
    def test_programme_consistency_and_publication_gate(self):
        result = subprocess.run(
            [sys.executable, "-B", str(ROOT / "scripts" / "validate-research-programme.py")],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_each_mobility_candidate_has_its_own_record_and_blueprint(self):
        candidates = [
            row for row in read_csv("CANDIDATE-REGISTER.csv")
            if row["category"] == "international_career_mobility"
        ]
        self.assertEqual(len(candidates), 13)
        self.assertEqual(len({row["proposed_url"] for row in candidates}), len(candidates))

        source_ids = {row["source_id"] for row in read_csv("RESEARCH-SOURCE-REGISTER.csv")}
        for candidate in candidates:
            with self.subTest(candidate=candidate["candidate_id"]):
                record_path = DEVELOPMENT / "research" / "records" / f"{candidate['candidate_id']}.json"
                record = json.loads(record_path.read_text(encoding="utf-8"))
                blueprint_path = ROOT / candidate["blueprint_path"]
                self.assertTrue(blueprint_path.is_file())
                self.assertEqual(record["proposed_url"], candidate["proposed_url"])
                self.assertEqual(record["approval_status"], "not_approved")
                self.assertEqual(record["publication_status"], "not_approved")
                self.assertEqual(record["keyword_metrics"]["volume_status"], "not_available")
                self.assertTrue(record["authoritative_sources"])
                self.assertTrue({source["source_id"] for source in record["authoritative_sources"]} <= source_ids)

    def test_candidate_urls_remain_out_of_public_search_and_sitemap(self):
        sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
        search_index = (ROOT / "assets" / "site-search-index.js").read_text(encoding="utf-8")
        for candidate in read_csv("CANDIDATE-REGISTER.csv"):
            with self.subTest(candidate=candidate["candidate_id"]):
                self.assertNotIn(candidate["proposed_url"], sitemap)
                self.assertNotIn(candidate["proposed_url"], search_index)
                self.assertEqual(candidate["search_sitemap_status"], "excluded")

    def test_market_screen_is_not_misrepresented_as_qualified_urls(self):
        markets = read_csv("MARKET-RESEARCH-SCREEN.csv")
        self.assertEqual(len(markets), 37)
        self.assertEqual(sum(row["screen_status"] == "existing_market_overlap" for row in markets), 4)
        self.assertEqual(sum(row["screen_status"] == "macro_screen_only" for row in markets), 33)
        self.assertTrue(all(not row["candidate_url"] for row in markets))

    def test_country_role_topics_are_merged_not_duplicated(self):
        overlaps = read_csv("CANDIDATE-OVERLAP-REGISTER.csv")
        self.assertEqual(len(overlaps), 3)
        self.assertTrue(all(not row["standalone_candidate_url"] for row in overlaps))
        self.assertTrue(all(row["overlap_decision"] == "merge_into_mobility_candidate" for row in overlaps))

    def test_hubs_have_individual_research_and_safe_release_states(self):
        hubs = [
            row for row in read_csv("CANDIDATE-REGISTER.csv")
            if row["category"] in {
                "career_resources_hub",
                "research_hub",
                "professional_profile_directory",
            }
        ]
        self.assertEqual(len(hubs), 3)
        for hub in hubs:
            record_path = DEVELOPMENT / "research" / "records" / f"{hub['candidate_id']}.json"
            record = json.loads(record_path.read_text(encoding="utf-8"))
            self.assertTrue(record["authoritative_sources"])
            self.assertTrue(record["competitor_research"])
            self.assertEqual(record["publication_status"], "not_approved")
            self.assertEqual(hub["publication_status"], "not_published")

        directory = next(row for row in hubs if row["category"] == "professional_profile_directory")
        directory_record = json.loads(
            (DEVELOPMENT / "research" / "records" / f"{directory['candidate_id']}.json")
            .read_text(encoding="utf-8")
        )
        self.assertIn("hold_", directory_record["candidate_status"])
        self.assertIn("profiles.html", directory["duplication_cannibalisation_assessment"])
        self.assertEqual(directory["approval_status"], "approved_for_research_only")

    def test_page_quotas_remain_complete(self):
        programme = read_csv("PAGE-PROGRAMME.csv")
        candidates = read_csv("CANDIDATE-REGISTER.csv")
        self.assertEqual(len(programme), 16)
        self.assertEqual(sum(int(row["target_count"]) for row in programme), 577)
        self.assertEqual(sum(int(row["candidate_urls_defined"]) for row in programme), len(candidates))
        self.assertEqual(
            sum(int(row["candidate_url_shortfall"]) for row in programme),
            577 - len(candidates),
        )
        mobility = next(row for row in programme if row["page_group"] == "international_career_mobility")
        self.assertEqual(mobility["candidate_urls_defined"], "13")
        self.assertEqual(mobility["research_records_created"], "13")
        self.assertEqual(mobility["blueprints_created"], "13")
        occupation = next(row for row in programme if row["page_group"] == "occupation_classification")
        self.assertEqual(occupation["candidate_urls_defined"], "23")
        self.assertEqual(occupation["qualified_for_development"], "0")
        industry = next(row for row in programme if row["page_group"] == "industry_specific_career_guides")
        self.assertEqual(industry["candidate_urls_defined"], "13")
        self.assertEqual(industry["qualified_for_development"], "1")
        self.assertEqual(industry["development_qualification_gap"], "44")


if __name__ == "__main__":
    unittest.main()
