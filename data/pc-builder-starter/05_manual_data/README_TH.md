# ตารางสำหรับเติมข้อมูลจริง

ไฟล์ CSV ในโฟลเดอร์นี้มีเฉพาะหัวตาราง ยังไม่มีข้อมูลจริง
- cpu_support.csv: CPU support/BIOS ต้องระบุ board revision จากผู้ผลิต
- prices_stock.csv: ราคาไทยและสต็อกของร้าน ใช้ part_id = opendb_id
- benchmark_results.csv: ผลทดสอบจริง ต้องระบุ workload/เวอร์ชัน/หน่วย ไม่รวมคะแนนต่างเงื่อนไขเข้าด้วยกัน
- manufacturer_verification.csv: เก็บค่าที่ตรวจจากผู้ผลิตและ URL โดยไม่แก้ต้นฉบับทิ้ง
เก็บวันที่เป็น ISO 8601 และ source_url เพื่อย้อนตรวจสอบได้

## ข้อมูลที่ตรวจและเติมแล้ว
verified_corrections.json เป็นข้อมูลจริงจากผู้ผลิตที่ตรวจ URL แล้ว ไม่ใช่แม่แบบว่าง
มี expected_mpns ป้องกันการใช้ผิดรุ่น และ note ระบุการแปลงหน่วย/เงื่อนไข
GPU reference rules ใช้ exact configuration เฉพาะ memory_bus; บันทึกความแตกต่างจาก exact-board verification ใน enrichment_evidence
อย่าแก้ 08_cleaned โดยตรง เพราะ pipeline จะเขียนใหม่ ให้เพิ่มหลักฐานใน JSON แล้วรัน pipeline และ tests
