import { FiArrowRight, FiEdit2, FiEye } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import { formatDateTime } from '../../../lib/formatDate'
import { COMPONENT_SLOT_LABELS } from '../../../types/componentSlots'
import { computerUpgradeStatusMeta, type ComputerUpgrade } from '../../../types/computerUpgrade'

const badgeVariantMap: Record<string, 'success' | 'warning' | 'info' | 'neutral'> = {
  'bg-amber-50 text-amber-600': 'warning',
  'bg-blue-50 text-blue-600': 'info',
  'bg-emerald-50 text-emerald-600': 'success',
  'bg-gray-100 text-gray-500': 'neutral',
}

const columns = ['ลำดับ', 'ชื่อลูกค้า', 'วันที่บันทึก', 'ของเดิม → ของใหม่', 'ตรวจสอบแล้ว', 'สถานะ', 'การจัดการ']

export function ComputerUpgradeTable({ upgrades }: { upgrades: ComputerUpgrade[] }) {
  if (upgrades.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">ไม่พบรายการที่ค้นหา</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="whitespace-nowrap text-xs text-gray-400">
            {columns.map((col) => (
              <th key={col} className="pb-3 pr-4 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {upgrades.map((upgrade, index) => {
            const verifiedCount = upgrade.items.filter((item) => item.verifiedByAdmin).length
            const meta = computerUpgradeStatusMeta[upgrade.status]
            return (
              <tr key={upgrade.id} className="whitespace-nowrap">
                <td className="py-3 pr-4 text-gray-500">{index + 1}</td>
                <td className="py-3 pr-4 font-medium text-gray-800">{upgrade.customerName}</td>
                <td className="py-3 pr-4 text-gray-400">{formatDateTime(upgrade.createdAt)}</td>
                <td className="whitespace-normal py-3 pr-4">
                  {upgrade.items.length === 0 ? (
                    <span className="text-xs text-gray-400">ยังไม่มีรายการ</span>
                  ) : (
                    <ul className="min-w-[260px] space-y-1">
                      {upgrade.items.map((item) => (
                        <li key={item.id} className="flex items-center gap-1.5 text-xs">
                          <span className="w-16 shrink-0 font-medium text-gray-500">
                            {COMPONENT_SLOT_LABELS[item.slot]}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-gray-600">
                            {item.oldItemDescription || 'ไม่ทราบของเดิม'}
                          </span>
                          <FiArrowRight className="shrink-0 text-gray-300" size={11} />
                          <span className="min-w-0 flex-1 truncate font-medium text-gray-800">
                            {item.newProductName ?? 'ยังไม่เลือก'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="py-3 pr-4 text-gray-600">
                  {verifiedCount} / {upgrade.items.length}
                </td>
                <td className="py-3 pr-4">
                  <Badge variant={badgeVariantMap[meta.badgeClass] ?? 'neutral'}>{meta.label}</Badge>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/inventory/computer-upgrade/${upgrade.id}`}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      aria-label="ดูรายละเอียด"
                    >
                      <FiEye size={16} />
                    </Link>
                    <Link
                      to={`/inventory/computer-upgrade/${upgrade.id}/edit`}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      aria-label="แก้ไข"
                    >
                      <FiEdit2 size={16} />
                    </Link>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
