# BVM Computer — Frontend

React 19 + TypeScript + Vite + Tailwind + Redux Toolkit + Radix UI

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build
npm run lint
```

## การเชื่อมต่อ Backend

ตั้งค่าผ่านไฟล์ `.env.local` (คัดลอกจาก [.env.example](.env.example))

| ตัวแปร | ความหมาย |
|---|---|
| `VITE_API_BASE_URL` | URL ของ backend เช่น `http://localhost:4000/api` หรือ `/api` (ใช้คู่กับ proxy) |
| `VITE_API_PROXY_TARGET` | (dev เท่านั้น) ให้ Vite proxy `/api` ไปที่ backend — ไม่ต้องตั้งค่า CORS |
| `VITE_API_MODE` | `mock` / `auto` / `live` (ดูด้านล่าง) |

**โหมด API**

- `live` — เรียก backend เท่านั้น ถ้า error จะแสดงข้อความ error ให้ผู้ใช้ (ค่าเริ่มต้นตอน `npm run build`)
- `auto` — เรียก backend ก่อน ถ้า**ติดต่อไม่ได้เลย** (ยังไม่ได้เปิด / CORS / offline) จะใช้ mock data แทน
  แต่ถ้า backend ตอบกลับเป็น error (400/401/404/500) จะไม่ใช้ mock มาปิดบัง (ค่าเริ่มต้นตอน `npm run dev`)
- `mock` — ไม่เรียก network เลย ใช้สำหรับทำ UI อย่างเดียว

### โครงสร้างชั้นข้อมูล

```
component / page
   └─ hooks (useCategoryProducts, useCatalogs)      ← useEffect + dispatch
       └─ Redux slice + createAsyncThunk            ← features/*
           └─ api/*Api.ts                           ← endpoint แต่ละตัว + mock fallback
               └─ api/request.ts → api/axiosClient.ts (axios, token, interceptors)
```

- `api/axiosClient.ts` — axios instance แนบ `Authorization: Bearer <token>` อัตโนมัติ, `withCredentials: true`
  และเมื่อได้ 401 จะ logout ผู้ใช้ออกจาก UI ทันที
- `api/apiError.ts` — แปลง error ทุกแบบเป็น `ApiError` พร้อมข้อความภาษาไทย (ใช้ `message` จาก backend ก่อนถ้ามี)
- `api/request.ts` — `apiGet` / `apiPost` / `withMockFallback`

## API Contract

Backend ส่ง JSON ของ resource ตรง ๆ เป็น body (ไม่ต้องห่อด้วย `{ data: ... }`)
ถ้าเกิด error ให้ส่ง `{ "message": "ข้อความที่จะแสดงให้ผู้ใช้" }` พร้อม HTTP status ที่ถูกต้อง

### สินค้า

| Method | Path | Response |
|---|---|---|
| GET | `/products?category={slug}` | `CategoryProduct[]` — ทุกสินค้าในหมวด |
| GET | `/products/{slug}/{id}` | `CategoryProduct` หรือ 404 |
| GET | `/products/search?q={query}` | `ProductSummary[]` |
| GET | `/products/popular` | `Product[]` (หน้าแรก) |
| GET | `/categories` | `Category[]` |
| GET | `/banners/promo` | `PromoBanner[]` |
| GET | `/deals/special` | `SpecialDeal[]` |

`slug` = `cpu` `gpu` `motherboard` `ram` `storage` `psu` `case` `cooling` `desktop-pc` `pc-sets`
— รูปแบบของ `CategoryProduct` แต่ละหมวดดูได้ที่ `src/data/{category}Products.ts` (เช่น `CpuProduct`, `GpuProduct`)
และ map รวมที่ [src/data/catalog.ts](src/data/catalog.ts)

### ผู้ใช้

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password, remember }` | `{ user: { id, email, name? }, token? }` |
| POST | `/auth/logout` | — | — |
| GET | `/auth/me` | — | `{ id, email, name? }` หรือ 401 |

`token` ไม่บังคับ — ถ้า backend ใช้ cookie session ก็ไม่ต้องส่งมา

### บัญชีของฉัน (`/account/profile`)

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/account/profile` | — | `UserProfile` |
| PUT | `/account/profile` | `{ firstName, lastName, phone, birthDate?, gender? }` | `UserProfile` |
| POST | `/account/profile/avatar` | `multipart/form-data` ฟิลด์ `avatar` (JPG/PNG ≤ 5 MB) | `{ avatarUrl }` |
| GET | `/account/summary` | — | `{ orders, wishlist, shipping, pendingPayment }` (ตัวเลขบนการ์ดโปรไฟล์) |

