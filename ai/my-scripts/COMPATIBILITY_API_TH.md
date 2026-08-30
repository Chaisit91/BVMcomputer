# ระบบตรวจความเข้ากันได้ของอุปกรณ์ PC

ระบบใช้กฎจาก specification สำหรับตัดอุปกรณ์ที่ใช้ร่วมกันไม่ได้ และแยกผลเป็น 3 สถานะ:

- `compatible`: ข้อมูลที่จำเป็นครบและผ่านทุกกฎ
- `incompatible`: มีอย่างน้อยหนึ่งกฎที่ยืนยันว่าใช้ร่วมกันไม่ได้
- `unknown`: ข้อมูลต้นทางไม่พอ ห้ามแสดงว่า compatible โดยอัตโนมัติ

หน้าเว็บแสดงคะแนน compatibility `0–100` พร้อมสี:

- สีเขียว: เลือกชุดหลักค่อนข้างครบ ทุกกฎที่ตรวจได้ผ่าน และไม่มีข้อมูล unknown
- สีเหลือง: ยังเลือกไม่ครบ หรือมี specification บางส่วนที่ตรวจยืนยันไม่ได้
- สีแดง: พบอย่างน้อยหนึ่งเงื่อนไขที่ใช้ร่วมกันไม่ได้

คะแนนนี้วัดความเข้ากันได้และความครบของข้อมูล ไม่ใช่ benchmark ความแรงหรือคะแนนคอขวด

## การกรองและประสิทธิภาพ

- โหลด CSV เข้า memory ครั้งเดียวตอนเปิด API และสร้าง index ตาม ID/socket
- cache ผลค้นหา 512 context และผล recommendation 256 context
- ส่ง dropdown แบบ compact JSON พร้อม gzip
- หน้าเว็บโหลด dropdown ใหม่เฉพาะเมื่อ dependency ของหมวดนั้นเปลี่ยน
- ตัดเฉพาะรายการ `incompatible`; รายการข้อมูลไม่ครบยังเลือกได้และจะแสดงสีเหลือง
- PostgreSQL importer สร้าง composite indexes สำหรับ socket, memory type, wattage, form factor และ clearance

## ใช้งานผ่าน Command Line

```powershell
python my-scripts/compatibility_engine.py --cpu "AMD Ryzen Threadripper 9980X"
```

เลือกอุปกรณ์เพิ่มและรับ JSON:

```powershell
python my-scripts/compatibility_engine.py `
  --cpu "<cpu-id>" `
  --motherboard "<motherboard-id>" `
  --gpu "<gpu-id>" `
  --ram "<ram-id>" `
  --cooler "<cooler-id>" `
  --case "<case-id>" `
  --psu "<psu-id>" `
  --storage "<storage-id>" `
  --json
```

## ใช้งานผ่าน HTTP API

ติดตั้ง dependency สำหรับ PostgreSQL และการย่อรูป แล้วเริ่ม server:

```powershell
python -m pip install -r my-scripts/requirements-postgres.txt
python my-scripts/compatibility_api.py --host 127.0.0.1 --port 8000
```

เปิดหน้าเลือกอุปกรณ์ใน browser:

```text
http://127.0.0.1:8000/
```

Endpoints:

```text
GET /health
GET /search?type=cpu&q=7800X3D&limit=20
GET /recommend?cpu=<id>&motherboard=<id>&gpu=<id>&limit=10
POST /assemble
```

หน้าเว็บควรเรียก `/search` เพื่อให้ผู้ใช้เลือก `opendb_id` ที่แน่นอน แล้วเรียก `/recommend` ใหม่ทุกครั้งที่เพิ่มหรือถอดอุปกรณ์

`POST /assemble` รับ JSON รูปแบบ `{"selection":{"cpu":"<id>", ...}}` หลังเลือกครบ 8 หมวด ระบบจะดึง `image_url` จาก PostgreSQL ย่อแต่ละรูปให้ไม่เกิน `1024×1024` โดยรักษาอัตราส่วน แล้วส่งข้อมูลสินค้าครบทุกชิ้นไปยัง MaxPlus Images API เนื่องจาก API รับรูปอ้างอิงได้สูงสุด 5 ไฟล์ ระบบจึงส่ง Case, Motherboard, CPU Cooler และ GPU เป็นรูปเดี่ยว และรวม CPU, RAM, PSU และ Storage เป็น contact sheet 2×2 ในไฟล์ที่ห้า ต้องตั้ง `MAXPLUS_API_KEY` (คีย์ `ccsk-...`) เฉพาะฝั่ง server และใช้ public HTTPS URL สำหรับรูปสินค้า ภาพที่ได้เป็นภาพจำลอง ไม่ใช่การรับรองรูปลักษณ์ของ SKU แบบ 100%

## ขอบเขตข้อมูลปัจจุบัน

ตรวจได้แล้ว: socket, RAM type/slots/capacity, PCIe x16, ความยาวและความหนา GPU, ขนาดเมนบอร์ด, ความสูง air cooler, PSU wattage/form factor/length, หัว ATX/EPS/GPU/SATA และ M.2/SATA storage

ยังรายงานเป็นข้อจำกัดหรือ `unknown`: BIOS CPU support list, ตำแหน่งหม้อน้ำ AIO, ราคา, benchmark และคะแนนคอขวด CPU/GPU

หลังแก้ข้อมูล normalized ให้สร้าง feature ใหม่ด้วย:

```powershell
python my-scripts/feature_engineering.py
```

รันทดสอบ:

```powershell
python my-scripts/test_compatibility_engine.py
```

## โครงสร้างข้อมูลและความปลอดภัยล่าสุด

- `data/processed/features` เก็บ feature ฉบับเต็มสำหรับสร้าง training และ validation
- `data/processed/web_catalog` เก็บสินค้าใหม่สุดหมวดละ 50 รายการสำหรับหน้าเว็บ
- สร้าง web catalog ใหม่ด้วย `python my-scripts/trim_feature_catalog.py --keep 50 --apply`
- การเปิดเว็บแบบ local ไม่ต้องเชื่อม PostgreSQL; ตั้ง `PGPASSWORD` เมื่อต้องการโหลด `image_url`
- หาก bind API ออกนอกเครื่อง ต้องตั้ง `BUILDCORES_API_TOKEN` อย่างน้อย 32 ตัวอักษร และส่ง `Authorization: Bearer <token>`
- ตรวจ training/validation ก่อน train ด้วย `python my-scripts/check_training_validation.py`; คำสั่งคืน exit code ที่ไม่ใช่ศูนย์เมื่อพบ schema drift, label ผิดรูปแบบ, คู่ซ้ำ หรือ data leakage
