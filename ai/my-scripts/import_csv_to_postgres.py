"""Import BuildCores CSV files into clear, category-specific PostgreSQL tables.

Each hardware category has its own table and every row contains ``brand_name``.
Optional source fields are preserved in ``source_details`` JSONB without empty
keys. The former mixed ``products`` layout is left untouched in its old schema.
"""

from __future__ import annotations

import argparse
import csv
import getpass
import json
import os
import re
import sys
import uuid
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Callable

import psycopg2
from psycopg2 import sql
from psycopg2.errors import InvalidCatalogName
from psycopg2.extras import Json


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DATA_DIR = ROOT / "data" / "processed"
VALID_SCHEMA = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


def clean(value: Any) -> str | None:
    if value is None:
        return None
    return str(value).strip() or None


def to_int(value: Any) -> int | None:
    try:
        return int(float(clean(value))) if clean(value) is not None else None
    except (TypeError, ValueError):
        return None


def to_float(value: Any) -> float | None:
    try:
        return float(clean(value)) if clean(value) is not None else None
    except (TypeError, ValueError):
        return None


def to_bool(value: Any) -> bool | None:
    normalized = (clean(value) or "").lower()
    true_values = {"true", "1", "yes", "y", "ecc", "registered", "enabled"}
    false_values = {"false", "0", "no", "n", "non-ecc", "unbuffered", "disabled"}
    if normalized in true_values:
        return True
    if normalized in false_values:
        return False
    return None


def to_release_year(value: Any) -> int | None:
    year = to_int(value)
    maximum = datetime.now().year + 2
    return year if year is not None and 1970 <= year <= maximum else None


def required_uuid(value: Any) -> str:
    try:
        return str(uuid.UUID(clean(value) or ""))
    except ValueError as exc:
        raise ValueError(f"invalid or missing opendb_id: {value}") from exc


def sum_ints(*values: Any) -> int | None:
    numbers = [number for number in map(to_int, values) if number is not None]
    return sum(numbers) if numbers else None


def join_values(*values: Any) -> str | None:
    present = [item for item in map(clean, values) if item]
    return "; ".join(present) or None


def product_image_url(row: dict[str, str]) -> str | None:
    """Return an image URL/path from supported CSV column names."""
    return next((value for column in ("image_url", "product_image_url", "metadata_image_url")
                 if (value := clean(row.get(column))) is not None), None)


def parse_json(value: Any) -> Any:
    text = clean(value)
    if text is None:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return text


def json_item_count(value: Any) -> int | None:
    parsed = parse_json(value)
    if isinstance(parsed, list):
        return len(parsed)
    if isinstance(parsed, dict):
        return len(parsed)
    return to_int(value)


def prefixed_values(row: dict[str, str], prefix: str) -> dict[str, str] | None:
    result = {
        key.removeprefix(prefix): cleaned
        for key, value in row.items()
        if key.startswith(prefix) and (cleaned := clean(value)) is not None
    }
    return result or None


def nonempty_source(row: dict[str, str]) -> dict[str, str]:
    return {
        key: cleaned
        for key, value in row.items()
        if (cleaned := clean(value)) is not None
    }


def completeness(row: dict[str, str]) -> float:
    if not row:
        return 0.0
    filled = sum(clean(value) is not None for value in row.values())
    return round(100 * filled / len(row), 2)


def source(column: str, converter: Callable[[Any], Any] = clean):
    return lambda row: converter(row.get(column))


@dataclass(frozen=True)
class Field:
    name: str
    sql_type: str
    getter: Callable[[dict[str, str]], Any]


@dataclass(frozen=True)
class Dataset:
    filename: str
    table: str
    name_en: str
    name_th: str
    fields: tuple[Field, ...]


def f(name: str, sql_type: str, column: str, converter=clean) -> Field:
    return Field(name, sql_type, source(column, converter))


