import { useEffect, useMemo, useState } from 'react'
import { FiCheckCircle, FiClipboard, FiClock, FiPlus, FiXCircle } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { CustomBuildTable } from '../../../components/inventory/custom-build/CustomBuildTable'
import { SummaryCard } from '../../../components/ui/SummaryCard'
import { getCustomBuildOrders, getCustomBuildSummary } from '../../../services/customBuild.service'
import type { BuildStatus, CustomBuildOrder, CustomBuildSummary } from '../../../types/customBuild'

type LoadStatus = 'loading' | 'error' | 'success'

const statusOptions: { value: BuildStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'ทุกสถานะ' },
  { value: 'pending', label: 'รอดำเนินการ' },
  { value: 'in_progress', label: 'กำลังดำเนินการ' },
  { value: 'done', label: 'เสร็จสิ้น' },
  { value: 'cancelled', label: 'ยกเลิก' },
]

export function CustomBuildPage() {
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [summary, setSummary] = useState<CustomBuildSummary | null>(null)
  const [orders, setOrders] = useState<CustomBuildOrder[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BuildStatus | 'all'>('all')

  useEffect(() => {
    let cancelled = false

    Promise.all([getCustomBuildSummary(), getCustomBuildOrders()])
      .then(([summaryResult, ordersResult]) => {
        if (!cancelled) {
          setSummary(summaryResult)
          setOrders(ordersResult)
          setStatus('success')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase()

    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesSearch =
        query === '' || order.customer.toLowerCase().includes(query) || order.orderNo.toLowerCase().includes(query)
      return matchesStatus && matchesSearch
    })
  }, [orders, search, statusFilter])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">กำลังโหลดข้อมูล...</div>
    )
  }

  if (status === 'error' || !summary) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-rose-500">
        โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">จัดสเปคคอม</h1>
          <p className="text-sm text-gray-400">จัดการรายการสเปคและออเดอร์ของลูกค้า</p>
        </div>
        <Link
          to="/inventory/custom-build/new"
          className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
        >
          <FiPlus size={16} />
          เพิ่มสเปคใหม่
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="สเปคทั้งหมด" value={`${summary.total} รายการ`} icon={<FiClipboard />} tone="rose" />
        <SummaryCard label="รอดำเนินการ" value={`${summary.pending} รายการ`} icon={<FiClock />} tone="amber" />
        <SummaryCard label="เสร็จสิ้น" value={`${summary.done} รายการ`} icon={<FiCheckCircle />} tone="emerald" />
        <SummaryCard label="ยกเลิก" value={`${summary.cancelled} รายการ`} icon={<FiXCircle />} tone="gray" />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาชื่อลูกค้าหรือเลขออเดอร์"
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as BuildStatus | 'all')}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-rose-400"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <CustomBuildTable orders={filteredOrders} />

        <p className="mt-4 text-xs text-gray-400">
          แสดง {filteredOrders.length} จาก {orders.length} รายการ
        </p>
      </div>
    </main>
  )
}
