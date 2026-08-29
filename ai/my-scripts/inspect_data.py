import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATASET = ROOT / "dataset"

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


def check_file(category, filename):
    file_path = DATASET / filename

    if not file_path.exists():
        print(f"❌ {category}: ไม่พบไฟล์ {filename}")

        csv_files = list(DATASET.glob("*.csv"))

        if csv_files:
            print("   📂 CSV ที่พบใน dataset:")
            for f in csv_files:
                print(f"      - {f.name}")

        return

    try:
        with file_path.open(
            "r",
            encoding="utf-8-sig",
            newline=""
        ) as f:

            reader = csv.DictReader(f)
            rows = list(reader)
            columns = reader.fieldnames or []

        print(
            f"✅ {category}: "
            f"{len(rows):,} records | "
            f"{len(columns)} columns"
        )

    except Exception as e:
        print(f"❌ {category}: อ่านไฟล์ไม่ได้ - {e}")


def inspect_details(category, filename):
    file_path = DATASET / filename

    if not file_path.exists():
        print(f"\n❌ {category}: ไม่พบไฟล์ {filename}")
        return

    try:
        with file_path.open(
            "r",
            encoding="utf-8-sig",
            newline=""
        ) as f:

            reader = csv.DictReader(f)
            rows = list(reader)
            columns = reader.fieldnames or []

        print()
        print("=" * 70)
        print(f"🔍 {category} DETAILED INSPECTION")
        print("=" * 70)

        print(f"📄 File    : {filename}")
        print(f"📊 Records : {len(rows):,}")
        print(f"📋 Columns : {len(columns)}")
        print()

        # แสดง Columns
        print("🔹 COLUMNS")
        print("-" * 70)

        for i, column in enumerate(columns, 1):
            print(f"{i:2}. {column}")

        # แสดงตัวอย่างข้อมูล
        print()
        print("🔹 SAMPLE DATA (3 records)")
        print("-" * 70)

        for i, row in enumerate(rows[:3], 1):
            print(f"\nRecord {i}:")

            for column in columns:
                value = row.get(column, "")

                # ตัดข้อความที่ยาวเกินไป
                if len(value) > 120:
                    value = value[:120] + "..."

                print(f"  {column}: {value}")

    except Exception as e:
        print(f"❌ {category}: อ่านไฟล์ไม่ได้ - {e}")


def main():
    print("=" * 60)
    print("BuildCores OpenDB - Dataset Check")
    print("=" * 60)
    print()

    if not DATASET.exists():
        print("❌ ไม่พบโฟลเดอร์ dataset")
        return

    print(f"📂 Dataset: {DATASET}")
    print()

    # ตรวจสอบไฟล์ทั้งหมด
    for category, filename in FILES.items():
        check_file(category, filename)

    # ตรวจรายละเอียดทุกหมวด
    for category, filename in FILES.items():
        inspect_details(category, filename)

    print()
    print("=" * 60)
    print("ตรวจสอบเสร็จแล้ว")
    print("=" * 60)


if __name__ == "__main__":
    main()