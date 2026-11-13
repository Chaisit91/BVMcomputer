import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { FiBox, FiImage, FiShoppingCart } from 'react-icons/fi'
import { useAppSelector } from '../../store/hooks'
import type { AdminAccount, AdminRole } from '../../types/admin'
import type { ActionItem, AnnouncementBrief, CategoryStat, LowStockItem, MiniStat, RecentOrder } from '../../types/dashboard'
import type { Banner } from '../../types/banner'
import { ActionQueueList } from '../../components/dashboard/ActionQueueList'
import { AnnouncementFeed } from '../../components/dashboard/AnnouncementFeed'
import { LowStockList } from '../../components/dashboard/LowStockList'
import { CategoryCard } from '../../components/dashboard/CategoryCard'
import { MiniStatCard } from '../../components/dashboard/MiniStatCard'
import { RecentOrdersTable } from '../../components/dashboard/RecentOrdersTable'
import {
  computeCategories,
  computeInventoryActionItems,
  computeLatestAnnouncements,
  computeLowStock,
  computeRecentOrders,
  getMiniStats,
  loadAllCatalogItems,
} from '../../services/dashboard.service'
import { getAnnouncements } from '../../services/announcement.service'
import { getCustomBuilds } from '../../services/customBuild.service'
import { getComputerUpgrades, getMyUpgradeVerificationsToday } from '../../services/computerUpgrade.service'
import { getOrders } from '../../services/order.service'
import { getMyChatRepliesToday, getUnreadChatSummary } from '../../services/chat.service'
import { getBanners } from '../../services/banner.service'
import { getTeam } from '../../services/admin.service'

// Banners expiring within this many days still show "active" — this is the
// one thing on content_moderator's single table that's genuinely actionable
// (a banner nobody renews just quietly goes dark on its endDate).
const EXPIRING_SOON_DAYS = 7

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
}

type DepartmentRole = Exclude<AdminRole, 'super_admin'>

const DEPARTMENT_INFO: Record<DepartmentRole, { title: string; tagline: string; icon: ReactNode; color: string; duties: string[] }> = {
  inventory_manager: {
    title: 'ฝ่ายคลังสินค้า',
    tagline: 'ดูแลสินค้าทุกหมวดที่ร้านขาย ตั้งแต่ชิ้นส่วนคอมไปจนถึงคอมประกอบสำเร็จ',
    icon: <FiBox size={28} />,
    color: 'bg-blue-50 text-blue-600',
    duties: [
      'เพิ่ม/แก้ไข/ลบสินค้าทุกหมวด: ซีพียู, การ์ดจอ, เมนบอร์ด, แรม, สตอเรจ, พาวเวอร์ซัพพลาย, เคส, ชุดระบายความร้อน',
      'จัดการคอมตั้งโต๊ะสำเร็จรูป, โปรโมชั่นเซ็ต, จัดสเปคคอม, งานอัพเกรดคอม',
      'อัปเดตราคาและจำนวนสต็อกให้ตรงกับของจริง',
      'อัปโหลดรูปสินค้า',
    ],
  },
  sales_staff: {
    title: 'ฝ่ายคำสั่งซื้อและบริการลูกค้า',
    tagline: 'ดูแลคำสั่งซื้อของลูกค้าตั้งแต่สั่งจนถึงมือ พร้อมดูแลบัญชีลูกค้า',
    icon: <FiShoppingCart size={28} />,
    color: 'bg-emerald-50 text-emerald-600',
    duties: [
      'ดูและอัปเดตสถานะคำสั่งซื้อ (รอดำเนินการ → เตรียมสินค้า → จัดส่ง → สำเร็จ/ยกเลิก)',
      'ใส่เลขพัสดุ ตรวจสลิปโอนเงินที่ลูกค้าอัปโหลด',
      'ดูข้อมูลลูกค้าและประวัติการสั่งซื้อ',
      'ปรับสถานะบัญชีลูกค้า (active/inactive/suspended)',
    ],
  },
  content_moderator: {
    title: 'ฝ่ายเนื้อหาและโปรโมชั่น',
    tagline: 'ดูแลแบนเนอร์และโปรโมชั่นที่แสดงหน้าร้าน',
    icon: <FiImage size={28} />,
    color: 'bg-amber-50 text-amber-600',
    duties: [
      'เพิ่ม/แก้ไข/ลบแบนเนอร์หน้าร้าน',
      'กำหนดช่วงเวลาที่แบนเนอร์แต่ละอันแสดงผล',
      'เปิด/ปิดการแสดงแบนเนอร์ได้เอง',
    ],
  },
}