DATASETS = (
    Dataset("cpu.csv", "cpu", "CPU", "ซีพียู", (
        f("socket", "TEXT", "socket"),
        f("cores", "INTEGER", "cores_total", to_int),
        f("threads", "INTEGER", "cores_threads", to_int),
        f("performance_cores", "INTEGER", "cores_performance", to_int),
        f("efficiency_cores", "INTEGER", "cores_efficiency", to_int),
        f("base_clock_ghz", "DOUBLE PRECISION", "clocks_performance_base", to_float),
        f("boost_clock_ghz", "DOUBLE PRECISION", "clocks_performance_boost", to_float),
        f("tdp_w", "INTEGER", "specifications_tdp", to_int),
        f("ppt_w", "INTEGER", "specifications_ppt", to_int),
        f("lithography", "TEXT", "specifications_lithography"),
        f("integrated_graphics", "TEXT", "specifications_integratedGraphics_model"),
        f("microarchitecture", "TEXT", "microarchitecture"),
        f("core_family", "TEXT", "coreFamily"),
        f("memory_types", "TEXT", "specifications_memory_types"),
        f("max_memory_gb", "INTEGER", "specifications_memory_maxSupport", to_int),
        f("memory_channels", "INTEGER", "specifications_memory_channels", to_int),
        f("cache_l1", "TEXT", "cache_l1"),
        f("cache_l2_mb", "DOUBLE PRECISION", "cache_l2", to_float),
        f("cache_l3_mb", "DOUBLE PRECISION", "cache_l3", to_float),
        f("ecc_support", "BOOLEAN", "specifications_eccSupport", to_bool),
        f("includes_cooler", "BOOLEAN", "specifications_includesCooler", to_bool),
        f("simultaneous_multithreading", "BOOLEAN", "specifications_simultaneousMultithreading", to_bool),
        f("packaging", "TEXT", "specifications_packaging"),
    )),
    Dataset("gpu.csv", "gpu", "GPU", "การ์ดจอ", (
        f("chipset", "TEXT", "chipset"),
        f("chipset_manufacturer", "TEXT", "chipset_manufacturer"),
        f("vram_gb", "DOUBLE PRECISION", "memory", to_float),
        f("memory_type", "TEXT", "memory_type"),
        f("memory_bus_bit", "INTEGER", "memory_bus", to_int),
        f("base_clock_mhz", "DOUBLE PRECISION", "core_base_clock", to_float),
        f("boost_clock_mhz", "DOUBLE PRECISION", "core_boost_clock", to_float),
        f("effective_memory_clock_mhz", "DOUBLE PRECISION", "effective_memory_clock", to_float),
        f("core_count", "INTEGER", "core_count", to_int),
        f("tdp_w", "INTEGER", "tdp", to_int),
        f("length_mm", "DOUBLE PRECISION", "length", to_float),
        f("slot_width", "DOUBLE PRECISION", "total_slot_width", to_float),
        f("interface", "TEXT", "interface"),
        f("cooling", "TEXT", "cooling"),
        f("color", "TEXT", "color"),
        f("lighting", "TEXT", "lighting"),
        Field("power_connectors", "TEXT", lambda row: join_values(
            row.get("power_connectors_pcie_12VHPWR"), row.get("power_connectors_pcie_12V_2x6"),
            row.get("power_connectors_pcie_6_pin"), row.get("power_connectors_pcie_8_pin"))),
        Field("video_outputs", "JSONB", lambda row: prefixed_values(row, "video_outputs_")),
    )),
    Dataset("ram.csv", "ram", "RAM", "แรม", (
        f("memory_type", "TEXT", "ram_type"),
        f("capacity_gb", "INTEGER", "capacity", to_int),
        f("module_count", "INTEGER", "modules_quantity", to_int),
        f("module_capacity_gb", "INTEGER", "modules_capacity_gb", to_int),
        f("speed_mhz", "INTEGER", "speed", to_int),
        f("cas_latency", "TEXT", "cas_latency"),
        f("timings", "TEXT", "timings"),
        f("voltage", "DOUBLE PRECISION", "voltage", to_float),
        f("ecc", "BOOLEAN", "ecc", to_bool),
        f("registered", "BOOLEAN", "registered", to_bool),
        f("form_factor", "TEXT", "form_factor"),
        f("heat_spreader", "BOOLEAN", "heat_spreader", to_bool),
        f("rgb", "BOOLEAN", "rgb", to_bool),
        f("height_mm", "DOUBLE PRECISION", "height", to_float),
        f("profile_support", "TEXT", "profile_support"),
        f("color", "TEXT", "color"),
    )),
    Dataset("motherboard.csv", "motherboard", "Motherboard", "เมนบอร์ด", (
        f("socket", "TEXT", "socket"),
        f("chipset", "TEXT", "chipset"),
        f("form_factor", "TEXT", "form_factor"),
        f("memory_type", "TEXT", "memory_ram_type"),
        f("memory_slots", "INTEGER", "memory_slots", to_int),
        f("max_memory_gb", "INTEGER", "memory_max", to_int),
        Field("m2_slot_count", "INTEGER", lambda row: json_item_count(row.get("m2_slots"))),
        Field("m2_slots", "JSONB", lambda row: parse_json(row.get("m2_slots"))),
        Field("sata_ports", "INTEGER", lambda row: sum_ints(
            row.get("storage_devices_sata_3_gb_s"), row.get("storage_devices_sata_6_gb_s"))),
        f("u2_ports", "INTEGER", "storage_devices_u2", to_int),
        Field("pcie_slots", "JSONB", lambda row: parse_json(row.get("pcie_slots"))),
        f("onboard_ethernet", "TEXT", "onboard_ethernet"),
        f("wireless_networking", "TEXT", "wireless_networking"),
        f("ecc_support", "BOOLEAN", "ecc_support", to_bool),
        f("audio_chipset", "TEXT", "audio_chipset"),
        Field("back_panel_ports", "JSONB", lambda row: parse_json(row.get("back_panel_ports"))),
        f("color", "TEXT", "color"),
    )),
    Dataset("psu.csv", "psu", "PSU", "พาวเวอร์ซัพพลาย", (
        f("wattage_w", "INTEGER", "wattage", to_int),
        f("efficiency_rating", "TEXT", "efficiency_rating"),
        f("cybernetics_efficiency", "TEXT", "cybernetics_efficiency_rating"),
        f("cybernetics_noise", "TEXT", "cybernetics_noise_rating"),
        f("modularity", "TEXT", "modular"),
        f("form_factor", "TEXT", "form_factor"),
        f("fanless", "BOOLEAN", "fanless", to_bool),
        f("length_mm", "DOUBLE PRECISION", "length", to_float),
        f("atx_24_pin", "INTEGER", "connectors_atx_24_pin", to_int),
        f("eps_8_pin", "INTEGER", "connectors_eps_8_pin", to_int),
        f("pcie_12vhpwr", "INTEGER", "connectors_pcie_12vhpwr", to_int),
        f("pcie_6_plus_2_pin", "INTEGER", "connectors_pcie_6_plus_2_pin", to_int),
        f("sata_connectors", "INTEGER", "connectors_sata", to_int),
        f("molex_4_pin", "INTEGER", "connectors_molex_4_pin", to_int),
    )),
    Dataset("cpu_cooler.csv", "cpu_cooler", "CPU Cooler", "ชุดระบายความร้อนซีพียู", (
        Field("cooler_type", "TEXT", lambda row: "Water" if to_bool(row.get("water_cooled")) else "Air"),
        f("socket_support", "TEXT", "cpu_sockets"),
        f("radiator_size_mm", "INTEGER", "radiator_size", to_int),
        f("fan_size_mm", "INTEGER", "fan_size", to_int),
        f("fan_count", "INTEGER", "fan_quantity", to_int),
        f("height_mm", "DOUBLE PRECISION", "height", to_float),
        f("min_fan_rpm", "INTEGER", "min_fan_rpm", to_int),
        f("max_fan_rpm", "INTEGER", "max_fan_rpm", to_int),
        f("min_noise_db", "DOUBLE PRECISION", "min_noise_level", to_float),
        f("max_noise_db", "DOUBLE PRECISION", "max_noise_level", to_float),
        f("fanless", "BOOLEAN", "fanless", to_bool),
        f("lighting", "TEXT", "lighting"),
        f("color", "TEXT", "color"),
    )),
    Dataset("pc_case.csv", "pc_case", "PC Case", "เคสคอมพิวเตอร์", (
        f("case_type", "TEXT", "form_factor"),
        f("motherboard_support", "TEXT", "supported_motherboard_form_factors"),
        f("gpu_max_length_mm", "DOUBLE PRECISION", "max_video_card_length", to_float),
        f("cpu_cooler_max_height_mm", "DOUBLE PRECISION", "max_cpu_cooler_height", to_float),
        f("psu_max_length_mm", "DOUBLE PRECISION", "max_psu_length", to_float),
        f("psu_support", "TEXT", "supported_power_supply_form_factors"),
        f("width_mm", "DOUBLE PRECISION", "dimensions_mm_width", to_float),
        f("height_mm", "DOUBLE PRECISION", "dimensions_mm_height", to_float),
        f("depth_mm", "DOUBLE PRECISION", "dimensions_mm_depth", to_float),
        f("volume_l", "DOUBLE PRECISION", "volume", to_float),
        f("weight_kg", "DOUBLE PRECISION", "weight", to_float),
        f("expansion_slots", "INTEGER", "expansion_slots", to_int),
        f("internal_2_5_bays", "INTEGER", "internal_2_5_bays", to_int),
        f("internal_3_5_bays", "INTEGER", "internal_3_5_bays", to_int),
        f("transparent_side_panel", "BOOLEAN", "has_transparent_side_panel", to_bool),
        f("color", "TEXT", "color"),
    )),
    Dataset("storage.csv", "storage", "Storage", "อุปกรณ์จัดเก็บข้อมูล", (
        Field("storage_type", "TEXT", lambda row: clean(row.get("storage_type")) or clean(row.get("type"))),
        f("capacity_gb", "INTEGER", "capacity", to_int),
        f("interface", "TEXT", "interface"),
        f("form_factor", "TEXT", "form_factor"),
        f("cache_mb", "INTEGER", "cache", to_int),
        f("nvme", "BOOLEAN", "nvme", to_bool),
        f("lighting", "TEXT", "lighting"),
    )),
)


