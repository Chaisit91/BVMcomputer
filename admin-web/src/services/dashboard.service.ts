import { api } from '../lib/api'
import { getOrders } from './order.service'
import { getUnreadChatSummary } from './chat.service'
import { getAnnouncements } from './announcement.service'
import { getCustomBuilds } from './customBuild.service'
import { getComputerUpgrades } from './computerUpgrade.service'
import type {
  ActionItem,
  AnnouncementBrief,
  CategoryStat,
  DashboardData,
  LowStockItem,
  MiniStat,
  RecentOrder,
  SalesTrendPoint,
  StatCardData,
  TopProduct,
} from '../types/dashboard'
import type { Announcement } from '../types/announcement'
import type { CustomBuild } from '../types/customBuild'
import type { ComputerUpgrade } from '../types/computerUpgrade'
import type { ChatUnreadSummary } from '../types/chat'

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

type Orders = Awaited<ReturnType<typeof getOrders>>
type Catalog = { def: (typeof CATEGORY_DEFS)[number]; items: RawCatalogItem[] }[]

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

export async function loadAllCatalogItems(): Promise<Catalog> {
  const lists = await Promise.all(CATEGORY_DEFS.map((category) => fetchCategory(category.apiPath)))
  return CATEGORY_DEFS.map((def, index) => ({ def, items: lists[index] }))
}

// Every stat below reads from the SAME catalog/orders fetch (loaded once in
// getDashboardData) instead of each re-fetching all 8 category endpoints +
// the orders list independently — that redundancy was ~38 HTTP requests per
// dashboard load instead of 9, which is what was making it feel slow.

function computeStats(catalog: Catalog, orders: Orders): StatCardData[] {
  const totalProducts = catalog.reduce((sum, c) => sum + c.items.length, 0)
  const lowStockCount = catalog.reduce((sum, c) => sum + c.items.filter((i) => isLowStock(i.status)).length, 0)

  const todayStr = new Date().toDateString()
  const todaysOrders = orders.filter((o) => new Date(o.orderedAt).toDateString() === todayStr)
  const todaysSales = todaysOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, item) => s + item.quantity * item.unitPrice, 0),
    0,
  )

  return [
    { id: 'products', label: 'สินค้าทั้งหมด', value: `${totalProducts.toLocaleString()} รายการ`, icon: 'box' },
    { id: 'sales', label: 'ยอดขายวันนี้', value: todaysSales.toLocaleString(), icon: 'wallet' },
    { id: 'orders', label: 'คำสั่งซื้อวันนี้', value: `${todaysOrders.length} รายการ`, icon: 'cart' },
    { id: 'lowstock', label: 'สินค้าใกล้หมด', value: `${lowStockCount} รายการ`, icon: 'alert' },
  ]
}

export function computeCategories(catalog: Catalog): CategoryStat[] {
  return catalog.map(({ def, items }) => ({
    id: def.id,
    name: def.name,
    count: items.length,
    // Share of this category's stock that's healthy (not low/out of stock).
    percent: items.length === 0 ? 100 : Math.round((items.filter((i) => !isLowStock(i.status)).length / items.length) * 1000) / 10,
    icon: def.icon,
  }))
}

export async function getMiniStats(): Promise<MiniStat[]> {
  const desktopPcs = await api.get<{ category: string }[]>('/desktop-pcs').then((res) => res.data)
  return [{ id: 'prebuilt', name: 'คอมพิวเตอร์ครบชุด', count: desktopPcs.length, unit: 'ชุด', icon: 'package' }]
}

// "Needs action today" — distinct from the read-only stats above: unread
// customer chats, computer-upgrade items nobody has verified yet, and new
// custom-build requests nobody has picked up. Each count === 0 just drops
// out of the rendered list (see ActionQueueList).
export function computeInventoryActionItems(upgrades: ComputerUpgrade[], builds: CustomBuild[]): ActionItem[] {
  const pendingVerifications = upgrades.reduce(
    (sum, u) => sum + u.items.filter((item) => !item.verifiedByAdmin).length,
    0,
  )
  const newBuilds = builds.filter((b) => b.status === 'pending').length

  return [
    { id: 'upgrade-verify', label: 'รายการอัปเกรดที่ยังไม่ตรวจสอบ', count: pendingVerifications, href: '/inventory/computer-upgrade', tone: 'normal' },
    { id: 'new-builds', label: 'คำขอสั่งประกอบคอมใหม่', count: newBuilds, href: '/inventory/custom-build', tone: 'normal' },
  ]
}

export function computeActionItems(unread: ChatUnreadSummary, upgrades: ComputerUpgrade[], builds: CustomBuild[]): ActionItem[] {
  return [
    { id: 'chats', label: 'แชทลูกค้าที่ยังไม่ได้ตอบ', count: unread.total, href: '/manage/chats', tone: 'urgent' },
    ...computeInventoryActionItems(upgrades, builds),
  ]
}

export function computeLatestAnnouncements(announcements: Announcement[]): AnnouncementBrief[] {
  return [...announcements]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
    .map((a) => ({ id: a.id, authorName: a.authorName, content: a.content, department: a.department, createdAt: a.createdAt }))
}

const THAI_WEEKDAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

function orderTotal(order: Orders[number]) {
  return order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
}

function computeWeeklyTrend(orders: Orders): SalesTrendPoint[] {
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

function computeMonthlyTrend(orders: Orders): SalesTrendPoint[] {
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

export function computeRecentOrders(orders: Orders): RecentOrder[] {
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

export function computeLowStock(catalog: Catalog): LowStockItem[] {
  return catalog
    .flatMap((c) => c.items)
    .filter((item) => isLowStock(item.status))
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 10)
    .map((item) => ({ id: item.id, name: item.name, remaining: item.stock, urgent: item.stock <= 3 }))
}

function computeTopProducts(catalog: Catalog, orders: Orders): TopProduct[] {
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
  const [catalog, orders, miniStats, unreadChats, upgrades, builds, announcements] = await Promise.all([
    loadAllCatalogItems(),
    getOrders(),
    getMiniStats(),
    getUnreadChatSummary(),
    getComputerUpgrades(),
    getCustomBuilds(),
    getAnnouncements(),
  ])

  return {
    stats: computeStats(catalog, orders),
    categories: computeCategories(catalog),
    miniStats,
    actionItems: computeActionItems(unreadChats, upgrades, builds),
    latestAnnouncements: computeLatestAnnouncements(announcements),
    weeklyTrend: computeWeeklyTrend(orders),
    recentOrders: computeRecentOrders(orders),
    lowStock: computeLowStock(catalog),
    monthlyTrend: computeMonthlyTrend(orders),
    topProducts: computeTopProducts(catalog, orders),
  }
}
