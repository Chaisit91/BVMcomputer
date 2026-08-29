# เก็บรูปสินค้าใน Cloudinary

ระบบเก็บไฟล์รูปจริงไว้ใน Cloudinary และเก็บเฉพาะ `secure_url` ลงในคอลัมน์
`image_url` ของ PostgreSQL ทำให้ API เดิมสามารถดาวน์โหลดรูปผ่าน public HTTPS ได้โดยไม่ต้อง
เปลี่ยน schema ฐานข้อมูล

## ตั้งค่า

คัดลอก API environment variable จากหน้า **API Keys** ของ Cloudinary Console ซึ่งมีรูปแบบ:

```text
cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

จากนั้นเปิด `run_compatibility_web.bat` และกรอกค่าดังกล่าวในช่อง `CLOUDINARY_URL`
โดยค่าจะไม่แสดงบนหน้าจอ หากกด Enter โดยไม่กรอก ระบบจะบันทึก URL ต้นทางแบบเดิม

หรือกำหนดใน PowerShell ก่อนเปิดโปรแกรม:

```powershell
$env:CLOUDINARY_URL = "cloudinary://API_KEY:API_SECRET@CLOUD_NAME"
.\run_compatibility_web.bat
```

ห้ามใส่ค่าจริงของ `CLOUDINARY_URL` ลง Git เพราะภายในมี API secret

## การทำงาน

`seed_selected_product_images.py` จะอัปโหลด URL ใน `PRODUCT_IMAGES` ไปยังโฟลเดอร์
`buildcores/products` บน Cloudinary ด้วย public ID ที่ผูกกับหมวดและ `opendb_id`
แล้วบันทึก `secure_url` ที่ได้รับลง PostgreSQL

กำหนดโฟลเดอร์อื่นได้ด้วย `CLOUDINARY_FOLDER` และเมื่อต้องการเขียนทับ asset เดิมให้ตั้ง:

```powershell
$env:CLOUDINARY_OVERWRITE = "1"
```

ถ้าไม่ตั้ง `CLOUDINARY_OVERWRITE` การ seed ซ้ำจะใช้ public ID เดิมโดยไม่เขียนทับรูปเดิม