@dataclass(frozen=True)
class DatabaseConfig:
    host: str
    port: int
    database: str
    user: str
    password: str | None
    schema: str

    @classmethod
    def from_environment(cls, schema_override: str | None = None):
        schema = schema_override or os.getenv("PGSCHEMA", "buildcores_clean")
        if not VALID_SCHEMA.fullmatch(schema):
            raise ValueError("schema may contain only letters, numbers, and underscores")
        return cls(
            os.getenv("PGHOST", "localhost"), int(os.getenv("PGPORT", "5432")),
            os.getenv("PGDATABASE", "buildcores_db"), os.getenv("PGUSER", "postgres"),
            os.getenv("PGPASSWORD") or None, schema,
        )

    def kwargs(self, database: str | None = None) -> dict[str, Any]:
        result: dict[str, Any] = {
            "host": self.host, "port": self.port, "dbname": database or self.database,
            "user": self.user, "connect_timeout": 10,
        }
        if self.password:
            result["password"] = self.password
        return result


COMMON_COLUMNS = (
    ("opendb_id", "UUID PRIMARY KEY"),
    ("brand_name", "TEXT NOT NULL"),
    ("product_name", "TEXT NOT NULL"),
    ("series", "TEXT"),
    ("variant", "TEXT"),
    ("release_year", "INTEGER"),
    ("image_url", "TEXT"),
    ("source_file", "TEXT"),
    ("part_numbers", "TEXT"),
    ("data_completeness_pct", "NUMERIC(5,2) NOT NULL"),
    ("source_details", "JSONB NOT NULL"),
    ("updated_at", "TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP"),
)


