# Blender Open Data — ดาวน์โหลดจริง

แหล่ง: https://opendata.blender.org/snapshots/opendata-latest.zip
ดาวน์โหลดวันที่ 2026-10-23; snapshot ภายใน: opendata-2026-10-23-000001+0000.jsonl
ไฟล์ ZIP ประมาณ 102 MB; JSONL เมื่อแตกประมาณ 1.9 GB จึงเก็บ ZIP ไว้เพื่อประหยัดพื้นที่
ใบอนุญาต CC0 ดู Blender_LICENSE.txt และ Blender_README.txt ต้นฉบับ
sample_3_records.json เป็น 3 บรรทัดแรกจริง ใช้ดูโครงสร้าง ไม่ใช่ชุดฝึกที่เพียงพอ
ใช้ ../07_scripts/read_blender.py อ่านแบบ streaming ไม่ต้องแตกทั้งไฟล์
ต้องจับคู่ชื่ออุปกรณ์กับ opendb_id และตรวจชนิด CPU/GPU ก่อนใช้
เก็บเวอร์ชัน Blender, scene, backend, OS และเงื่อนไขทดสอบแยกกัน
ข้อมูลนี้วัดงานเรนเดอร์ ไม่ใช่ FPS เกม และยังไม่ได้ clean หรือ join กับ catalog
