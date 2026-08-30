import { FiMonitor } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import type { PromoSet, PromoSetStatus } from '../../../types/promoSet'

const statusMap: Record<PromoSetStatus, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  selling: { label: 'กำลังขาย', variant: 'success' },
  out_of_stock: { label: 'หมดสต็อก', variant: 'warning' },
  closed: { label: 'ปิดการขาย', variant: 'danger' },
}

export function PromoSetCard({ set }: { set: PromoSet }) {
  const discountPercent =
    set.regularPrice > 0 ? Math.round(((set.regularPrice - set.promoPrice) / set.regularPrice) * 100) : 0

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
        <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-rose-500">
          {set.code}
        </span>
        <span className="absolute right-3 top-3">
          <Badge variant={statusMap[set.status].variant}>{statusMap[set.status].label}</Badge>
        </span>
        <FiMonitor className="text-white/20" size={56} />
      </div>
      <div className="p-4">
        <h3 className="truncate text-sm font-semibold text-gray-900">{set.name}</h3>
        <p className="mt-1 truncate text-xs text-gray-400">สเปคย่อ: {set.specSummary}</p>
        <div className="mt-3 flex items-center gap-2 border-t border-gray-50 pt-3">
          <span className="text-xs text-gray-300 line-through">฿{set.regularPrice.toLocaleString()}</span>
          {discountPercent > 0 && (
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-500">
              ส่วนลด {discountPercent}%
            </span>
          )}
        </div>
        <p className="text-xl font-bold text-rose-500">฿{set.promoPrice.toLocaleString()}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`h-1.5 w-1.5 rounded-full ${set.stock > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            {set.stock > 0 ? `คงเหลือ ${set.stock} เครื่อง` : 'หมดสต็อก'}
          </span>
          <Link
            to={`/inventory/promo-sets/${set.id}/edit`}
            className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-50"
          >
            แก้ไข
          </Link>
        </div>
      </div>
    </div>
  )
}
