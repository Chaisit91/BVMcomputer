# ตารางสำหรับเติมข้อมูลจริง

ไฟล์ CSV ในโฟลเดอร์นี้มีเฉพาะหัวตาราง ยังไม่มีข้อมูลจริง
- cpu_support.csv: CPU support/BIOS ต้องระบุ board revision จากผู้ผลิต
- prices_stock.csv: ราคาไทยและสต็อกของร้าน ใช้ part_id = opendb_id
- benchmark_results.csv: ผลทดสอบจริง ต้องระบุ workload/เวอร์ชัน/หน่วย ไม่รวมคะแนนต่างเงื่อนไขเข้าด้วยกัน
- manufacturer_verification.csv: เก็บค่าที่ตรวจจากผู้ผลิตและ URL โดยไม่แก้ต้นฉบับทิ้ง
เก็บวันที่เป็น ISO 8601 และ source_url เพื่อย้อนตรวจสอบได้
