import csv
from pathlib import Path
from collections import Counter


# ============================================================
# BuildCores OpenDB - NORMALIZED DATA QUALITY CHECK
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

DATA_DIR = ROOT / "data" / "processed" / "normalized"

FILES = {
    "CPU": "cpu.csv",
    "GPU": "gpu.csv",
    "RAM": "ram.csv",
    "Motherboard": "motherboard.csv",
    "PSU": "psu.csv",
    "Cooler": "cpu_cooler.csv",
    "Case": "pc_case.csv",
    "Storage": "storage.csv",
}


# ============================================================
# Helpers
# ============================================================

def clean(value):
    if value is None:
        return ""

    return str(value).strip()


def is_empty(value):
    return clean(value) == ""


def show_values(rows, column, limit=15):

    values = []

    for row in rows:

        value = clean(row.get(column, ""))

        if value and value not in values:
            values.append(value)

        if len(values) >= limit:
            break

    if not values:
        return "-"

    return ", ".join(values)


def check_duplicates(rows):

    ids = []

    for row in rows:

        opendb_id = clean(row.get("opendb_id", ""))

        if opendb_id:
            ids.append(opendb_id)

    counter = Counter(ids)

    duplicates = [
        value
        for value, count in counter.items()
        if count > 1
    ]

    return len(ids), len(duplicates)


def check_column(rows, column):

    total = len(rows)

    filled = sum(
        1
        for row in rows
        if not is_empty(row.get(column, ""))
    )

    empty = total - filled

    percentage = (
        empty / total * 100
        if total > 0
        else 0
    )

    return filled, empty, percentage


# ============================================================
# Load CSV
# ============================================================

