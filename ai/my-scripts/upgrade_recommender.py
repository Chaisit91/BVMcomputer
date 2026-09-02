"""Deterministic PC upgrade recommendations built on compatibility rules.

Performance fields only rank candidates. Hard compatibility always comes from
``compatibility_engine`` so a high score can never hide an incompatible part.
"""

from __future__ import annotations

import math
import re
from typing import Any

from compatibility_engine import (
    PART_FILES,
    SelectionError,
    case_checks,
    complete_build_exists,
    cooler_score,
    cooler_socket_key,
    effective_cooler_sockets,
    motherboard_fits_cpu,
    motherboard_score,
    number,
    overall_status,
    psu_checks,
    public_part,
    ram_checks,
    recommended_psu_watts,
    select,
    storage_checks,
    tokens,
)


GOALS = {"gaming", "creator", "general"}
TARGETS = set(PART_FILES)
PART_LABELS = {
    "cpu": "CPU",
    "motherboard": "Motherboard",
    "gpu": "GPU",
    "ram": "RAM",
    "cooler": "CPU Cooler",
    "psu": "PSU",
    "case": "Case",
    "storage": "Storage",
}
GOAL_LABELS = {
    "gaming": "เล่นเกม",
    "creator": "ทำงานสร้างสรรค์/เรนเดอร์",
    "general": "ใช้งานทั่วไป",
}
GOAL_PRIORITIES = {
    "gaming": {"gpu": 1.0, "cpu": 0.82, "ram": 0.48, "storage": 0.32},
    "creator": {"cpu": 1.0, "ram": 0.82, "gpu": 0.76, "storage": 0.52},
    "general": {"storage": 1.0, "ram": 0.82, "cpu": 0.58, "gpu": 0.20},
}


def issue(rule: str, parts: tuple[str, ...], reason: str) -> dict[str, Any]:
    return {"rule": rule, "parts": list(parts), "reason": reason}


def build_issues(selected: dict[str, dict[str, str]]) -> list[dict[str, Any]]:
    """Return explicit incompatibilities in a partial or complete build."""

    issues: list[dict[str, Any]] = []
    cpu = selected.get("cpu")
    board = selected.get("motherboard")
    gpu = selected.get("gpu")
    ram = selected.get("ram")
    cooler = selected.get("cooler")
    psu = selected.get("psu")
    case = selected.get("case")
    storage = selected.get("storage")

    if cpu and board and not motherboard_fits_cpu(board, cpu):
        issues.append(issue(
            "cpu_motherboard",
            ("cpu", "motherboard"),
            f"CPU socket {cpu.get('socket') or '?'} ไม่ตรงกับเมนบอร์ด {board.get('socket') or '?'}",
        ))

    if cpu and cooler:
        socket = cooler_socket_key(cpu.get("socket"))
        if not socket or socket not in effective_cooler_sockets(cooler):
            issues.append(issue(
                "cooler_socket",
                ("cpu", "cooler"),
                "CPU Cooler ไม่รองรับ socket ของ CPU",
            ))

    if board and ram:
        for check in ram_checks(ram, board):
            if check["status"] == "incompatible":
                issues.append(issue(check["rule"], ("ram", "motherboard"), check["reason"]))

    if board and gpu and (number(board.get("pcie_x16_slots")) or 0) <= 0:
        issues.append(issue(
            "gpu_pcie",
            ("gpu", "motherboard"),
            "เมนบอร์ดไม่มีสล็อต PCIe x16 สำหรับ GPU",
        ))

    if psu:
        minimum = recommended_psu_watts(cpu, gpu) if cpu else None
        psu_parts = {
            "psu_wattage": tuple(part for part in ("cpu", "gpu", "psu") if part in selected),
            "main_power": tuple(part for part in ("motherboard", "psu") if part in selected),
            "cpu_power": tuple(part for part in ("motherboard", "psu") if part in selected),
            "gpu_power": tuple(part for part in ("gpu", "psu") if part in selected),
        }
        for check in psu_checks(psu, minimum, board, gpu):
            if check["status"] == "incompatible":
                issues.append(issue(
                    check["rule"],
                    psu_parts.get(check["rule"], ("psu",)),
                    check["reason"],
                ))

    if case:
        case_parts = {
            "case_motherboard": ("motherboard", "case"),
            "case_gpu_length": ("gpu", "case"),
            "case_gpu_slots": ("gpu", "case"),
            "case_cooler_height": ("cooler", "case"),
            "case_psu_form": ("psu", "case"),
            "case_psu_length": ("psu", "case"),
        }
        for check in case_checks(case, board, gpu, cooler, psu):
            if check["status"] == "incompatible":
                parts = tuple(part for part in case_parts.get(check["rule"], ("case",)) if part in selected)
                issues.append(issue(check["rule"], parts, check["reason"]))

    if storage:
        storage_parts = {
            "storage_m2": ("storage", "motherboard"),
            "storage_sata": ("storage", "motherboard"),
            "storage_case_bay": ("storage", "case"),
            "storage_power": ("storage", "psu"),
        }
        for check in storage_checks(storage, board, case, psu):
            if check["status"] == "incompatible":
                parts = tuple(part for part in storage_parts.get(check["rule"], ("storage",)) if part in selected)
                issues.append(issue(check["rule"], parts, check["reason"]))
    return issues


