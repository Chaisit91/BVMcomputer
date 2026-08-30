import type { ReactNode } from 'react'
import { FiChevronRight, FiFileText, FiPercent, FiShield, FiUsers } from 'react-icons/fi'
import { HiMegaphone } from 'react-icons/hi2'

interface ManageMenuItem {
  id: string
  name: string
  description: string
  icon: ReactNode
}

const items: ManageMenuItem[] = [
  { id: 'users', name: 'จัดการผู้ใช้งาน', description: 'ตรวจสอบข้อมูลและสถานะบัญชีลูกค้า', icon: <FiUsers /> },
  { id: 'orders', name: 'จัดการคำสั่งซื้อ', description: 'ตรวจสอบและอัปเดตสถานะคำสั่งซื้อ', icon: <FiFileText /> },
  { id: 'banners', name: 'จัดการโฆษณาและแบนเนอร์', description: 'จัดการภาพประชาสัมพันธ์ที่แสดงบนหน้าบ้าน', icon: <HiMegaphone /> },
  { id: 'admins', name: 'จัดการผู้ดูแล', description: 'จัดการบัญชีของผู้ดูแลระบบ', icon: <FiShield /> },
  { id: 'promotions', name: 'จัดการโปรโมชั่น', description: 'จัดการคูปองและส่วนลด', icon: <FiPercent /> },
]

export function ManageMenu() {
  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
      <p className="mb-3 text-sm font-semibold text-gray-800">เมนูจัดการระบบ</p>
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="flex w-full items-center gap-3 rounded-xl border border-gray-100 p-3 text-left transition hover:border-gray-200 hover:bg-gray-50"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
              {item.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-gray-800">{item.name}</span>
              <span className="block text-xs text-gray-400">{item.description}</span>
            </span>
            <FiChevronRight className="shrink-0 text-gray-300" />
          </button>
        ))}
      </div>
    </div>
  )
}