# Columns used by compatibility filtering. These indexes keep PostgreSQL useful
# for larger catalogs while the local API uses a faster in-memory read cache.
COMPATIBILITY_INDEXES = {
    "cpu": (("socket",), ("memory_types",)),
    "motherboard": (("socket", "memory_type", "form_factor"), ("ecc_support",)),
    "ram": (("memory_type", "module_count", "capacity_gb"), ("ecc", "registered")),
    "gpu": (("length_mm", "slot_width"), ("tdp_w",)),
    "psu": (("wattage_w", "form_factor"),),
    "cpu_cooler": (("height_mm", "radiator_size_mm"),),
    "pc_case": (("gpu_max_length_mm", "cpu_cooler_max_height_mm"), ("psu_max_length_mm",)),
    "storage": (("interface", "form_factor"),),
}


def create_database_if_missing(config: DatabaseConfig) -> None:
    try:
        connection = psycopg2.connect(**config.kwargs())
        connection.close()
        return
    except InvalidCatalogName:
        pass
    connection = psycopg2.connect(**config.kwargs(os.getenv("PGMAINTENANCE_DB", "postgres")))
    connection.autocommit = True
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (config.database,))
            if cursor.fetchone() is None:
                cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(config.database)))
    finally:
        connection.close()


def set_search_path(cursor: Any, schema_name: str) -> None:
    cursor.execute(sql.SQL("SET search_path TO {}, public").format(sql.Identifier(schema_name)))


