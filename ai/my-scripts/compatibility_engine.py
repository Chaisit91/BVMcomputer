"""Deterministic PC-part compatibility filtering for BuildCores OpenDB.

Hard compatibility must be checked with product specifications, not predicted by
a machine-learning classifier.  This module reads the engineered feature CSVs,
starts from a selected CPU, and progressively removes parts that cannot work
with the current selection.

Examples:
    python my-scripts/compatibility_engine.py --cpu "Ryzen 7 7800X3D"
    python my-scripts/compatibility_engine.py --cpu <id> --gpu "RTX 4070" --json
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import re
import sys
from pathlib import Path
from typing import Any, Callable


ROOT = Path(__file__).resolve().parent.parent
FEATURE_DIR = ROOT / "data" / "processed" / "features"
PART_FILES = {
    "cpu": "cpu.csv",
    "motherboard": "motherboard.csv",
    "ram": "ram.csv",
    "gpu": "gpu.csv",
    "psu": "psu.csv",
    "case": "pc_case.csv",
    "cooler": "cpu_cooler.csv",
    "storage": "storage.csv",
}


class SelectionError(ValueError):
    """Raised when a requested catalog item cannot be selected unambiguously."""


def clean(value: Any) -> str:
    return "" if value is None else str(value).strip()


def key(value: Any) -> str:
    """Normalize names/specification tokens for conservative equality checks."""
    return re.sub(r"[^A-Z0-9]+", "", clean(value).upper())


def socket_key(value: Any) -> str:
    return re.sub(r"[^A-Z0-9]+", "", clean(value).upper().replace("+", "PLUS"))


def cooler_socket_key(value: Any) -> str:
    value = socket_key(value)
    return value.replace("PLUS", "") if value.startswith(("AM", "FM")) else value


CPU_TO_BOARD_SOCKET = {
    "AM2": {"AM2", "AM2PLUS"},
    "AM3": {"AM3", "AM3PLUS"},
    "FM2": {"FM2", "FM2PLUS"},
}


def compatible_board_sockets(cpu_socket: Any) -> set[str]:
    normalized = socket_key(cpu_socket)
    return CPU_TO_BOARD_SOCKET.get(normalized, {normalized}) if normalized else set()


def number(value: Any) -> float | None:
    try:
        result = float(clean(value))
        return result if math.isfinite(result) else None
    except (TypeError, ValueError):
        return None


def tokens(value: Any) -> set[str]:
    return {key(item) for item in re.split(r"[|,;/]", clean(value)) if key(item)}


def socket_hints_from_name(value: Any) -> set[str]:
    patterns = re.findall(
        r"(?<![A-Z0-9])(?:AM[2345]|FM[12]\+?|TR4|STR5|SP[356]|LGA\s*\d{3,4}(?:-\d)?)(?![A-Z0-9])",
        clean(value).upper(),
    )
    return {cooler_socket_key(item) for item in patterns}


def effective_cooler_sockets(cooler: dict[str, str]) -> set[str]:
    declared = {
        cooler_socket_key(item)
        for item in re.split(r"[|,;/]", clean(cooler.get("cpu_sockets")))
        if cooler_socket_key(item)
    }
    hints = socket_hints_from_name(cooler.get("name"))
    # A socket explicitly marketed in the product name is stronger evidence
    # when a suspiciously broad source list includes unrelated socket families.
    intersection = declared & hints
    return intersection if hints and intersection else declared


def motherboard_fits_cpu(board: dict[str, str], cpu: dict[str, str]) -> bool:
    allowed_sockets = compatible_board_sockets(cpu.get("socket"))
    if not allowed_sockets or socket_key(board.get("socket")) not in allowed_sockets:
        return False
    cpu_memory = tokens(cpu.get("memory_type"))
    board_memory = key(board.get("ram_type"))
    return not (cpu_memory and board_memory and board_memory not in cpu_memory)


def load_catalog() -> dict[str, list[dict[str, str]]]:
    catalog: dict[str, list[dict[str, str]]] = {}
    for part_type, filename in PART_FILES.items():
        path = FEATURE_DIR / filename
        if not path.exists():
            raise FileNotFoundError(
                f"Missing {path}. Run my-scripts/feature_engineering.py first."
            )
        with path.open("r", encoding="utf-8-sig", newline="") as file:
            catalog[part_type] = list(csv.DictReader(file))
    return catalog


def select(rows: list[dict[str, str]], query: str, part_type: str) -> dict[str, str]:
    query = clean(query)
    exact = [
        row for row in rows
        if query.casefold() in {
            clean(row.get("opendb_id")).casefold(),
            clean(row.get("name")).casefold(),
        }
    ]
    if len(exact) == 1:
        return exact[0]

    matches = [row for row in rows if query.casefold() in clean(row.get("name")).casefold()]
    if len(matches) == 1:
        return matches[0]
    if not matches:
        raise SelectionError(f"ไม่พบ {part_type}: {query}")

    examples = "\n".join(
        f"  - {row.get('name')} [{row.get('opendb_id')}]" for row in matches[:10]
    )
    raise SelectionError(
        f"พบ {part_type} ที่ตรงกับ '{query}' {len(matches)} รายการ "
        f"กรุณาระบุชื่อเต็มหรือ opendb_id:\n{examples}"
    )


def public_part(row: dict[str, str], *, score: float | None = None) -> dict[str, Any]:
    result: dict[str, Any] = {
        "opendb_id": row.get("opendb_id", ""),
        "name": row.get("name", ""),
        "manufacturer": row.get("manufacturer", ""),
    }
    if score is not None:
        result["rank_score"] = round(score, 2)
    return result


def top(
    rows: list[dict[str, str]],
    score: Callable[[dict[str, str]], float],
    limit: int,
) -> list[dict[str, Any]]:
    ranked = sorted(rows, key=score, reverse=True)
    return [public_part(row, score=score(row)) for row in ranked[:limit]]


def motherboard_score(board: dict[str, str], cpu: dict[str, str]) -> float:
    score = 0.0
    cpu_memory = tokens(cpu.get("memory_type"))
    if cpu_memory and key(board.get("ram_type")) in cpu_memory:
        score += 30
    score += min(number(board.get("memory_slots")) or 0, 8) * 3
    score += min(number(board.get("memory_max_gb")) or 0, 256) / 16
    score += min(number(board.get("m2_slot_count")) or 0, 5) * 4
    score += min(number(board.get("pcie_max_gen")) or 0, 5) * 4
    return score


def ram_score(ram: dict[str, str]) -> float:
    capacity = min(number(ram.get("capacity_gb")) or 0, 128)
    speed = min(number(ram.get("speed_mhz")) or 0, 8000)
    latency = number(ram.get("cas_latency"))
    return capacity / 4 + speed / 250 + (20 if latency and latency <= 36 else 0)


def cooler_score(cooler: dict[str, str], cpu: dict[str, str]) -> float:
    tdp = number(cpu.get("tdp")) or 0
    radiator = number(cooler.get("radiator_size_mm")) or 0
    fans = number(cooler.get("fan_quantity")) or 0
    water = key(cooler.get("water_cooled")) == "TRUE"
    score = radiator / 10 + fans * 4 + (10 if water else 0)
    if tdp <= 65 and not water:
        score += 12
    elif tdp >= 150 and (water or radiator >= 240):
        score += 25
    return score


def ram_checks(ram: dict[str, str], board: dict[str, str]) -> list[dict[str, str]]:
    checks: list[dict[str, str]] = []
    ram_type, board_type = key(ram.get("ram_type")), key(board.get("ram_type"))
    if not ram_type or not board_type:
        checks.append(result_check("ram_type", "unknown", "ข้อมูลชนิด RAM ของ RAM หรือเมนบอร์ดไม่ครบ"))
    elif ram_type != board_type:
        checks.append(result_check("ram_type", "incompatible", f"RAM เป็น {ram.get('ram_type')} แต่เมนบอร์ดใช้ {board.get('ram_type')}"))
    else:
        checks.append(result_check("ram_type", "compatible", "ชนิด DDR ตรงกัน"))

    modules = number(ram.get("module_quantity"))
    slots = number(board.get("memory_slots"))
    capacity = number(ram.get("capacity_gb"))
    maximum = number(board.get("memory_max_gb"))
    if modules is None or slots is None:
        checks.append(result_check("ram_modules", "unknown", "ข้อมูลจำนวนแถว RAM หรือสล็อตไม่ครบ"))
    elif modules > slots:
        checks.append(result_check("ram_modules", "incompatible", f"RAM มี {modules:g} แถว แต่เมนบอร์ดมี {slots:g} สล็อต"))
    else:
        checks.append(result_check("ram_modules", "compatible", "จำนวนแถว RAM ไม่เกินสล็อต"))
    if capacity is None or maximum is None:
        checks.append(result_check("ram_capacity", "unknown", "ข้อมูลความจุ RAM สูงสุดไม่ครบ"))
    elif capacity > maximum:
        checks.append(result_check("ram_capacity", "incompatible", f"RAM {capacity:g} GB เกินขีดจำกัด {maximum:g} GB"))
    else:
        checks.append(result_check("ram_capacity", "compatible", "ความจุ RAM ผ่าน"))

    ram_ecc_text = key(ram.get("ecc"))
    board_ecc_text = key(board.get("ecc_support"))
    ram_is_ecc = "ECC" in ram_ecc_text and "NONECC" not in ram_ecc_text
    if ram_is_ecc:
        if board_ecc_text in {"FALSE", "NO", "0"}:
            checks.append(result_check("ram_ecc", "incompatible", "RAM เป็น ECC แต่เมนบอร์ดระบุว่าไม่รองรับ ECC"))
        elif board_ecc_text in {"TRUE", "YES", "1"}:
            checks.append(result_check("ram_ecc", "compatible", "เมนบอร์ดรองรับ ECC"))
        else:
            checks.append(result_check("ram_ecc", "unknown", "ไม่มีข้อมูล ECC support ของเมนบอร์ด"))
    registered = key(ram.get("registered"))
    if registered and "UNBUFFERED" not in registered and registered not in {"FALSE", "NO", "0"}:
        checks.append(result_check("ram_registered", "unknown", "RAM แบบ Registered/RDIMM ต้องตรวจคู่มือเมนบอร์ดเพิ่มเติม"))
    return checks


def ram_fits_board(ram: dict[str, str], board: dict[str, str]) -> bool:
    return overall_status(ram_checks(ram, board)) != "incompatible"


def recommended_psu_watts(cpu: dict[str, str], gpu: dict[str, str] | None) -> int | None:
    cpu_tdp = number(cpu.get("tdp"))
    gpu_tdp = number(gpu.get("tdp")) if gpu else None
    if cpu_tdp is None or (gpu and gpu_tdp is None):
        return None
    # Component draw + 100 W for the rest of the system, with about 35% headroom.
    target = ((cpu_tdp + (gpu_tdp or 0) + 100) * 1.35)
    return max(450, int(math.ceil(target / 50.0) * 50))


def psu_score(psu: dict[str, str], minimum_watts: int | None) -> float:
    wattage = number(psu.get("wattage")) or 0
    target = minimum_watts or 450
    # Prefer modest headroom and better efficiency instead of simply the largest PSU.
    score = max(0.0, 100 - abs(wattage - target) / 10)
    rating = key(psu.get("efficiency_rating"))
    for name, bonus in (("TITANIUM", 20), ("PLATINUM", 16), ("GOLD", 12), ("SILVER", 8), ("BRONZE", 5)):
        if name in rating:
            score += bonus
            break
    return score


def result_check(rule: str, status: str, reason: str) -> dict[str, str]:
    return {"rule": rule, "status": status, "reason": reason}


def required_eps_connectors(value: Any) -> int | None:
    value = clean(value)
    if not value:
        return None
    eight_pin = len(re.findall(r"8\s*[- ]?pin", value, re.IGNORECASE))
    four_pin = len(re.findall(r"4\s*[- ]?pin", value, re.IGNORECASE))
    return eight_pin + math.ceil(four_pin / 2)


def psu_checks(
    psu: dict[str, str],
    minimum_watts: int | None,
    board: dict[str, str] | None,
    gpu: dict[str, str] | None,
) -> list[dict[str, str]]:
    checks: list[dict[str, str]] = []
    wattage = number(psu.get("wattage"))
    if minimum_watts is None or wattage is None:
        checks.append(result_check("psu_wattage", "unknown", "ข้อมูล TDP หรือกำลังไฟ PSU ไม่ครบ"))
    elif wattage < minimum_watts:
        checks.append(result_check("psu_wattage", "incompatible", f"ต้องการอย่างน้อย {minimum_watts} W แต่ PSU มี {wattage:g} W"))
    else:
        checks.append(result_check("psu_wattage", "compatible", f"PSU {wattage:g} W ผ่านขั้นต่ำ {minimum_watts} W"))

    if board:
        atx = number(psu.get("atx_24_pin"))
        eps = number(psu.get("eps_8_pin"))
        required_eps = required_eps_connectors(board.get("cpu_power_connectors"))
        if atx is None:
            checks.append(result_check("main_power", "unknown", "ไม่มีข้อมูลหัว ATX 24-pin ของ PSU"))
        elif atx < 1:
            checks.append(result_check("main_power", "incompatible", "PSU ไม่มีหัว ATX 24-pin"))
        else:
            checks.append(result_check("main_power", "compatible", "มีหัว ATX 24-pin"))
        if eps is None or required_eps is None:
            checks.append(result_check("cpu_power", "unknown", "ข้อมูลหัวไฟ CPU/EPS ไม่ครบ"))
        elif eps < 1:
            checks.append(result_check("cpu_power", "incompatible", "PSU ไม่มีหัวไฟ CPU/EPS"))
        elif eps < required_eps:
            checks.append(result_check("cpu_power", "unknown", f"PSU มี EPS {eps:g} หัว จากที่บอร์ดระบุ {required_eps}; หัวเสริมอาจเป็น optional"))
        else:
            checks.append(result_check("cpu_power", "compatible", "หัวไฟ CPU/EPS เพียงพอ"))

    if gpu:
        required_16 = (number(gpu.get("power_12vhpwr")) or 0) + (number(gpu.get("power_12v_2x6")) or 0)
        required_legacy = (number(gpu.get("power_8_pin")) or 0) + (number(gpu.get("power_6_pin")) or 0)
        available_16 = number(psu.get("pcie_12vhpwr"))
        available_legacy = number(psu.get("pcie_6_plus_2_pin"))
        gpu_power_known = all(clean(gpu.get(field)) != "" for field in ("power_12vhpwr", "power_12v_2x6", "power_8_pin", "power_6_pin"))
        if not gpu_power_known or available_16 is None or available_legacy is None:
            checks.append(result_check("gpu_power", "unknown", "ข้อมูลหัวไฟ GPU หรือ PSU ไม่ครบ"))
        elif available_16 < required_16 or available_legacy < required_legacy:
            checks.append(result_check("gpu_power", "incompatible", f"ต้องการ 16-pin {required_16:g} และ 6/8-pin {required_legacy:g} หัว"))
        else:
            checks.append(result_check("gpu_power", "compatible", "หัวไฟ GPU เพียงพอ"))
    return checks


def overall_status(checks: list[dict[str, str]]) -> str:
    statuses = {item["status"] for item in checks}
    if "incompatible" in statuses:
        return "incompatible"
    if "unknown" in statuses:
        return "unknown"
    return "compatible"


def compatibility_quality(
    selected: dict[str, dict[str, str]],
    checks: list[dict[str, str]],
) -> dict[str, Any]:
    """Score compatibility evidence and build completeness, not performance."""
    statuses = [item["status"] for item in checks]
    points = {"compatible": 100, "unknown": 55, "incompatible": 0}
    evidence_score = (
        sum(points.get(status, 0) for status in statuses) / len(statuses)
        if statuses else 55
    )
    completion_score = len(selected) / len(PART_FILES) * 100
    score = round(evidence_score * 0.70 + completion_score * 0.30)

    if "incompatible" in statuses:
        level, label, color = "poor", "เข้ากันไม่ได้", "red"
        score = min(score, 39)
    elif "unknown" not in statuses and len(selected) >= 5 and score >= 80:
        level, label, color = "excellent", "เข้ากันได้ดีมาก", "green"
    else:
        level, label, color = "moderate", "ปานกลาง / ต้องตรวจเพิ่ม", "yellow"

    return {
        "score": score,
        "level": level,
        "label": label,
        "color": color,
        "selected_parts": len(selected),
        "total_part_types": len(PART_FILES),
        "note": "คะแนนนี้วัด compatibility และความครบของข้อมูล ไม่ใช่ความแรงหรือคอขวด",
    }


def storage_checks(
    storage: dict[str, str],
    board: dict[str, str] | None,
    case: dict[str, str] | None,
    psu: dict[str, str] | None,
) -> list[dict[str, str]]:
    checks: list[dict[str, str]] = []
    is_nvme = key(storage.get("nvme")) == "TRUE" or "NVME" in key(storage.get("interface"))
    is_m2 = is_nvme or "M2" in key(storage.get("form_factor"))
    is_sata = "SATA" in key(storage.get("interface")) and not is_m2
    if board:
        if is_m2:
            has_m2 = number(board.get("has_m2"))
            if has_m2 is None:
                checks.append(result_check("storage_m2", "unknown", "ไม่มีข้อมูลสล็อต M.2 ของเมนบอร์ด"))
            elif has_m2 < 1:
                checks.append(result_check("storage_m2", "incompatible", "เมนบอร์ดไม่มีสล็อต M.2"))
            elif is_nvme:
                checks.append(result_check("storage_m2", "compatible", "เมนบอร์ดมีสล็อต M.2"))
            else:
                checks.append(result_check("storage_m2", "unknown", "มีสล็อต M.2 แต่ข้อมูลไม่ยืนยันว่า slot รองรับ M.2 SATA"))
        elif is_sata:
            ports = number(board.get("sata_port_count"))
            if ports is None:
                checks.append(result_check("storage_sata", "unknown", "ไม่มีข้อมูลพอร์ต SATA ของเมนบอร์ด"))
            elif ports < 1:
                checks.append(result_check("storage_sata", "incompatible", "เมนบอร์ดไม่มีพอร์ต SATA"))
            else:
                checks.append(result_check("storage_sata", "compatible", "เมนบอร์ดมีพอร์ต SATA"))
        else:
            checks.append(result_check("storage_interface", "unknown", "ยังไม่มีกฎสำหรับ interface ของ storage นี้"))
    if is_sata and case:
        form = key(storage.get("form_factor"))
        field = "internal_2_5_bays" if "25" in form else "internal_3_5_bays" if "35" in form else ""
        bays = number(case.get(field)) if field else None
        if bays is None:
            checks.append(result_check("storage_case_bay", "unknown", "ข้อมูลขนาด drive หรือช่องติดตั้งเคสไม่ครบ"))
        elif bays < 1:
            checks.append(result_check("storage_case_bay", "incompatible", "เคสไม่มีช่องติดตั้ง drive ขนาดนี้"))
        else:
            checks.append(result_check("storage_case_bay", "compatible", "เคสมีช่องติดตั้ง storage"))
    if is_sata and psu:
        connectors = number(psu.get("sata_connectors"))
        if connectors is None:
            checks.append(result_check("storage_power", "unknown", "ไม่มีข้อมูลหัวไฟ SATA ของ PSU"))
        elif connectors < 1:
            checks.append(result_check("storage_power", "incompatible", "PSU ไม่มีหัวไฟ SATA"))
        else:
            checks.append(result_check("storage_power", "compatible", "PSU มีหัวไฟ SATA"))
    return checks


def case_checks(
    case: dict[str, str],
    board: dict[str, str] | None,
    gpu: dict[str, str] | None,
    cooler: dict[str, str] | None,
    psu: dict[str, str] | None,
) -> list[dict[str, str]]:
    checks: list[dict[str, str]] = []
    if board:
        supported = tokens(case.get("supported_motherboards"))
        board_size = key(board.get("form_factor"))
        if not supported or not board_size:
            checks.append(result_check("case_motherboard", "unknown", "ข้อมูลขนาดเมนบอร์ดหรือเคสไม่ครบ"))
        elif board_size not in supported:
            checks.append(result_check("case_motherboard", "incompatible", "เคสไม่รองรับ form factor ของเมนบอร์ด"))
        else:
            checks.append(result_check("case_motherboard", "compatible", "ขนาดเมนบอร์ดใส่เคสได้"))
    if gpu:
        gpu_length = number(gpu.get("length_mm"))
        clearance = number(case.get("gpu_clearance_mm"))
        if gpu_length is None or clearance is None:
            checks.append(result_check("case_gpu_length", "unknown", "ข้อมูลความยาว GPU หรือระยะเคสไม่ครบ"))
        elif gpu_length > clearance:
            checks.append(result_check("case_gpu_length", "incompatible", f"GPU ยาว {gpu_length:g} mm แต่เคสรองรับ {clearance:g} mm"))
        else:
            checks.append(result_check("case_gpu_length", "compatible", "ความยาว GPU ผ่าน"))
        required_slots = number(gpu.get("expansion_slots_required"))
        available_slots = number(case.get("expansion_slots"))
        if required_slots is None or available_slots is None:
            checks.append(result_check("case_gpu_slots", "unknown", "ข้อมูลความหนา GPU หรือสล็อตเคสไม่ครบ"))
        elif required_slots > available_slots:
            checks.append(result_check("case_gpu_slots", "incompatible", f"GPU ต้องใช้ {required_slots:g} สล็อต แต่เคสมี {available_slots:g}"))
        else:
            checks.append(result_check("case_gpu_slots", "compatible", "จำนวน expansion slots เพียงพอ"))
        if number(gpu.get("radiator_size_mm")):
            checks.append(result_check("case_gpu_radiator", "unknown", "dataset ไม่มีตำแหน่งหม้อน้ำของ GPU ที่เคสรองรับ"))
    if cooler:
        height = number(cooler.get("height_mm"))
        clearance = number(case.get("cooler_clearance_mm"))
        if number(cooler.get("radiator_size_mm")):
            checks.append(result_check("case_aio_radiator", "unknown", "dataset ไม่มีตำแหน่งและขนาดหม้อน้ำที่เคสรองรับ"))
        elif height is None or clearance is None:
            checks.append(result_check("case_cooler_height", "unknown", "ข้อมูลความสูง cooler หรือระยะเคสไม่ครบ"))
        elif height > clearance:
            checks.append(result_check("case_cooler_height", "incompatible", f"Cooler สูง {height:g} mm แต่เคสรองรับ {clearance:g} mm"))
        else:
            checks.append(result_check("case_cooler_height", "compatible", "ความสูง cooler ผ่าน"))
    if psu:
        supported = tokens(case.get("supported_psu"))
        psu_size = key(psu.get("form_factor"))
        if not supported or not psu_size:
            checks.append(result_check("case_psu_form", "unknown", "ข้อมูล form factor ของ PSU หรือเคสไม่ครบ"))
        elif psu_size not in supported:
            checks.append(result_check("case_psu_form", "incompatible", "เคสไม่รองรับ form factor ของ PSU"))
        else:
            checks.append(result_check("case_psu_form", "compatible", "form factor ของ PSU ผ่าน"))
        psu_length = number(psu.get("length_mm"))
        clearance = number(case.get("psu_clearance_mm"))
        if psu_length is None or clearance is None:
            checks.append(result_check("case_psu_length", "unknown", "ข้อมูลความยาว PSU หรือระยะเคสไม่ครบ"))
        elif psu_length > clearance:
            checks.append(result_check("case_psu_length", "incompatible", f"PSU ยาว {psu_length:g} mm แต่เคสรองรับ {clearance:g} mm"))
        else:
            checks.append(result_check("case_psu_length", "compatible", "ความยาว PSU ผ่าน"))
    return checks


def case_fits(case: dict[str, str], board: dict[str, str] | None, gpu: dict[str, str] | None, cooler: dict[str, str] | None, psu: dict[str, str] | None) -> bool:
    return overall_status(case_checks(case, board, gpu, cooler, psu)) == "compatible"


def build_recommendations(
    catalog: dict[str, list[dict[str, str]]],
    queries: dict[str, str | None],
    limit: int,
) -> dict[str, Any]:
    selected: dict[str, dict[str, str]] = {
        part: select(catalog[part], query, part)
        for part, query in queries.items()
        if query
    }
    cpu = selected["cpu"]

    cpu_socket = cooler_socket_key(cpu.get("socket"))
    boards = [b for b in catalog["motherboard"] if motherboard_fits_cpu(b, cpu)]
    coolers = [c for c in catalog["cooler"] if cpu_socket and cpu_socket in effective_cooler_sockets(c)]

    gpu = selected.get("gpu")
    if gpu:
        # Consumer GPUs need a physical x16 slot. PCIe generations are backward compatible.
        boards = [b for b in boards if (number(b.get("pcie_x16_slots")) or 0) > 0]

    board = selected.get("motherboard")
    if board and board not in boards:
        raise SelectionError("เมนบอร์ดที่เลือกใช้ socket ไม่ตรงกับ CPU")

    active_boards = [board] if board else boards
    ram_groups = {"compatible": [], "unknown": [], "incompatible": []}
    for ram_candidate in catalog["ram"]:
        statuses = [overall_status(ram_checks(ram_candidate, candidate)) for candidate in active_boards]
        status = "compatible" if "compatible" in statuses else "unknown" if "unknown" in statuses else "incompatible"
        ram_groups[status].append(ram_candidate)
    ram_rows = ram_groups["compatible"] + ram_groups["unknown"]
    ram = selected.get("ram")
    if ram and ram not in ram_rows:
        raise SelectionError(
            "RAM ที่เลือกไม่ตรงชนิด จำนวนแถวเกิน หรือความจุเกินที่เมนบอร์ดรองรับ"
        )

    cooler = selected.get("cooler")
    if cooler and cooler not in coolers:
        raise SelectionError("ชุดระบายความร้อนที่เลือกไม่รองรับ socket ของ CPU")

    psu = selected.get("psu")
    minimum_watts = recommended_psu_watts(cpu, gpu)
    psu_board = board
    psu_groups = {"compatible": [], "unknown": [], "incompatible": []}
    for candidate in catalog["psu"]:
        status = overall_status(psu_checks(candidate, minimum_watts, psu_board, gpu))
        psu_groups[status].append(candidate)
    psus = psu_groups["compatible"]
    if psu:
        selected_psu_status = overall_status(psu_checks(psu, minimum_watts, board, gpu))
        if selected_psu_status == "incompatible":
            raise SelectionError("PSU ที่เลือกกำลังไฟหรือหัวต่อไม่เพียงพอ")

    case_groups = {"compatible": [], "unknown": [], "incompatible": []}
    for candidate_case in catalog["case"]:
        statuses = [
            overall_status(case_checks(candidate_case, candidate, gpu, cooler, psu))
            for candidate in active_boards
        ]
        status = "compatible" if "compatible" in statuses else "unknown" if "unknown" in statuses else "incompatible"
        case_groups[status].append(candidate_case)
    cases = case_groups["compatible"]
    chosen_case = selected.get("case")
    if chosen_case:
        chosen_statuses = [
            overall_status(case_checks(chosen_case, candidate, gpu, cooler, psu))
            for candidate in active_boards
        ]
        if chosen_statuses and all(status == "incompatible" for status in chosen_statuses):
            raise SelectionError("เคสที่เลือกไม่รองรับอุปกรณ์ที่เลือก")

    storage = catalog["storage"]
    storage_groups = {"compatible": [], "unknown": [], "incompatible": []}
    if board:
        for item in storage:
            checks = storage_checks(item, board, chosen_case, psu)
            storage_groups[overall_status(checks)].append(item)
        storage = storage_groups["compatible"]
    else:
        storage_groups["unknown"] = storage
        storage = []

    chosen_storage = selected.get("storage")
    if chosen_storage and board:
        if overall_status(storage_checks(chosen_storage, board, chosen_case, psu)) == "incompatible":
            raise SelectionError("Storage ที่เลือกใช้กับเมนบอร์ด เคส หรือ PSU ไม่ได้")

    selected_checks: list[dict[str, str]] = []
    if board:
        selected_checks.append(result_check("cpu_socket", "compatible", "CPU และเมนบอร์ดใช้ socket เดียวกัน"))
    if cooler:
        selected_checks.append(result_check("cooler_socket", "compatible", "Cooler รองรับ socket ของ CPU"))
    if ram:
        if board:
            selected_checks.extend(ram_checks(ram, board))
        else:
            selected_checks.append(result_check("ram_motherboard", "compatible", "RAM ใช้ได้กับเมนบอร์ดที่เหลืออย่างน้อยหนึ่งรุ่น"))
    if gpu and board:
        selected_checks.append(result_check("gpu_pcie", "compatible", "เมนบอร์ดมีสล็อต PCIe x16"))
    if psu:
        selected_checks.extend(psu_checks(psu, minimum_watts, board, gpu))
    if chosen_case:
        selected_checks.extend(case_checks(chosen_case, board, gpu, cooler, psu))
    if chosen_storage:
        selected_checks.extend(storage_checks(chosen_storage, board, chosen_case, psu))

    result = {
        "selected": {part: public_part(row) for part, row in selected.items()},
        "constraints": {
            "cpu_socket": cpu.get("socket", ""),
            "recommended_psu_watts": minimum_watts,
            "note": "rank_score เป็น heuristic สำหรับเรียงลำดับ ไม่ใช่ผลจากโมเดล AI",
        },
        "compatible_counts": {
            "motherboard": len(boards),
            "cooler": len(coolers),
            "ram": len(ram_groups["compatible"]),
            "gpu": len(catalog["gpu"]),
            "psu": len(psus),
            "case": len(cases),
            "storage": len(storage),
        },
        "unknown_counts": {
            "ram": len(ram_groups["unknown"]),
            "psu": len(psu_groups["unknown"]),
            "case": len(case_groups["unknown"]),
            "storage": len(storage_groups["unknown"]),
        },
        "validation": {
            "status": overall_status(selected_checks) if selected_checks else "unknown",
            "checks": selected_checks,
            "quality": compatibility_quality(selected, selected_checks),
            "limitations": [
                "ไม่มีข้อมูล BIOS version/CPU support list รายรุ่น",
                "ไม่มีข้อมูลตำแหน่งหม้อน้ำ AIO ที่เคสรองรับ",
                "ไม่มีค่า cooling capacity ของ CPU cooler สำหรับยืนยัน TDP โดยตรง",
                "ไม่มี RAM QVL/XMP/EXPO support list รายเมนบอร์ด",
                "ยังไม่มีราคาและ benchmark สำหรับประเมินความคุ้มค่าและคอขวด",
            ],
        },
        "recommendations": {
            "motherboard": top(boards, lambda row: motherboard_score(row, cpu), limit),
            "cooler": top(coolers, lambda row: cooler_score(row, cpu), limit),
            "ram": top(ram_rows, ram_score, limit),
            "psu": top(psus, lambda row: psu_score(row, minimum_watts), limit),
            "case": [public_part(row) for row in cases[:limit]],
            "storage": [public_part(row) for row in storage[:limit]],
        },
    }
    if not gpu:
        result["constraints"]["gpu_note"] = (
            "CPU ไม่ได้กำหนด GPU ที่ใส่ได้โดยตรง; เลือก GPU เพื่อกรองเคสและคำนวณ PSU"
        )
    return result


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="กรองอุปกรณ์ PC ที่เข้ากันได้จาก BuildCores OpenDB")
    parser.add_argument("--cpu", required=True, help="ชื่อเต็ม บางส่วนของชื่อ หรือ opendb_id")
    parser.add_argument("--motherboard")
    parser.add_argument("--ram")
    parser.add_argument("--gpu")
    parser.add_argument("--cooler")
    parser.add_argument("--case")
    parser.add_argument("--psu")
    parser.add_argument("--storage")
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--json", action="store_true", help="พิมพ์ผลลัพธ์ JSON สำหรับ API/frontend")
    return parser.parse_args()


def main() -> int:
    # Windows terminals may default to cp1252 even though catalog names/messages
    # are UTF-8.  Keep CLI and redirected JSON output Unicode-safe.
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")

    args = parse_args()
    queries = {
        "cpu": args.cpu,
        "motherboard": args.motherboard,
        "ram": args.ram,
        "gpu": args.gpu,
        "cooler": args.cooler,
        "case": args.case,
        "psu": args.psu,
        "storage": args.storage,
    }
    try:
        result = build_recommendations(load_catalog(), queries, max(1, args.limit))
    except (FileNotFoundError, SelectionError) as error:
        print(f"ERROR: {error}")
        return 2

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0

    print(f"CPU: {result['selected']['cpu']['name']}")
    print(f"Socket: {result['constraints']['cpu_socket']}")
    if result["constraints"]["recommended_psu_watts"]:
        print(f"PSU ที่แนะนำขั้นต่ำ: {result['constraints']['recommended_psu_watts']} W")
    print("\nจำนวนอุปกรณ์ที่ผ่านกฎ:")
    for part, count in result["compatible_counts"].items():
        print(f"  {part:12} {count:,}")
    print("\nรายการแนะนำ (ใช้ --json เพื่อดูทุกหมวด):")
    for part in ("motherboard", "cooler", "ram"):
        print(f"\n{part.upper()}")
        for item in result["recommendations"][part]:
            print(f"  - {item['name']} [{item.get('rank_score', 0):.2f}]")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
