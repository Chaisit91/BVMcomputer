import csv
from pathlib import Path


# ============================================================
# BuildCores OpenDB
# CSV STRUCTURE INSPECTOR
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

DATA_DIR = ROOT / "data" / "processed"

CSV_FILES = [
    "cpu.csv",
    "gpu.csv",
    "ram.csv",
    "motherboard.csv",
    "psu.csv",
    "cpu_cooler.csv",
    "pc_case.csv",
]


def inspect_csv(file_path: Path):

    print("\n" + "=" * 80)
    print(f"📄 FILE: {file_path.name}")
    print("=" * 80)

    if not file_path.exists():
        print("❌ File not found")
        return

    with open(
        file_path,
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as f:

        reader = csv.DictReader(f)

        columns = reader.fieldnames or []

        print(f"\n📊 Columns: {len(columns)}")
        print("-" * 80)

        for i, column in enumerate(columns, start=1):
            print(f"{i:3}. {column}")

        print("\n🔎 Sample data")
        print("-" * 80)

        rows = []

        for row in reader:
            rows.append(row)

            if len(rows) >= 3:
                break

        if not rows:
            print("⚠️ No data")
            return

        for index, row in enumerate(rows, start=1):

            print(f"\nROW {index}")

            for column in columns:
                value = row.get(column, "")

                if value is None:
                    value = ""

                value = str(value)

                if len(value) > 100:
                    value = value[:100] + "..."

                print(f"  {column}: {value}")


def main():

    print("=" * 80)
    print("BuildCores OpenDB - CSV → PostgreSQL INSPECTOR")
    print("=" * 80)

    print(f"\n📂 CSV Directory:")
    print(f"   {DATA_DIR}")

    for filename in CSV_FILES:
        inspect_csv(DATA_DIR / filename)

    print("\n" + "=" * 80)
    print("✅ Inspection complete")
    print("=" * 80)


if __name__ == "__main__":
    main()