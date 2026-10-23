"""ตรวจไฟล์แค็ตตาล็อก จำนวน ID และ checksum ต้นฉบับ โดยไม่แก้ข้อมูล"""
from pathlib import Path
import json, hashlib, zipfile
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'manifest.json').read_text(encoding='utf-8'))
ids=set()
for category in manifest['counts']:
    rows=json.loads((root/'02_catalog'/category['category']/'parts.json').read_text(encoding='utf-8'))
    assert len(rows)==category['count'], category
    for row in rows:
        # ID ใช้เชื่อมข้อมูล ต้องไม่หายและไม่ซ้ำข้ามหมวด
        key=row['opendb_id']; assert key not in ids, key; ids.add(key)
for item in json.loads((root/'06_docs/raw_checksums.json').read_text(encoding='utf-8')):
    assert hashlib.sha256((root/item['path']).read_bytes()).hexdigest()==item['sha256'],item['path']
with zipfile.ZipFile(next((root/'04_benchmarks').glob('*.zip'))) as z:
    # อ่านทั้ง ZIP เพื่อตรวจ CRC; ไม่แตกข้อมูลออกลงดิสก์
    assert z.testzip() is None
assert len(ids)==manifest['total']
print('PASS: catalog counts, unique IDs, raw SHA256, and benchmark ZIP CRC;',len(ids),'parts')