def initialize_schema(connection: Any, schema_name: str) -> None:
    with connection.cursor() as cursor:
        cursor.execute(sql.SQL("CREATE SCHEMA IF NOT EXISTS {}").format(sql.Identifier(schema_name)))
        set_search_path(cursor, schema_name)
        for dataset in DATASETS:
            definitions = [
                sql.SQL("{} {}").format(sql.Identifier(name), sql.SQL(type_name))
                for name, type_name in COMMON_COLUMNS
            ] + [
                sql.SQL("{} {}").format(sql.Identifier(item.name), sql.SQL(item.sql_type))
                for item in dataset.fields
            ]
            cursor.execute(sql.SQL("CREATE TABLE IF NOT EXISTS {} ({})").format(
                sql.Identifier(dataset.table), sql.SQL(", ").join(definitions)))
            # CREATE TABLE IF NOT EXISTS does not add new columns to tables that
            # already exist, so keep the schema upgrade safe and repeatable.
            cursor.execute(sql.SQL("ALTER TABLE {} ADD COLUMN IF NOT EXISTS image_url TEXT").format(
                sql.Identifier(dataset.table)))
            cursor.execute(sql.SQL("CREATE INDEX IF NOT EXISTS {} ON {} (brand_name)").format(
                sql.Identifier(f"idx_{dataset.table}_brand"), sql.Identifier(dataset.table)))
            cursor.execute(sql.SQL("CREATE INDEX IF NOT EXISTS {} ON {} (product_name)").format(
                sql.Identifier(f"idx_{dataset.table}_name"), sql.Identifier(dataset.table)))
            cursor.execute(sql.SQL("CREATE INDEX IF NOT EXISTS {} ON {} (lower(product_name) text_pattern_ops)").format(
                sql.Identifier(f"idx_{dataset.table}_name_prefix"), sql.Identifier(dataset.table)))
            for position, columns in enumerate(COMPATIBILITY_INDEXES.get(dataset.table, ()), 1):
                cursor.execute(sql.SQL("CREATE INDEX IF NOT EXISTS {} ON {} ({})").format(
                    sql.Identifier(f"idx_{dataset.table}_compat_{position}"),
                    sql.Identifier(dataset.table),
                    sql.SQL(", ").join(sql.Identifier(column) for column in columns),
                ))

        summary_parts = [sql.SQL(
            "SELECT {}::text AS category_key, {}::text AS category_name_en, "
            "{}::text AS category_name_th, count(*)::bigint AS product_count, "
            "count(DISTINCT brand_name)::bigint AS brand_count FROM {}"
        ).format(sql.Literal(d.table), sql.Literal(d.name_en), sql.Literal(d.name_th), sql.Identifier(d.table))
            for d in DATASETS]
        cursor.execute(sql.SQL("CREATE OR REPLACE VIEW category_summary AS {}").format(
            sql.SQL(" UNION ALL ").join(summary_parts)))

        brand_parts = [sql.SQL(
            "SELECT {}::text AS category_key, brand_name, count(*)::bigint AS product_count "
            "FROM {} GROUP BY brand_name"
        ).format(sql.Literal(d.table), sql.Identifier(d.table)) for d in DATASETS]
        cursor.execute(sql.SQL("CREATE OR REPLACE VIEW brand_summary AS {}").format(
            sql.SQL(" UNION ALL ").join(brand_parts)))

        product_parts = [sql.SQL(
            "SELECT {}::text AS category_key, opendb_id, brand_name, product_name, "
            "series, variant, release_year, data_completeness_pct, image_url FROM {}"
        ).format(sql.Literal(d.table), sql.Identifier(d.table)) for d in DATASETS]
        cursor.execute(sql.SQL("CREATE OR REPLACE VIEW all_products AS {}").format(
            sql.SQL(" UNION ALL ").join(product_parts)))
    connection.commit()


def adapt_field(item: Field, value: Any) -> Any:
    return Json(value, dumps=lambda obj: json.dumps(obj, ensure_ascii=False)) if item.sql_type == "JSONB" and value is not None else value


def row_values(dataset: Dataset, row: dict[str, str]) -> list[Any]:
    common = [
        required_uuid(row.get("opendb_id")),
        clean(row.get("metadata_manufacturer")) or "Unknown",
        clean(row.get("metadata_name")) or "Unknown Product",
        clean(row.get("metadata_series")) or clean(row.get("series")),
        clean(row.get("metadata_variant")),
        to_release_year(row.get("metadata_releaseYear")),
        product_image_url(row),
        clean(row.get("_source_file")),
        clean(row.get("metadata_part_numbers")),
        completeness(row),
        Json(nonempty_source(row), dumps=lambda obj: json.dumps(obj, ensure_ascii=False)),
    ]
    return common + [adapt_field(item, item.getter(row)) for item in dataset.fields]


