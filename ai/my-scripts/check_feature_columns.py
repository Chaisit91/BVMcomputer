import csv
from pathlib import Path


# ============================================================
# BuildCores OpenDB - CHECK FEATURE COLUMNS
# ============================================================

ROOT = Path(__file__).resolve().parent.parent

FEATURE_DIR = ROOT / "data" / "processed" / "features"


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


def load_csv(filename):

    path = FEATURE_DIR / filename

    if not path.exists():
        print(f"❌ ไม่พบไฟล์: {path}")
        return []

    with open(
        path,
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as f:

        return list(csv.DictReader(f))


def main():

    print("=" * 70)
    print("BuildCores OpenDB - CHECK FEATURE COLUMNS")
    print("=" * 70)

    print()
    print(f"📂 Feature Directory:")
    print(FEATURE_DIR)

    for category, filename in FILES.items():

        rows = load_csv(filename)

        print()
        print("-" * 70)
        print(f"🔍 {category}")
        print(f"📄 {filename}")
        print(f"📊 Records: {len(rows):,}")

        if not rows:
            continue

        columns = list(rows[0].keys())

        print()
        print(f"Columns ({len(columns)}):")

        for i, column in enumerate(columns, 1):
            print(f"  {i:02d}. {column}")

    print()
    print("=" * 70)
    print("✅ COLUMN CHECK เสร็จแล้ว")
    print("=" * 70)


if __name__ == "__main__":
    main()