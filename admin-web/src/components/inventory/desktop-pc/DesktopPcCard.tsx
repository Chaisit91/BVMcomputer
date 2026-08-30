import { FiMonitor } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import type { DesktopPc, DesktopPcCategory, DesktopPcStatus } from '../../../types/desktopPc'

const categoryMap: Record<DesktopPcCategory, { label: string; variant: 'success' | 'info' | 'danger' | 'warning' | 'neutral' }> = {
  desktop: { label: 'เดสก์ท็อป พีซี', variant: 'success' },
  mini_pc: { label: 'มินิพีซี', variant: 'neutral' },
  all_in_one: { label: 'ออลอินวัน', variant: 'info' },
  ai_workstation: { label: 'คอมพิวเตอร์ AI', variant: 'danger' },
  ai_enterprise: { label: 'คอมพิวเตอร์ AI สำหรับองค์กร', variant: 'warning' },
}

const statusMap: Record<DesktopPcStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  selling: { label: 'กำลังขาย', variant: 'success' },
  low_stock: { label: 'สต็อกน้อย', variant: 'warning' },
  out_of_stock: { label: 'หมดสต็อก', variant: 'danger' },
  discontinued: { label: 'เลิกขาย', variant: 'neutral' },
}

export function DesktopPcCard({ product }: { product: DesktopPc }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <Link
        to={`/inventory/desktop-pc/${product.id}`}
        className="relative flex h-40 items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900"
      >
        <span className="absolute left-3 top-3">
          <Badge variant={categoryMap[product.category].variant}>{categoryMap[product.category].label}</Badge>
        </span>
        <span className="absolute right-3 top-3">
          <Badge variant={statusMap[product.status].variant}>{statusMap[product.status].label}</Badge>
        </span>
        <FiMonitor className="text-white/20" size={56} />
      </Link>
      <div className="p-4">
        <Link to={`/inventory/desktop-pc/${product.id}`} className="block truncate text-sm font-semibold text-gray-900 hover:text-rose-500">
          {product.name}
        </Link>
        <p className="mt-1 truncate text-xs text-gray-400">{product.specSummary}</p>
        <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3 text-xs">
          <div>
            <p className="text-gray-400">ราคาจำหน่าย</p>
            <p className="text-lg font-bold text-rose-500">฿{product.price.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400">คงเหลือ</p>
            <p className={`font-medium ${product.stock > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {product.stock} เครื่อง
            </p>
          </div>
        </div>
        <Link
          to={`/inventory/desktop-pc/${product.id}/edit`}
          className="mt-3 block rounded-lg border border-rose-200 py-1.5 text-center text-xs font-medium text-rose-500 hover:bg-rose-50"
        >
          แก้ไข
        </Link>
      </div>
    </div>
  )
}
