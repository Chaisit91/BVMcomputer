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
  FiRefreshCw,
  FiSliders,
  FiWind,
  FiZap,
  FiActivity,
} from 'react-icons/fi'

export interface InventoryMenuItem {
  id: string
  name: string
  description: string
  icon: ReactNode
  path?: string
}

// Exported so Sidebar.tsx (the department-role layout) can render the same
// list in its own vertical nav instead of keeping a second copy in sync.
export const inventoryMenuItems: InventoryMenuItem[] = [
  { id: 'ai-test', name: 'ทดสอบระบบ AI', description: 'ตรวจสถานะ ค้นหา และคำแนะนำจาก AI', icon: <FiActivity />, path: '/inventory/ai-test' },
  { id: 'build', name: 'จัดสเปคคอม', description: 'จัดสเปคอุปกรณ์ครบชุด', icon: <FiSliders />, path: '/inventory/custom-build' },
  { id: 'upgrade', name: 'อัพเกรดคอมพิวเตอร์', description: 'ตรวจสอบเครื่องเดิมและอัพเกรดของลูกค้า', icon: <FiRefreshCw />, path: '/inventory/computer-upgrade' },
  { id: 'promo', name: 'คอมพิวเตอร์เซ็ตโปรโมชั่น', description: 'โปรโมชั่นแบบคอมพร้อมใช้', icon: <FiGift />, path: '/inventory/promo-sets' },
  { id: 'desktop', name: 'คอมพิวเตอร์ตั้งโต๊ะ', description: 'จัดการสเปคคอมตั้งโต๊ะ', icon: <FiMonitor />, path: '/inventory/desktop-pc' },
  { id: 'cpu', name: 'ซีพียู', description: 'โปรเซสเซอร์ Intel และ AMD', icon: <FiCpu />, path: '/inventory/cpu' },
  { id: 'gpu', name: 'การ์ดจอ', description: 'การ์ดกราฟิกทุกรุ่น', icon: <FiImage />, path: '/inventory/gpu' },
  { id: 'motherboard', name: 'เมนบอร์ด', description: 'เมนบอร์ดทุกแพลตฟอร์ม', icon: <FiLayers />, path: '/inventory/motherboard' },
  { id: 'ram', name: 'แรม', description: 'แรม DDR4 และ DDR5', icon: <FiDatabase />, path: '/inventory/ram' },
  { id: 'storage', name: 'ฮาร์ดดิสก์ และ เอสเอสดี', description: 'อุปกรณ์จัดเก็บข้อมูล', icon: <FiHardDrive />, path: '/inventory/storage' },
  { id: 'psu', name: 'พาวเวอร์ซัพพลาย', description: 'พาวเวอร์ซัพพลายทุกวัตต์', icon: <FiZap />, path: '/inventory/psu' },
  { id: 'case', name: 'เคส', description: 'เคสคอมพิวเตอร์ทุกขนาด', icon: <FiBox />, path: '/inventory/case' },
  { id: 'cooling', name: 'ชุดระบายความร้อน', description: 'ระบบระบายความร้อน', icon: <FiWind />, path: '/inventory/cooling' },
]

// isOpen retriggers the stagger every time the dropdown opens, not just on
// first mount — the panel itself stays permanently mounted (see Topbar's
// dropdownPanelClass comment) so a plain "animate on mount" class would
// only ever play once, the first time the page loads.
export function InventoryMenu({ onNavigate, isOpen = true }: { onNavigate?: () => void; isOpen?: boolean }) {
  const location = useLocation()

  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-[#0d0e11] shadow-xl shadow-black/50">
      <p className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-gray-300">
        หมวดหมู่อุปกรณ์คอมพิวเตอร์
      </p>
      <ul className="max-h-96 overflow-y-auto py-1">
        {inventoryMenuItems.map((item, index) => {
          const isActive = item.path === location.pathname
          const rowClassName = `flex w-full items-center gap-3 px-4 py-2.5 text-left ${
            isActive ? 'bg-white/5' : 'hover:bg-white/5'
          }`
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
                <span
                  className={`block truncate text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}
                >
                  {item.name}
                </span>
                <span className={`block truncate text-xs ${isActive ? 'text-gray-400' : 'text-gray-500'}`}>
                  {item.description}
                </span>
              </span>
              <FiChevronRight className={`shrink-0 ${isActive ? 'text-rose-400' : 'text-gray-600'}`} />
            </>
          )

          return (
            <li
              key={item.id}
              className={isOpen ? 'animate-rise-in' : ''}
              style={isOpen ? { animationDelay: `${index * 20}ms` } : undefined}
            >
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
