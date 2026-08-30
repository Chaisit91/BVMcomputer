"""Build a small web catalog from the full machine-learning feature CSVs."""

from __future__ import annotations

import argparse
import csv
import os
import tempfile
from pathlib import Path

from compatibility_engine import (
    cooler_socket_key,
    effective_cooler_sockets,
    key,
    motherboard_fits_cpu,
    tokens,
)


ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "dataset"
FEATURE_DIR = ROOT / "data" / "processed" / "features"
WEB_CATALOG_DIR = ROOT / "data" / "processed" / "web_catalog"
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
MIN_CHOICES_PER_CPU = 8
MAX_CPU_SOCKET_FAMILIES = 4
IMPORTANT_FIELDS = {
    "cpu.csv": ("name", "socket", "memory_type", "tdp", "cores_total", "threads"),
    "motherboard.csv": (
        "name", "socket", "ram_type", "form_factor", "memory_slots",
        "memory_max_gb", "pcie_x16_slots", "m2_slot_count", "sata_port_count",
    ),
    "ram.csv": ("name", "ram_type", "capacity_gb", "module_quantity", "speed_mhz"),
    "gpu.csv": ("name", "memory_gb", "tdp", "length_mm", "expansion_slots_required"),
    "psu.csv": (
        "name", "wattage", "form_factor", "length_mm", "atx_24_pin",
        "eps_8_pin", "pcie_6_plus_2_pin", "sata_connectors",
    ),
    "pc_case.csv": (
        "name", "supported_motherboards", "gpu_clearance_mm", "expansion_slots",
        "cooler_clearance_mm", "supported_psu", "psu_clearance_mm",
    ),
    "cpu_cooler.csv": ("name", "cpu_sockets", "height_mm", "fan_size_mm"),
    "storage.csv": ("name", "interface", "form_factor", "capacity_gb"),
}


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
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(
            "w",
            encoding="utf-8-sig",
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


def completeness(filename: str, row: dict[str, str]) -> int:
    return sum(bool((row.get(field) or "").strip()) for field in IMPORTANT_FIELDS[filename])


def ranked_rows(
    filename: str,
    rows: list[dict[str, str]],
    recency: dict[str, tuple[int, str]],
    bonus=None,
) -> list[dict[str, str]]:
    bonus = bonus or (lambda _row: 0)
    return sorted(
        rows,
        key=lambda row: (
            bonus(row),
            completeness(filename, row),
            *recency.get(row.get("opendb_id", ""), (-1, "")),
            row.get("opendb_id", ""),
        ),
        reverse=True,
    )


def select_with_group_minimums(
    ranked: list[dict[str, str]],
    group_for,
    groups: list[str],
    keep: int,
    minimum: int = MIN_CHOICES_PER_CPU,
) -> list[dict[str, str]]:
    selected: list[dict[str, str]] = []
    selected_ids: set[str] = set()
    for group in groups:
        matches = [row for row in ranked if group_for(row) == group]
        for row in matches[:minimum]:
            part_id = row.get("opendb_id", "")
            if part_id and part_id not in selected_ids:
                selected.append(row)
                selected_ids.add(part_id)
    for row in ranked:
        if len(selected) >= keep:
            break
        part_id = row.get("opendb_id", "")
        if part_id and part_id not in selected_ids:
            selected.append(row)
            selected_ids.add(part_id)
    return selected[:keep]


def curated_catalog(
    all_rows: dict[str, list[dict[str, str]]],
    recencies: dict[str, dict[str, tuple[int, str]]],
    keep: int,
) -> dict[str, list[dict[str, str]]]:
    boards_by_socket: dict[str, list[dict[str, str]]] = {}
    for board in all_rows["motherboard.csv"]:
        boards_by_socket.setdefault(key(board.get("socket")), []).append(board)

    coolers_by_socket: dict[str, list[dict[str, str]]] = {}
    for cooler in all_rows["cpu_cooler.csv"]:
        for socket in effective_cooler_sockets(cooler):
            coolers_by_socket.setdefault(socket, []).append(cooler)

    eligible_cpus = [
        cpu for cpu in all_rows["cpu.csv"]
        if len(boards_by_socket.get(key(cpu.get("socket")), ())) >= MIN_CHOICES_PER_CPU
        and len(coolers_by_socket.get(cooler_socket_key(cpu.get("socket")), ())) >= MIN_CHOICES_PER_CPU
    ]
    cpu_ranked = ranked_rows("cpu.csv", eligible_cpus, recencies["cpu.csv"])
    family_best: dict[str, tuple] = {}
    for cpu in cpu_ranked:
        family = key(cpu.get("socket"))
        family_best.setdefault(
            family,
            (
                completeness("cpu.csv", cpu),
                *recencies["cpu.csv"].get(cpu.get("opendb_id", ""), (-1, "")),
            ),
        )
    families = sorted(family_best, key=family_best.get, reverse=True)[:MAX_CPU_SOCKET_FAMILIES]
    cpu_ranked = [cpu for cpu in cpu_ranked if key(cpu.get("socket")) in families]
    cpus = select_with_group_minimums(
        cpu_ranked, lambda row: key(row.get("socket")), families, keep
    )

    board_ranked = ranked_rows(
        "motherboard.csv",
        [row for row in all_rows["motherboard.csv"] if key(row.get("socket")) in families],
        recencies["motherboard.csv"],
    )
    boards: list[dict[str, str]] = []
    board_ids: set[str] = set()
    # Socket quotas alone are insufficient for platforms that support more
    # than one RAM generation. Guarantee the minimum for every retained CPU.
    for cpu in cpus:
        while sum(motherboard_fits_cpu(board, cpu) for board in boards) < MIN_CHOICES_PER_CPU:
            candidate = next(
                (
                    row for row in board_ranked
                    if motherboard_fits_cpu(row, cpu)
                    and row.get("opendb_id", "") not in board_ids
                ),
                None,
            )
            if candidate is None:
                break
            boards.append(candidate)
            board_ids.add(candidate.get("opendb_id", ""))
    for row in board_ranked:
        if len(boards) >= keep:
            break
        if row.get("opendb_id", "") not in board_ids:
            boards.append(row)
            board_ids.add(row.get("opendb_id", ""))

    cooler_ranked = ranked_rows(
        "cpu_cooler.csv",
        [
            row for row in all_rows["cpu_cooler.csv"]
            if effective_cooler_sockets(row) & set(families)
        ],
        recencies["cpu_cooler.csv"],
        bonus=lambda row: len(effective_cooler_sockets(row) & set(families)),
    )
    coolers: list[dict[str, str]] = []
    cooler_ids: set[str] = set()
    for family in families:
        while sum(family in effective_cooler_sockets(row) for row in coolers) < MIN_CHOICES_PER_CPU:
            candidate = next(
                (
                    row for row in cooler_ranked
                    if family in effective_cooler_sockets(row)
                    and row.get("opendb_id", "") not in cooler_ids
                ),
                None,
            )
            if candidate is None:
                break
            coolers.append(candidate)
            cooler_ids.add(candidate.get("opendb_id", ""))
    for row in cooler_ranked:
        if len(coolers) >= keep:
            break
        if row.get("opendb_id", "") not in cooler_ids:
            coolers.append(row)
            cooler_ids.add(row.get("opendb_id", ""))

    ram_types = list(dict.fromkeys(key(row.get("ram_type")) for row in boards if key(row.get("ram_type"))))
    ram_ranked = ranked_rows(
        "ram.csv",
        [row for row in all_rows["ram.csv"] if key(row.get("ram_type")) in ram_types],
        recencies["ram.csv"],
    )
    ram = select_with_group_minimums(
        ram_ranked, lambda row: key(row.get("ram_type")), ram_types, keep
    )

    board_forms = {key(row.get("form_factor")) for row in boards if key(row.get("form_factor"))}
    case_ranked = ranked_rows(
        "pc_case.csv",
        [row for row in all_rows["pc_case.csv"] if tokens(row.get("supported_motherboards")) & board_forms],
        recencies["pc_case.csv"],
        bonus=lambda row: len(tokens(row.get("supported_motherboards")) & board_forms),
    )

    result = {
        "cpu.csv": cpus,
        "motherboard.csv": boards,
        "cpu_cooler.csv": coolers[:keep],
        "ram.csv": ram,
        "pc_case.csv": case_ranked[:keep],
    }
    for filename in ("gpu.csv", "psu.csv", "storage.csv"):
        result[filename] = ranked_rows(
            filename, all_rows[filename], recencies[filename]
        )[:keep]
    return result


def print_cpu_coverage(catalog: dict[str, list[dict[str, str]]]) -> None:
    board_counts = []
    cooler_counts = []
    for cpu in catalog["cpu.csv"]:
        board_counts.append(sum(motherboard_fits_cpu(board, cpu) for board in catalog["motherboard.csv"]))
        socket = cooler_socket_key(cpu.get("socket"))
        cooler_counts.append(sum(socket in effective_cooler_sockets(cooler) for cooler in catalog["cpu_cooler.csv"]))
    print(
        "CPU coverage: "
        f"motherboards min={min(board_counts, default=0)}, "
        f"coolers min={min(cooler_counts, default=0)}, "
        f"socket families={len({key(row.get('socket')) for row in catalog['cpu.csv']})}"
    )


def trim_catalog(keep: int, apply: bool) -> None:
    all_rows: dict[str, list[dict[str, str]]] = {}
    fieldnames_by_file: dict[str, list[str]] = {}
    recencies: dict[str, dict[str, tuple[int, str]]] = {}
    for filename in CATALOG_FILES:
        feature_path = FEATURE_DIR / filename
        fieldnames, rows = read_csv(feature_path)
        all_rows[filename] = rows
        fieldnames_by_file[filename] = fieldnames
        recencies[filename] = source_recency(SOURCE_DIR / filename)

    retained_by_file = curated_catalog(all_rows, recencies, keep)
    print_cpu_coverage(retained_by_file)
    for filename in CATALOG_FILES:
        rows = all_rows[filename]
        retained = retained_by_file[filename]
        years = [recencies[filename].get(row.get("opendb_id", ""), (-1, ""))[0] for row in retained]
        year_range = f"{min(years)}-{max(years)}" if years else "none"
        action = "saved" if apply else "would save"
        print(f"{filename}: {len(rows)} -> {len(retained)} rows ({action}, years {year_range})")
        if apply:
            replace_csv(WEB_CATALOG_DIR / filename, fieldnames_by_file[filename], retained)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Build a complete, compatibility-aware web catalog"
    )
    parser.add_argument("--keep", type=int, default=50)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    if args.keep < 1:
        parser.error("--keep must be at least 1")
    trim_catalog(args.keep, args.apply)


if __name__ == "__main__":
    main()
