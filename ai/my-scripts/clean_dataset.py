import csv
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DATASET = ROOT / "dataset"
CLEANED_DATASET = ROOT / "data" / "processed"

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
# ค่าที่ถือว่าเป็นข้อมูลว่าง
# ============================================================

EMPTY_VALUES = {
    "",
    "none",
    "null",
    "nan",
    "n/a",
    "na",
    "-"
}


def clean_value(value):
    """
    ทำความสะอาดค่าของแต่ละ cell
    """

    if value is None:
        return ""

    value = value.strip()

    if value.lower() in EMPTY_VALUES:
        return ""

    return value


def clean_file(category, filename):
    input_file = DATASET / filename
    output_file = CLEANED_DATASET / filename

    if not input_file.exists():
        print(f"❌ {category}: ไม่พบไฟล์ {filename}")
        return

    try:
        with input_file.open(
            "r",
            encoding="utf-8-sig",
            newline=""
        ) as f:

            reader = csv.DictReader(f)

            rows = list(reader)
            columns = reader.fieldnames or []

        original_count = len(rows)

        cleaned_rows = []

        for row in rows:

            cleaned_row = {}

            for column in columns:
                cleaned_row[column] = clean_value(
                    row.get(column)
                )

            cleaned_rows.append(cleaned_row)

        # ----------------------------------------------------
        # ลบข้อมูลซ้ำ
        # ----------------------------------------------------

        unique_rows = []
        seen = set()

        for row in cleaned_rows:

            row_key = tuple(
                row[column]
                for column in columns
            )

            if row_key not in seen:
                seen.add(row_key)
                unique_rows.append(row)

        duplicate_count = (
            len(cleaned_rows) - len(unique_rows)
        )

        # ----------------------------------------------------
        # สร้างโฟลเดอร์ output
        # ----------------------------------------------------

        CLEANED_DATASET.mkdir(
            parents=True,
            exist_ok=True
        )

        # ----------------------------------------------------
        # เขียนไฟล์ใหม่
        # ----------------------------------------------------

        with output_file.open(
            "w",
            encoding="utf-8-sig",
            newline=""
        ) as f:

            writer = csv.DictWriter(
                f,
                fieldnames=columns
            )

            writer.writeheader()
            writer.writerows(unique_rows)

        print(
            f"✅ {category}: "
            f"{original_count:,} → "
            f"{len(unique_rows):,} records | "
            f"ลบซ้ำ {duplicate_count:,}"
        )

    except Exception as e:
        print(
            f"❌ {category}: "
            f"เกิดข้อผิดพลาด - {e}"
        )


def main():

    print("=" * 70)
    print("BuildCores OpenDB - DATA CLEANING")
    print("=" * 70)
    print()

    if not DATASET.exists():
        print("❌ ไม่พบโฟลเดอร์ dataset")
        return

    print(f"📂 Input : {DATASET}")
    print(f"📂 Output: {CLEANED_DATASET}")
    print()

    for category, filename in FILES.items():
        clean_file(category, filename)

    print()
    print("=" * 70)
    print("✅ DATA CLEANING เสร็จแล้ว")
    print("=" * 70)


if __name__ == "__main__":
    main()