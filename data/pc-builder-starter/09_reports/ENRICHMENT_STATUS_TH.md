# ผลการแก้ข้อมูลที่ต้องตรวจเพิ่ม — รอบ 1

- ข้อมูลสินค้า: 26,264 รายการ ไม่ลบสินค้า
- เดิม needs_review: 7,403 รายการ
- ปัจจุบัน needs_review: 6,761 รายการ ลดสุทธิ 642
- เติม/แก้ค่า: 844 ฟิลด์ ใน 792 รายการ
- จากผู้ผลิตตรง MPN: 9 ฟิลด์
- จาก official GPU reference configuration ตรงรุ่นชิป/ความจุ/ชนิด VRAM: 393 ฟิลด์ (ไม่ใช่ตรวจ custom board ทุกฟิลด์)
- จากข้อมูลต้นทางที่ผู้ผลิตและ MPN ตรง สเปกแยกรุ่นไม่ขัดกัน: 442 ฟิลด์ (ยังไม่ใช่ manufacturer verification)
- พบหลักฐานขัดกัน: 17 ฟิลด์ เก็บไว้ตรวจ ไม่ทับค่าโดยเดา
- งานตรวจฟิลด์ที่ยังเหลือ: 10,099 งาน หลายงานอาจเป็นสินค้าตัวเดียวกัน

## อ่านผลในโปรเจกต์
โฟลเดอร์ C:/Users/chatchaloem/Documents/GitHub/BVMcomputer/data/pc-builder-starter/
- 08_cleaned/: ชุดข้อมูลล่าสุด พร้อม enrichment_evidence ในแต่ละ record
- 09_reports/enrichment_receipts.json: ค่าก่อน/หลัง method, donor ID หรือ URL ผู้ผลิต
- 09_reports/review_queue.json: คิวงานที่ยังเหลือ พร้อม part ID, MPN, URL ถ้ามี และ priority
- 09_reports/enrichment_conflicts.json: หลักฐานที่ขัดกัน
- 05_manual_data/verified_corrections.json: การแก้จากผู้ผลิตที่เก็บไว้ทำซ้ำ
- 05_manual_data/gpu_reference_rules.json: กฎเติม memory bus เท่านั้น ไม่อนุมานขนาดการ์ด/ขั้วต่อ

## สิ่งที่ยังไม่เสร็จ
ยังไม่ตรวจผู้ผลิตครบ 6,761 รายการ ไม่ได้ล้าง flag ให้ผ่านเทียม
ประเด็นหลักที่เหลือคือชนิด PSU/ความสูงซิงก์ของเคส, memory bus รุ่นที่ยังไม่มีหลักฐาน, หน่วยน้ำหนัก และสเปกเสริม CPU
รายการ no_issues_detected ไม่เท่ากับยืนยัน compatibility ทั้งเครื่อง
การตรวจ BIOS/CPU support, ระยะติดหม้อน้ำและการแชร์เลนยังต้องใช้ข้อมูลเพิ่ม

## Validation
ผ่าน 8 unit/integration tests และ --check ยืนยัน deterministic output/จำนวนสินค้า/ID ไม่ซ้ำ/hash input ไม่เปลี่ยน
ไม่แก้ต้นฉบับ ไม่แก้ .gitignore และไม่ stage/commit