def component_score(
    part_type: str,
    row: dict[str, str],
    goal: str,
    selected: dict[str, dict[str, str]],
) -> float:
    """Comparable heuristic score within one part category."""

    if part_type == "cpu":
        return number(row.get("performance_score")) or (
            (number(row.get("cores_total")) or 0) * (number(row.get("boost_clock")) or 0)
        )
    if part_type == "gpu":
        compute = (number(row.get("compute_score")) or 0) / 1_000_000
        memory = number(row.get("memory_gb")) or 0
        efficiency = (number(row.get("performance_per_watt")) or 0) / 10_000
        if goal == "gaming":
            return compute + memory * 0.75 + efficiency * 0.20
        if goal == "creator":
            return compute * 0.85 + memory * 1.25 + efficiency * 0.15
        return compute * 0.35 + memory * 0.60 + efficiency * 0.45
    if part_type == "ram":
        capacity = number(row.get("capacity_gb")) or 0
        speed = number(row.get("speed_score")) or 0
        if goal == "gaming":
            return min(capacity, 64) * 0.45 + speed * 0.75
        if goal == "creator":
            return capacity * 0.85 + speed * 0.55
        return min(capacity, 64) * 0.80 + speed * 0.35
    if part_type == "storage":
        capacity = number(row.get("capacity_gb")) or 0
        interface = row.get("interface", "").upper()
        generation = number(re.search(r"PCIE\s*([345])", interface).group(1)) if re.search(r"PCIE\s*([345])", interface) else 0
        nvme = row.get("nvme", "").strip().casefold() in {"1", "true", "yes"}
        return math.log2(capacity + 1) * 10 + generation * 8 + (30 if nvme else 0)
    if part_type == "motherboard":
        cpu = selected.get("cpu")
        return motherboard_score(row, cpu) if cpu else (
            (number(row.get("memory_slots")) or 0) * 3
            + (number(row.get("m2_slot_count")) or 0) * 4
            + (number(row.get("pcie_max_gen")) or 0) * 4
        )
    if part_type == "cooler":
        cpu = selected.get("cpu")
        return cooler_score(row, cpu) if cpu else (
            (number(row.get("radiator_size_mm")) or 0) / 10
            + (number(row.get("fan_quantity")) or 0) * 4
        )
    if part_type == "psu":
        efficiency = row.get("efficiency_rating", "").upper()
        bonus = 30 if "TITANIUM" in efficiency else 24 if "PLATINUM" in efficiency else 18 if "GOLD" in efficiency else 8
        return (number(row.get("wattage")) or 0) / 10 + bonus
    if part_type == "case":
        return (
            (number(row.get("gpu_clearance_mm")) or 0) / 10
            + (number(row.get("cooler_clearance_mm")) or 0) / 10
            + (number(row.get("expansion_slots")) or 0) * 2
        )
    return 0.0


