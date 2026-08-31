import type { PsuFormValues } from '../schemas/psu.schema'
import type { ExtraSpec, Psu, PsuSummary } from '../types/psu'

// ponytail: mock data stands in for the real endpoints until the backend ships;
// swap the body for an `api.get(...)` call later, callers don't change.
function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const psus: Psu[] = [
  { id: '1', displayCode: 'PSU-001', sku: 'PSU-CORSAIR-RM850X', name: 'CORSAIR RM850x 850W 80+ Gold Full Modular', brand: 'CORSAIR', sellingPrice: 4690, promoEnabled: true, promoPrice: 4490, stock: 18, status: 'active', specs: { continuousPower: '850 Watt', certification: '80+ Gold', modularity: 'Full Modular', formFactor: 'ATX', fanSize: '135mm', connectors: '24-pin ATX, 2x 8-pin CPU, 4x PCIe', protection: 'OVP, UVP, OCP, SCP, OPP, OTP', warranty: '10 Years' }, extraSpecs: [], videoLinks: ['https://www.youtube.com/watch?v=corsair-rm850x-full-review', 'https://www.youtube.com/watch?v=corsair-rm850x-rtx4090-test'], description: 'CORSAIR RM850x ซีรี่ส์มอบพลังงานที่มีประสิทธิภาพระดับ 80 PLUS Gold แต่พีชีของคุณ พร้อมพัดลมเทคโนโลยี Magnetic Levitation ขนาด 135 มม. ทำงานเงียบเป็นพิเศษ แม้ในช่วงการทำงานที่โหลดไฟหนักหน่วงที่สุด\n\nไฮไลท์จุดเด่นผลิตภัณฑ์:\n• การออกแบบสายเคเบิลแบบ Full Modular เพื่อการจัดสายไฟที่ง่ายดายและสวยงามในเคสคอมพิวเตอร์ของคุณ\n• ติดตั้งพัดลมขนาด 135 มม. Magnetic Levitation (ML) Bearing เงียบและทนทานเป็นพิเศษ\n• คอนเดนเซอร์เกรดญี่ปุ่น ทนทานต่ออุณหภูมิ 105 องศาเซลเซียส มอบกระแสไฟสม่ำเสมอไร้กังวล\n• ผ่านการรับรองประสิทธิภาพการจ่ายไฟระดับ 80 PLUS Gold สูงถึง 90%\n• มั่นใจได้ด้วยระบบความปลอดภัยและรับประกันสินค้ายาวนานสูงสุด 10 ปีเต็ม', updatedAt: '28/08/2025' },
  { id: '2', displayCode: 'PSU-002', sku: 'PSU-ASUS-TUF1000P', name: 'ASUS TUF Gaming 1000W 80+ Platinum', brand: 'ASUS', sellingPrice: 11900, promoEnabled: false, promoPrice: 0, stock: 5, status: 'active', specs: { continuousPower: '1000 Watt', certification: '80+ Platinum', modularity: 'Full Modular', formFactor: 'ATX', fanSize: '135mm', connectors: '24-pin ATX, 2x 8-pin CPU, 6x PCIe', protection: 'OVP, UVP, OCP, SCP, OPP, OTP', warranty: '10 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '27/08/2025' },
  { id: '3', displayCode: 'PSU-003', sku: 'PSU-MSI-MAG650BN', name: 'MSI MAG A650BN 650W 80+ Bronze', brand: 'MSI', sellingPrice: 1990, promoEnabled: false, promoPrice: 0, stock: 2, status: 'active', specs: { continuousPower: '650 Watt', certification: '80+ Bronze', modularity: 'Non Modular', formFactor: 'ATX', fanSize: '120mm', connectors: '24-pin ATX, 1x 8-pin CPU, 2x PCIe', protection: 'OVP, OCP, SCP, OPP', warranty: '3 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '20/08/2025' },
  { id: '4', displayCode: 'PSU-004', sku: 'PSU-THERMALTAKE-GX2-750', name: 'THERMALTAKE Toughpower GX2 750W 80+ Gold', brand: 'THERMALTAKE', sellingPrice: 3890, promoEnabled: false, promoPrice: 0, stock: 12, status: 'active', specs: { continuousPower: '750 Watt', certification: '80+ Gold', modularity: 'Full Modular', formFactor: 'ATX', fanSize: '120mm', connectors: '24-pin ATX, 2x 8-pin CPU, 4x PCIe', protection: 'OVP, UVP, OCP, SCP, OPP, OTP', warranty: '5 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '19/08/2025' },
  { id: '5', displayCode: 'PSU-005', sku: 'PSU-FSP-HYDRO1000', name: 'FSP Hydro PTM Pro 1000W 80+ Gold', brand: 'FSP', sellingPrice: 5490, promoEnabled: false, promoPrice: 0, stock: 0, status: 'active', specs: { continuousPower: '1000 Watt', certification: '80+ Gold', modularity: 'Full Modular', formFactor: 'ATX', fanSize: '135mm', connectors: '24-pin ATX, 2x 8-pin CPU, 4x PCIe', protection: 'OVP, UVP, OCP, SCP, OPP, OTP', warranty: '10 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '15/08/2025' },
  { id: '6', displayCode: 'PSU-006', sku: 'PSU-COOLERMASTER-MWE600', name: 'COOLER MASTER MWE 600 Bronze V2', brand: 'COOLER MASTER', sellingPrice: 1750, promoEnabled: false, promoPrice: 0, stock: 24, status: 'active', specs: { continuousPower: '600 Watt', certification: '80+ Bronze', modularity: 'Non Modular', formFactor: 'ATX', fanSize: '120mm', connectors: '24-pin ATX, 1x 8-pin CPU, 2x PCIe', protection: 'OVP, OCP, SCP, OPP', warranty: '5 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '13/08/2025' },
  { id: '7', displayCode: 'PSU-007', sku: 'PSU-AEROCOOL-VX550', name: 'AEROCOOL VX PLUS 550W 80+ Bronze', brand: 'AEROCOOL', sellingPrice: 1390, promoEnabled: false, promoPrice: 0, stock: 15, status: 'active', specs: { continuousPower: '550 Watt', certification: '80+ Bronze', modularity: 'Non Modular', formFactor: 'ATX', fanSize: '120mm', connectors: '24-pin ATX, 1x 8-pin CPU, 2x PCIe', protection: 'OVP, OCP, SCP', warranty: '2 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '11/08/2025' },
  { id: '8', displayCode: 'PSU-008', sku: 'PSU-CORSAIR-HX1200', name: 'CORSAIR HX1200 1200W 80+ Platinum', brand: 'CORSAIR', sellingPrice: 8900, promoEnabled: false, promoPrice: 0, stock: 3, status: 'active', specs: { continuousPower: '1200 Watt', certification: '80+ Platinum', modularity: 'Full Modular', formFactor: 'ATX', fanSize: '135mm', connectors: '24-pin ATX, 2x 8-pin CPU, 8x PCIe', protection: 'OVP, UVP, OCP, SCP, OPP, OTP', warranty: '10 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '09/08/2025' },
]

export function getPsuSummary(): Promise<PsuSummary> {
  return mockDelay({ totalModels: 198, totalStock: 1245, lowStockCount: 5, outOfStockCount: 2 })
}

export function getPsus(): Promise<Psu[]> {
  return mockDelay(psus)
}

export function getPsuDetail(id: string): Promise<Psu | null> {
  return mockDelay(psus.find((item) => item.id === id) ?? null)
}

export function savePsu(
  _id: string,
  _data: PsuFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<void> {
  return mockDelay(undefined)
}

export function createPsu(
  _data: PsuFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<{ id: string }> {
  return mockDelay({ id: String(psus.length + 1) })
}

export function deletePsu(_id: string): Promise<void> {
  return mockDelay(undefined)
}
