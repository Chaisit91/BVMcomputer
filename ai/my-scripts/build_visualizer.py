"""Create simulated assembled-PC turntable images from selected products."""

from __future__ import annotations

import base64
import ipaddress
import io
import json
import os
import re
import socket
from concurrent.futures import ThreadPoolExecutor
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import HTTPRedirectHandler, Request, build_opener, urlopen

from PIL import Image, ImageDraw, ImageOps, UnidentifiedImageError


PART_ORDER = ("case", "motherboard", "cpu", "cooler", "ram", "gpu", "psu", "storage")
PART_LABELS = {
    "case": "PC case",
    "motherboard": "motherboard",
    "cpu": "CPU",
    "cooler": "CPU cooler",
    "ram": "RAM kit",
    "gpu": "graphics card",
    "psu": "power supply",
    "storage": "storage drive",
}
IMAGE_URL = re.compile(r"^https://", re.IGNORECASE)
MAXPLUS_IMAGE_API_URL = "https://api.maxplus-ai.cc/gpt-image/v1/images/generations"
MAXPLUS_REFERENCE_LIMIT = 5
INDIVIDUAL_REFERENCE_TYPES = ("case", "motherboard", "cooler", "gpu")
MAX_REFERENCE_SIDE = 1024
MAX_DOWNLOAD_BYTES = 15 * 1024 * 1024
DEFAULT_TURNTABLE_VIEWS = 8
MIN_TURNTABLE_VIEWS = 4
MAX_TURNTABLE_VIEWS = 12
Image.MAX_IMAGE_PIXELS = 40_000_000


class BuildImageError(ValueError):
    """A build cannot be rendered safely from the supplied catalog data."""


def validate_public_image_url(image_url: str) -> None:
    parsed = urlparse(image_url)
    if parsed.scheme.lower() != "https" or not parsed.hostname or parsed.username or parsed.password:
        raise BuildImageError("รูปสินค้าต้องเป็น public HTTPS URL")
    try:
        addresses = {
            item[4][0]
            for item in socket.getaddrinfo(parsed.hostname, parsed.port or 443, type=socket.SOCK_STREAM)
        }
    except socket.gaierror as error:
        raise BuildImageError(f"หา host ของรูปสินค้าไม่พบ: {parsed.hostname}") from error
    if not addresses or any(not ipaddress.ip_address(address).is_global for address in addresses):
        raise BuildImageError("ไม่อนุญาต URL รูปจาก localhost หรือเครือข่ายภายใน")