def change_targets_for_issue(rule: str, target: str) -> list[str]:
    if rule == "cpu_motherboard":
        return ["motherboard"] if target == "cpu" else ["cpu"] if target == "motherboard" else []
    if rule == "cooler_socket":
        return ["cooler"] if target == "cpu" else []
    if rule.startswith("ram_"):
        return ["motherboard"] if target == "ram" else ["ram"] if target == "motherboard" else []
    if rule == "gpu_pcie":
        return ["motherboard"] if target == "gpu" else []
    if rule.startswith("psu_") or rule in {"main_power", "cpu_power", "gpu_power"}:
        return ["psu"] if target != "psu" else []
    if rule.startswith("case_"):
        return ["case"] if target != "case" else []
    if rule in {"storage_m2", "storage_sata"}:
        return ["motherboard"] if target == "storage" else ["storage"]
    if rule == "storage_case_bay":
        return ["case"] if target == "storage" else ["storage"]
    if rule == "storage_power":
        return ["psu"] if target == "storage" else ["storage"]
    return []


def evidence_reasons(part_type: str, row: dict[str, str], goal: str) -> list[str]:
    reasons = [f"จัดอันดับโดยให้น้ำหนักกับเป้าหมาย{GOAL_LABELS[goal]}"]
    if part_type == "cpu":
        reasons.append(
            f"performance score {number(row.get('performance_score')) or 0:g}, "
            f"{number(row.get('cores_total')) or 0:g} cores / {number(row.get('threads')) or 0:g} threads"
        )
    elif part_type == "gpu":
        reasons.append(
            f"VRAM {number(row.get('memory_gb')) or 0:g} GB และ compute score "
            f"{number(row.get('compute_score')) or 0:,.0f}"
        )
    elif part_type == "ram":
        reasons.append(
            f"RAM {number(row.get('capacity_gb')) or 0:g} GB ที่ {number(row.get('speed_mhz')) or 0:g} MHz"
        )
    elif part_type == "storage":
        reasons.append(
            f"ความจุ {number(row.get('capacity_gb')) or 0:g} GB, interface {row.get('interface') or 'ไม่ระบุ'}"
        )
    return reasons


