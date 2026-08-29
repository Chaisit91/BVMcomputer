import json
import threading
import unittest
from http.server import ThreadingHTTPServer
from unittest.mock import Mock
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from compatibility_api import CompatibilityHandler


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


if __name__ == "__main__":
    unittest.main()
