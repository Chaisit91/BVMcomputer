import base64
import io
import json
import unittest
from unittest.mock import patch

from PIL import Image

from build_visualizer import (
    BuildImageError,
    PART_ORDER,
    build_prompt,
    generate_build_image,
    generate_build_turntable,
    maxplus_reference_images,
    resize_reference_image,
    selected_image_parts,
    validate_public_image_url,
)


def catalog(image_url="https://images.example.test/product.png"):
    return {
        part_type: {
            f"{part_type}-id": {
                "opendb_id": f"{part_type}-id",
                "name": f"Test {part_type}",
                "image_url": image_url,
            }
        }
        for part_type in PART_ORDER
    }


def selection():
    return {part_type: f"{part_type}-id" for part_type in PART_ORDER}


class BuildVisualizerTests(unittest.TestCase):
    def test_rejects_a_non_maxplus_key_before_api_request(self):
        with patch.dict("os.environ", {"MAXPLUS_API_KEY": "sk-not-maxplus"}, clear=True):
            with self.assertRaisesRegex(BuildImageError, "ccsk-"):
                generate_build_image([])

    def test_sends_all_eight_products_within_maxplus_five_reference_limit(self):
        parts = [
            {
                "type": part_type,
                "label": part_type,
                "opendb_id": f"{part_type}-id",
                "name": f"Test {part_type}",
                "image_url": "https://images.example.test/product.png",
            }
            for part_type in PART_ORDER
        ]
        encoded_reference = base64.b64encode(self._image_bytes()).decode("ascii")
        references = [
            {
                **part,
                "reference_data_url": f"data:image/png;base64,{encoded_reference}",
                "reference_width": 100,
                "reference_height": 50,
            }
            for part in parts
        ]
        generated = base64.b64encode(b"generated-image").decode("ascii")
        response = io.BytesIO(json.dumps({"data": [{"b64_json": generated}]}).encode())

        with (
            patch.dict("os.environ", {"MAXPLUS_API_KEY": "ccsk-test-key"}, clear=True),
            patch("build_visualizer.prepare_reference_images", return_value=references),
            patch("build_visualizer.urlopen", return_value=response) as mocked_urlopen,
        ):
            result = generate_build_image(parts)

        request = mocked_urlopen.call_args.args[0]
        payload = json.loads(request.data)
        self.assertEqual(request.full_url, "https://api.maxplus-ai.cc/gpt-image/v1/images/generations")
        self.assertEqual(request.headers["Authorization"], "Bearer ccsk-test-key")
        self.assertEqual(payload["model"], "gpt-image-2")
        self.assertEqual(payload["response_format"], "b64_json")
        self.assertEqual(len(payload["reference_images"]), 5)
        self.assertEqual(
            payload["reference_images"][-1]["name"],
            "05-cpu-ram-psu-storage-contact-sheet.jpg",
        )
        self.assertEqual(result["image_base64"], generated)

    def test_contact_sheet_contains_the_four_grouped_products(self):
        encoded = base64.b64encode(self._image_bytes()).decode("ascii")
        references = [
            {
                "type": part_type,
                "label": part_type,
                "name": f"Test {part_type}",
                "reference_data_url": f"data:image/png;base64,{encoded}",
            }
            for part_type in PART_ORDER
        ]

        payload_images = maxplus_reference_images(references)

        self.assertEqual(len(payload_images), 5)
        sheet = base64.b64decode(payload_images[-1]["data"])
        with Image.open(io.BytesIO(sheet)) as image:
            self.assertEqual(image.size, (1024, 1024))

    def test_generates_evenly_spaced_turntable_views(self):
        parts = [
            {
                "type": part_type,
                "label": part_type,
                "opendb_id": f"{part_type}-id",
                "name": f"Test {part_type}",
                "image_url": "https://images.example.test/product.png",
            }
            for part_type in PART_ORDER
        ]
        encoded_reference = base64.b64encode(self._image_bytes()).decode("ascii")
        references = [
            {
                **part,
                "reference_data_url": f"data:image/png;base64,{encoded_reference}",
                "reference_width": 100,
                "reference_height": 50,
            }
            for part in parts
        ]
        generated = base64.b64encode(b"turntable-frame").decode("ascii")

        def api_response(*_args, **_kwargs):
            return io.BytesIO(json.dumps({"data": [{"b64_json": generated}]}).encode())

        with (
            patch.dict(
                "os.environ",
                {
                    "MAXPLUS_API_KEY": "ccsk-test-key",
                    "MAXPLUS_TURNTABLE_VIEWS": "4",
                },
                clear=True,
            ),
            patch("build_visualizer.prepare_reference_images", return_value=references),
            patch("build_visualizer.urlopen", side_effect=api_response) as mocked_urlopen,
        ):
            result = generate_build_turntable(parts)

        self.assertEqual([frame["angle"] for frame in result["images"]], [0, 90, 180, 270])
        self.assertEqual(mocked_urlopen.call_count, 4)
        prompts = [json.loads(call.args[0].data)["prompt"] for call in mocked_urlopen.call_args_list]
        for angle in (0, 90, 180, 270):
            self.assertTrue(any(f"{angle} degrees" in prompt for prompt in prompts))

    @staticmethod
    def _image_bytes():
        source = io.BytesIO()
        Image.new("RGB", (80, 40), "white").save(source, format="PNG")
        return source.getvalue()

    def test_requires_all_eight_part_types(self):
        chosen = selection()
        del chosen["gpu"]
        with self.assertRaisesRegex(BuildImageError, "gpu"):
            selected_image_parts(catalog(), chosen)

    def test_requires_an_https_image_for_every_part(self):
        rows = catalog()
        rows["ram"]["ram-id"]["image_url"] = ""
        with self.assertRaisesRegex(BuildImageError, "Test ram"):
            selected_image_parts(rows, selection())

    def test_rejects_non_public_image_paths(self):
        rows = catalog()
        rows["case"]["case-id"]["image_url"] = "C:/private/case.png"
        with self.assertRaisesRegex(BuildImageError, "public HTTPS URL"):
            selected_image_parts(rows, selection())

    def test_prompt_contains_exact_manifest_and_constraints(self):
        parts = selected_image_parts(catalog(), selection())
        prompt = build_prompt(parts)
        self.assertEqual(len(parts), 8)
        for part in parts:
            self.assertIn(part["name"], prompt)
            self.assertIn(part["opendb_id"], prompt)
        self.assertIn("Do not add, remove, duplicate", prompt)

    def test_resizes_large_image_without_changing_aspect_ratio(self):
        source = io.BytesIO()
        Image.new("RGB", (2400, 1200), "white").save(source, format="JPEG")
        data_url, width, height = resize_reference_image(source.getvalue())
        self.assertEqual((width, height), (1024, 512))
        self.assertTrue(data_url.startswith("data:image/jpeg;base64,"))
        self.assertGreater(len(base64.b64decode(data_url.split(",", 1)[1])), 0)

    def test_does_not_enlarge_small_transparent_image(self):
        source = io.BytesIO()
        Image.new("RGBA", (320, 240), (0, 0, 0, 0)).save(source, format="PNG")
        data_url, width, height = resize_reference_image(source.getvalue())
        self.assertEqual((width, height), (320, 240))
        self.assertTrue(data_url.startswith("data:image/png;base64,"))

    def test_rejects_private_image_hosts(self):
        address = (None, None, None, None, ("127.0.0.1", 443))
        with patch("build_visualizer.socket.getaddrinfo", return_value=[address]):
            with self.assertRaisesRegex(BuildImageError, "เครือข่ายภายใน"):
                validate_public_image_url("https://localhost/image.png")


if __name__ == "__main__":
    unittest.main()