def recommend_upgrades(
    catalog: dict[str, list[dict[str, str]]],
    current_queries: dict[str, str | None],
    goal: str = "gaming",
    target: str = "auto",
    limit: int = 5,
) -> dict[str, Any]:
    """Recommend upgrades and identify parts that must change with each option."""

    goal = goal.strip().lower()
    target = target.strip().lower()
    if goal not in GOALS:
        raise ValueError(f"goal ต้องเป็นหนึ่งใน: {', '.join(sorted(GOALS))}")
    if target != "auto" and target not in TARGETS:
        raise ValueError(f"target ต้องเป็น auto หรือหนึ่งใน: {', '.join(PART_FILES)}")

    selected = {
        part: select(catalog[part], query, part)
        for part, query in current_queries.items()
        if part in PART_FILES and query
    }
    if not selected:
        raise SelectionError("กรุณาระบุอุปกรณ์ในเครื่องปัจจุบันอย่างน้อย 1 ชิ้น")

    baseline_keys = {(item["rule"], tuple(item["parts"])) for item in build_issues(selected)}
    targets = [target] if target != "auto" else [
        part for part in GOAL_PRIORITIES[goal] if part in selected
    ]
    if not targets:
        targets = [part for part in GOAL_PRIORITIES[goal] if catalog.get(part)]

    by_target: dict[str, list[dict[str, Any]]] = {}
    for part_type in targets:
        current = selected.get(part_type)
        current_score = component_score(part_type, current, goal, selected) if current else 0.0
        candidates: list[dict[str, Any]] = []
        priority = GOAL_PRIORITIES[goal].get(part_type, 0.35)

        for candidate in catalog[part_type]:
            if current and candidate.get("opendb_id") == current.get("opendb_id"):
                continue
            candidate_score = component_score(part_type, candidate, goal, selected)
            gain = ((candidate_score - current_score) / current_score * 100) if current_score > 0 else None
            if current and (gain is None or gain < 5):
                continue

            proposed = {**selected, part_type: candidate}
            new_issues = [
                item for item in build_issues(proposed)
                if (item["rule"], tuple(item["parts"])) not in baseline_keys
            ]
            dependencies: dict[str, list[str]] = {}
            invalid_candidate = False
            for item in new_issues:
                changes = change_targets_for_issue(item["rule"], part_type)
                if part_type in item["parts"] and not changes:
                    invalid_candidate = True
                    break
                for dependency in changes:
                    dependencies.setdefault(dependency, []).append(item["reason"])
            if invalid_candidate:
                continue

            if part_type == "cpu" and selected.get("ram"):
                supported = tokens(candidate.get("memory_type"))
                current_ram_type = selected["ram"].get("ram_type", "")
                if supported and current_ram_type and current_ram_type.upper() not in supported:
                    dependencies.setdefault("ram", []).append(
                        f"CPU รุ่นนี้รองรับ {candidate.get('memory_type')} แต่ RAM เดิมเป็น {current_ram_type}"
                    )

            retained = {
                part: row for part, row in proposed.items()
                if part not in dependencies
            }
            if retained.get("cpu") and not complete_build_exists(catalog, retained):
                continue

            gain_value = gain if gain is not None else 10.0
            decision_score = priority * gain_value - len(dependencies) * 18
            upgrade_score = max(0.0, min(100.0, 50 + decision_score / 2))
            required_changes = [
                {
                    "part_type": dependency,
                    "label": PART_LABELS[dependency],
                    "reasons": reasons,
                }
                for dependency, reasons in sorted(dependencies.items())
            ]
            candidates.append({
                "part_type": part_type,
                "label": PART_LABELS[part_type],
                "product": public_part(candidate),
                "upgrade_score": round(upgrade_score, 1),
                "estimated_gain_percent": round(gain, 1) if gain is not None else None,
                "reasons": evidence_reasons(part_type, candidate, goal),
                "required_changes": required_changes,
                "can_keep": [
                    part for part in selected
                    if part != part_type and part not in dependencies
                ],
                "confidence": "high" if current and not dependencies else "medium",
                "_decision_score": decision_score,
            })

        candidates.sort(key=lambda item: item["_decision_score"], reverse=True)
        by_target[part_type] = candidates[:limit if target != "auto" else 2]

    recommendations = [item for items in by_target.values() for item in items]
    recommendations.sort(key=lambda item: item["_decision_score"], reverse=True)
    recommendations = recommendations[:limit]
    for item in recommendations:
        item.pop("_decision_score", None)

    return {
        "goal": goal,
        "goal_label": GOAL_LABELS[goal],
        "target": target,
        "current_build": {part: public_part(row) for part, row in selected.items()},
        "recommendations": recommendations,
        "summary": (
            f"พบตัวเลือกอัปเกรด {len(recommendations)} รายการสำหรับเป้าหมาย{GOAL_LABELS[goal]}"
            if recommendations else
            "ยังไม่พบตัวเลือกที่แรงขึ้นอย่างน้อย 5% และมีเส้นทาง compatibility ที่สมบูรณ์"
        ),
        "limitations": [
            "estimated_gain_percent เป็นการเทียบ feature score ภายในหมวด ไม่ใช่ FPS หรือ benchmark จริง",
            "ยังไม่มีราคา จึงยังไม่ใช้ budget หรือคำนวณความคุ้มค่าต่อบาท",
            "ควรตรวจ BIOS support, RAM QVL และตำแหน่งติดตั้ง radiator กับผู้ผลิตก่อนซื้อ",
        ],
    }
