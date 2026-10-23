"""อ่านผลทดสอบ Blender จาก ZIP ทีละบรรทัด ใช้ Python standard library เท่านั้น"""
from pathlib import Path
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]

def iter_benchmarks():
    # อ่านแบบ streaming เพื่อไม่โหลดข้อมูลประมาณ 1.9 GB เข้าหน่วยความจำ
    archive = ROOT / "04_benchmarks" / "blender-opendata-2026-10-23.zip"
    with zipfile.ZipFile(archive) as z:
        member = next(n for n in z.namelist() if n.endswith(".jsonl"))
        with z.open(member) as stream:
            for line in stream:
                if line.strip():
                    yield json.loads(line)

if __name__ == "__main__":
    # ตัวอย่างแสดงเพียงหนึ่ง record; การฝึก ML ต้อง clean และแยกเงื่อนไขทดสอบก่อน
    print(json.dumps(next(iter_benchmarks()), ensure_ascii=False, indent=2))
