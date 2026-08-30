import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FiBox,
  FiChevronRight,
  FiCpu,
  FiDatabase,
  FiGift,
  FiHardDrive,
  FiImage,
  FiLayers,
  FiMonitor,
  FiSliders,
  FiWind,
  FiZap,
} from 'react-icons/fi'

interface InventoryMenuItem {
  id: string
  name: string
  description: string
  icon: ReactNode
  path?: string
}

const items: InventoryMenuItem[] = [
  { id: 'build', name: 'จัดสเปคคอม', description: 'จัดสเปคอุปกรณ์ครบชุด', icon: <FiSliders />, path: '/inventory/custom-build' },
  { id: 'promo', name: 'คอมพิวเตอร์เซ็ตโปรโมชั่น', description: 'โปรโมชั่นแบบคอมพร้อมใช้', icon: <FiGift />, path: '/inventory/promo-sets' },
  { id: 'desktop', name: 'คอมพิวเตอร์ตั้งโต๊ะ', description: 'จัดการสเปคคอมตั้งโต๊ะ', icon: <FiMonitor />, path: '/inventory/desktop-pc' },
  { id: 'cpu', name: 'ซีพียู', description: 'โปรเซสเซอร์ Intel และ AMD', icon: <FiCpu />, path: '/inventory/cpu' },
  { id: 'gpu', name: 'การ์ดจอ', description: 'การ์ดกราฟิกทุกรุ่น', icon: <FiImage />, path: '/inventory/gpu' },
  { id: 'motherboard', name: 'เมนบอร์ด', description: 'เมนบอร์ดทุกแพลตฟอร์ม', icon: <FiLayers />, path: '/inventory/motherboard' },
  { id: 'ram', name: 'แรม', description: 'แรม DDR4 และ DDR5', icon: <FiDatabase /> },
  { id: 'storage', name: 'ฮาร์ดดิสก์ และ เอสเอสดี', description: 'อุปกรณ์จัดเก็บข้อมูล', icon: <FiHardDrive /> },
  { id: 'psu', name: 'พาวเวอร์ซัพพลาย', description: 'พาวเวอร์ซัพพลายทุกวัตต์', icon: <FiZap /> },
  { id: 'case', name: 'เคส', description: 'เคสคอมพิวเตอร์ทุกขนาด', icon: <FiBox /> },
  { id: 'cooling', name: 'ชุดระบายความร้อน', description: 'ระบบระบายความร้อน', icon: <FiWind /> },
]

export function InventoryMenu({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
      <p className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-800">
        หมวดหมู่อุปกรณ์คอมพิวเตอร์
      </p>
      <ul className="max-h-96 overflow-y-auto py-1">
        {items.map((item) => {
          const isActive = item.path === location.pathname
          const rowClassName = `flex w-full items-center gap-3 px-4 py-2.5 text-left ${
            isActive ? 'bg-rose-50' : 'hover:bg-gray-50'
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
                <span
                  className={`block truncate text-sm font-medium ${isActive ? 'text-rose-600' : 'text-gray-800'}`}
                >
                  {item.name}
                </span>
                <span className={`block truncate text-xs ${isActive ? 'text-rose-400' : 'text-gray-400'}`}>
                  {item.description}
                </span>
              </span>
              <FiChevronRight className={`shrink-0 ${isActive ? 'text-rose-400' : 'text-gray-300'}`} />
            </>
          )

          return (
            <li key={item.id}>
              {item.path ? (
                <Link to={item.path} onClick={onNavigate} className={rowClassName}>
                  {rowContent}
                </Link>
              ) : (
                <button type="button" className={rowClassName}>
                  {rowContent}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
