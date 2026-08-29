"""Store demo product images in Cloudinary and save their URLs to PostgreSQL."""

from __future__ import annotations

import os
import re
import sys

import psycopg2
from psycopg2 import sql


PRODUCT_IMAGES = (
    (
        "pc_case",
        "d2cafb0b-be62-4072-a3fb-7069cdb6355b",
        "ADATA XPG Battlecruiser II ATX Mid Tower Black Tempered Glass Side Panel",
        "https://c1.neweggimages.com/productimage/nb640/ADFRD2602271DE0TF3E.jpg",
    ),
    (
        "motherboard",
        "38461941-af56-4c21-a1c0-eac865f91deb",
        "AsRock B850M Challenger WiFi White",
        "https://cdn.idealo.com/folder/Product/209796/6/209796629/s1_produktbild_max/asrock-b850m-challenger-wifi-white.jpg",
    ),
    (
        "cpu",
        "850de815-7c76-48e5-8097-a009109be14b",
        "AMD Ryzen 5 7600X3D",
        "https://royal-computers.ru/upload/thumbs/catalog/source/processor-amd-ryzen-5-7600x3d_678e17.png",
    ),
    # The source catalog contains the same CPU under two OpenDB IDs. Updating
    # both keeps the reference image available whichever duplicate is selected.
    (
        "cpu",
        "ba099e65-8148-4937-aa16-80927792778e",
        "AMD Ryzen 5 7600X3D",
        "https://royal-computers.ru/upload/thumbs/catalog/source/processor-amd-ryzen-5-7600x3d_678e17.png",
    ),
    (
        "cpu_cooler",
        "20c64d8a-b738-4a1b-8eec-7acfa3626222",
        "Alpenföhn Panorama 2 Air 58 CFM Black",
        "https://www.alpenfoehn.de/data/media/68/Panorama2_01-297368.jpg",
    ),
    (
        "ram",
        "64251c3b-3b18-492a-bc5d-f85b4d4636d2",
        "Acer Predator Hera RGB 32GB (2x16GB) DDR5-8000 CL36 Silver",
        "https://www.predatorstorage.com/wp-content/uploads/2024/12/2-predator-hera-ddr5-rgb-memory-silver.png",
    ),
    (
        "gpu",
        "912b1323-4ce2-4c6b-bb96-91a6e7e2c725",
        "Asus DUAL MINI OC GeForce GTX 1660 SUPER 6GB GDDR6 Black",
        "https://media.solotodo.com/media/products/1175138_picture_1591893902.png",
    ),
    (
        "psu",
        "5ac2a34f-275f-4dcd-865c-d72cc1758c23",
        "ADATA XPG CORE Reactor 750 Black 750W Fully Modular 80+ Gold Certified ATX",
        "https://i5.walmartimages.com/asr/db292c16-3a0d-43f1-887f-74c3dc824d1a.4ffc01c2ae2b3481e6f87e861a8c0ff8.jpeg",
    ),
    (
        "storage",
        "7d6c5939-3673-49b2-965c-1f21fc1b16fb",
        "Acer FA200 500GB SSD M.2 PCIe 4.0 NVMe",
        "https://bizweb.dktcdn.net/100/492/434/products/5-min-048785a4-db85-4688-b70d-b822c96679aa.png?v=1751075870190",
    ),
)


def cloudinary_image_url(source_url: str, table: str, opendb_id: str) -> str:
    """Upload a source image when Cloudinary is configured and return its HTTPS URL."""
    if not os.getenv("CLOUDINARY_URL"):
        return source_url

    try:
        from cloudinary import uploader
    except ImportError as error:
        raise RuntimeError(
            "Cloudinary is configured but the cloudinary package is not installed"
        ) from error

    folder = os.getenv("CLOUDINARY_FOLDER", "buildcores/products").strip("/")
    if not folder or not re.fullmatch(r"[A-Za-z0-9_/-]+", folder):
        raise RuntimeError("CLOUDINARY_FOLDER contains unsupported characters")

    result = uploader.upload(
        source_url,
        resource_type="image",
        public_id=f"{folder}/{table}/{opendb_id}",
        unique_filename=False,
        overwrite=os.getenv("CLOUDINARY_OVERWRITE", "").lower() in {"1", "true", "yes"},
        tags=["buildcores", "product-image", table],
    )
    secure_url = str(result.get("secure_url") or "")
    if not secure_url.startswith("https://"):
        raise RuntimeError(f"Cloudinary did not return a secure URL for {table}.{opendb_id}")
    return secure_url


def main() -> int:
    schema = os.getenv("PGSCHEMA", "buildcores_clean")
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", schema):
        print("[ERROR] Invalid PGSCHEMA", file=sys.stderr)
        return 2

    connection = psycopg2.connect(
        host=os.getenv("PGHOST", "localhost"),
        port=int(os.getenv("PGPORT", "5432")),
        dbname=os.getenv("PGDATABASE", "buildcores_db"),
        user=os.getenv("PGUSER", "postgres"),
        password=os.getenv("PGPASSWORD") or None,
        connect_timeout=10,
    )
    updated: list[tuple[str, str, str]] = []
    try:
        with connection, connection.cursor() as cursor:
            for table, opendb_id, expected_name, source_url in PRODUCT_IMAGES:
                image_url = cloudinary_image_url(source_url, table, opendb_id)
                cursor.execute(
                    sql.SQL(
                        "UPDATE {}.{} SET image_url = %s, updated_at = CURRENT_TIMESTAMP "
                        "WHERE opendb_id = %s AND product_name = %s "
                        "RETURNING opendb_id::text, product_name, image_url"
                    ).format(sql.Identifier(schema), sql.Identifier(table)),
                    (image_url, opendb_id, expected_name),
                )
                row = cursor.fetchone()
                if row is None:
                    raise RuntimeError(
                        f"Product was not found or its name changed: {table}.{opendb_id}"
                    )
                updated.append(row)
    finally:
        connection.close()

    unique_products = len({name for _, name, _ in updated})
    print(
        f"Product images: saved {unique_products} products "
        f"({len(updated)} database rows) to {schema}"
    )
    if os.getenv("CLOUDINARY_URL"):
        print("Product images: Cloudinary upload is enabled; PostgreSQL contains secure URLs")
    else:
        print("Product images: CLOUDINARY_URL is not set; original source URLs were saved")
    for _, name, _ in updated:
        print(f"  OK  {name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
