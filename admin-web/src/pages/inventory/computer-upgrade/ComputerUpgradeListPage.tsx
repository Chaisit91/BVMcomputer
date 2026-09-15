import { useEffect, useMemo, useState } from 'react'
import { FiCheckCircle, FiClock, FiPlus, FiRefreshCw } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { ComputerUpgradeTable } from '../../../components/inventory/computer-upgrade/ComputerUpgradeTable'
import { SummaryCard } from '../../../components/ui/SummaryCard'
import { getComputerUpgrades } from '../../../services/computerUpgrade.service'
import { computerUpgradeStatusMeta, type ComputerUpgrade, type ComputerUpgradeStatus } from '../../../types/computerUpgrade'

type LoadStatus = 'loading' | 'error' | 'success'

const statusOptions: { value: ComputerUpgradeStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'ทุกสถานะ' },
  ...(Object.keys(computerUpgradeStatusMeta) as ComputerUpgradeStatus[]).map((value) => ({
    value,
    label: computerUpgradeStatusMeta[value].label,
  })),
]

export function ComputerUpgradeListPage() {
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [upgrades, setUpgrades] = useState<ComputerUpgrade[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ComputerUpgradeStatus | 'all'>('all')

  useEffect(() => {
    let cancelled = false

    getComputerUpgrades()
      .then((result) => {
        if (!cancelled) {
          setUpgrades(result)
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

  const summary = useMemo(
    () => ({
      total: upgrades.length,
      pendingReview: upgrades.filter((u) => u.status === 'pending_review').length,
      inProgress: upgrades.filter((u) => u.status === 'in_progress').length,
      completed: upgrades.filter((u) => u.status === 'completed').length,
    }),
    [upgrades],
  )

  const filteredUpgrades = useMemo(() => {
    const query = search.trim().toLowerCase()
    return upgrades.filter((upgrade) => {
      const matchesStatus = statusFilter === 'all' || upgrade.status === statusFilter
      const matchesSearch = query === '' || upgrade.customerName.toLowerCase().includes(query)
      return matchesStatus && matchesSearch
    })
  }, [upgrades, search, statusFilter])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">กำลังโหลดข้อมูล...</div>
    )
  }

  if (status === 'error') {
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
          <h1 className="text-xl font-bold text-gray-900">จัดการอัพเกรดคอมพิวเตอร์</h1>
          <p className="text-sm text-gray-400">ตรวจสอบเครื่องเดิมของลูกค้าและติดตามรายการที่กำลังอัพเกรด</p>
        </div>
        <Link
          to="/inventory/computer-upgrade/new"
          className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
        >
          <FiPlus size={16} />
          เพิ่มรายการใหม่
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="รายการทั้งหมด" value={`${summary.total} รายการ`} icon={<FiRefreshCw />} tone="rose" />
        <SummaryCard label="รอตรวจสอบ" value={`${summary.pendingReview} รายการ`} icon={<FiClock />} tone="amber" />
        <SummaryCard label="กำลังดำเนินการ" value={`${summary.inProgress} รายการ`} icon={<FiRefreshCw />} tone="rose" />
        <SummaryCard label="เสร็จสิ้น" value={`${summary.completed} รายการ`} icon={<FiCheckCircle />} tone="emerald" />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาชื่อลูกค้า"
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as ComputerUpgradeStatus | 'all')}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-rose-400"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <ComputerUpgradeTable upgrades={filteredUpgrades} />

        <p className="mt-4 text-xs text-gray-400">
          แสดง {filteredUpgrades.length} จาก {upgrades.length} รายการ
        </p>
      </div>
    </main>
  )
}
