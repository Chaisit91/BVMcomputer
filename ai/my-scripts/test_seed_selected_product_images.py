import os
import sys
import types
import unittest
from unittest.mock import Mock, patch

from seed_selected_product_images import cloudinary_image_url


class CloudinaryImageUrlTests(unittest.TestCase):
    def test_returns_source_url_when_cloudinary_is_not_configured(self):
        source_url = "https://images.example.test/gpu.png"
        with patch.dict(os.environ, {}, clear=True):
            self.assertEqual(
                cloudinary_image_url(source_url, "gpu", "product-id"),
                source_url,
            )

    def test_uploads_to_a_stable_public_id_and_returns_secure_url(self):
        uploader = Mock()
        uploader.upload.return_value = {
            "secure_url": "https://res.cloudinary.com/demo/image/upload/gpu.png"
        }
        cloudinary = types.ModuleType("cloudinary")
        cloudinary.uploader = uploader

        with (
            patch.dict(
                os.environ,
                {"CLOUDINARY_URL": "cloudinary://key:secret@demo"},
                clear=True,
            ),
            patch.dict(sys.modules, {"cloudinary": cloudinary}),
        ):
            result = cloudinary_image_url(
                "https://images.example.test/gpu.png", "gpu", "product-id"
            )

        self.assertEqual(
            result,
            "https://res.cloudinary.com/demo/image/upload/gpu.png",
        )
        uploader.upload.assert_called_once_with(
            "https://images.example.test/gpu.png",
            resource_type="image",
            public_id="buildcores/products/gpu/product-id",
            unique_filename=False,
            overwrite=False,
            tags=["buildcores", "product-image", "gpu"],
        )

    def test_rejects_a_response_without_a_secure_url(self):
        uploader = Mock()
        uploader.upload.return_value = {"url": "http://example.test/gpu.png"}
        cloudinary = types.ModuleType("cloudinary")
        cloudinary.uploader = uploader

        with (
            patch.dict(
                os.environ,
                {"CLOUDINARY_URL": "cloudinary://key:secret@demo"},
                clear=True,
            ),
            patch.dict(sys.modules, {"cloudinary": cloudinary}),
        ):
            with self.assertRaisesRegex(RuntimeError, "secure URL"):
                cloudinary_image_url(
                    "https://images.example.test/gpu.png", "gpu", "product-id"
                )


if __name__ == "__main__":
    unittest.main()
