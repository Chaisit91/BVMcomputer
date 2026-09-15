# ใช้ Supabase เป็นฐานข้อมูลกลาง

Admin → Backend → Supabase PostgreSQL

AI → Backend `/api/internal/ai/catalog` → ตาราง Product และสเปกชุดเดียวกับ Admin

## รันทั้งระบบ

จากโฟลเดอร์ BVMcomputer รัน `run_connected_system.bat` แล้วเปิด http://localhost:5173
ใช้บัญชี Admin เดิม ระบบสร้าง token ระหว่าง Backend/AI ในหน่วยความจำทุกครั้ง
ตัวรันรวมใช้พอร์ต AI 8100 เพื่อแยกจากเว็บ AI แบบ offline ที่ใช้พอร์ต 8000
ต้องมี dependencies ของ Backend/Admin, Prisma client ที่ generate แล้ว และ Python
การปิดด้วย Ctrl+C จะหยุดบริการที่เริ่มจากคำสั่งนี้

Backend อ่าน DATABASE_URL จาก `Backend-web/.env` ซึ่งชี้ Supabase
ไฟล์ Admin `.env` มีเฉพาะ VITE_API_URL และ VITE_USE_MOCK_DATA=false
ระหว่างพัฒนา Admin เรียก `/api` ผ่าน Vite proxy เพื่อให้คุกกี้ล็อกอินอยู่โดเมนเดียวกัน
ตัวรันรวมตั้ง BACKEND_PROXY_TARGET ให้ตรงพอร์ต Backend โดยอัตโนมัติ
ถ้ารัน Admin แยกและ Backend ไม่ได้ใช้ 8080 ให้ตั้ง BACKEND_PROXY_TARGET ใน environment ก่อนรัน Vite
สำหรับ production ให้ reverse proxy `/api` ไป Backend หรือกำหนด VITE_API_URL ให้เหมาะกับการตั้งค่าคุกกี้ของ deployment
ห้ามใส่รหัสฐานข้อมูลหรือ secret key ในตัวแปร VITE_

## ข้อมูลฉบับร่าง

คำสั่ง `npm run catalog:preview` และ `npm run catalog:import` ใน Backend-web
อ่านเฉพาะ `database/data/processed/web_catalog/*.csv` (8 หมวด)
นำเข้า Product + ตารางเฉพาะหมวด + ProductSpecValue ใน transaction เดียว
คง UUID เดิม ใช้ SKU `OPENDB-<UUID>` และข้ามสินค้าที่มีอยู่แล้วเมื่อรันซ้ำ
ไม่อ่าน open-db, training dataset หรือ models และไม่ใช้ตาราง product_catalog เก่าของ AI

สินค้านำเข้าเป็น inactive และ publishImmediately=false ราคา/สต็อก 0 เป็นค่าเว้นไว้ให้กรอก
costPrice=null ค่า 0 ของแคช/ประกัน/กำลังไฟสูงสุดและช่องข้อความว่างหมายถึงไม่มีข้อมูลจาก clean CSV
ต้องตรวจสเปกและกรอกข้อมูลที่ขาดก่อนขาย ห้ามถือว่าราคา 0 คือสินค้าฟรี
แก้ชื่อ/สเปก/ราคา/สต็อกผ่านหน้าสินค้าใน Admin แล้วเปิดใช้งาน
AI อ่านเฉพาะ active และ publishImmediately=true; ฉบับร่างจะยังไม่ปรากฏใน AI
ฟอร์มที่มีเฉพาะสถานะ active จะตั้งเผยแพร่ให้ด้วย; ฟอร์มที่มีเฉพาะปุ่มเผยแพร่จะตั้งสถานะ active ให้ด้วย
ถ้าฟอร์มมีทั้งสองช่อง (เช่น CPU) ให้เปิดทั้งสองช่องเอง

AI ตรวจข้อมูลใหม่ทุก 10 วินาทีเมื่อมีคำขอ และล้างผลแนะนำที่ cache เมื่อข้อมูลเปลี่ยน
หาก Backend/ฐานข้อมูลเข้าถึงไม่ได้ จะตอบ 503 หลังถึงรอบตรวจ ไม่สลับกลับไป CSV
การจับคู่ใช้ Product.id (ฟิลด์ opendb_id ใน API AI) ไม่ใช้ชื่อสินค้า
สินค้าที่สเปกไม่ครบอาจถูกกรองออกจนกว่าจะเติมสเปกที่จำเป็น
จำนวน catalog ไม่ถูกจำกัดไว้ที่ 50 ในระบบออนไลน์

`ai/run_compatibility_web.bat` เป็น launcher แบบ offline เดิม;
สำหรับข้อมูล Supabase ที่แก้จาก Admin ให้ใช้ `run_connected_system.bat`
หากรันแยก ให้ตั้ง AI_BACKEND_URL และ AI_CATALOG_TOKEN ใน AI;
ตั้ง AI_CATALOG_TOKEN เดียวกันใน Backend, และตั้ง AI_SERVICE_TOKEN ให้ตรง BUILDCORES_API_TOKEN

ข้อมูลในโฟลเดอร์ database เป็นต้นทางนำเข้า/ฝึกโมเดล ไม่ใช่ฐานข้อมูลออนไลน์
อย่าลบโฟลเดอร์นี้จนกว่าจะสำรองข้อมูลที่ต้องใช้ฝึกโมเดลและนำเข้าแล้ว
