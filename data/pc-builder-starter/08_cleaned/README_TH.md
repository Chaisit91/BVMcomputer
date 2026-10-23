# ชุดสเปกที่ผ่านการเตรียมข้อมูล v1

## ใช้ชุดไหน
แอปควรอ่าน 08_cleaned/<category>/parts.json แทน 02_catalog
CSV มีคอลัมน์ตรงกับ JSON; ค่า list/object ใน CSV เป็น JSON text, ช่องว่างเป็น null
ทุก record ในหมวดเดียวกันมีคอลัมน์ชุดเดียวกัน; schema.json กำหนด contract ของ record
ไม่สร้างคอลัมน์ราคา/FPS/BIOS ปลอม ข้อมูลเหล่านี้ต้องใช้ตารางแยกและแหล่งจริง

## หมวด
cpu, gpu, motherboard, ram, psu, cpu_cooler, case, ssd, hdd, sshd, storage_unknown
Storage แยกจาก storage_type ที่ระบุเท่านั้น ไม่เดาจากชื่อ
CPU อื่นนอก AM4/AM5/LGA1700 ยังเก็บครบ โดย demo_scope=other_or_unknown
RAM แยก module_format เป็น DIMM/SO_DIMM เฉพาะเมื่อ form_factor ระบุ
Cooler แยก cooler_type=air/liquid/unknown จาก water_cooled ที่เป็น boolean จริง

## คอลัมน์
- part_id: opendb_id เดิม ไม่ใช้ชื่อ/part number เป็น primary key
- name, manufacturer, manufacturer_url: คอลัมน์อ่านง่าย พร้อมคง metadata แยกไว้
- source_record, source_commit, source_category, pipeline_version: provenance
- nested fields ใช้ __ เช่น metadata__part_numbers; ต้นทางทุกฟิลด์มี mapping ใน data_dictionary.json
- ทุก leaf field ตาม schema ต้นทางมีคอลัมน์ แม้ทั้งหมวดไม่มีค่า
- list เช่น cpu_sockets และขั้วต่อยังเป็น list ไม่แตกเป็นจำนวนคอลัมน์ไม่แน่นอน
- ไม่มีการรวม/ลบ duplicate records อัตโนมัติ

## ความหมายของคุณภาพข้อมูล
quality_status=no_issues_detected หมายถึงไม่พบปัญหาจากกฎ cleaning ชุดนี้เท่านั้น
needs_review หมายถึงมี quality_issue_codes ให้ตรวจใน 09_reports/issues.json
ข้อมูลที่ไม่มีเป็น null; [] ที่ต้นทางส่งมาไม่ยืนยันว่าไม่รองรับ ให้กฎ compatibility ถือว่ายังไม่ทราบหากต้องใช้รายการนี้
ศูนย์ของความยาว/ความจุ/กำลัง PSU/จำนวนช่อง RAM ที่ต้องเป็นบวก เปลี่ยนเป็น null พร้อม log
ศูนย์ของ connector, cache และจำนวน E-core คงไว้ ไม่ถือว่าผิดโดยอัตโนมัติ
ตัวเลข clock บางช่องยังเป็นศูนย์จากต้นทาง ห้ามใช้เป็นค่าประสิทธิภาพจริงโดยไม่ตรวจเพิ่ม
คำว่า None ในฟิลด์ข้อความคงไว้ เพราะอาจแปลว่าไม่มีฟีเจอร์ ไม่ใช่ข้อมูลหาย
ชื่อ/ข้อความที่ต้นทางเสียหายไม่ซ่อมด้วยการเดา
ตรวจชนิดข้อมูลระดับ leaf ตาม upstream schema; ไม่ใช่การยืนยันความถูกต้องของค่ากับผู้ผลิต

## หน่วยและข้อจำกัด
ชื่อคอลัมน์หลักระบุหน่วยที่ยืนยันได้จาก schema; ดู source_path/description เพิ่มใน dictionary
source_speed_mhz เก็บค่าต้นทาง RAM ตาม schema ที่เขียน MHz; ยังไม่เปลี่ยนหรือรับรองเป็น MT/s
source_effective_memory_clock_mhz ของ GPU อาจใช้ความหมาย clock ต่างกันในต้นทาง จึงไม่ใช้จัดอันดับโดยตรง
source_weight_lb ของเคส กับ source_weight_g หมวดอื่น เก็บตามหน่วย schema แต่ยังไม่แปลง
น้ำหนักทุกค่าที่มีถูก flag ให้ตรวจ เพราะบางรายการดูผิดหน่วย ต้องอ้างผู้ผลิตก่อนใช้งาน
tdp_w ไม่ใช่กำลังไฟสูงสุดทั้งเครื่อง; power_limit_source_w เก็บค่าช่อง ppt ต้นทาง ไม่รับรองว่าเป็น PPT ของทุกค่าย
socket ตรงกันไม่พอยืนยัน CPU support/BIOS; ยังไม่มี BIOS/CPU support ที่ตรวจจากผู้ผลิต
ยังไม่รับรองระยะหม้อน้ำ/สาย GPU, การแชร์เลน และคุณภาพ PSU
Blender benchmark ยังไม่ได้ clean/join; ไม่ใช้เป็นคะแนนเกม

## รายงาน
../09_reports/summary.json: จำนวนเข้าออก ปัญหา และ hash inputs
../09_reports/issues.json: ปัญหารายสินค้า/ฟิลด์พร้อมค่าต้นทาง
../09_reports/changes.json: ค่าก่อน/หลังและเหตุผลการแปลง
../09_reports/possible_duplicates.json: manufacturer + part number ซ้ำ ต้อง review ไม่ใช่ยืนยันว่าซ้ำ
../09_reports/column_coverage.csv: จำนวนค่าที่ไม่ว่างต่อคอลัมน์ ไม่ใช่คะแนนความถูกต้อง

## ทำซ้ำจาก root โปรเจกต์
python scripts/data/clean_catalog.py
python scripts/data/clean_catalog.py --check
python -m unittest discover -s tests -p "test_clean_catalog.py"
ใช้ Python 3.10+ standard library ไม่มี dependency เพิ่ม
--check สร้างผลใหม่ใน temp และเทียบ hash ทุก output เพื่อยืนยัน reproducibility
schema.json เป็น output contract ที่สร้างจาก source schema + ชนิดที่พบ ไม่ใช่หลักฐานว่า upstream ถูกต้องทุกค่า
ต้นฉบับ 01_raw และ 02_catalog ไม่ถูกแก้ไข; ไม่แก้ .gitignore และไม่มีการ stage/commit
สิทธิ์ข้อมูล BuildCores ยังคง CC BY-NC-SA 4.0 ดู ../licenses/