ทุก endpoint ต้องระบุตัวผู้ใช้จาก session/token ห้ามรับ user id จาก body — type อยู่ที่ [src/types/api.ts](src/types/api.ts)
ถ้าติดต่อ backend ไม่ได้ (โหมด `auto`/`mock`) หน้าจะแสดง "โหมดทดสอบ" และบอกชัดว่าข้อมูลยังไม่ได้บันทึกไปยังเซิร์ฟเวอร์

### คำสั่งซื้อ

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/orders` | `CreateOrderRequest` | `{ orderId, status, total, paymentUrl? }` |
| POST | `/coupons/validate` | `{ code, subtotal }` | `{ valid, discount, message? }` |

ถ้าส่ง `paymentUrl` กลับมา (บัตรเครดิต / QR) หน้าเว็บจะพาผู้ใช้ไปหน้าชำระเงินนั้นต่อ
— type ทั้งหมดอยู่ที่ [src/types/api.ts](src/types/api.ts)

### AI / Upgrade / Build

| Method | Path | ไฟล์ |
|---|---|---|
| POST | `/upgrade/analyze` | `src/services/upgrade/aiService.ts` |
| POST | `/build/preview` | `src/services/build/pcPreviewService.ts` |

`POST /upgrade/analyze` (STEP 3) รับ `UpgradeAnalysisRequest` — สเปคปัจจุบัน + ชิ้นส่วนอัปเกรดที่เลือกล่าสุด + งบ/การใช้งาน
แล้วตอบ `UpgradeAnalysisResult` ครั้งเดียวครบ: คะแนน, รายการตรวจสอบความเข้ากันได้ (`compatible` / `warning` / `incompatible` พร้อม `fix`),
Insight และคำแนะนำสินค้า — type อยู่ที่ [src/types/upgrade.ts](src/types/upgrade.ts)

- Backend ต้องตอบ `source: 'ai'` — ถ้าติดต่อไม่ได้ (โหมด `auto`/`mock`) หน้าเว็บจะคำนวณแบบกฎจากข้อมูลสเปคสินค้าแทน
  ([mockUpgradeAnalysis.ts](src/services/upgrade/mockUpgradeAnalysis.ts)) และติดป้าย "ผลจำลอง (Demo)" ทุกจุด
- ผลวิเคราะห์ผูกกับชุดสินค้าที่ส่งไป เมื่อผู้ใช้เปลี่ยนชิ้นส่วน ผลเดิมจะถูกแสดงเป็น "รอตรวจสอบความเข้ากันได้" จนกว่าจะกดวิเคราะห์ใหม่

### แชทปรึกษาแอดมิน (Support Chat)

ไฟล์: [src/services/chat/chatService.ts](src/services/chat/chatService.ts) · type: [src/types/chat.ts](src/types/chat.ts)

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/support/status` | — | `{ availability: 'online' \| 'offline', replyTimeMinutes? }` |
| POST | `/support/conversations` | `{ conversationId? }` | `{ id }` — สร้างห้องใหม่ หรือกลับเข้าห้องเดิม |
| GET | `/support/conversations/{id}/messages?after={messageId}` | — | `ChatMessage[]` (เก่า → ใหม่) |
| POST | `/support/conversations/{id}/messages` | `{ text }` หรือ `{ spec: SharedSpecItem[] }` | `ChatMessage` |

- ลูกค้าที่ login แล้วให้ backend ระบุตัวตนจาก cookie/token; ลูกค้าทั่วไปจะผูกกับ `conversationId` ที่เก็บใน localStorage
  — backend ต้องถือว่า id นี้เป็นสิทธิ์เข้าถึงห้อง (ควรเป็นค่าสุ่มที่เดาไม่ได้)
- ตอนนี้รับข้อความใหม่ด้วยการ poll ทุก 8 วินาทีตอนเปิดแชท / 30 วินาทีตอนย่อ (เพื่อแสดง badge ข้อความใหม่)
  เปลี่ยนเป็น WebSocket/SSE ได้ใน `chatService.ts` + `pollChat` โดยไม่ต้องแก้ UI
- ถ้าติดต่อ backend ไม่ได้ (โหมด `auto`/`mock`) แชทจะเข้า **โหมดทดสอบ (Demo)**: ข้อความเก็บในเครื่องเท่านั้น
  ไม่แสดงสถานะออนไลน์ และไม่มีข้อความตอบกลับอัตโนมัติ
