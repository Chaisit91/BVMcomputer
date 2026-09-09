import { FiEdit2, FiEye } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Badge } from '../../ui/Badge'
import { formatDateTime } from '../../../lib/formatDate'
import type { BuildStatus, CustomBuild } from '../../../types/customBuild'

const statusMap: Record<BuildStatus, { label: string; variant: 'success' | 'warning' | 'info' | 'danger' }> = {
  done: { label: 'เสร็จสิ้น', variant: 'success' },
  pending: { label: 'รอดำเนินการ', variant: 'warning' },
  in_progress: { label: 'กำลังดำเนินการ', variant: 'info' },
  cancelled: { label: 'ยกเลิก', variant: 'danger' },
}

const columns = [
  'ลำดับ',
  'เลขออเดอร์',
  'ชื่อลูกค้า',
  'วันที่บันทึก',
  'ซีพียู',
  'การ์ดจอ',
  'เมนบอร์ด',
  'แรม',
  'ฮาร์ดดิสก์/เอสเอสดี',
  'พาวเวอร์ซัพพลาย',
  'เคส',
  'ชุดระบายความร้อน',
  'ราคารวม',
  'สถานะ',
  'การจัดการ',
]

export function CustomBuildTable({ builds }: { builds: CustomBuild[] }) {
  if (builds.length === 0) {
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
          {builds.map((build, index) => (
            <tr key={build.id} className="whitespace-nowrap">
              <td className="py-3 pr-4 text-gray-500">{index + 1}</td>
              <td className="py-3 pr-4 font-medium text-gray-800">{build.orderNo}</td>
              <td className="py-3 pr-4 text-gray-600">{build.customer}</td>
              <td className="py-3 pr-4 text-gray-400">{formatDateTime(build.createdAt)}</td>
              <td className="py-3 pr-4 text-gray-600">{build.components.cpu}</td>
              <td className="py-3 pr-4 text-gray-600">{build.components.gpu}</td>
              <td className="py-3 pr-4 text-gray-600">{build.components.motherboard}</td>
              <td className="py-3 pr-4 text-gray-600">{build.components.ram}</td>
              <td className="py-3 pr-4 text-gray-600">{build.components.storage}</td>
              <td className="py-3 pr-4 text-gray-600">{build.components.psu}</td>
              <td className="py-3 pr-4 text-gray-600">{build.components.case}</td>
              <td className="py-3 pr-4 text-gray-600">{build.components.cooling}</td>
              <td className="py-3 pr-4 font-medium text-gray-800">฿{build.total.toLocaleString()}</td>
              <td className="py-3 pr-4">
                <Badge variant={statusMap[build.status].variant}>{statusMap[build.status].label}</Badge>
              </td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/inventory/custom-build/${build.id}`}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label="ดูรายละเอียด"
                  >
                    <FiEye size={16} />
                  </Link>
                  <Link
                    to={`/inventory/custom-build/${build.id}/edit`}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label="แก้ไข"
                  >
                    <FiEdit2 size={16} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
