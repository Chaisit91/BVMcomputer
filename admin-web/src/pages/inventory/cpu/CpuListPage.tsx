import { useEffect, useMemo, useState } from 'react'
import { FiAlertTriangle, FiBox, FiEdit2, FiMail, FiPlus, FiShield, FiTrash2, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Badge } from '../../../components/ui/Badge'
import { SummaryCard } from '../../../components/ui/SummaryCard'
import { deleteCpu, getCpuSummary, getCpus } from '../../../services/cpu.service'
import type { Cpu, CpuSummary } from '../../../types/cpu'

type LoadStatus = 'loading' | 'error' | 'success'
type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'stock_desc'

const brandFacet = ['AMD', 'Intel']
const seriesFacet = ['12th Gen', '14th Gen', 'CORE ULTRA', '5000 Series', '7000 Series', '7000 WX-Series', '8000 Series', '9000 Series']
const processorFacet = ['CORE i3', 'CORE i5', 'CORE i7', 'Ryzen 5', 'Ryzen 7', 'Ryzen 9', 'RYZEN THREADRIPPER', 'ULTRA 5', 'ULTRA 7']
const socketFacet = ['AM4', 'AM5', 'sTR5', 'LGA 1700', 'LGA 1851']

function getStockStatusLabel(stock: number) {
  if (stock === 0) return 'สินค้าหมด'
  if (stock <= 20) return 'ใกล้หมด (≤20)'
  return 'มีสินค้า'
}

interface ExtraFilterDef {
  key: string
  title: string
  getValue: (cpu: Cpu) => string
}

// each entry mirrors a field from the product spec form — options are derived from real data, not hardcoded
const extraFilterDefs: ExtraFilterDef[] = [
  { key: 'stockStatus', title: 'สถานะสต็อก', getValue: (cpu) => getStockStatusLabel(cpu.stock) },
  { key: 'processorNumber', title: 'รหัสประมวลผล (Processor Number)', getValue: (cpu) => cpu.processorNumber },
  { key: 'coresThreads', title: 'จำนวนคอร์/เธรด (Cores/Threads)', getValue: (cpu) => cpu.coresThreads },
  { key: 'baseFrequency', title: 'ความถี่พื้นฐาน (Base Frequency)', getValue: (cpu) => cpu.baseFrequency },
  { key: 'maxTurboFrequency', title: 'ความถี่เทอร์โบสูงสุด (Max Turbo Frequency)', getValue: (cpu) => cpu.maxTurboFrequency },
  { key: 'l2Cache', title: 'แคช L2 (L2 Cache)', getValue: (cpu) => cpu.l2Cache },
  { key: 'l3Cache', title: 'แคช L3 (L3 Cache)', getValue: (cpu) => cpu.l3Cache },
  { key: 'graphics', title: 'โมเดลกราฟิกในตัว (Graphics Models)', getValue: (cpu) => cpu.graphics },
  { key: 'tdp', title: 'อัตราการปล่อยความร้อน (Default TDP)', getValue: (cpu) => cpu.tdp },
  { key: 'maxTdp', title: 'TDP สูงสุด (Max TDP)', getValue: (cpu) => cpu.maxTdp },
  { key: 'warranty', title: 'การรับประกัน (Warranty)', getValue: (cpu) => cpu.warranty },
]

function useToggleSet(initial: string[] = []) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initial))
  const toggle = (value: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }
  const clear = () => setSelected(new Set())
  return { selected, toggle, clear }
}

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
  onRemove,
}: {
  title: string
  options: string[]
  selected: Set<string>
  onToggle: (value: string) => void
  onRemove?: () => void
}) {
  return (
    <div className="border-b border-gray-100 py-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        {onRemove && (
          <button type="button" onClick={onRemove} className="text-gray-300 hover:text-rose-500" aria-label="ลบตัวกรองนี้">
            <FiX size={14} />
          </button>
        )}
      </div>
      <div className="space-y-1.5">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={selected.has(option)}
              onChange={() => onToggle(option)}
              className="h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-400"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  )
}

