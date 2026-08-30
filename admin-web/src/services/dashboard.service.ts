import type {
  CategoryStat,
  DashboardData,
  LowStockItem,
  MiniStat,
  RecentOrder,
  SalesTrendPoint,
  StatCardData,
  TopProduct,
} from '../types/dashboard'

// ponytail: mock data stands in for the real endpoints until the backend ships;
// each function's return shape is the intended API contract — swap the body
// for an `api.get(...)` call later, callers don't change.
function mockDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export function getStats(): Promise<StatCardData[]> {
  return mockDelay([
    { id: 'products', label: 'สินค้าทั้งหมด', value: '3,847 รายการ', change: 2.4, changeLabel: 'จากเดือนที่แล้ว', icon: 'box' },
    { id: 'sales', label: 'ยอดขายวันนี้', value: '128,450', change: 12.8, changeLabel: 'จากเมื่อวาน', icon: 'wallet' },
    { id: 'orders', label: 'คำสั่งซื้อใหม่', value: '24 รายการ', change: 8.3, changeLabel: 'จากเมื่อวาน', icon: 'cart' },
    { id: 'lowstock', label: 'สินค้าใกล้หมด', value: '18 รายการ', change: -4.2, changeLabel: 'จากสัปดาห์ที่แล้ว', icon: 'alert' },
  ])
}

export function getCategories(): Promise<CategoryStat[]> {
  return mockDelay([
    { id: 'cpu', name: 'ซีพียู (CPU)', count: 245, percent: 96.4, icon: 'cpu' },
    { id: 'gpu', name: 'การ์ดจอ (GPU)', count: 561, percent: 89.2, icon: 'gpu' },
    { id: 'mb', name: 'เมนบอร์ด (Motherboard)', count: 288, percent: 91.5, icon: 'motherboard' },
    { id: 'ram', name: 'แรม (RAM)', count: 198, percent: 96.7, icon: 'ram' },
    { id: 'storage', name: 'ฮาร์ดดิสก์/เอสเอสดี', count: 312, percent: 93.4, icon: 'storage' },
    { id: 'psu', name: 'พาวเวอร์ซัพพลาย', count: 156, percent: 88.7, icon: 'psu' },
    { id: 'case', name: 'เคส (Case)', count: 178, percent: 92.9, icon: 'case' },
    { id: 'cooling', name: 'ชุดระบายความร้อน', count: 134, percent: 95.0, icon: 'cooling' },
  ])
}

export function getMiniStats(): Promise<MiniStat[]> {
  return mockDelay([
    { id: 'prebuilt', name: 'คอมพิวเตอร์ครบชุด', count: 45, unit: 'ชุด', icon: 'package' },
    { id: 'aipc', name: 'AI PC', count: 12, unit: 'เครื่อง', icon: 'cpu' },
  ])
}

export function getWeeklyTrend(): Promise<SalesTrendPoint[]> {
  return mockDelay([
    { label: 'ส', value: 62 },
    { label: 'อา', value: 58 },
    { label: 'จ', value: 70 },
    { label: 'อ', value: 88 },
    { label: 'พ', value: 95 },
    { label: 'พฤ', value: 80 },
    { label: 'ศ', value: 100 },
  ])
}

export function getRecentOrders(): Promise<RecentOrder[]> {
  return mockDelay([
    { id: '1', code: 'ORD-7729', customer: 'สมชาย ใจดี', item: 'Intel i5-13400F + RTX 4060 Set', total: 28900, status: 'success', date: '24 ต.ค. 14:20' },
    { id: '2', code: 'ORD-7728', customer: 'วิภาวรรณ สุขใจ', item: 'ASUS ROG B760-F Motherboard', total: 7890, status: 'shipping', date: '24 ต.ค. 13:45' },
    { id: '3', code: 'ORD-7727', customer: 'อนันต์ ธนพันธ์', item: 'RAM Kingston Fury 32GB', total: 4250, status: 'success', date: '24 ต.ค. 11:50' },
    { id: '4', code: 'ORD-7726', customer: 'เกริกไกร ชัยพงษ์', item: 'Crucial T500 SSD 2TB', total: 6400, status: 'pending', date: '24 ต.ค. 10:15' },
    { id: '5', code: 'ORD-7725', customer: 'พลอย แข่งขัน', item: 'GIGABYTE RTX 4070 Ti SUPER', total: 31900, status: 'success', date: '24 ต.ค. 09:00' },
  ])
}

export function getLowStock(): Promise<LowStockItem[]> {
  return mockDelay([
    { id: '1', name: 'ASUS PRIME H610M-E D4', remaining: 3, urgent: true },
    { id: '2', name: 'MSI MAG B760M MORTAR', remaining: 5, urgent: true },
    { id: '3', name: 'AMD Ryzen 5 7600X', remaining: 4, urgent: true },
    { id: '4', name: 'Kingston NV2 2TB NVMe', remaining: 6, urgent: false },
    { id: '5', name: 'Corsair RM750e 750W', remaining: 5, urgent: true },
  ])
}

export function getMonthlyTrend(): Promise<SalesTrendPoint[]> {
  return mockDelay([
    { label: 'ม.ค.', value: 55 },
    { label: 'ก.พ.', value: 48 },
    { label: 'มี.ค.', value: 60 },
    { label: 'เม.ย.', value: 52 },
    { label: 'พ.ค.', value: 70 },
    { label: 'มิ.ย.', value: 78 },
    { label: 'ก.ค.', value: 82 },
    { label: 'ส.ค.', value: 75 },
    { label: 'ก.ย.', value: 88 },
    { label: 'ต.ค.', value: 95 },
    { label: 'พ.ย.', value: 100 },
    { label: 'ธ.ค.', value: 90 },
  ])
}

export function getTopProducts(): Promise<TopProduct[]> {
  return mockDelay([
    { id: '1', rank: 1, name: 'NVIDIA GeForce RTX 4070 Ti SUPER', category: 'การ์ดจอ', sold: 48, revenue: 1296000, stockStatus: 'in_stock' },
    { id: '2', rank: 2, name: 'AMD Ryzen 7 7800X3D', category: 'ซีพียู', sold: 42, revenue: 546000, stockStatus: 'in_stock' },
    { id: '3', rank: 3, name: 'CORSAIR VENGEANCE DDR5 32GB', category: 'แรม', sold: 38, revenue: 190000, stockStatus: 'in_stock' },
    { id: '4', rank: 4, name: 'Samsung 990 PRO 2TB NVMe', category: 'HDD/SSD', sold: 35, revenue: 280000, stockStatus: 'low_stock' },
    { id: '5', rank: 5, name: 'CORSAIR iCUE H150i ROG ELITE', category: 'ชุดระบายความร้อน', sold: 30, revenue: 179700, stockStatus: 'in_stock' },
  ])
}

export async function getDashboardData(): Promise<DashboardData> {
  const [stats, categories, miniStats, weeklyTrend, recentOrders, lowStock, monthlyTrend, topProducts] =
    await Promise.all([
      getStats(),
      getCategories(),
      getMiniStats(),
      getWeeklyTrend(),
      getRecentOrders(),
      getLowStock(),
      getMonthlyTrend(),
      getTopProducts(),
    ])

  return { stats, categories, miniStats, weeklyTrend, recentOrders, lowStock, monthlyTrend, topProducts }
}
