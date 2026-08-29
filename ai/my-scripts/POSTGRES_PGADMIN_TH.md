# นำเข้าข้อมูลและเปิดดูด้วย pgAdmin

สคริปต์ `import_csv_to_postgres.py` จัดข้อมูลเป็นลำดับดังนี้:

1. `categories` — หมวดหมู่ภาษาอังกฤษและภาษาไทย
2. `brands` — ยี่ห้อ
3. `products` — ข้อมูลสินค้าส่วนกลาง
4. `cpu_specs`, `gpu_specs`, `ram_specs`, `motherboard_specs`,
   `psu_specs`, `cpu_cooler_specs`, `pc_case_specs`, `storage_specs` —
   รายละเอียดเฉพาะหมวด
5. `product_catalog` — view รวมหมวด สินค้า และรายละเอียดไว้ดูในหน้าเดียว

ข้อมูล CSV ทุกคอลัมน์ยังถูกเก็บครบในคอลัมน์ `raw_data` ชนิด JSONB
ของตารางรายละเอียดแต่ละหมวด

## 1. ตั้งค่าการเชื่อมต่อใน PowerShell

ใช้ค่าชุดเดียวกับ PostgreSQL/pgAdmin ของเครื่อง โดยเปลี่ยนรหัสผ่านให้ตรงกับ
ผู้ใช้ `postgres` ของคุณ:

```powershell
$env:PGHOST = "localhost"
$env:PGPORT = "5432"
$env:PGDATABASE = "buildcores_db"
$env:PGUSER = "postgres"
$env:PGPASSWORD = "mypassword"
$env:PGSCHEMA = "buildcores"
```

ค่ารหัสผ่านไม่ถูกบันทึกลงในไฟล์ Python

## 2. ติดตั้งไลบรารีและนำเข้า

รันจากโฟลเดอร์รากของโปรเจกต์:

```powershell
python -m pip install -r my-scripts/requirements-postgres.txt
python my-scripts/import_csv_to_postgres.py --check-only
python my-scripts/import_csv_to_postgres.py --create-database
```

คำสั่งสุดท้ายจะสร้าง database (ถ้ายังไม่มี), schema, tables, indexes และ view
จากนั้นนำเข้าข้อมูลทั้ง 8 หมวด คำสั่งนี้รันซ้ำได้ โดยรายการเดิมจะถูกอัปเดตจาก
`opendb_id` และจะไม่เพิ่มแถวซ้ำ

หากต้องการสร้างเฉพาะโครงสร้างฐานข้อมูล:

```powershell
python my-scripts/import_csv_to_postgres.py --create-database --init-only
```

## 3. เปิดใน pgAdmin

pgAdmin เป็นโปรแกรมสำหรับเชื่อมต่อ PostgreSQL เดียวกัน ไม่ต้องเชื่อม Python
เข้าหา pgAdmin โดยตรง

ใน pgAdmin เลือก **Register > Server** แล้วระบุ:

- Name: `BuildCores Local`
- Host name/address: `localhost`
- Port: `5432`
- Maintenance database: `buildcores_db`
- Username: `postgres`
- Password: รหัสเดียวกับ `PGPASSWORD`

หลังเชื่อมต่อให้เปิด:

`Servers > BuildCores Local > Databases > buildcores_db > Schemas > buildcores`

ถ้าเพิ่งนำเข้าข้อมูล ให้คลิกขวาที่ `Schemas` แล้วเลือก **Refresh**

## ตัวอย่าง Query

ดูจำนวนสินค้าตามหมวด:

```sql
SELECT category_name_th, category_name_en, COUNT(*) AS product_count
FROM buildcores.product_catalog
GROUP BY category_name_th, category_name_en
ORDER BY category_name_en;
```

ดูสินค้าและรายละเอียดในหน้าเดียว:

```sql
SELECT category_name_th, brand_name, product_name, details
FROM buildcores.product_catalog
ORDER BY category_name_en, brand_name, product_name
LIMIT 100;
```

ดูรายละเอียด CPU แบบแยกคอลัมน์:

```sql
SELECT p.product_name, b.brand_name, s.socket, s.cores, s.threads,
       s.base_clock_ghz, s.boost_clock_ghz, s.tdp_w
FROM buildcores.cpu_specs AS s
JOIN buildcores.products AS p ON p.product_id = s.product_id
JOIN buildcores.brands AS b ON b.brand_id = p.brand_id
ORDER BY b.brand_name, p.product_name;
```
