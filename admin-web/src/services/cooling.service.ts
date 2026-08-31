import type { CoolingFormValues } from '../schemas/cooling.schema'
import type { Cooling, CoolingSummary, ExtraSpec } from '../types/cooling'

// ponytail: mock data stands in for the real endpoints until the backend ships;
// swap the body for an `api.get(...)` call later, callers don't change.
function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const coolers: Cooling[] = [
  { id: '1', displayCode: 'CL-001', sku: 'CL-CORSAIR-H150i', name: 'CORSAIR iCUE H150i RGB ELITE 360mm', brand: 'CORSAIR', sellingPrice: 8990, promoEnabled: true, promoPrice: 8490, stock: 12, status: 'active', specs: { coolingType: 'AIO Liquid 360mm', socketSupport: 'LGA 1700, AM5, AM4', radiatorSize: '360mm', fanSize: '120mm x3', fanSpeed: '2100 RPM', noiseLevel: '36 dBA', tdpRating: '250W TDP', rgb: 'Yes (iCUE Compatible)', warranty: '5 Years' }, extraSpecs: [], videoLinks: ['https://www.youtube.com/watch?v=h150i-elite-full-review', 'https://www.youtube.com/watch?v=h150i-intel-i9-temp-test'], description: 'CORSAIR iCUE H150i RGB ELITE 360mm มอบการระบายความร้อนที่มีประสิทธิภาพสูงแก่หน่วยประมวลผลรุ่นใหม่ล่าสุด พร้อมพัดลมขนาด 120 มม. AF ELITE Series จ่ายลมแรงต่อเนื่องแต่เงียบสงบ\n\nไฮไลท์จุดเด่นผลิตภัณฑ์:\n• แผ่นระบายความร้อนทองแดงประสิทธิภาพสูง สัมผัสแน่นและกระจายความร้อนได้อย่างยอดเยี่ยม\n• พัดลม AF120 ELITE เทคโนโลยีตลับลูกปืน Fluid Dynamic Bearing (FDB) ทนทาน ไร้เสียงรบกวน\n• การควบคุมไฟ RGB บนปั๊มน้ำอย่างไร้รอยต่อผ่านทางระบบซอฟต์แวร์ CORSAIR iCUE\n• มาพร้อมหม้อน้ำขนาดใหญ่ 360 มม. เพิ่มพื้นที่ผิวเพื่อประสิทธิภาพการระบายความร้อนขั้นสูงสุด\n• สินค้ารับประกันคุณภาพและบริการหลังการขายยาวนานสูงสุด 5 ปีเต็ม', updatedAt: '28/08/2025' },
  { id: '2', displayCode: 'CL-002', sku: 'CL-COOLERMASTER-H212', name: 'COOLER MASTER Hyper 212 Halo Black', brand: 'COOLER MASTER', sellingPrice: 1190, promoEnabled: false, promoPrice: 0, stock: 45, status: 'active', specs: { coolingType: 'Air Cooler', socketSupport: 'LGA 1700, AM5', radiatorSize: '-', fanSize: '120mm', fanSpeed: '1800 RPM', noiseLevel: '27 dBA', tdpRating: '150W TDP', rgb: 'Yes (ARGB)', warranty: '2 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '27/08/2025' },
  { id: '3', displayCode: 'CL-003', sku: 'CL-DEEPCOOL-LT720', name: 'DEEPCOOL LT720 White 360mm', brand: 'DEEPCOOL', sellingPrice: 4290, promoEnabled: false, promoPrice: 0, stock: 8, status: 'active', specs: { coolingType: 'AIO Liquid 360mm', socketSupport: 'LGA 1700, AM5', radiatorSize: '360mm', fanSize: '120mm x3', fanSpeed: '2500 RPM', noiseLevel: '30.5 dBA', tdpRating: '300W TDP', rgb: 'Yes (ARGB)', warranty: '5 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '20/08/2025' },
  { id: '4', displayCode: 'CL-004', sku: 'CL-THERMALRIGHT-PA120SE', name: 'THERMALRIGHT Peerless Assassin 120 SE', brand: 'THERMALRIGHT', sellingPrice: 1390, promoEnabled: false, promoPrice: 0, stock: 2, status: 'active', specs: { coolingType: 'Air Cooler', socketSupport: 'LGA 1700, AM5', radiatorSize: '-', fanSize: '120mm x2', fanSpeed: '1550 RPM', noiseLevel: '25.6 dBA', tdpRating: '220W TDP', rgb: 'ไม่มี', warranty: '3 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '19/08/2025' },
  { id: '5', displayCode: 'CL-005', sku: 'CL-LIANLI-GALAHAD2LCD', name: 'LIAN LI Galahad II LCD 360mm', brand: 'LIAN LI', sellingPrice: 5990, promoEnabled: false, promoPrice: 0, stock: 15, status: 'active', specs: { coolingType: 'AIO Liquid 360mm', socketSupport: 'LGA 1700, AM5', radiatorSize: '360mm', fanSize: '120mm x3', fanSpeed: '2100 RPM', noiseLevel: '28 dBA', tdpRating: '320W TDP', rgb: 'Yes (LCD Display)', warranty: '6 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '15/08/2025' },
  { id: '6', displayCode: 'CL-006', sku: 'CL-NOCTUA-NHD15CHROMAX', name: 'NOCTUA NH-D15 chromax.black', brand: 'NOCTUA', sellingPrice: 3990, promoEnabled: false, promoPrice: 0, stock: 5, status: 'active', specs: { coolingType: 'Air Cooler', socketSupport: 'LGA 1700, AM5', radiatorSize: '-', fanSize: '140mm x2', fanSpeed: '1500 RPM', noiseLevel: '24.6 dBA', tdpRating: '220W TDP', rgb: 'ไม่มี', warranty: '6 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '13/08/2025' },
  { id: '7', displayCode: 'CL-007', sku: 'CL-IDCOOLING-SE207XT', name: 'ID-COOLING SE-207-XT Slim', brand: 'ID-COOLING', sellingPrice: 1290, promoEnabled: false, promoPrice: 0, stock: 0, status: 'active', specs: { coolingType: 'Air Cooler', socketSupport: 'LGA 1700, AM5', radiatorSize: '-', fanSize: '120mm', fanSpeed: '1500 RPM', noiseLevel: '25.6 dBA', tdpRating: '200W TDP', rgb: 'ไม่มี', warranty: '2 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '11/08/2025' },
  { id: '8', displayCode: 'CL-008', sku: 'CL-ASUS-ROGRYUJIN3', name: 'ASUS ROG Ryujin III 360mm', brand: 'ASUS', sellingPrice: 12900, promoEnabled: false, promoPrice: 0, stock: 6, status: 'active', specs: { coolingType: 'AIO Liquid 360mm', socketSupport: 'LGA 1700, AM5', radiatorSize: '360mm', fanSize: '120mm x3', fanSpeed: '2500 RPM', noiseLevel: '37 dBA', tdpRating: '350W TDP', rgb: 'Yes (LiveDash OLED)', warranty: '6 Years' }, extraSpecs: [], videoLinks: [], description: '', updatedAt: '09/08/2025' },
]

export function getCoolingSummary(): Promise<CoolingSummary> {
  return mockDelay({ totalModels: 196, activeRatePercent: 98, lowStockCount: 8, outOfStockCount: 1 })
}

export function getCoolers(): Promise<Cooling[]> {
  return mockDelay(coolers)
}

export function getCoolingDetail(id: string): Promise<Cooling | null> {
  return mockDelay(coolers.find((item) => item.id === id) ?? null)
}

export function saveCooling(
  _id: string,
  _data: CoolingFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<void> {
  return mockDelay(undefined)
}

export function createCooling(
  _data: CoolingFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<{ id: string }> {
  return mockDelay({ id: String(coolers.length + 1) })
}

export function deleteCooling(_id: string): Promise<void> {
  return mockDelay(undefined)
}