interface OverviewData {
  actionItems: ActionItem[]
  lowStock: LowStockItem[]
  categories: CategoryStat[]
  miniStats: MiniStat[]
  recentOrders: RecentOrder[]
  bannerSummary: { active: number; total: number } | null
  expiringBanners: Banner[]
  // What THIS admin personally did today — a shared-pool system (any
  // teammate can answer any chat/verify any upgrade, see chat.repository.ts)
  // has no "assigned to me" concept, so this is a personal count, not a
  // narrower/restricted view of the team's queue above.
  myToday: { label: string; count: number }[]
}

// Each role only ever calls the endpoints it's actually allowed to (see
// Backend-web/src/index.ts's requireRole wiring) — sales_staff can't reach
// catalog endpoints and content_moderator can't reach orders, so this is
// deliberately three separate small fetches rather than one shared loader.
const emptyOverview: Pick<OverviewData, 'actionItems' | 'lowStock' | 'categories' | 'miniStats' | 'recentOrders' | 'bannerSummary' | 'expiringBanners'> = {
  actionItems: [],
  lowStock: [],
  categories: [],
  miniStats: [],
  recentOrders: [],
  bannerSummary: null,
  expiringBanners: [],
}

async function loadOverviewData(role: DepartmentRole): Promise<OverviewData> {
  if (role === 'inventory_manager') {
    const [catalog, upgrades, builds, miniStats, myVerifications] = await Promise.all([
      loadAllCatalogItems(),
      getComputerUpgrades(),
      getCustomBuilds(),
      getMiniStats(),
      getMyUpgradeVerificationsToday(),
    ])
    return {
      ...emptyOverview,
      actionItems: computeInventoryActionItems(upgrades, builds),
      lowStock: computeLowStock(catalog),
      categories: computeCategories(catalog),
      miniStats,
      myToday: [{ label: 'ตรวจสอบรายการอัปเกรดไปแล้ว', count: myVerifications }],
    }
  }
  if (role === 'sales_staff') {
    const [orders, unread, myReplies] = await Promise.all([getOrders(), getUnreadChatSummary(), getMyChatRepliesToday()])
    const pendingToday = orders.filter((o) => o.orderStatus === 'pending').length
    return {
      ...emptyOverview,
      actionItems: [
        { id: 'chats', label: 'แชทลูกค้าที่ยังไม่ได้ตอบ', count: unread.total, href: '/manage/chats', tone: 'urgent' },
        { id: 'orders-pending', label: 'คำสั่งซื้อที่รอดำเนินการ', count: pendingToday, href: '/manage/orders', tone: 'normal' },
      ],
      recentOrders: computeRecentOrders(orders),
      myToday: [{ label: 'ตอบแชทลูกค้าไปแล้ว', count: myReplies }],
    }
  }
  const banners = await getBanners()
  return {
    ...emptyOverview,
    bannerSummary: { active: banners.filter((b) => b.status === 'active').length, total: banners.length },
    expiringBanners: banners.filter((b) => b.status === 'active' && daysUntil(b.endDate) <= EXPIRING_SOON_DAYS),
    myToday: [],
  }
}

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString()
}

