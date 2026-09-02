"""Read the clean public product catalog from Supabase Data API."""

from __future__ import annotations

import json
from typing import Any
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen


CATEGORY_MAP = {
    "cpu": "cpu",
    "motherboard": "motherboard",
    "gpu": "gpu",
    "ram": "ram",
    "cpu_cooler": "cooler",
    "pc_case": "case",
    "psu": "psu",
    "storage": "storage",
}


def scalar(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    return str(value).strip()


def load_supabase_catalog(
    project_url: str,
    publishable_key: str,
    timeout: float = 10,
) -> dict[str, list[dict[str, str]]]:
    """Fetch and flatten ``product_catalog`` rows without using a secret key."""

    project_url = project_url.strip().rstrip("/")
    parsed = urlparse(project_url)
    if parsed.scheme != "https" or not parsed.netloc:
        raise ValueError("SUPABASE_URL ต้องเป็น public HTTPS URL")
    publishable_key = publishable_key.strip()
    if not publishable_key.startswith(("sb_publishable_", "eyJ")):
        raise ValueError("SUPABASE_PUBLISHABLE_KEY มีรูปแบบไม่ถูกต้อง")

    query = urlencode({
        "select": "opendb_id,category,name,manufacturer,image_url,specs,catalog_rank",
        "order": "category.asc,catalog_rank.asc",
    })
    request = Request(
        f"{project_url}/rest/v1/product_catalog?{query}",
        headers={
            "apikey": publishable_key,
            "Authorization": f"Bearer {publishable_key}",
            "Accept": "application/json",
            "User-Agent": "BuildCoresCatalog/1.0",
        },
    )
    with urlopen(request, timeout=timeout) as response:
        rows = json.load(response)
    if not isinstance(rows, list):
        raise ValueError("Supabase product_catalog response ต้องเป็น JSON array")

    catalog = {part_type: [] for part_type in CATEGORY_MAP.values()}
    seen: set[str] = set()
    for item in rows:
        if not isinstance(item, dict):
            raise ValueError("Supabase product_catalog มี row ที่ไม่ใช่ object")
        category = scalar(item.get("category"))
        part_type = CATEGORY_MAP.get(category)
        if not part_type:
            raise ValueError(f"Supabase product_catalog มี category ที่ไม่รองรับ: {category}")
        opendb_id = scalar(item.get("opendb_id"))
        name = scalar(item.get("name"))
        manufacturer = scalar(item.get("manufacturer"))
        specs = item.get("specs") or {}
        if not opendb_id or not name or not manufacturer or not isinstance(specs, dict):
            raise ValueError("Supabase product_catalog มี id/name/manufacturer/specs ไม่ครบ")
        if opendb_id in seen:
            raise ValueError(f"Supabase product_catalog มี opendb_id ซ้ำ: {opendb_id}")
        seen.add(opendb_id)
        catalog[part_type].append({
            "opendb_id": opendb_id,
            "name": name,
            "manufacturer": manufacturer,
            "image_url": scalar(item.get("image_url")),
            **{key: scalar(value) for key, value in specs.items()},
        })

    empty = [part_type for part_type, items in catalog.items() if not items]
    if empty:
        raise ValueError(f"Supabase product_catalog ไม่มีข้อมูลหมวด: {', '.join(empty)}")
    return catalog