def import_dataset(connection: Any, schema: str, data_dir: Path, dataset: Dataset) -> int:
    with (data_dir / dataset.filename).open("r", encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    columns = [name for name, _ in COMMON_COLUMNS if name != "updated_at"] + [item.name for item in dataset.fields]
    assignments = [
        sql.SQL("{} = COALESCE(EXCLUDED.{}, {}.{})").format(
            sql.Identifier(name), sql.Identifier(name),
            sql.Identifier(dataset.table), sql.Identifier(name),
        ) if name == "image_url" else
        sql.SQL("{} = EXCLUDED.{}").format(sql.Identifier(name), sql.Identifier(name))
        for name in columns if name != "opendb_id"
    ]
    assignments.append(sql.SQL("updated_at = CURRENT_TIMESTAMP"))
    statement = sql.SQL("INSERT INTO {} ({}) VALUES ({}) ON CONFLICT (opendb_id) DO UPDATE SET {}").format(
        sql.Identifier(dataset.table), sql.SQL(", ").join(map(sql.Identifier, columns)),
        sql.SQL(", ").join([sql.Placeholder() for _ in columns]), sql.SQL(", ").join(assignments))
    with connection.cursor() as cursor:
        set_search_path(cursor, schema)
        for index, row in enumerate(rows, 1):
            try:
                cursor.execute(statement, row_values(dataset, row))
            except Exception as exc:
                raise RuntimeError(f"{dataset.filename}, row {index}, {row.get('metadata_name')}: {exc}") from exc
    connection.commit()
    return len(rows)


def validate_files(data_dir: Path) -> tuple[bool, list[str]]:
    valid, messages = True, []
    required = {"opendb_id", "metadata_name", "metadata_manufacturer"}
    for dataset in DATASETS:
        path = data_dir / dataset.filename
        if not path.is_file():
            valid = False
            messages.append(f"MISSING  {path}")
            continue
        with path.open("r", encoding="utf-8-sig", newline="") as handle:
            missing = required - set(next(csv.reader(handle), []))
        if missing:
            valid = False
            messages.append(f"INVALID  {dataset.filename}: missing {', '.join(sorted(missing))}")
        else:
            messages.append(f"OK       {dataset.filename}")
    return valid, messages


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Import CSV into separate PostgreSQL category tables")
    parser.add_argument("--data-dir", type=Path, default=DEFAULT_DATA_DIR)
    parser.add_argument("--schema", help="Default: PGSCHEMA or buildcores_clean")
    parser.add_argument("--create-database", action="store_true")
    parser.add_argument("--init-only", action="store_true")
    parser.add_argument("--check-only", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    data_dir = args.data_dir.resolve()
    valid, messages = validate_files(data_dir)
    print(f"CSV directory: {data_dir}")
    for message in messages:
        print(f"  {message}")
    if not valid:
        return 1
    if args.check_only:
        print("CSV validation passed.")
        return 0
    try:
        config = DatabaseConfig.from_environment(args.schema)
        if config.password is None and sys.stdin.isatty():
            config = DatabaseConfig(config.host, config.port, config.database, config.user,
                                    getpass.getpass(f"PostgreSQL password for {config.user}: "), config.schema)
        print(f"PostgreSQL: {config.user}@{config.host}:{config.port}/{config.database} (schema: {config.schema})")
        if args.create_database:
            create_database_if_missing(config)
        connection = psycopg2.connect(**config.kwargs())
    except Exception as exc:
        print(f"Cannot connect to PostgreSQL: {exc}", file=sys.stderr)
        return 2
    try:
        initialize_schema(connection, config.schema)
        print("Separate category tables are ready.")
        if args.init_only:
            return 0
        total = 0
        for dataset in DATASETS:
            count = import_dataset(connection, config.schema, data_dir, dataset)
            total += count
            print(f"  Imported {dataset.name_en:<12} {count:>6,} rows -> {config.schema}.{dataset.table}")
        print(f"Import complete: {total:,} rows across {len(DATASETS)} separate tables.")
        print(f"Open pgAdmin: {config.database} > Schemas > {config.schema} > Tables")
        return 0
    except Exception as exc:
        connection.rollback()
        print(f"Import failed: {exc}", file=sys.stderr)
        return 3
    finally:
        connection.close()


if __name__ == "__main__":
    raise SystemExit(main())
