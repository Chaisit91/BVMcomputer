import { api } from '../lib/api'
import { getOrders } from './order.service'
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

// ponytail: aggregated client-side from the existing list endpoints instead of
// building dedicated backend analytics routes — this app has no historical
// stats table, so period-over-period `change` numbers have no real baseline
// and are reported as 0 rather than fabricated. Fetching every order/product
// list on every dashboard load doesn't scale past a small catalog/order
// volume; upgrade to real backend aggregation (and a stats-snapshot table for
// genuine trend/change numbers) if that becomes the bottleneck.

interface RawCatalogItem {
  id: string
  name: string
  stock: number
  status: string
}

const CATEGORY_DEFS: { id: string; apiPath: string; name: string; icon: CategoryStat['icon'] }[] = [
  { id: 'cpu', apiPath: 'cpus', name: 'ซีพียู (CPU)', icon: 'cpu' },
  { id: 'gpu', apiPath: 'gpus', name: 'การ์ดจอ (GPU)', icon: 'gpu' },
  { id: 'mb', apiPath: 'motherboards', name: 'เมนบอร์ด (Motherboard)', icon: 'motherboard' },
  { id: 'ram', apiPath: 'rams', name: 'แรม (RAM)', icon: 'ram' },
  { id: 'storage', apiPath: 'storages', name: 'ฮาร์ดดิสก์/เอสเอสดี', icon: 'storage' },
  { id: 'psu', apiPath: 'psus', name: 'พาวเวอร์ซัพพลาย', icon: 'psu' },
  { id: 'case', apiPath: 'cases', name: 'เคส (Case)', icon: 'case' },
  { id: 'cooling', apiPath: 'coolings', name: 'ชุดระบายความร้อน', icon: 'cooling' },
]

function fetchCategory(apiPath: string): Promise<RawCatalogItem[]> {
  return api.get<RawCatalogItem[]>(`/${apiPath}`).then((res) => res.data)
}

function isLowStock(status: string) {
  return status === 'low_stock' || status === 'out_of_stock'
}

async function loadAllCatalogItems() {
  const lists = await Promise.all(CATEGORY_DEFS.map((c) => fetchCategory(c.apiPath)))
  return CATEGORY_DEFS.map((def, i) => ({ def, items: lists[i] }))
}

export async function getStats(): Promise<StatCardData[]> {
  const [catalog, orders] = await Promise.all([loadAllCatalogItems(), getOrders()])
  const totalProducts = catalog.reduce((sum, c) => sum + c.items.length, 0)
  const lowStockCount = catalog.reduce((sum, c) => sum + c.items.filter((i) => isLowStock(i.status)).length, 0)

  const todayStr = new Date().toDateString()
  const todaysOrders = orders.filter((o) => new Date(o.orderedAt).toDateString() === todayStr)
  const todaysSales = todaysOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, item) => s + item.quantity * item.unitPrice, 0),
    0,
  )

  return [
    { id: 'products', label: 'สินค้าทั้งหมด', value: `${totalProducts.toLocaleString()} รายการ`, change: 0, changeLabel: 'ไม่มีข้อมูลเปรียบเทียบ', icon: 'box' },
    { id: 'sales', label: 'ยอดขายวันนี้', value: todaysSales.toLocaleString(), change: 0, changeLabel: 'ไม่มีข้อมูลเปรียบเทียบ', icon: 'wallet' },
    { id: 'orders', label: 'คำสั่งซื้อวันนี้', value: `${todaysOrders.length} รายการ`, change: 0, changeLabel: 'ไม่มีข้อมูลเปรียบเทียบ', icon: 'cart' },
    { id: 'lowstock', label: 'สินค้าใกล้หมด', value: `${lowStockCount} รายการ`, change: 0, changeLabel: 'ไม่มีข้อมูลเปรียบเทียบ', icon: 'alert' },
  ]
}

