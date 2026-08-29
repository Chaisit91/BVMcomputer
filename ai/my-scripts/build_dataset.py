import json
import csv
from pathlib import Path

# ตำแหน่งโปรเจกต์
ROOT = Path(__file__).resolve().parent.parent
OPEN_DB = ROOT / "open-db"
DATASET = ROOT / "dataset"

# หมวดข้อมูลที่เราต้องการ
CATEGORIES = {
    "CPU": "cpu.csv",
    "GPU": "gpu.csv",
    "RAM": "ram.csv",
    "Motherboard": "motherboard.csv",
    "PSU": "psu.csv",
    "CPUCooler": "cpu_cooler.csv",
    "PCCase": "pc_case.csv",
    "Storage": "storage.csv",
}


def flatten_json(data, parent_key=""):
    """แปลง JSON แบบ nested ให้เป็นข้อมูลแบนสำหรับ CSV"""
    result = {}

    if isinstance(data, dict):
        for key, value in data.items():
            new_key = f"{parent_key}_{key}" if parent_key else key
            result.update(flatten_json(value, new_key))

    elif isinstance(data, list):
        # ถ้าเป็น list ธรรมดา เช่น ["DDR4", "DDR5"]
        if all(not isinstance(x, (dict, list)) for x in data):
            result[parent_key] = " | ".join(
                "" if x is None else str(x) for x in data
            )
        else:
            result[parent_key] = json.dumps(
                data,
                ensure_ascii=False
            )

    else:
        result[parent_key] = data

    return result


def process_category(category, output_name):
    source = OPEN_DB / category
    output = DATASET / output_name

    if not source.exists():
        print(f"[SKIP] {category}: ไม่พบโฟลเดอร์")
        return

    files = sorted(source.glob("*.json"))

    if not files:
        print(f"[SKIP] {category}: ไม่พบไฟล์ JSON")
        return

    rows = []
    errors = 0

    for file in files:
        try:
            with file.open("r", encoding="utf-8-sig") as f:
                data = json.load(f)

            if not isinstance(data, dict):
                continue

            row = flatten_json(data)

            # เก็บชื่อไฟล์ต้นทางไว้ตรวจสอบภายหลัง
            row["_source_file"] = file.name

            rows.append(row)

        except Exception as e:
            errors += 1
            print(f"[ERROR] {file.name}: {e}")

    if not rows:
        print(f"[FAIL] {category}: ไม่มีข้อมูลที่ใช้ได้")
        return

    # รวมชื่อ column ทั้งหมด
    columns = sorted({
        key
        for row in rows
        for key in row.keys()
    })

    # ให้ข้อมูลสำคัญอยู่ด้านหน้า
    preferred = [
        "opendb_id",
        "metadata_name",
        "metadata_manufacturer",
        "metadata_series",
        "metadata_variant",
        "metadata_releaseYear",
        "series",
        "socket",
        "_source_file",
    ]

    columns = (
        [c for c in preferred if c in columns]
        + [c for c in columns if c not in preferred]
    )

    DATASET.mkdir(parents=True, exist_ok=True)

    with output.open(
        "w",
        encoding="utf-8-sig",
        newline=""
    ) as f:

        writer = csv.DictWriter(
            f,
            fieldnames=columns,
            extrasaction="ignore"
        )

        writer.writeheader()

        for row in rows:
            writer.writerow({
                column: (
                    ""
                    if row.get(column) is None
                    else str(row.get(column))
                )
                for column in columns
            })

    print(
        f"[OK] {category}: "
        f"{len(rows):,} records -> dataset\\{output_name}"
        f" | {len(columns)} columns"
        f" | errors: {errors}"
    )


def main():

    print("=" * 60)
    print("BuildCores OpenDB -> Dataset")
    print("=" * 60)

    print(f"Project: {ROOT}")
    print()

    if not OPEN_DB.exists():
        print("[ERROR] ไม่พบโฟลเดอร์ open-db")
        return

    for category, output_name in CATEGORIES.items():
        process_category(category, output_name)

    print()
    print("=" * 60)
    print("เสร็จแล้ว!")
    print(f"Dataset อยู่ที่: {DATASET}")
    print("=" * 60)


if __name__ == "__main__":
    main()