def load_csv(filename):

    path = DATA_DIR / filename

    if not path.exists():
        return None, None

    with open(
        path,
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as f:

        reader = csv.DictReader(f)

        rows = list(reader)

        return rows, reader.fieldnames


# ============================================================
# Component Checks
# ============================================================

def component_specific_check(component, rows):

    print()
    print("🔎 NORMALIZATION CHECK")
    print("-" * 70)

    # --------------------------------------------------------
    # CPU
    # --------------------------------------------------------

    if component == "CPU":

        print(
            "Socket       :",
            show_values(rows, "socket")
        )

        print(
            "Microarchitecture:",
            show_values(rows, "microarchitecture")
        )

        print(
            "Memory Types :",
            show_values(
                rows,
                "specifications_memory_types"
            )
        )

        print(
            "TDP          :",
            show_values(
                rows,
                "specifications_tdp"
            )
        )

        print(
            "Base Clock   :",
            show_values(
                rows,
                "clocks_performance_base"
            )
        )

        print(
            "Boost Clock  :",
            show_values(
                rows,
                "clocks_performance_boost"
            )
        )

    # --------------------------------------------------------
    # GPU
    # --------------------------------------------------------

    elif component == "GPU":

        print(
            "Memory       :",
            show_values(rows, "memory")
        )

        print(
            "Memory Type  :",
            show_values(rows, "memory_type")
        )

        print(
            "Core Count   :",
            show_values(rows, "core_count")
        )

        print(
            "TDP          :",
            show_values(rows, "tdp")
        )

        print(
            "Base Clock   :",
            show_values(rows, "core_base_clock")
        )

        print(
            "Boost Clock  :",
            show_values(rows, "core_boost_clock")
        )

    # --------------------------------------------------------
    # RAM
    # --------------------------------------------------------

    elif component == "RAM":

        print(
            "RAM Type     :",
            show_values(rows, "ram_type")
        )

        print(
            "Speed MHz    :",
            show_values(rows, "speed")
        )

        print(
            "Capacity GB  :",
            show_values(rows, "capacity")
        )

        print(
            "Module Qty   :",
            show_values(rows, "modules_quantity")
        )

    # --------------------------------------------------------
    # Motherboard
    # --------------------------------------------------------

    elif component == "Motherboard":

        print(
            "Socket       :",
            show_values(rows, "socket")
        )

        print(
            "RAM Type     :",
            show_values(rows, "memory_ram_type")
        )

        print(
            "RAM Slots    :",
            show_values(rows, "memory_slots")
        )

        print(
            "M.2 Slots    :",
            show_values(rows, "m2_slots")
        )

        print(
            "Form Factor  :",
            show_values(rows, "form_factor")
        )

    # --------------------------------------------------------
    # PSU
    # --------------------------------------------------------

    elif component == "PSU":

        print(
            "Wattage      :",
            show_values(rows, "wattage")
        )

        print(
            "Efficiency   :",
            show_values(rows, "efficiency_rating")
        )

        print(
            "Modular      :",
            show_values(rows, "modular")
        )

    # --------------------------------------------------------
    # Cooler
    # --------------------------------------------------------

    elif component == "Cooler":

        print(
            "CPU Sockets  :",
            show_values(rows, "cpu_sockets")
        )

        print(
            "Fan Quantity :",
            show_values(rows, "fan_quantity")
        )

        print(
            "Fan Size     :",
            show_values(rows, "fan_size")
        )

        print(
            "Water Cooled :",
            show_values(rows, "water_cooled")
        )

    # --------------------------------------------------------
    # Case
    # --------------------------------------------------------

    elif component == "Case":

        print(
            "Form Factor  :",
            show_values(rows, "form_factor")
        )

        print(
            "GPU Length   :",
            show_values(rows, "max_video_card_length")
        )

        print(
            "Cooler Height:",
            show_values(rows, "max_cpu_cooler_height")
        )

    # --------------------------------------------------------
    # Storage
    # --------------------------------------------------------

    elif component == "Storage":

        print(
            "Capacity GB  :",
            show_values(rows, "capacity")
        )

        print(
            "Storage Type :",
            show_values(rows, "storage_type")
        )

        print(
            "Type         :",
            show_values(rows, "type")
        )

        print(
            "NVMe         :",
            show_values(rows, "nvme")
        )


# ============================================================
# Main
# ============================================================

def main():

    print("=" * 70)
    print("BuildCores OpenDB - NORMALIZED DATA QUALITY CHECK")
    print("=" * 70)

    print()
    print(f"📂 Input: {DATA_DIR}")
    print()

    total_records = 0
    total_duplicates = 0

    for component, filename in FILES.items():

        print("=" * 70)
        print(f"🔍 {component}")
        print("=" * 70)

        rows, columns = load_csv(filename)

        if rows is None:

            print(
                f"❌ ไม่พบไฟล์: {filename}"
            )

            continue

        record_count = len(rows)

        total_records += record_count

        print(
            f"📄 File    : {filename}"
        )

        print(
            f"📊 Records : {record_count:,}"
        )

        print(
            f"📋 Columns : {len(columns)}"
        )

        # ----------------------------------------------------
        # ID CHECK
        # ----------------------------------------------------

        id_count, duplicate_count = check_duplicates(
            rows
        )

        total_duplicates += duplicate_count

        print()
        print("OPENDB ID CHECK")
        print("-" * 70)

        print(
            f"Unique IDs    : {id_count:,}"
        )

        print(
            f"Duplicate IDs : {duplicate_count:,}"
        )

        if duplicate_count == 0:

            print(
                "✅ opendb_id ไม่ซ้ำ"
            )

        else:

            print(
                "❌ พบ opendb_id ซ้ำ"
            )

        # ----------------------------------------------------
        # Important Columns
        # ----------------------------------------------------

        print()
        print("IMPORTANT COLUMN CHECK")
        print("-" * 70)

        important_columns = [
            "metadata_name",
            "metadata_manufacturer",
            "metadata_part_numbers",
        ]

        for column in important_columns:

            if column not in columns:
                continue

            filled, empty, percentage = check_column(
                rows,
                column
            )

            print(
                f"{column:<40} "
                f"filled={filled:>5} | "
                f"empty={empty:>5} "
                f"({percentage:>6.2f}%)"
            )

        # ----------------------------------------------------
        # Specific Check
        # ----------------------------------------------------

        component_specific_check(
            component,
            rows
        )

    # ========================================================
    # Final Summary
    # ========================================================

    print()
    print("=" * 70)
    print("📊 NORMALIZED DATA SUMMARY")
    print("=" * 70)

    print(
        f"Total Records    : {total_records:,}"
    )

    print(
        f"Total Duplicates : {total_duplicates:,}"
    )

    if total_duplicates == 0:

        print(
            "✅ ไม่พบ Duplicate ID"
        )

    else:

        print(
            "❌ พบ Duplicate ID"
        )

    print()
    print("=" * 70)
    print("✅ NORMALIZED DATA QUALITY CHECK เสร็จแล้ว")
    print("=" * 70)


if __name__ == "__main__":
    main()