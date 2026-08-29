"""Keep only the newest products in the feature CSV catalog used by the web API."""

from __future__ import annotations

import argparse
import csv
import os
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "dataset"
FEATURE_DIR = ROOT / "data" / "processed" / "features"
CATALOG_FILES = (
    "cpu.csv",
    "motherboard.csv",
    "ram.csv",
    "gpu.csv",
    "psu.csv",
    "pc_case.csv",
    "cpu_cooler.csv",
    "storage.csv",
)


def release_year(value: str | None) -> int:
    try:
        year = int(str(value).strip())
        return year if 1970 <= year <= 2100 else -1
    except (TypeError, ValueError):
        return -1


def source_recency(path: Path) -> dict[str, tuple[int, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return {
            row.get("opendb_id", ""): (
                release_year(row.get("metadata_releaseYear")),
                row.get("metadata_last_manually_spec_verified_at", "") or "",
            )
            for row in csv.DictReader(handle)
            if row.get("opendb_id")
        }


def read_csv(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        return list(reader.fieldnames or ()), list(reader)


def replace_csv(path: Path, fieldnames: list[str], rows: list[dict[str, str]]) -> None:
    has_bom = path.read_bytes().startswith(b"\xef\xbb\xbf")
    encoding = "utf-8-sig" if has_bom else "utf-8"
    temporary_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(
            "w",
            encoding=encoding,
            newline="",
            dir=path.parent,
            prefix=f".{path.name}.",
            suffix=".tmp",
            delete=False,
        ) as handle:
            temporary_path = handle.name
            writer = csv.DictWriter(handle, fieldnames=fieldnames, lineterminator="\n")
            writer.writeheader()
            writer.writerows(rows)
        os.replace(temporary_path, path)
    finally:
        if temporary_path and os.path.exists(temporary_path):
            os.unlink(temporary_path)


def trim_catalog(keep: int, apply: bool) -> None:
    for filename in CATALOG_FILES:
        feature_path = FEATURE_DIR / filename
        recency = source_recency(SOURCE_DIR / filename)
        fieldnames, rows = read_csv(feature_path)
        ranked = sorted(
            rows,
            key=lambda row: (
                *recency.get(row.get("opendb_id", ""), (-1, "")),
                row.get("opendb_id", ""),
            ),
            reverse=True,
        )
        retained = ranked[:keep]
        years = [recency.get(row.get("opendb_id", ""), (-1, ""))[0] for row in retained]
        year_range = f"{min(years)}-{max(years)}" if years else "none"
        action = "saved" if apply else "would save"
        print(f"{filename}: {len(rows)} -> {len(retained)} rows ({action}, years {year_range})")
        if apply:
            replace_csv(feature_path, fieldnames, retained)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Keep the newest products in web-facing feature CSV files"
    )
    parser.add_argument("--keep", type=int, default=50)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    if args.keep < 1:
        parser.error("--keep must be at least 1")
    trim_catalog(args.keep, args.apply)


if __name__ == "__main__":
    main()
