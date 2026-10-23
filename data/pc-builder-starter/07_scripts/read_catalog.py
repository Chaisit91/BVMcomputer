"""ตัวอย่างอ่านฐานสินค้าโดยไม่แก้ต้นฉบับ ใช้ Python standard library เท่านั้น"""
from pathlib import Path
import json
ROOT = Path(__file__).resolve().parents[1]

def load_parts(category):
    # category เช่น cpu, gpu, motherboard, ram, psu, cpu_cooler, case, ssd, hdd
    path = ROOT / "02_catalog" / category / "parts.json"
    return json.loads(path.read_text(encoding="utf-8"))

if __name__ == "__main__":
    cpus = load_parts("cpu")
    print("CPU records:", len(cpus))
    for cpu in cpus[:5]:
        # ไม่มี socket = ยังสรุป compatibility ไม่ได้ ห้ามเดาจากชื่อ
        print(cpu.get("opendb_id"), cpu.get("metadata", {}).get("name"), cpu.get("socket"))
