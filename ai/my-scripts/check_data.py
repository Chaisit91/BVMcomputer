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


def main():
    print("=" * 60)
    print("BuildCores OpenDB - Dataset Check")
    print("=" * 60)
    print()

    if not DATASET.exists():
        print("❌ ไม่พบโฟลเดอร์ dataset")
        return

    for category, filename in FILES.items():
        check_file(category, filename)

    print()
    print("=" * 60)
    print("ตรวจสอบเสร็จแล้ว")
    print("=" * 60)


if __name__ == "__main__":
    main()