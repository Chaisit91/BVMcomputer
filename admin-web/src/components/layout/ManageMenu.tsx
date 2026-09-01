import type { ReactNode } from 'react'
import { FiChevronRight, FiFileText, FiPercent, FiUsers } from 'react-icons/fi'
import { HiMegaphone } from 'react-icons/hi2'
import { Link, useLocation } from 'react-router-dom'
import { canAccess } from '../../lib/permissions'
import { useAppSelector } from '../../store/hooks'

interface ManageMenuItem {
  id: string
  name: string
  description: string
  icon: ReactNode
  path?: string
}

const items: ManageMenuItem[] = [
  { id: 'users', name: 'จัดการผู้ใช้งาน', description: 'ตรวจสอบข้อมูลและสถานะบัญชีลูกค้า', icon: <FiUsers />, path: '/manage/users' },
  { id: 'orders', name: 'จัดการคำสั่งซื้อ', description: 'ตรวจสอบและอัปเดตสถานะคำสั่งซื้อ', icon: <FiFileText />, path: '/manage/orders' },
  { id: 'banners', name: 'จัดการโฆษณาและแบนเนอร์', description: 'จัดการภาพประชาสัมพันธ์ที่แสดงบนหน้าบ้าน', icon: <HiMegaphone />, path: '/manage/banners' },
  { id: 'promotions', name: 'จัดการโปรโมชั่น', description: 'จัดการคูปองและส่วนลด', icon: <FiPercent /> },
]

export function ManageMenu({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()
  const role = useAppSelector((state) => state.auth.user?.role)
  const visibleItems = items.filter((item) => !item.path || canAccess(role, item.path))

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
      <p className="mb-3 text-sm font-semibold text-gray-800">เมนูจัดการระบบ</p>
      <div className="space-y-2">
        {visibleItems.map((item) => {
          const isActive = item.path === location.pathname
          const rowClassName = `flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
            isActive ? 'border-rose-200 bg-rose-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
          }`
          const rowContent = (
            <>
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  isActive ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-500'
                }`}
              >
                {item.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-sm font-medium ${isActive ? 'text-rose-600' : 'text-gray-800'}`}>
                  {item.name}
                </span>
                <span className={`block text-xs ${isActive ? 'text-rose-400' : 'text-gray-400'}`}>{item.description}</span>
              </span>
              <FiChevronRight className={`shrink-0 ${isActive ? 'text-rose-400' : 'text-gray-300'}`} />
            </>
          )

          return item.path ? (
            <Link key={item.id} to={item.path} onClick={onNavigate} className={rowClassName}>
              {rowContent}
            </Link>
          ) : (
            <button key={item.id} type="button" className={rowClassName}>
              {rowContent}
            </button>
          )
        })}
      </div>
    </div>
  )
}
