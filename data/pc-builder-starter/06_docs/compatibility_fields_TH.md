# ฟิลด์สำหรับเริ่มเขียนกฎ (ยังไม่ใช่การรับรอง compatibility)

| สิ่งที่ตรวจ | ฟิลด์ตั้งต้น | ข้อมูลที่ต้องตรวจเพิ่ม |
|---|---|---|
| CPU / บอร์ด | CPU.socket, Motherboard.socket | CPU support list, BIOS ขั้นต่ำ, board revision |
| RAM / บอร์ด | RAM.ram_type, RAM.capacity, RAM.modules, RAM.form_factor; Motherboard.memory | ชนิด DIMM/ECC/registered ที่บอร์ดรองรับ และข้อจำกัด CPU |
| Cooler / CPU | CPUCooler.cpu_sockets | ชุดขายมี mounting kit ที่ต้องใช้หรือไม่ |
| GPU / เคส | GPU.length, GPU.total_slot_width; PCCase.max_video_card_length, PCCase.expansion_slots | ความสูงการ์ด, ระยะสายไฟ, ผลจากหม้อน้ำ/พัดลม |
| ซิงก์ลม / เคส | CPUCooler.height, water_cooled; PCCase.max_cpu_cooler_height | ระยะหลบ RAM; ห้ามเอาความสูงปั๊มน้ำไปเทียบแทนความเข้ากันได้หม้อน้ำ |
| PSU / เครื่อง | PSU.wattage, PSU.connectors; GPU.power_connectors, GPU.tdp; CPU.specifications | กำลังไฟสูงสุด/ชั่วขณะและคำแนะนำผู้ผลิต; TDP ไม่ใช่ไฟสูงสุดทั้งเครื่อง |
| PSU / เคส | PSU.form_factor, PSU.length; PCCase.supported_power_supply_form_factors | ความยาวที่รองรับเมื่อใส่ถาด HDD และระยะสาย |
| SSD/HDD / บอร์ด | Storage.interface, form_factor, nvme; Motherboard.m2_slots, storage_devices | M.2 ไม่ได้แปลว่า NVMe เสมอ; ต้องดู SATA/NVMe และการแชร์พอร์ต/เลน |

ตรวจชื่อฟิลด์จริงจาก JSON และ schema ก่อนเขียนโค้ด เพราะแต่ละ record อาจไม่มีบางฟิลด์
อย่าเทียบ socket ด้วยข้อความดิบโดยไม่ normalize เช่นช่องว่าง/ขีด แต่ต้องเก็บค่าต้นฉบับไว้
ใช้สถานะ compatible / incompatible / conditional / unknown
ผ่านกฎ socket เป็นเพียงผ่านกฎนี้ ไม่ได้แปลว่าทั้งชุด compatible
