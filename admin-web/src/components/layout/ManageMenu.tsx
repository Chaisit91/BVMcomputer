import type { ReactNode } from 'react'
import { FiChevronRight, FiFileText, FiMessageCircle, FiPercent, FiUsers } from 'react-icons/fi'
import { HiMegaphone } from 'react-icons/hi2'
import { Link, useLocation } from 'react-router-dom'
import { canAccess } from '../../lib/permissions'
import { useAppSelector } from '../../store/hooks'

export interface ManageMenuItem {
  id: string
  name: string
  description: string
  icon: ReactNode
  path?: string
}

// Exported so Sidebar.tsx (the department-role layout) can render the same
// list in its own vertical nav instead of keeping a second copy in sync.
export const manageMenuItems: ManageMenuItem[] = [
  { id: 'users', name: 'จัดการผู้ใช้งาน', description: 'ตรวจสอบข้อมูลและสถานะบัญชีลูกค้า', icon: <FiUsers />, path: '/manage/users' },
  { id: 'orders', name: 'จัดการคำสั่งซื้อ', description: 'ตรวจสอบและอัปเดตสถานะคำสั่งซื้อ', icon: <FiFileText />, path: '/manage/orders' },
  { id: 'chats', name: 'แชทลูกค้า', description: 'ตอบแชทและข้อความสอบถามจากลูกค้าทุกช่องทางในระบบ', icon: <FiMessageCircle />, path: '/manage/chats' },
  { id: 'banners', name: 'จัดการโฆษณาและแบนเนอร์', description: 'จัดการภาพประชาสัมพันธ์ที่แสดงบนหน้าบ้าน', icon: <HiMegaphone />, path: '/manage/banners' },
  { id: 'promotions', name: 'จัดการโปรโมชั่น', description: 'จัดการคูปองและส่วนลด', icon: <FiPercent /> },
]

// isOpen retriggers the stagger every time the dropdown opens, not just on
// first mount — the panel itself stays permanently mounted (see Topbar's
// dropdownPanelClass comment) so a plain "animate on mount" class would
// only ever play once, the first time the page loads.
export function ManageMenu({ onNavigate, isOpen = true }: { onNavigate?: () => void; isOpen?: boolean }) {
  const location = useLocation()
  const role = useAppSelector((state) => state.auth.user?.role)
  const visibleItems = manageMenuItems.filter((item) => !item.path || canAccess(role, item.path))

  return (
    <div className="w-full rounded-xl border border-white/10 bg-[#0d0e11] p-4 shadow-xl shadow-black/50">
      <p className="mb-3 text-sm font-semibold text-gray-300">เมนูจัดการระบบ</p>
      <div className="space-y-2">
        {visibleItems.map((item, index) => {
          const isActive = item.path === location.pathname
          const rowClassName = `flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
            isActive ? 'border-rose-500/30 bg-white/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
          } ${isOpen ? 'animate-rise-in' : ''}`
          const rowStyle = isOpen ? { animationDelay: `${index * 25}ms` } : undefined
          const rowContent = (
            <>
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  isActive ? 'bg-rose-500 text-white' : 'bg-white/5 text-gray-400'
                }`}
              >
                {item.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                  {item.name}
                </span>
                <span className={`block text-xs ${isActive ? 'text-gray-400' : 'text-gray-500'}`}>{item.description}</span>
              </span>
              <FiChevronRight className={`shrink-0 ${isActive ? 'text-rose-400' : 'text-gray-600'}`} />
            </>
          )

          return item.path ? (
            <Link key={item.id} to={item.path} onClick={onNavigate} className={rowClassName} style={rowStyle}>
              {rowContent}
            </Link>
          ) : (
            <button key={item.id} type="button" className={rowClassName} style={rowStyle}>
              {rowContent}
            </button>
          )
        })}
      </div>
    </div>
  )
}
