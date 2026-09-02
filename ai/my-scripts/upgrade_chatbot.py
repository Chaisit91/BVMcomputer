"""Conversational facade for deterministic PC upgrade recommendations."""

from __future__ import annotations

import re
from typing import Any

from compatibility_engine import PART_FILES, SelectionError, public_part, select
from upgrade_recommender import (
    GOAL_LABELS,
    PART_LABELS,
    build_issues,
    recommend_upgrades,
)


GOAL_KEYWORDS = {
    "gaming": ("เกม", "gaming", "fps", "1440p", "4k", "esport"),
    "creator": ("ตัดต่อ", "เรนเดอร์", "render", "creator", "stream", "สตรีม", "ทำงานกราฟิก"),
    "general": ("ทั่วไป", "ทำงานเอกสาร", "เรียน", "office", "เปิดเว็บ"),
}
TARGET_KEYWORDS = {
    "motherboard": ("motherboard", "mainboard", "เมนบอร์ด"),
    "cooler": ("cpu cooler", "cooler", "ชุดระบาย", "ฮีตซิงก์", "ซิงก์"),
    "storage": ("storage", "ssd", "hdd", "nvme", "ที่เก็บ", "ฮาร์ดดิสก์"),
    "gpu": ("gpu", "การ์ดจอ", "rtx", "radeon", "geforce"),
    "cpu": ("cpu", "ซีพียู", "processor", "โปรเซสเซอร์"),
    "ram": ("ram", "แรม", "ddr4", "ddr5"),
    "psu": ("psu", "power supply", "พาวเวอร์ซัพพลาย", "เพาเวอร์"),
    "case": ("case", "เคส"),
}
COMPATIBILITY_KEYWORDS = (
    "เข้ากัน", "compatible", "รองรับ", "ใช้ด้วยกัน", "พอไหม", "ผ่านไหม", "เช็กสเปก",
)
QUICK_REPLIES = [
    "เล่นเกมควรอัปเกรดอะไรก่อน",
    "ถ้าเปลี่ยน GPU ต้องเปลี่ยนอะไรตาม",
    "เช็กว่าสเปกที่เลือกเข้ากันไหม",
    "ใช้งานทั่วไปควรอัปเกรดอะไร",
]


def normalize_message(message: str) -> str:
    return re.sub(r"\s+", " ", message.strip().casefold())


def detect_goal(message: str, default: str = "gaming") -> str:
    normalized = normalize_message(message)
    for goal, keywords in GOAL_KEYWORDS.items():
        if any(keyword in normalized for keyword in keywords):
            return goal
    return default if default in GOAL_LABELS else "gaming"


def detect_target(message: str, default: str = "auto") -> str:
    normalized = normalize_message(message)
    for target, keywords in TARGET_KEYWORDS.items():
        if any(keyword in normalized for keyword in keywords):
            return target
    return default if default == "auto" or default in PART_FILES else "auto"


def selected_build(
    catalog: dict[str, list[dict[str, str]]],
    current_queries: dict[str, str | None],
) -> dict[str, dict[str, str]]:
    return {
        part: select(catalog[part], query, part)
        for part, query in current_queries.items()
        if part in PART_FILES and query
    }


def compatibility_answer(selected: dict[str, dict[str, str]]) -> str:
    if not selected:
        return "กรุณาเลือกอุปกรณ์ของเครื่องปัจจุบันอย่างน้อย 1 ชิ้นก่อน แล้วผมจะตรวจให้ครับ"
    issues = build_issues(selected)
    if not issues:
        return (
            f"จากอุปกรณ์ที่เลือก {len(selected)}/8 หมวด ยังไม่พบเงื่อนไขที่ยืนยันว่าเข้ากันไม่ได้ครับ "
            "ถ้ายังเลือกไม่ครบ ผลนี้เป็นเพียงการตรวจส่วนที่มีข้อมูลเท่านั้น"
        )
    details = " ".join(f"• {item['reason']}" for item in issues[:5])
    return f"พบจุดที่ต้องแก้ {len(issues)} รายการครับ {details}"


