import json
import threading
import unittest
from http.server import ThreadingHTTPServer
from unittest.mock import Mock
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from compatibility_api import CATALOG, CompatibilityHandler, filter_compatible_search


class CompatibilityApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), CompatibilityHandler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.server.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)

    def test_health(self):
        with urlopen(f"{self.base_url}/health", timeout=3) as response:
            payload = json.load(response)
        self.assertEqual(payload["status"], "ok")
        self.assertEqual(set(payload["catalog_counts"].values()), {50})

    def test_api_token_is_enforced_when_configured(self):
        previous = CompatibilityHandler.api_token
        CompatibilityHandler.api_token = "x" * 32
        try:
            with self.assertRaises(HTTPError) as caught:
                urlopen(f"{self.base_url}/health", timeout=3)
            try:
                self.assertEqual(caught.exception.code, 401)
            finally:
                caught.exception.close()

            request = Request(
                f"{self.base_url}/health",
                headers={"Authorization": f"Bearer {'x' * 32}"},
            )
            with urlopen(request, timeout=3) as response:
                self.assertEqual(json.load(response)["status"], "ok")
        finally:
            CompatibilityHandler.api_token = previous

    def test_client_disconnect_does_not_raise_a_server_error(self):
        handler = object.__new__(CompatibilityHandler)
        handler.wfile = Mock()
        handler.wfile.write.side_effect = ConnectionAbortedError(10053, "aborted")
        handler.close_connection = False

        handler.write_body(b"response")

        self.assertTrue(handler.close_connection)

    def test_assemble_requires_a_complete_selection(self):
        request = Request(
            f"{self.base_url}/assemble",
            data=json.dumps({"selection": {}}).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with self.assertRaises(HTTPError) as caught:
            urlopen(request, timeout=3)
        try:
            self.assertEqual(caught.exception.code, 422)
            payload = json.loads(caught.exception.read())
            self.assertIn("cpu", payload["error"])
        finally:
            caught.exception.close()

    def test_assemble_rejects_cross_origin_requests(self):
        request = Request(
            f"{self.base_url}/assemble",
            data=json.dumps({"selection": {}}).encode(),
            headers={"Content-Type": "application/json", "Origin": "https://example.test"},
            method="POST",
        )
        with self.assertRaises(HTTPError) as caught:
            urlopen(request, timeout=3)
        try:
            self.assertEqual(caught.exception.code, 403)
        finally:
            caught.exception.close()

    def test_first_offered_choice_can_reach_all_eight_categories(self):
        order = ("cpu", "motherboard", "gpu", "ram", "cooler", "psu", "case", "storage")
        picked = {}
        for part_type in order:
            params = {
                key: row["opendb_id"]
                for key, row in picked.items()
            }
            options = filter_compatible_search(part_type, CATALOG[part_type], params)
            self.assertTrue(options, f"no viable {part_type} after {tuple(picked)}")
            picked[part_type] = options[0]
        self.assertEqual(set(picked), set(order))


if __name__ == "__main__":
    unittest.main()
