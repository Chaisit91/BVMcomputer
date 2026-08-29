import csv
from pathlib import Path
from collections import Counter


ROOT = Path(__file__).resolve().parent.parent
DATASET = ROOT / "data" / "processed"


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


def inspect_file(category, filename):

    file_path = DATASET / filename

    if not file_path.exists():
        print(f"❌ {category}: ไม่พบไฟล์")
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

        total = len(rows)

        print()
        print("=" * 70)
        print(f"🔍 {category}")
        print("=" * 70)

        print(f"📄 File    : {filename}")
        print(f"📊 Records : {total:,}")
        print(f"📋 Columns : {len(columns)}")

        print()
        print("COLUMN DATA QUALITY")
        print("-" * 70)

        for column in columns:

            empty_count = 0
            values = []

            for row in rows:

                value = row.get(column, "")

                if value is None or value.strip() == "":
                    empty_count += 1
                else:
                    values.append(value.strip())

            filled_count = total - empty_count

            if total > 0:
                empty_percent = (
                    empty_count / total
                ) * 100
            else:
                empty_percent = 0

            unique_count = len(set(values))

            # สถานะ
            if empty_percent >= 90:
                status = "⚠️ เกือบว่าง"
            elif empty_percent >= 50:
                status = "🟡 ว่างเยอะ"
            elif empty_percent >= 20:
                status = "🟠 ว่างปานกลาง"
            else:
                status = "✅ ดี"

            print(
                f"{column:<55} "
                f"filled={filled_count:>5,} | "
                f"empty={empty_count:>5,} "
                f"({empty_percent:>6.2f}%) | "
                f"unique={unique_count:>5,} | "
                f"{status}"
            )

        # ----------------------------------------------------
        # ตรวจ duplicate จาก opendb_id
        # ----------------------------------------------------

        if "opendb_id" in columns:

            ids = [
                row["opendb_id"]
                for row in rows
                if row.get("opendb_id")
            ]

            counter = Counter(ids)

            duplicate_ids = [
                value
                for value, count in counter.items()
                if count > 1
            ]

            print()
            print("OPENDB ID CHECK")
            print("-" * 70)

            print(
                f"Unique IDs    : {len(counter):,}"
            )

            print(
                f"Duplicate IDs : {len(duplicate_ids):,}"
            )

            if duplicate_ids:
                print("⚠️ พบ opendb_id ซ้ำ")
            else:
                print("✅ opendb_id ไม่ซ้ำ")

    except Exception as e:

        print(
            f"❌ {category}: "
            f"อ่านไฟล์ไม่ได้ - {e}"
        )


def main():

    print("=" * 70)
    print("BuildCores OpenDB - DATA QUALITY ANALYSIS")
    print("=" * 70)

    if not DATASET.exists():

        print()
        print("❌ ไม่พบโฟลเดอร์:")
        print(DATASET)

        return

    for category, filename in FILES.items():
        inspect_file(category, filename)

    print()
    print("=" * 70)
    print("✅ DATA QUALITY ANALYSIS เสร็จแล้ว")
    print("=" * 70)


if __name__ == "__main__":
    main()