export function DepartmentOverviewPage() {
  const currentUser = useAppSelector((state) => state.auth.user)
  const role = currentUser?.role as DepartmentRole | undefined
  const isTeamLead = Boolean(currentUser?.isTeamLead)

  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [announcements, setAnnouncements] = useState<AnnouncementBrief[]>([])
  const [postedToday, setPostedToday] = useState(0)
  const [team, setTeam] = useState<AdminAccount[] | null>(null)

  useEffect(() => {
    if (!role || !currentUser) return
    let cancelled = false

    Promise.all([
      loadOverviewData(role),
      getAnnouncements(),
      isTeamLead ? getTeam() : Promise.resolve(null),
    ]).then(([overviewData, allAnnouncements, teamList]) => {
      if (cancelled) return
      setOverview(overviewData)
      setAnnouncements(computeLatestAnnouncements(allAnnouncements))
      setPostedToday(allAnnouncements.filter((a) => a.authorId === currentUser.id && isToday(a.createdAt)).length)
      if (teamList) setTeam(teamList.filter((a) => a.id !== currentUser.id))
    })

    return () => {
      cancelled = true
    }
  }, [role, currentUser, isTeamLead])

  const myToday = [...(overview?.myToday ?? []), ...(isTeamLead ? [{ label: 'โพสต์ประกาศไปแล้ว', count: postedToday }] : [])]

  if (!role) return null
  const info = DEPARTMENT_INFO[role]

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <div className="flex items-center gap-4">
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${info.color}`}>{info.icon}</span>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{info.title}</h1>
          <p className="text-sm text-gray-400">{info.tagline}</p>
        </div>
      </div>

      {overview && overview.actionItems.length > 0 && (
        <div className="card p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">ต้องดำเนินการวันนี้</h2>
          <ActionQueueList items={overview.actionItems} />
        </div>
      )}

      {myToday.length > 0 && (
        <div className="card p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">สิ่งที่คุณทำไปแล้ววันนี้</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {myToday.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900">{stat.count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {overview && overview.categories.length > 0 && (
        <div className="card p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">ภาพรวมหมวดหมู่สินค้า</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {overview.categories.map((category) => (
              <CategoryCard key={category.id} {...category} />
            ))}
          </div>
          {overview.miniStats.length > 0 && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {overview.miniStats.map((mini) => (
                <MiniStatCard key={mini.id} {...mini} />
              ))}
            </div>
          )}
        </div>
      )}

      {overview && overview.lowStock.length > 0 && (
        <div className="card p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">สินค้าใกล้หมด / หมดสต็อก</h2>
          <LowStockList items={overview.lowStock} />
        </div>
      )}

      {overview && overview.recentOrders.length > 0 && (
        <div className="card p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">คำสั่งซื้อล่าสุด</h2>
          <RecentOrdersTable orders={overview.recentOrders} />
        </div>
      )}

      {overview && overview.expiringBanners.length > 0 && (
        <div className="card p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">แบนเนอร์ใกล้หมดอายุ (ภายใน {EXPIRING_SOON_DAYS} วัน)</h2>
          <ul className="divide-y divide-gray-50">
            {overview.expiringBanners.map((banner) => (
              <li key={banner.id} className="flex items-center justify-between py-3">
                <p className="text-sm font-medium text-gray-800">{banner.name}</p>
                <Link to="/manage/banners" className="text-xs font-medium text-rose-500 hover:text-rose-600">
                  หมดอายุ {banner.endDate}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {overview?.bannerSummary && (
        <div className="card flex items-center justify-between p-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">แบนเนอร์ที่กำลังแสดงอยู่</h2>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {overview.bannerSummary.active} <span className="text-sm font-normal text-gray-400">/ {overview.bannerSummary.total} รายการ</span>
            </p>
          </div>
          <Link to="/manage/banners" className="rounded-lg bg-rose-500 px-4 py-2 text-xs font-medium text-white hover:bg-rose-600">
            จัดการแบนเนอร์
          </Link>
        </div>
      )}

      {announcements.length > 0 && (
        <div className="card p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">ประกาศล่าสุด</h2>
          <AnnouncementFeed announcements={announcements} />
        </div>
      )}

      <div className="card p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-800">หน้าที่และความรับผิดชอบ</h2>
        <ul className="space-y-3">
          {info.duties.map((duty) => (
            <li key={duty} className="flex items-start gap-3 text-sm text-gray-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
              {duty}
            </li>
          ))}
        </ul>
      </div>

      {isTeamLead && (
        <div className="card p-6">
          <h2 className="mb-1 text-sm font-semibold text-gray-800">ทีมของคุณ</h2>
          <p className="mb-4 text-xs text-gray-400">
            แก้ไขข้อมูลทั่วไป (ชื่อ, เบอร์โทร, ตำแหน่งงาน, สถานะ) ของทุกคนในทีมนี้ได้ที่เมนู{' '}
            <span className="font-medium text-gray-600">ผู้ดูแลระบบ</span> — ยกเว้นอีเมล/รหัสผ่าน และบัญชีหัวหน้าทีมคนอื่น ซึ่งแก้ไขได้เฉพาะเจ้าของบัญชีหรือผู้ดูแลระบบสูงสุดเท่านั้น
          </p>
          {team && team.length > 0 ? (
            <ul className="divide-y divide-gray-50">
              {team.map((member) => (
                <li key={member.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {member.firstName} {member.lastName}
                      {member.isTeamLead && <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600">หัวหน้าทีม</span>}
                    </p>
                    <p className="text-xs text-gray-400">{member.jobTitle || '-'}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      member.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {member.status === 'active' ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm text-gray-400">ยังไม่มีเพื่อนร่วมทีมอื่นในแผนกนี้</p>
          )}
        </div>
      )}
    </main>
  )
}