export function CpuListPage() {
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [summary, setSummary] = useState<CpuSummary | null>(null)
  const [cpus, setCpus] = useState<Cpu[]>([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('newest')

  const brands = useToggleSet(brandFacet)
  const series = useToggleSet()
  const processors = useToggleSet()
  const sockets = useToggleSet()

  const [addedFilterKeys, setAddedFilterKeys] = useState<string[]>([])
  const [addedSelections, setAddedSelections] = useState<Record<string, Set<string>>>({})
  const [showAddMenu, setShowAddMenu] = useState(false)

  useEffect(() => {
    let cancelled = false

    Promise.all([getCpuSummary(), getCpus()])
      .then(([summaryResult, cpusResult]) => {
        if (!cancelled) {
          setSummary(summaryResult)
          setCpus(cpusResult)
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

  const addFilter = (key: string) => {
    setAddedFilterKeys((prev) => [...prev, key])
    setAddedSelections((prev) => ({ ...prev, [key]: new Set() }))
  }

  const removeFilter = (key: string) => {
    setAddedFilterKeys((prev) => prev.filter((item) => item !== key))
    setAddedSelections((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const toggleAddedValue = (key: string, value: string) => {
    setAddedSelections((prev) => {
      const next = new Set(prev[key] ?? [])
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return { ...prev, [key]: next }
    })
  }

  const clearAllFilters = () => {
    brands.clear()
    series.clear()
    processors.clear()
    sockets.clear()
    setAddedSelections((prev) => {
      const cleared: Record<string, Set<string>> = {}
      for (const key of Object.keys(prev)) cleared[key] = new Set()
      return cleared
    })
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('ยืนยันการลบสินค้านี้?')) return
    await deleteCpu(id)
    setCpus((prev) => prev.filter((cpu) => cpu.id !== id))
  }

  const availableToAdd = extraFilterDefs.filter((def) => !addedFilterKeys.includes(def.key))

  const optionsByKey = useMemo(() => {
    const map: Record<string, string[]> = {}
    for (const def of extraFilterDefs) {
      map[def.key] = Array.from(new Set(cpus.map(def.getValue).filter(Boolean))).sort()
    }
    return map
  }, [cpus])

  const visibleCpus = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = cpus.filter((cpu) => {
      const matchesSearch =
        query === '' || cpu.name.toLowerCase().includes(query) || cpu.sku.toLowerCase().includes(query)
      const matchesBrand = brands.selected.size === 0 || brands.selected.has(cpu.brand)
      const matchesSeries = series.selected.size === 0 || series.selected.has(cpu.series)
      const matchesProcessor = processors.selected.size === 0 || processors.selected.has(cpu.processorLine)
      const matchesSocket = sockets.selected.size === 0 || sockets.selected.has(cpu.socket)
      const matchesAdded = addedFilterKeys.every((key) => {
        const def = extraFilterDefs.find((item) => item.key === key)
        const selected = addedSelections[key] ?? new Set<string>()
        if (!def || selected.size === 0) return true
        return selected.has(def.getValue(cpu))
      })
      return matchesSearch && matchesBrand && matchesSeries && matchesProcessor && matchesSocket && matchesAdded
    })

    const sorted = [...filtered]
    if (sort === 'price_asc') sorted.sort((a, b) => a.sellingPrice - b.sellingPrice)
    if (sort === 'price_desc') sorted.sort((a, b) => b.sellingPrice - a.sellingPrice)
    if (sort === 'stock_desc') sorted.sort((a, b) => b.stock - a.stock)
    return sorted
  }, [cpus, search, sort, brands.selected, series.selected, processors.selected, sockets.selected, addedFilterKeys, addedSelections])

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
        <h1 className="text-xl font-bold text-gray-900">ซีพียู (CPU)</h1>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหารหัสสินค้า หรือ ชื่อซีพียู..."
            className="min-w-[220px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-rose-400"
          >
            <option value="newest">เรียงตามล่าสุด</option>
            <option value="price_asc">ราคาต่ำ-สูง</option>
            <option value="price_desc">ราคาสูง-ต่ำ</option>
            <option value="stock_desc">คงเหลือมากสุด</option>
          </select>
          <Link
            to="/inventory/cpu/new"
            className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
          >
            <FiPlus size={16} />
            เพิ่มสินค้าใหม่
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="จำนวนสินค้าทั้งหมด" value={`${summary.total} รายการ`} icon={<FiBox />} tone="rose" />
        <SummaryCard label="สินค้าคงเหลือรวม" value={`${summary.totalStock} ชิ้น`} icon={<FiMail />} tone="rose" />
        <SummaryCard
          label="สินค้าใกล้หมด (≤ 20)"
          value={`${summary.lowStock} รายการ`}
          icon={<FiAlertTriangle />}
          tone="amber"
        />
        <SummaryCard label="สินค้าหมด" value={`${summary.outOfStock} รายการ`} icon={<FiShield />} tone="gray" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800">ตัวกรองสินค้า</p>
            <button type="button" onClick={clearAllFilters} className="text-xs text-rose-500 hover:underline">
              ล้างทั้งหมด
            </button>
          </div>
          <FilterGroup title="แบรนด์ (Brand)" options={brandFacet} selected={brands.selected} onToggle={brands.toggle} />
          <FilterGroup title="ซีรีส์ (Series)" options={seriesFacet} selected={series.selected} onToggle={series.toggle} />
          <FilterGroup
            title="รุ่นประมวลผล (Processor)"
            options={processorFacet}
            selected={processors.selected}
            onToggle={processors.toggle}
          />
          <FilterGroup
            title="ประเภทซ็อกเก็ต (Socket)"
            options={socketFacet}
            selected={sockets.selected}
            onToggle={sockets.toggle}
          />

          {addedFilterKeys.map((key) => {
            const def = extraFilterDefs.find((item) => item.key === key)
            if (!def) return null
            return (
              <FilterGroup
                key={key}
                title={def.title}
                options={optionsByKey[key] ?? []}
                selected={addedSelections[key] ?? new Set()}
                onToggle={(value) => toggleAddedValue(key, value)}
                onRemove={() => removeFilter(key)}
              />
            )
          })}

          {availableToAdd.length > 0 && (
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setShowAddMenu(true)}
                className="flex w-full items-center justify-center gap-1 rounded-full bg-rose-50 py-2 text-sm font-medium text-rose-500 hover:bg-rose-100"
              >
                <FiPlus size={14} /> เพิ่มตัวกรอง
              </button>
            </div>
          )}
        </aside>

        {showAddMenu && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setShowAddMenu(false)}
          >
            <div
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">เพิ่มตัวกรอง</h2>
                <button
                  type="button"
                  onClick={() => setShowAddMenu(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="ปิด"
                >
                  <FiX size={18} />
                </button>
              </div>
              {availableToAdd.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">เพิ่มตัวกรองครบทุกหมวดแล้ว</p>
              ) : (
                <div className="max-h-96 space-y-1.5 overflow-y-auto">
                  {availableToAdd.map((def) => (
                    <button
                      key={def.key}
                      type="button"
                      onClick={() => addFilter(def.key)}
                      className="flex w-full items-center justify-between rounded-xl border border-gray-100 px-4 py-3 text-left text-sm text-gray-700 hover:border-rose-200 hover:bg-rose-50"
                    >
                      {def.title}
                      <FiPlus size={14} className="text-rose-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          {visibleCpus.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">ไม่พบสินค้าที่ค้นหา</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="whitespace-nowrap text-xs text-gray-400">
                    <th className="pb-3 pr-4 font-medium">รหัสสินค้า (SKU)</th>
                    <th className="pb-3 pr-4 font-medium">ชื่อสินค้า (Product Name)</th>
                    <th className="pb-3 pr-4 font-medium">แบรนด์</th>
                    <th className="pb-3 pr-4 font-medium">ซีรีส์</th>
                    <th className="pb-3 pr-4 font-medium">ราคา</th>
                    <th className="pb-3 pr-4 font-medium">คงเหลือ</th>
                    <th className="pb-3 pr-4 font-medium">สถานะ</th>
                    <th className="pb-3 pr-4 font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visibleCpus.map((cpu) => (
                    <tr key={cpu.id} className="whitespace-nowrap">
                      <td className="py-3 pr-4 font-medium text-gray-800">{cpu.sku}</td>
                      <td className="py-3 pr-4 text-gray-800">{cpu.name}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={cpu.brand === 'AMD' ? 'danger' : 'info'}>{cpu.brand}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-gray-500">{cpu.series}</td>
                      <td className="py-3 pr-4 font-medium text-gray-800">฿{cpu.sellingPrice.toLocaleString()}</td>
                      <td className="py-3 pr-4">
                        {cpu.stock === 0 ? (
                          <span className="flex items-center gap-1.5 text-rose-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            สินค้าหมด
                          </span>
                        ) : (
                          <span className={`flex items-center gap-1.5 ${cpu.stock <= 20 ? 'text-amber-500' : 'text-emerald-500'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${cpu.stock <= 20 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            {cpu.stock} ชิ้น
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={cpu.publishImmediately ? 'success' : 'neutral'}>
                          {cpu.publishImmediately ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/inventory/cpu/${cpu.id}/edit`}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            aria-label="แก้ไข"
                          >
                            <FiEdit2 size={16} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(cpu.id)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-rose-500"
                            aria-label="ลบ"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-4 text-xs text-gray-400">
            แสดงทั้งหมด {visibleCpus.length} จาก {cpus.length} รายการ
          </p>
        </div>
      </div>
    </main>
  )
}
