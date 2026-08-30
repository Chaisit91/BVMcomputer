import { useEffect, useMemo, useState } from 'react'
import { FiAlertCircle, FiCheckCircle, FiFlag, FiPackage, FiPlus } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { PromoSetCard } from '../../../components/inventory/promo-sets/PromoSetCard'
import { SummaryCard } from '../../../components/ui/SummaryCard'
import { getPromoSetSummary, getPromoSets } from '../../../services/promoSet.service'
import type { PromoSet, PromoSetStatus, PromoSetSummary } from '../../../types/promoSet'

type LoadStatus = 'loading' | 'error' | 'success'
type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'stock_desc'

const statusOptions: { value: PromoSetStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'selling', label: 'กำลังขาย' },
  { value: 'out_of_stock', label: 'หมดสต็อก' },
  { value: 'closed', label: 'ปิดการขาย' },
]

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'อัปเดตล่าสุด' },
  { value: 'price_asc', label: 'ราคาต่ำ-สูง' },
  { value: 'price_desc', label: 'ราคาสูง-ต่ำ' },
  { value: 'stock_desc', label: 'คงเหลือมากสุด' },
]

export function PromoSetListPage() {
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [summary, setSummary] = useState<PromoSetSummary | null>(null)
  const [sets, setSets] = useState<PromoSet[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PromoSetStatus | 'all'>('all')
  const [sort, setSort] = useState<SortOption>('newest')

  useEffect(() => {
    let cancelled = false

    Promise.all([getPromoSetSummary(), getPromoSets()])
      .then(([summaryResult, setsResult]) => {
        if (!cancelled) {
          setSummary(summaryResult)
          setSets(setsResult)
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

  const visibleSets = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = sets.filter((set) => {
      const matchesStatus = statusFilter === 'all' || set.status === statusFilter
      const matchesSearch =
        query === '' || set.name.toLowerCase().includes(query) || set.code.toLowerCase().includes(query)
      return matchesStatus && matchesSearch
    })

    const sorted = [...filtered]
    if (sort === 'price_asc') sorted.sort((a, b) => a.promoPrice - b.promoPrice)
    if (sort === 'price_desc') sorted.sort((a, b) => b.promoPrice - a.promoPrice)
    if (sort === 'stock_desc') sorted.sort((a, b) => b.stock - a.stock)
    return sorted
  }, [sets, search, statusFilter, sort])

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
          <h1 className="text-xl font-bold text-gray-900">คอมพิวเตอร์เซ็ตโปรโมชั่น</h1>
          <p className="text-sm text-gray-400">จัดการเซ็ตคอมโปรโมชั่นและส่วนลดทั้งหมดในระบบ</p>
        </div>
        <Link
          to="/inventory/promo-sets/new"
          className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
        >
          <FiPlus size={16} />
          เพิ่มเซ็ตใหม่
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="เซ็ตทั้งหมด" value={`${summary.total} เซ็ต`} icon={<FiPackage />} tone="rose" />
        <SummaryCard label="กำลังขาย" value={`${summary.selling} เซ็ต`} icon={<FiCheckCircle />} tone="emerald" />
        <SummaryCard label="หมดสต็อก" value={`${summary.outOfStock} เซ็ต`} icon={<FiAlertCircle />} tone="amber" />
        <SummaryCard label="ปิดการขาย" value={`${summary.closed} เซ็ต`} icon={<FiFlag />} tone="gray" />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาด้วยชื่อหรือรหัสเซ็ต..."
            className="min-w-[200px] flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as PromoSetStatus | 'all')}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-rose-400"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                สถานะ: {option.label}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-rose-400"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                เรียงตาม: {option.label}
              </option>
            ))}
          </select>
        </div>

        {visibleSets.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">ไม่พบเซ็ตที่ค้นหา</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleSets.map((set) => (
              <PromoSetCard key={set.id} set={set} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