export async function getCategories(): Promise<CategoryStat[]> {
  const catalog = await loadAllCatalogItems()
  return catalog.map(({ def, items }) => ({
    id: def.id,
    name: def.name,
    count: items.length,
    // Share of this category's stock that's healthy (not low/out of stock) —
    // the mock's "percent" had no defined meaning, this one is real.
    percent: items.length === 0 ? 100 : Math.round((items.filter((i) => !isLowStock(i.status)).length / items.length) * 1000) / 10,
    icon: def.icon,
  }))
}

export async function getMiniStats(): Promise<MiniStat[]> {
  const desktopPcs = await api.get<{ category: string }[]>('/desktop-pcs').then((res) => res.data)
  const aiCount = desktopPcs.filter((d) => d.category === 'ai_workstation' || d.category === 'ai_enterprise').length
  return [
    { id: 'prebuilt', name: 'คอมพิวเตอร์ครบชุด', count: desktopPcs.length, unit: 'ชุด', icon: 'package' },
    { id: 'aipc', name: 'AI PC', count: aiCount, unit: 'เครื่อง', icon: 'cpu' },
  ]
}

const THAI_WEEKDAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

function orderTotal(order: Awaited<ReturnType<typeof getOrders>>[number]) {
  return order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
}

export async function getWeeklyTrend(): Promise<SalesTrendPoint[]> {
  const orders = await getOrders()
  const now = new Date()
  const days: SalesTrendPoint[] = []
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now)
    day.setDate(now.getDate() - i)
    const dayStr = day.toDateString()
    const value = orders.filter((o) => new Date(o.orderedAt).toDateString() === dayStr).reduce((sum, o) => sum + orderTotal(o), 0)
    days.push({ label: THAI_WEEKDAYS[day.getDay()], value })
  }
  return days
}

export async function getMonthlyTrend(): Promise<SalesTrendPoint[]> {
  const orders = await getOrders()
  const now = new Date()
  const months: SalesTrendPoint[] = []
  for (let i = 11; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = orders
      .filter((o) => {
        const d = new Date(o.orderedAt)
        return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth()
      })
      .reduce((sum, o) => sum + orderTotal(o), 0)
    months.push({ label: THAI_MONTHS[month.getMonth()], value })
  }
  return months
}

export async function getRecentOrders(): Promise<RecentOrder[]> {
  const orders = await getOrders()
  return [...orders]
    .sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime())
    .slice(0, 5)
    .map((o) => ({
      id: o.id,
      code: o.orderCode,
      customer: o.customerName,
      item: o.items[0] ? o.items[0].name + (o.items.length > 1 ? ` และอีก ${o.items.length - 1} รายการ` : '') : '-',
      total: orderTotal(o),
      status: o.orderStatus === 'completed' ? 'success' : o.orderStatus === 'shipping' ? 'shipping' : 'pending',
      date: new Date(o.orderedAt).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    }))
}

export async function getLowStock(): Promise<LowStockItem[]> {
  const catalog = await loadAllCatalogItems()
  const all = catalog.flatMap((c) => c.items)
  return all
    .filter((item) => isLowStock(item.status))
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 10)
    .map((item) => ({ id: item.id, name: item.name, remaining: item.stock, urgent: item.stock <= 3 }))
}

export async function getTopProducts(): Promise<TopProduct[]> {
  const [orders, catalog] = await Promise.all([getOrders(), loadAllCatalogItems()])
  const stockByName = new Map(catalog.flatMap((c) => c.items).map((item) => [item.name, item.status]))

  const totals = new Map<string, { name: string; category: string; sold: number; revenue: number }>()
  for (const order of orders) {
    for (const item of order.items) {
      const key = `${item.name}::${item.category}`
      const current = totals.get(key) ?? { name: item.name, category: item.category, sold: 0, revenue: 0 }
      current.sold += item.quantity
      current.revenue += item.quantity * item.unitPrice
      totals.set(key, current)
    }
  }

  return [...totals.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((entry, index) => ({
      id: String(index + 1),
      rank: index + 1,
      name: entry.name,
      category: entry.category,
      sold: entry.sold,
      revenue: entry.revenue,
      stockStatus: isLowStock(stockByName.get(entry.name) ?? 'active') ? 'low_stock' : 'in_stock',
    }))
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
