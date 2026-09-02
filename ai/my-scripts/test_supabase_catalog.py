import io
import json
import unittest
from unittest.mock import patch

from supabase_catalog import load_supabase_catalog


class FakeResponse(io.BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *_args):
        self.close()


class SupabaseCatalogTests(unittest.TestCase):
    def test_catalog_rows_are_mapped_and_specs_are_flattened(self):
        rows = []
        categories = (
            "cpu", "motherboard", "gpu", "ram",
            "cpu_cooler", "pc_case", "psu", "storage",
        )
        for index, category in enumerate(categories):
            rows.append({
                "opendb_id": f"id-{index}",
                "category": category,
                "name": f"Part {index}",
                "manufacturer": "Test",
                "image_url": None,
                "catalog_rank": 1,
                "specs": {"numeric": 42, "enabled": True},
            })
        response = FakeResponse(json.dumps(rows).encode())

        with patch("supabase_catalog.urlopen", return_value=response) as mocked:
            catalog = load_supabase_catalog(
                "https://project.supabase.co",
                "sb_publishable_example_key",
            )

        self.assertEqual(set(catalog), {"cpu", "motherboard", "gpu", "ram", "cooler", "case", "psu", "storage"})
        self.assertEqual(catalog["cooler"][0]["numeric"], "42")
        self.assertEqual(catalog["case"][0]["enabled"], "true")
        request = mocked.call_args.args[0]
        self.assertEqual(request.headers["Apikey"], "sb_publishable_example_key")

    def test_non_https_project_url_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "HTTPS"):
            load_supabase_catalog("http://localhost:54321", "sb_publishable_example_key")


if __name__ == "__main__":
    unittest.main()
