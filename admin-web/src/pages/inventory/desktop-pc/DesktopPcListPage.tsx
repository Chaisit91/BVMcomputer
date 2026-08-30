import { useEffect, useMemo, useState } from 'react'
import { FiAlertCircle, FiCheckCircle, FiList, FiPackage, FiPlus } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { DesktopPcCard } from '../../../components/inventory/desktop-pc/DesktopPcCard'
import { SummaryCard } from '../../../components/ui/SummaryCard'
import { getDesktopPcSummary, getDesktopPcs } from '../../../services/desktopPc.service'
import type { DesktopPc, DesktopPcCategory, DesktopPcStatus, DesktopPcSummary } from '../../../types/desktopPc'

type LoadStatus = 'loading' | 'error' | 'success'

const categoryTabs: { value: DesktopPcCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'ดูทั้งหมด' },
  { value: 'desktop', label: 'เดสก์ท็อป พีซี' },
  { value: 'mini_pc', label: 'มินิพีซี' },
  { value: 'all_in_one', label: 'ออลอินวัน' },
  { value: 'ai_workstation', label: 'คอมพิวเตอร์ AI' },
  { value: 'ai_enterprise', label: 'คอมพิวเตอร์ AI สำหรับองค์กร' },
]

const statusOptions: { value: DesktopPcStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'selling', label: 'กำลังขาย' },
  { value: 'low_stock', label: 'สต็อกน้อย' },
  { value: 'out_of_stock', label: 'หมดสต็อก' },
  { value: 'discontinued', label: 'เลิกขาย' },
]

export function DesktopPcListPage() {
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [summary, setSummary] = useState<DesktopPcSummary | null>(null)
  const [products, setProducts] = useState<DesktopPc[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<DesktopPcStatus | 'all'>('all')
  const [categoryTab, setCategoryTab] = useState<DesktopPcCategory | 'all'>('all')

  useEffect(() => {
    let cancelled = false

    Promise.all([getDesktopPcSummary(), getDesktopPcs()])
      .then(([summaryResult, productsResult]) => {
        if (!cancelled) {
          setSummary(summaryResult)
          setProducts(productsResult)
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

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products.filter((product) => {
      const matchesCategory = categoryTab === 'all' || product.category === categoryTab
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter
      const matchesSearch =
        query === '' || product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query)
      return matchesCategory && matchesStatus && matchesSearch
    })
  }, [products, search, statusFilter, categoryTab])

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
          <h1 className="text-xl font-bold text-gray-900">คอมพิวเตอร์ตั้งโต๊ะ</h1>
          <p className="text-sm text-gray-400">จัดการสินค้าคอมพิวเตอร์ตั้งโต๊ะทั้งหมด</p>
        </div>
        <Link
          to="/inventory/desktop-pc/new"
          className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
        >
          <FiPlus size={16} />
          เพิ่มสินค้า
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="สินค้าทั้งหมด" value={`${summary.total} รายการ`} icon={<FiPackage />} tone="rose" />
        <SummaryCard label="กำลังขาย" value={`${summary.selling} รายการ`} icon={<FiCheckCircle />} tone="emerald" />
        <SummaryCard label="สต็อกน้อย" value={`${summary.lowStock} รายการ`} icon={<FiAlertCircle />} tone="amber" />
        <SummaryCard label="เลิกขาย" value={`${summary.discontinued} รายการ`} icon={<FiList />} tone="gray" />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-2">
        {categoryTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setCategoryTab(tab.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              categoryTab === tab.value ? 'bg-rose-50 text-rose-500' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาด้วยชื่อสินค้า หรือ SKU..."
            className="min-w-[200px] flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as DesktopPcStatus | 'all')}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-rose-400"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                สถานะ: {option.label}
              </option>
            ))}
          </select>
        </div>

        {visibleProducts.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">ไม่พบสินค้าที่ค้นหา</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <DesktopPcCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
