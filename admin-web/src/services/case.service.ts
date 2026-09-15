import { api } from '../lib/api'
import { USE_MOCK_DATA } from '../lib/mockMode'
import { toPromoEnabled, toPromoPriceField } from '../lib/promoPrice'
import type { CaseFormValues } from '../schemas/case.schema'
import type { Case, ExtraSpec } from '../types/case'

function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const mockCases: Case[] = [
  {
    id: 'case-1', displayCode: 'CASE-001', sku: 'CS-LL-O11D', name: 'Lian Li O11 Dynamic EVO', brand: 'LIAN LI',
    sellingPrice: 5490, promoEnabled: true, promoPrice: 4990, stock: 14, status: 'active',
    specs: { mbSupport: 'ATX', caseType: 'Mid Tower', sidePanel: 'Tempered Glass', dimensions: '465 x 285 x 460 mm', weight: '11.5 kg', driveBays: '2x 3.5", 4x 2.5"', fanSupport: 'รองรับพัดลมสูงสุด 9 ตำแหน่ง', radiatorSupport: 'สูงสุด 360mm', ioPorts: 'USB 3.0 x2, USB-C x1, Audio', warranty: '2 ปี' },
    extraSpecs: [], videoLinks: [], description: 'เคสตัวขายดี ดีไซน์คู่ กระจกสองด้าน ระบายอากาศดีเยี่ยม', updatedAt: '2026-08-12T10:00:00Z',
  },
  {
    id: 'case-2', displayCode: 'CASE-002', sku: 'CS-NZ-H510', name: 'NZXT H5 Flow', brand: 'NZXT',
    sellingPrice: 2990, promoEnabled: false, promoPrice: 0, stock: 22, status: 'active',
    specs: { mbSupport: 'Micro-ATX', caseType: 'Mid Tower', sidePanel: 'Tempered Glass', dimensions: '428 x 230 x 461 mm', weight: '6.7 kg', driveBays: '2x 3.5", 2x 2.5"', fanSupport: 'สูงสุด 6 ตำแหน่ง', radiatorSupport: 'สูงสุด 280mm', ioPorts: 'USB 3.0 x1, USB-C x1', warranty: '2 ปี' },
    extraSpecs: [], videoLinks: [], description: 'เคสระบายอากาศดี หน้ากากตาข่าย ราคาคุ้มค่า', updatedAt: '2026-08-10T10:00:00Z',
  },
  {
    id: 'case-3', displayCode: 'CASE-003', sku: 'CS-CS-4000D', name: 'Corsair 4000D Airflow', brand: 'CORSAIR',
    sellingPrice: 3390, promoEnabled: false, promoPrice: 0, stock: 8, status: 'active',
    specs: { mbSupport: 'ATX', caseType: 'Mid Tower', sidePanel: 'Tempered Glass', dimensions: '466 x 230 x 453 mm', weight: '7.9 kg', driveBays: '2x 3.5", 2x 2.5"', fanSupport: 'สูงสุด 6 ตำแหน่ง', radiatorSupport: 'สูงสุด 360mm', ioPorts: 'USB 3.1 x1, USB 3.0 x1', warranty: '2 ปี' },
    extraSpecs: [], videoLinks: [], description: 'ยอดนิยมตลอดกาล ตะแกรงหน้าเคสระบายอากาศเยี่ยม', updatedAt: '2026-08-05T10:00:00Z',
  },
  {
    id: 'case-4', displayCode: 'CASE-004', sku: 'CS-MT-KING95', name: 'Montech King 95', brand: 'MONTECH',
    sellingPrice: 2190, promoEnabled: true, promoPrice: 1890, stock: 3, status: 'low_stock',
    specs: { mbSupport: 'ATX', caseType: 'Mid Tower', sidePanel: 'Mesh Panel', dimensions: '465 x 230 x 470 mm', weight: '9 kg', driveBays: '2x 3.5", 3x 2.5"', fanSupport: 'สูงสุด 7 ตำแหน่ง', radiatorSupport: 'สูงสุด 360mm', ioPorts: 'USB 3.0 x2', warranty: '1 ปี' },
    extraSpecs: [], videoLinks: [], description: 'ตะแกรงเมชเต็มหน้า ราคาประหยัด ลมเข้าเยอะ', updatedAt: '2026-07-28T10:00:00Z',
  },
  {
    id: 'case-5', displayCode: 'CASE-005', sku: 'CS-HY-Y70', name: 'Hyte Y70', brand: 'HYTE',
    sellingPrice: 8990, promoEnabled: false, promoPrice: 0, stock: 5, status: 'active',
    specs: { mbSupport: 'E-ATX', caseType: 'Full Tower', sidePanel: 'Tempered Glass', dimensions: '535 x 260 x 508 mm', weight: '16 kg', driveBays: '2x 3.5", 3x 2.5"', fanSupport: 'สูงสุด 10 ตำแหน่ง', radiatorSupport: 'สูงสุด 360mm x2', ioPorts: 'USB-C x1, USB 3.0 x2', warranty: '2 ปี' },
    extraSpecs: [], videoLinks: [], description: 'เคสดีไซน์แนวตั้ง กระจกพาโนรามา หรูหรา', updatedAt: '2026-07-20T10:00:00Z',
  },
  {
    id: 'case-6', displayCode: 'CASE-006', sku: 'CS-AS-A21', name: 'ASUS TUF Gaming A21', brand: 'ASUS',
    sellingPrice: 2590, promoEnabled: false, promoPrice: 0, stock: 0, status: 'out_of_stock',
    specs: { mbSupport: 'Micro-ATX', caseType: 'Mid Tower', sidePanel: 'Solid Panel', dimensions: '410 x 205 x 420 mm', weight: '6.2 kg', driveBays: '1x 3.5", 2x 2.5"', fanSupport: 'สูงสุด 5 ตำแหน่ง', radiatorSupport: 'สูงสุด 240mm', ioPorts: 'USB 3.0 x1', warranty: '2 ปี' },
    extraSpecs: [], videoLinks: [], description: 'เคสทหาร ทนทาน ขนาดกะทัดรัด', updatedAt: '2026-07-15T10:00:00Z',
  },
  {
    id: 'case-7', displayCode: 'CASE-007', sku: 'CS-DC-CH560', name: 'DeepCool CH560', brand: 'DEEPCOOL',
    sellingPrice: 2790, promoEnabled: false, promoPrice: 0, stock: 17, status: 'active',
    specs: { mbSupport: 'ATX', caseType: 'Mid Tower', sidePanel: 'Tempered Glass', dimensions: '450 x 220 x 460 mm', weight: '8.1 kg', driveBays: '2x 3.5", 2x 2.5"', fanSupport: 'สูงสุด 6 ตำแหน่ง', radiatorSupport: 'สูงสุด 360mm', ioPorts: 'USB-C x1, USB 3.0 x1', warranty: '1 ปี' },
    extraSpecs: [], videoLinks: [], description: 'หน้ากากตาข่ายเต็มแผ่น ลมไหลเวียนดี', updatedAt: '2026-07-10T10:00:00Z',
  },
  {
    id: 'case-8', displayCode: 'CASE-008', sku: 'CS-TT-CTE750', name: 'Thermaltake CTE 750 Air', brand: 'THERMALTAKE',
    sellingPrice: 6490, promoEnabled: false, promoPrice: 0, stock: 6, status: 'preorder',
    specs: { mbSupport: 'E-ATX', caseType: 'Full Tower', sidePanel: 'Mesh Panel', dimensions: '542 x 250 x 495 mm', weight: '13.4 kg', driveBays: '2x 3.5", 4x 2.5"', fanSupport: 'สูงสุด 11 ตำแหน่ง', radiatorSupport: 'สูงสุด 420mm', ioPorts: 'USB-C x1, USB 3.0 x2', warranty: '2 ปี' },
    extraSpecs: [], videoLinks: [], description: 'ตัวใหญ่ ลมเยอะ รองรับวอเตอร์คูลลิ่งระดับสูง', updatedAt: '2026-07-01T10:00:00Z',
  },
  {
    id: 'case-9', displayCode: 'CASE-009', sku: 'CS-LL-LANCOOL216', name: 'Lian Li Lancool 216', brand: 'LIAN LI',
    sellingPrice: 3290, promoEnabled: true, promoPrice: 2990, stock: 11, status: 'active',
    specs: { mbSupport: 'ATX', caseType: 'Mid Tower', sidePanel: 'Tempered Glass', dimensions: '453 x 230 x 494 mm', weight: '9.6 kg', driveBays: '2x 3.5", 2x 2.5"', fanSupport: 'สูงสุด 7 ตำแหน่ง', radiatorSupport: 'สูงสุด 360mm', ioPorts: 'USB-C x1, USB 3.0 x2', warranty: '2 ปี' },
    extraSpecs: [], videoLinks: [], description: 'ระบายอากาศระดับท็อป พัดลมขนาดใหญ่ 2 ตัวติดมาให้', updatedAt: '2026-06-25T10:00:00Z',
  },
  {
    id: 'case-10', displayCode: 'CASE-010', sku: 'CS-MT-AIR900', name: 'Montech Air 900', brand: 'MONTECH',
    sellingPrice: 3990, promoEnabled: false, promoPrice: 0, stock: 9, status: 'discontinued',
    specs: { mbSupport: 'E-ATX', caseType: 'Full Tower', sidePanel: 'Tempered Glass', dimensions: '502 x 240 x 495 mm', weight: '12 kg', driveBays: '2x 3.5", 3x 2.5"', fanSupport: 'สูงสุด 9 ตำแหน่ง', radiatorSupport: 'สูงสุด 360mm', ioPorts: 'USB-C x1, USB 3.0 x2', warranty: '1 ปี' },
    extraSpecs: [], videoLinks: [], description: 'รุ่นเก่าเลิกผลิต เหลือสต็อกจำนวนจำกัด', updatedAt: '2026-05-10T10:00:00Z',
  },
]

