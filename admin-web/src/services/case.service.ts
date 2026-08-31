import type { CaseFormValues } from '../schemas/case.schema'
import type { Case, CaseSummary, ExtraSpec } from '../types/case'

// ponytail: mock data stands in for the real endpoints until the backend ships;
// swap the body for an `api.get(...)` call later, callers don't change.
function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const cases: Case[] = [
  { id: '1', displayCode: 'CS-001', sku: 'CS-LIANLI-O11D-RGB', name: 'LIAN LI O11 Dynamic EVO RGB Black', brand: 'LIAN LI', sellingPrice: 6890, promoEnabled: true, promoPrice: 6490, stock: 14, status: 'active', specs: { mbSupport: 'E-ATX, ATX, Micro-ATX', caseType: 'Mid Tower', sidePanel: 'Tempered Glass', dimensions: '478 × 290 × 471 mm', weight: '12.5 kg', driveBays: '4× 3.5" HDD or 8× 2.5" SSD', fanSupport: 'Top: 3×120mm / Side: 3×120mm / Bottom: 3×120mm', radiatorSupport: 'Top/Side/Bottom: Up to 360mm', ioPorts: '1x USB 3.1 Type-C, 2x USB 3.0, Audio', warranty: '1 Year' }, extraSpecs: [], videoLinks: ['https://www.youtube.com/watch?v=lianli-o11d-rgb-review'], description: 'LIAN LI O11 Dynamic EVO RGB เคสดีไซน์ตู้ปลาขายสเปคเวอร์ชันล่าสุดที่อัปเกรดแแกนไฟ RGB ขนาดใหญ่อย่างสวยงาม พร้อมทั้งยังคงโครงสร้าง Dual Chamber ที่ช่วยในการจัดเรียงเคสและเพิ่มประสิทธิภาพการระบายอากาศอย่างเต็มที่\n\nจุดเด่นผลิตภัณฑ์:\n• แผงไฟแกน RGB แบบกระจายอัตโนมัติรอบขอบบนและขอบล่างของตัวเคส\n• รองรับเมนบอร์ดขนาดใหญ่สูงสุดถึง E-ATX เพื่อประสิทธิภาพสูงสุดในการประกอบเครื่องคอมพิวเตอร์ของคุณ\n• กระจก Tempered Glass เกรดอุตสาหกรรมไสพิเศษแบบไร้รอยต่อ\n• การควบคุมทิศทางลมอัจฉริยะสามารถสลับฝั่งการติดตั้งบอร์ดเพื่อกลับหัวตัวเครื่องได้ (Reverse Mode)', updatedAt: '28/08/2025' },
  { id: '2', displayCode: 'CS-002', sku: 'CS-NZXT-H9F-WH', name: 'NZXT H9 Flow White', brand: 'NZXT', sellingPrice: 5590, promoEnabled: false, promoPrice: 0, stock: 8, status: 'active', specs: { mbSupport: 'ATX, Micro-ATX, Mini-ITX', caseType: 'Mid Tower', sidePanel: 'Mesh Panel', dimensions: '460 × 230 × 460 mm', weight: '9.8 kg', driveBays: '2× 3.5" HDD or 4× 2.5" SSD', fanSupport: 'Front: 3×140mm / Rear: 1×140mm', radiatorSupport: 'Front: Up to 360mm', ioPorts: '1x USB-C, 2x USB 3.0, Audio', warranty: '2 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '27/08/2025' },
  { id: '3', displayCode: 'CS-003', sku: 'CS-MONTECH-K95P-WH', name: 'MONTECH KING 95 PRO Premium White', brand: 'MONTECH', sellingPrice: 3990, promoEnabled: false, promoPrice: 0, stock: 3, status: 'active', specs: { mbSupport: 'ATX, Micro-ATX, Mini-ITX', caseType: 'Mid Tower', sidePanel: 'Tempered Glass', dimensions: '465 × 235 × 480 mm', weight: '10.2 kg', driveBays: '2× 3.5" HDD or 3× 2.5" SSD', fanSupport: 'Front: 3×120mm / Top: 3×120mm / Rear: 1×120mm', radiatorSupport: 'Top/Front: Up to 360mm', ioPorts: '1x USB-C, 2x USB 3.0, Audio', warranty: '1 Year' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '20/08/2025' },
  { id: '4', displayCode: 'CS-004', sku: 'CS-HYTE-Y70T-BK', name: 'HYTE Y70 Touch Infinite Black', brand: 'HYTE', sellingPrice: 12900, promoEnabled: false, promoPrice: 0, stock: 5, status: 'active', specs: { mbSupport: 'E-ATX, ATX, Micro-ATX', caseType: 'Mid Tower', sidePanel: 'Tempered Glass', dimensions: '530 × 250 × 508 mm', weight: '14.1 kg', driveBays: '2× 3.5" HDD or 4× 2.5" SSD', fanSupport: 'Top: 3×120mm / Side: 3×120mm', radiatorSupport: 'Top/Side: Up to 360mm', ioPorts: '1x USB 3.1 Type-C, 2x USB 3.0, Audio', warranty: '2 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '19/08/2025' },
  { id: '5', displayCode: 'CS-005', sku: 'CS-CORSAIR-3000D-AF', name: 'CORSAIR 3000D RGB Airflow', brand: 'CORSAIR', sellingPrice: 2790, promoEnabled: false, promoPrice: 0, stock: 0, status: 'active', specs: { mbSupport: 'ATX, Micro-ATX, Mini-ITX', caseType: 'Mid Tower', sidePanel: 'Mesh Panel', dimensions: '466 × 230 × 453 mm', weight: '8.7 kg', driveBays: '2× 3.5" HDD or 2× 2.5" SSD', fanSupport: 'Front: 3×120mm ARGB included', radiatorSupport: 'Front: Up to 360mm', ioPorts: '1x USB-C, 2x USB 3.0, Audio', warranty: '2 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '15/08/2025' },
  { id: '6', displayCode: 'CS-006', sku: 'CS-DEEPCOOL-CH160', name: 'DEEPCOOL CH160 Ultra-portable', brand: 'DEEPCOOL', sellingPrice: 1890, promoEnabled: false, promoPrice: 0, stock: 22, status: 'active', specs: { mbSupport: 'Mini-ITX', caseType: 'Mini Tower', sidePanel: 'Tempered Glass', dimensions: '260 × 210 × 330 mm', weight: '4.5 kg', driveBays: '1× 3.5" HDD or 2× 2.5" SSD', fanSupport: 'Rear: 1×92mm', radiatorSupport: 'Not Supported', ioPorts: '1x USB-C, 1x USB 3.0, Audio', warranty: '1 Year' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '13/08/2025' },
  { id: '7', displayCode: 'CS-007', sku: 'CS-ASUS-ROG-GR701', name: 'ASUS ROG Hyperion GR701', brand: 'ASUS', sellingPrice: 13900, promoEnabled: false, promoPrice: 0, stock: 2, status: 'active', specs: { mbSupport: 'E-ATX, ATX, Micro-ATX', caseType: 'Full Tower', sidePanel: 'Tempered Glass', dimensions: '608 × 290 × 555 mm', weight: '18.6 kg', driveBays: '4× 3.5" HDD or 6× 2.5" SSD', fanSupport: 'Front: 3×140mm / Top: 3×140mm / Rear: 1×140mm', radiatorSupport: 'Top/Front: Up to 420mm', ioPorts: '2x USB 3.1 Type-C, 4x USB 3.0, Audio', warranty: '3 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '11/08/2025' },
  { id: '8', displayCode: 'CS-008', sku: 'CS-THERMALTAKE-P3TG', name: 'THERMALTAKE Core P3 TG Pro', brand: 'THERMALTAKE', sellingPrice: 4990, promoEnabled: false, promoPrice: 0, stock: 11, status: 'active', specs: { mbSupport: 'E-ATX, ATX, Micro-ATX', caseType: 'Open Frame', sidePanel: 'Tempered Glass', dimensions: '544 × 250 × 510 mm', weight: '11.3 kg', driveBays: '2× 3.5" HDD or 3× 2.5" SSD', fanSupport: 'Wall-mount: up to 5×120mm', radiatorSupport: 'Wall-mount: Up to 360mm', ioPorts: '1x USB-C, 2x USB 3.0, Audio', warranty: '2 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '09/08/2025' },
]

export function getCaseSummary(): Promise<CaseSummary> {
  return mockDelay({ totalModels: 184, activeRatePercent: 96.4, totalStock: 1120, lowStockCount: 8 })
}

export function getCases(): Promise<Case[]> {
  return mockDelay(cases)
}

export function getCaseDetail(id: string): Promise<Case | null> {
  return mockDelay(cases.find((item) => item.id === id) ?? null)
}

export function saveCase(
  _id: string,
  _data: CaseFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<void> {
  return mockDelay(undefined)
}

export function createCase(
  _data: CaseFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<{ id: string }> {
  return mockDelay({ id: String(cases.length + 1) })
}

export function deleteCase(_id: string): Promise<void> {
  return mockDelay(undefined)
}