class SafeImageRedirectHandler(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        validate_public_image_url(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def resize_reference_image(image_bytes: bytes) -> tuple[str, int, int]:
    """Normalize an image to at most 1024x1024 and return a compact data URL."""
    try:
        with Image.open(io.BytesIO(image_bytes)) as opened:
            image = ImageOps.exif_transpose(opened)
            image.thumbnail(
                (MAX_REFERENCE_SIDE, MAX_REFERENCE_SIDE),
                Image.Resampling.LANCZOS,
            )
            has_alpha = image.mode in {"RGBA", "LA"} or "transparency" in image.info
            output = io.BytesIO()
            if has_alpha:
                image.convert("RGBA").save(output, format="PNG", optimize=True)
                media_type = "image/png"
            else:
                image.convert("RGB").save(output, format="JPEG", quality=88, optimize=True)
                media_type = "image/jpeg"
            width, height = image.size
    except (Image.DecompressionBombError, OSError, UnidentifiedImageError) as error:
        raise BuildImageError("ไฟล์จาก image_url ไม่ใช่รูปภาพที่รองรับหรือมีขนาดใหญ่เกินไป") from error
    encoded = base64.b64encode(output.getvalue()).decode("ascii")
    return f"data:{media_type};base64,{encoded}", width, height


def download_reference_image(part: dict[str, str]) -> dict[str, Any]:
    image_url = part["image_url"]
    validate_public_image_url(image_url)
    request = Request(image_url, headers={"User-Agent": "BuildCoresImageFetcher/1.0"})
    try:
        with build_opener(SafeImageRedirectHandler()).open(request, timeout=20) as response:
            content_type = response.headers.get_content_type()
            content_length = response.headers.get("Content-Length")
            if not content_type.startswith("image/"):
                raise BuildImageError(f"URL ของ {part['name']} ไม่ได้ส่งไฟล์รูปภาพ")
            if content_length and int(content_length) > MAX_DOWNLOAD_BYTES:
                raise BuildImageError(f"รูปของ {part['name']} มีขนาดเกิน 15 MB")
            image_bytes = response.read(MAX_DOWNLOAD_BYTES + 1)
    except (HTTPError, URLError, TimeoutError, ValueError) as error:
        raise BuildImageError(f"ดาวน์โหลดรูปของ {part['name']} ไม่สำเร็จ: {error}") from error
    if len(image_bytes) > MAX_DOWNLOAD_BYTES:
        raise BuildImageError(f"รูปของ {part['name']} มีขนาดเกิน 15 MB")
    data_url, width, height = resize_reference_image(image_bytes)
    return {**part, "reference_data_url": data_url, "reference_width": width, "reference_height": height}


def prepare_reference_images(parts: list[dict[str, str]]) -> list[dict[str, Any]]:
    with ThreadPoolExecutor(max_workers=4) as executor:
        return list(executor.map(download_reference_image, parts))


def selected_image_parts(
    by_id: dict[str, dict[str, dict[str, str]]],
    selection: dict[str, str],
) -> list[dict[str, str]]:
    missing_types = [part_type for part_type in PART_ORDER if not selection.get(part_type)]
    if missing_types:
        raise BuildImageError(f"กรุณาเลือกอุปกรณ์ให้ครบ: {', '.join(missing_types)}")

    parts = []
    missing_images = []
    for part_type in PART_ORDER:
        part_id = selection[part_type]
        row = by_id.get(part_type, {}).get(part_id)
        if row is None:
            raise BuildImageError(f"ไม่พบ {part_type}: {part_id}")
        image_url = (row.get("image_url") or "").strip()
        if not image_url:
            missing_images.append(f"{PART_LABELS[part_type]}: {row.get('name', part_id)}")
            continue
        if not IMAGE_URL.match(image_url):
            raise BuildImageError(
                f"รูปของ {row.get('name', part_id)} ต้องเป็น public HTTPS URL"
            )
        parts.append({
            "type": part_type,
            "label": PART_LABELS[part_type],
            "opendb_id": part_id,
            "name": row.get("name", ""),
            "image_url": image_url,
        })

    if missing_images:
        raise BuildImageError("ยังไม่มีรูปสินค้า:\n- " + "\n- ".join(missing_images))
    return parts


def build_prompt(parts: list[dict[str, str]], angle_degrees: int = 315) -> str:
    manifest = "\n".join(
        f"Part {index}: {part['label']} — {part['name']} [{part['opendb_id']}]"
        for index, part in enumerate(parts, 1)
    )
    return f"""Use case: product-mockup
Asset type: customer PC build preview
Primary request: Create one photorealistic studio product image of a fully assembled desktop PC using the exact products in the reference-image manifest below.
Reference-image manifest:
{manifest}
Reference layout: Some products may be grouped as separate labeled tiles in one contact-sheet reference because the image API accepts at most five reference files. Treat every tile as a distinct product from the eight-part manifest, not as one combined product.
Turntable camera: Render exactly one view at {angle_degrees} degrees around the PC. Use this fixed convention: 0 degrees is the front, 90 degrees is the right side, 180 degrees is the rear, and 270 degrees is the left/transparent-panel side. Keep the PC perfectly centered, upright, fully in frame, and at the same scale, camera height, focal length, neutral studio lighting, and plain light-gray background used for every angle in the turntable set. Do not render a collage, contact sheet, annotations, or another camera angle.
Composition: product turntable view; the PC case must define the enclosure, exterior shape, and color. Show internal components only when they are naturally visible through the transparent panel from this angle.
Constraints: Use every listed product exactly once. Preserve each product's distinctive shape, color, branding, fan count, cooler type, and visible layout as closely as possible. Do not substitute a different model. Do not add, remove, duplicate, redesign, recolor, or invent any PC component. Internal parts that are normally hidden may remain hidden. No monitor, keyboard, mouse, desk accessories, text, labels, people, watermark, or decorative objects.
Important: This is a visual simulation based only on the supplied references; favor product identity over artistic styling."""


def maxplus_reference_images(references: list[dict[str, Any]]) -> list[dict[str, str]]:
    """Fit eight product references into MaxPlus's five-reference request limit."""
    if len(references) <= MAXPLUS_REFERENCE_LIMIT:
        payload_images = []
        for index, part in enumerate(references, 1):
            header, encoded = part["reference_data_url"].split(",", 1)
            media_type = header.removeprefix("data:").split(";", 1)[0]
            extension = "png" if media_type == "image/png" else "jpg"
            payload_images.append({
                "media_type": media_type,
                "data": encoded,
                "name": f"{index:02d}-{part['type']}.{extension}",
            })
        return payload_images

    individual = [
        part for part in references if part["type"] in INDIVIDUAL_REFERENCE_TYPES
    ]
    grouped = [
        part for part in references if part["type"] not in INDIVIDUAL_REFERENCE_TYPES
    ]
    if len(individual) != MAXPLUS_REFERENCE_LIMIT - 1 or len(grouped) > 4:
        raise BuildImageError("จัดกลุ่มรูปอ้างอิงให้ไม่เกินข้อจำกัด 5 รูปของ MaxPlus ไม่ได้")

    payload_images = maxplus_reference_images(individual)
    canvas = Image.new("RGB", (1024, 1024), "white")
    draw = ImageDraw.Draw(canvas)
    for index, part in enumerate(grouped):
        column, row = index % 2, index // 2
        left, top = column * 512, row * 512
        draw.rectangle((left, top, left + 511, top + 511), outline="#b8bec8", width=2)
        label = f"{part['label']}: {part['name']}"
        draw.text((left + 14, top + 12), label[:70], fill="black")
        _, encoded = part["reference_data_url"].split(",", 1)
        with Image.open(io.BytesIO(base64.b64decode(encoded))) as opened:
            product = ImageOps.contain(opened.convert("RGBA"), (476, 450), Image.Resampling.LANCZOS)
        x = left + (512 - product.width) // 2
        y = top + 48 + (450 - product.height) // 2
        canvas.paste(product, (x, y), product)

    output = io.BytesIO()
    canvas.save(output, format="JPEG", quality=90, optimize=True)
    payload_images.append({
        "media_type": "image/jpeg",
        "data": base64.b64encode(output.getvalue()).decode("ascii"),
        "name": "05-cpu-ram-psu-storage-contact-sheet.jpg",
    })
    return payload_images


def _maxplus_api_key() -> str:
    api_key = os.getenv("MAXPLUS_API_KEY", "").strip()
    if not api_key:
        raise BuildImageError("ยังไม่ได้ตั้งค่า MAXPLUS_API_KEY บนเครื่องเซิร์ฟเวอร์")
    if not api_key.lower().startswith("ccsk-"):
        raise BuildImageError(
            "MAXPLUS_API_KEY ต้องเป็นคีย์ของ MaxPlus AI ที่ขึ้นต้นด้วย ccsk-"
        )
    return api_key


def _generate_angle_image(
    api_key: str,
    parts: list[dict[str, str]],
    reference_images: list[dict[str, str]],
    angle_degrees: int,
) -> str:
    """Generate and validate one angle in a turntable sequence."""

    payload = {
        "model": os.getenv("MAXPLUS_IMAGE_MODEL", "gpt-image-2"),
        "prompt": build_prompt(parts, angle_degrees),
        "n": 1,
        "size": "1024x1024",
        "quality": "high",
        "output_format": "png",
        "response_format": "b64_json",
        "reference_images": reference_images,
    }
    request = Request(
        MAXPLUS_IMAGE_API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=300) as response:
            result = json.load(response)
    except HTTPError as error:
        request_id = error.headers.get("x-request-id", "")
        try:
            raw_body = error.read().decode("utf-8", errors="replace")
            error_body = json.loads(raw_body)
            api_error = error_body.get("error", {})
            if isinstance(api_error, dict):
                detail = api_error.get("message") or raw_body or str(error)
                error_code = api_error.get("code") or api_error.get("type")
            else:
                detail = str(api_error or raw_body or error)
                error_code = error_body.get("type")
        except (json.JSONDecodeError, AttributeError, OSError):
            detail = raw_body if "raw_body" in locals() and raw_body else str(error)
            error_code = None
        context = [f"HTTP {error.code}"]
        if error_code:
            context.append(str(error_code))
        if request_id:
            context.append(f"request_id={request_id}")
        raise BuildImageError(f"MaxPlus AI API ({', '.join(context)}): {detail}") from error
    except (TimeoutError, URLError) as error:
        raise BuildImageError(f"เชื่อมต่อ MaxPlus AI API ไม่สำเร็จ: {error}") from error

    image_data = result.get("data")
    image_base64 = image_data[0].get("b64_json") if isinstance(image_data, list) and image_data else None
    if not image_base64:
        raise BuildImageError("MaxPlus AI API ไม่ได้ส่งภาพแบบ b64_json กลับมา")
    try:
        base64.b64decode(image_base64, validate=True)
    except (ValueError, TypeError) as error:
        raise BuildImageError("MaxPlus AI API ส่งข้อมูลรูปภาพ base64 ที่ไม่ถูกต้อง") from error
    return image_base64


def _turntable_view_count() -> int:
    raw_value = os.getenv("MAXPLUS_TURNTABLE_VIEWS", str(DEFAULT_TURNTABLE_VIEWS))
    try:
        view_count = int(raw_value)
    except ValueError as error:
        raise BuildImageError("MAXPLUS_TURNTABLE_VIEWS ต้องเป็นจำนวนเต็ม 4 ถึง 12") from error
    if not MIN_TURNTABLE_VIEWS <= view_count <= MAX_TURNTABLE_VIEWS:
        raise BuildImageError("MAXPLUS_TURNTABLE_VIEWS ต้องอยู่ระหว่าง 4 ถึง 12")
    return view_count


def _build_result(
    references: list[dict[str, Any]],
    images: list[dict[str, Any]],
) -> dict[str, Any]:
    return {
        # Keep the original fields so older clients can still show the first frame.
        "image_base64": images[0]["image_base64"],
        "media_type": "image/png",
        "images": images,
        "parts": [
            {
                **{key: part[key] for key in ("type", "opendb_id", "name")},
                "reference_size": f"{part['reference_width']}x{part['reference_height']}",
            }
            for part in references
        ],
        "disclaimer": "ภาพหมุน 360° เป็นชุดภาพจำลองจาก AI ไม่ใช่โมเดล 3D รายละเอียดระหว่างมุมอาจแตกต่างกัน โปรดตรวจรูปสินค้าต้นฉบับก่อนสั่งซื้อ",
    }


def generate_build_image(parts: list[dict[str, str]]) -> dict[str, Any]:
    """Generate one legacy preview image."""
    api_key = _maxplus_api_key()
    references = prepare_reference_images(parts)
    reference_images = maxplus_reference_images(references)
    image_base64 = _generate_angle_image(api_key, parts, reference_images, 315)
    return _build_result(references, [{
        "angle": 315,
        "image_base64": image_base64,
        "media_type": "image/png",
    }])


def generate_build_turntable(parts: list[dict[str, str]]) -> dict[str, Any]:
    """Generate evenly spaced images that the browser can drag like a 360 viewer."""
    api_key = _maxplus_api_key()
    references = prepare_reference_images(parts)
    reference_images = maxplus_reference_images(references)
    view_count = _turntable_view_count()
    angles = [round(index * 360 / view_count) % 360 for index in range(view_count)]
    worker_count = min(2, view_count)

    def render(angle: int) -> dict[str, Any]:
        return {
            "angle": angle,
            "image_base64": _generate_angle_image(
                api_key, parts, reference_images, angle
            ),
            "media_type": "image/png",
        }

    with ThreadPoolExecutor(max_workers=worker_count) as executor:
        images = list(executor.map(render, angles))
    return _build_result(references, images)