// Prisma's Decimal fields (sellingPrice/promoPrice) serialize to JSON as
// strings, not numbers — coerce them here so arithmetic/sorting/toLocaleString
// downstream isn't silently operating on strings.
function fromApi(row: any): Case {
  const promoPrice = row.promoPrice == null ? null : Number(row.promoPrice)
  return { ...row, sellingPrice: Number(row.sellingPrice), promoEnabled: toPromoEnabled(promoPrice), promoPrice: promoPrice ?? 0 }
}

function toApiBody(data: CaseFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] }) {
  const { promoEnabled, promoPrice, ...rest } = data
  return { ...rest, promoPrice: toPromoPriceField(promoEnabled, promoPrice) }
}

export function getCases(): Promise<Case[]> {
  if (USE_MOCK_DATA) return mockDelay(mockCases)
  return api.get<Case[]>('/cases').then((res) => res.data.map(fromApi))
}

export function getCaseDetail(id: string): Promise<Case | null> {
  if (USE_MOCK_DATA) return mockDelay(mockCases.find((c) => c.id === id) ?? null)
  return api
    .get<Case>(`/cases/${id}`)
    .then((res) => fromApi(res.data))
    .catch(() => null)
}

export function saveCase(
  id: string,
  data: CaseFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.put(`/cases/${id}`, toApiBody(data)).then(() => undefined)
}

export function createCase(
  data: CaseFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<{ id: string }> {
  if (USE_MOCK_DATA) return mockDelay({ id: `case-${Date.now()}` })
  return api.post<Case>('/cases', toApiBody(data)).then((res) => ({ id: res.data.id }))
}

export function deleteCase(id: string): Promise<void> {
  if (USE_MOCK_DATA) return mockDelay(undefined)
  return api.delete(`/cases/${id}`).then(() => undefined)
}