def recommendation_answer(result: dict[str, Any]) -> str:
    recommendations = result["recommendations"]
    if not recommendations:
        return result["summary"]
    top = recommendations[0]
    product = top["product"]["name"]
    gain = top["estimated_gain_percent"]
    gain_text = (
        f"feature score สูงกว่าของเดิมประมาณ {gain:g}%"
        if gain is not None else
        "ยังไม่มีอุปกรณ์เดิมในหมวดนี้สำหรับเทียบคะแนน"
    )
    response = (
        f"สำหรับ{result['goal_label']} ผมแนะนำ {top['label']} รุ่น {product} ก่อนครับ "
        f"เพราะ{gain_text}"
    )
    changes = top["required_changes"]
    if changes:
        labels = ", ".join(change["label"] for change in changes)
        reasons = " ".join(
            f"{change['label']}: {'; '.join(change['reasons'])}"
            for change in changes
        )
        response += f" ถ้าเลือกรุ่นนี้ต้องเปลี่ยน {labels} ตามด้วย เนื่องจาก {reasons}"
    else:
        response += " จากข้อมูลที่เลือกยังไม่พบชิ้นส่วนที่จำเป็นต้องเปลี่ยนตาม"
    response += " คะแนนนี้ใช้จัดอันดับจากสเปกใน catalog ไม่ใช่ FPS หรือ benchmark เกมจริงครับ"
    return response


def chat(
    catalog: dict[str, list[dict[str, str]]],
    current_queries: dict[str, str | None],
    message: str,
    goal: str = "gaming",
    target: str = "auto",
    limit: int = 3,
) -> dict[str, Any]:
    """Answer one chat turn without an external model or hidden state."""

    if not isinstance(message, str):
        raise ValueError("message ต้องเป็นข้อความ")
    message = message.strip()
    if not message:
        raise ValueError("กรุณาพิมพ์คำถาม")
    if len(message) > 1_000:
        raise ValueError("message ต้องยาวไม่เกิน 1,000 ตัวอักษร")

    detected_goal = detect_goal(message, goal)
    detected_target = detect_target(message, target)
    selected = selected_build(catalog, current_queries)
    normalized = normalize_message(message)

    if any(keyword in normalized for keyword in COMPATIBILITY_KEYWORDS):
        reply = compatibility_answer(selected)
        return {
            "reply": reply,
            "intent": "compatibility",
            "detected_goal": detected_goal,
            "detected_target": detected_target,
            "recommendations": [],
            "current_build": {part: public_part(row) for part, row in selected.items()},
            "quick_replies": QUICK_REPLIES,
        }

    if not selected:
        return {
            "reply": (
                "เลือกอุปกรณ์ของเครื่องปัจจุบันด้านบนอย่างน้อย 1 ชิ้นก่อนครับ "
                "จากนั้นถามได้เลยว่าเล่นเกมควรอัปเกรดอะไร หรือถ้าเปลี่ยน GPU ต้องเปลี่ยนอะไรตาม"
            ),
            "intent": "needs_current_build",
            "detected_goal": detected_goal,
            "detected_target": detected_target,
            "recommendations": [],
            "current_build": {},
            "quick_replies": QUICK_REPLIES,
        }

    result = recommend_upgrades(
        catalog,
        current_queries,
        goal=detected_goal,
        target=detected_target,
        limit=limit,
    )
    return {
        "reply": recommendation_answer(result),
        "intent": "upgrade_recommendation",
        "detected_goal": detected_goal,
        "detected_target": detected_target,
        "recommendations": result["recommendations"],
        "current_build": result["current_build"],
        "quick_replies": QUICK_REPLIES,
        "limitations": result["limitations"],
    }
