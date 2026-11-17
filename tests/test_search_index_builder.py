import importlib.util
import sys
import unittest
from pathlib import Path

sys.dont_write_bytecode = True
BUILDER_PATH = Path(__file__).resolve().parents[1] / "scripts" / "build-site-search-index.py"
SPEC = importlib.util.spec_from_file_location("build_site_search_index", BUILDER_PATH)
BUILDER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(BUILDER)


class SearchEligibilityTests(unittest.TestCase):
    def test_published_sitemap_page_is_eligible(self):
        self.assertTrue(BUILDER.is_search_eligible(
            '<meta name="robots" content="index, follow"><main>Published</main>',
            "roles/chief-executive/index.html",
        ))

    def test_noindex_is_excluded_independent_of_attribute_order(self):
        sources = (
            '<meta name="robots" content="noindex, follow">',
            '<meta content="follow, NOINDEX" name="ROBOTS">',
            '<meta name="googlebot" content="noindex">',
        )
        for source in sources:
            with self.subTest(source=source):
                self.assertFalse(BUILDER.is_search_eligible(source, "page.html"))

    def test_unpublished_paths_and_statuses_are_excluded(self):
        excluded = (
            ("<main>Draft</main>", "staging/new-page/index.html"),
            ("<main>Draft</main>", "drafts/new-page.html"),
            ('<main data-status="draft">Draft</main>', "new-page.html"),
            ('<main data-publication-status="private">Private</main>', "new-page.html"),
            ('<meta name="publication-status" content="unpublished">', "new-page.html"),
        )
        for source, page_name in excluded:
            with self.subTest(page_name=page_name, source=source):
                self.assertFalse(BUILDER.is_search_eligible(source, page_name))


if __name__ == "__main__":
    unittest.main()
