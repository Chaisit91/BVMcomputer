import { useEffect, useMemo, useState } from 'react'
import { FiBox, FiCheckCircle, FiCpu, FiEdit2, FiPlus, FiTrash2, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Badge } from '../../../components/ui/Badge'
import { SummaryCard } from '../../../components/ui/SummaryCard'
import { deleteRam, getRamSummary, getRams } from '../../../services/ram.service'
import type { Ram, RamSummary } from '../../../types/ram'

type LoadStatus = 'loading' | 'error' | 'success'

const brandFacet = ['ADATA', 'APACER', 'CORSAIR', 'HIKSEMI', 'KINGSTON', 'LEXAR', 'KINGBANK', 'COLORFIRE']
const capacityFacet = ['16GB (8GBx2)', '32GB (16GBx2)', '16GB (16GBx1)', '8GB (8GBx1)']
const speedFacet = ['3200MHz', '5600MHz', '6000MHz', '6400MHz']
const typeFacet = ['DDR5', 'DDR4']

function getStockStatus(stock: number): { label: string; variant: 'success' | 'warning' | 'danger' } {
  if (stock === 0) return { label: 'สินค้าหมด', variant: 'danger' }
  if (stock <= 5) return { label: 'ใกล้หมด', variant: 'warning' }
  return { label: 'พร้อมจำหน่าย', variant: 'success' }
}

interface ExtraFilterDef {
  key: string
  title: string
  getValue: (ram: Ram) => string
}

const extraFilterDefs: ExtraFilterDef[] = [
  { key: 'series', title: 'รุ่น/ซีรีส์', getValue: (ram) => ram.series },
  { key: 'voltage', title: 'แรงดันไฟ', getValue: (ram) => ram.specs.voltage },
  { key: 'warranty', title: 'ระยะเวลารับประกัน', getValue: (ram) => ram.specs.warranty },
  { key: 'heatSpreader', title: 'วัสดุระบายความร้อน', getValue: (ram) => ram.specs.heatSpreader },
  { key: 'rgbLighting', title: 'ไฟส่องสว่าง (RGB)', getValue: (ram) => ram.specs.rgbLighting },
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

export function RamListPage() {
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [summary, setSummary] = useState<RamSummary | null>(null)
  const [rams, setRams] = useState<Ram[]>([])
  const [search, setSearch] = useState('')

  const brands = useToggleSet()
  const capacities = useToggleSet()
  const speeds = useToggleSet()
  const types = useToggleSet()

  const [addedFilterKeys, setAddedFilterKeys] = useState<string[]>([])
  const [addedSelections, setAddedSelections] = useState<Record<string, Set<string>>>({})
  const [showAddMenu, setShowAddMenu] = useState(false)

  useEffect(() => {
    let cancelled = false

    Promise.all([getRamSummary(), getRams()])
      .then(([summaryResult, ramsResult]) => {
        if (!cancelled) {
          setSummary(summaryResult)
          setRams(ramsResult)
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
    capacities.clear()
    speeds.clear()
    types.clear()
    setAddedSelections((prev) => {
      const cleared: Record<string, Set<string>> = {}
      for (const key of Object.keys(prev)) cleared[key] = new Set()
      return cleared
    })
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('ยืนยันการลบแรมนี้?')) return
    await deleteRam(id)
    setRams((prev) => prev.filter((ram) => ram.id !== id))
  }

  const availableToAdd = extraFilterDefs.filter((def) => !addedFilterKeys.includes(def.key))

  const optionsByKey = useMemo(() => {
    const map: Record<string, string[]> = {}
    for (const def of extraFilterDefs) {
      map[def.key] = Array.from(new Set(rams.map(def.getValue).filter(Boolean))).sort()
    }
    return map
  }, [rams])

  const visibleRams = useMemo(() => {
    const query = search.trim().toLowerCase()
    return rams.filter((ram) => {
      const matchesSearch =
        query === '' || ram.name.toLowerCase().includes(query) || ram.sku.toLowerCase().includes(query)
      const matchesBrand = brands.selected.size === 0 || brands.selected.has(ram.brand)
      const matchesCapacity = capacities.selected.size === 0 || capacities.selected.has(ram.specs.capacity)
      const matchesSpeed = speeds.selected.size === 0 || speeds.selected.has(ram.specs.speed)
      const matchesType = types.selected.size === 0 || types.selected.has(ram.specs.memoryType)
      const matchesAdded = addedFilterKeys.every((key) => {
        const def = extraFilterDefs.find((item) => item.key === key)
        const selected = addedSelections[key] ?? new Set<string>()
        if (!def || selected.size === 0) return true
        return selected.has(def.getValue(ram))
      })
      return matchesSearch && matchesBrand && matchesCapacity && matchesSpeed && matchesType && matchesAdded
    })
  }, [
    rams,
    search,
    brands.selected,
    capacities.selected,
    speeds.selected,
    types.selected,
    addedFilterKeys,
    addedSelections,
  ])

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
        <h1 className="text-xl font-bold text-gray-900">แรมคอมพิวเตอร์ (RAM Inventory)</h1>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาแรม รุ่น หรือ ความเร็ว..."
            className="min-w-[220px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
          <Link
            to="/inventory/ram/new"
            className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
          >
            <FiPlus size={16} />
            เพิ่มแรมใหม่
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="จำนวนแรมทั้งหมดในระบบ" value={`${summary.totalModels} รุ่น`} icon={<FiBox />} tone="rose" />
        <SummaryCard label="สินค้าพร้อมจำหน่ายปกติ" value={`${summary.activeRatePercent}% Active`} icon={<FiCheckCircle />} tone="emerald" />
        <SummaryCard label="แรมทั้งหมด (RAM)" value={`${summary.totalStock.toLocaleString()} ชิ้น`} icon={<FiCpu />} tone="rose" />
        <SummaryCard label="แบรนด์ทั้งหมด" value={`${summary.totalBrands} แบรนด์`} icon={<FiPlus />} tone="amber" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800">ตัวกรองสินค้า</p>
            <button type="button" onClick={clearAllFilters} className="text-xs text-rose-500 hover:underline">
              ล้างตัวกรอง
            </button>
          </div>
          <FilterGroup title="แบรนด์ (Brand)" options={brandFacet} selected={brands.selected} onToggle={brands.toggle} />
          <FilterGroup title="ความจุ (Capacity)" options={capacityFacet} selected={capacities.selected} onToggle={capacities.toggle} />
          <FilterGroup title="ความเร็วบัส (Speed)" options={speedFacet} selected={speeds.selected} onToggle={speeds.toggle} />
          <FilterGroup title="ประเภทแรม (Type)" options={typeFacet} selected={types.selected} onToggle={types.toggle} />

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
            <div onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">เพิ่มตัวกรอง</h2>
                <button type="button" onClick={() => setShowAddMenu(false)} className="text-gray-400 hover:text-gray-600" aria-label="ปิด">
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
          <h2 className="mb-4 text-sm font-semibold text-gray-800">รายการแรมในคลังสินค้าทั้งหมด (RAM List)</h2>
          {visibleRams.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">ไม่พบสินค้าที่ค้นหา</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="whitespace-nowrap text-xs text-gray-400">
                    <th className="pb-3 pr-4 font-medium">ชื่อสินค้า</th>
                    <th className="pb-3 pr-4 font-medium">แบรนด์</th>
                    <th className="pb-3 pr-4 font-medium">ประเภท</th>
                    <th className="pb-3 pr-4 font-medium">ความจุ</th>
                    <th className="pb-3 pr-4 font-medium">ความเร็ว</th>
                    <th className="pb-3 pr-4 font-medium">ราคาเริ่มต้น</th>
                    <th className="pb-3 pr-4 font-medium">คงเหลือ</th>
                    <th className="pb-3 pr-4 font-medium">สถานะ</th>
                    <th className="pb-3 pr-4 font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visibleRams.map((ram) => (
                    <tr key={ram.id} className="whitespace-nowrap">
                      <td className="max-w-xs py-3 pr-4">
                        <Link to={`/inventory/ram/${ram.id}`} className="block truncate font-medium text-gray-800 hover:text-rose-500">
                          {ram.name}
                        </Link>
                        <span className="text-xs text-gray-400">{ram.sku}</span>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{ram.brand}</td>
                      <td className="py-3 pr-4 text-gray-600">{ram.specs.memoryType}</td>
                      <td className="py-3 pr-4 text-gray-600">{ram.specs.capacity}</td>
                      <td className="py-3 pr-4 text-gray-600">{ram.specs.speed}</td>
                      <td className="py-3 pr-4 font-medium text-gray-800">{ram.sellingPrice.toLocaleString()} ฿</td>
                      <td className="py-3 pr-4 text-gray-600">{ram.stock} ชิ้น</td>
                      <td className="py-3 pr-4">
                        <Badge variant={getStockStatus(ram.stock).variant}>{getStockStatus(ram.stock).label}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/inventory/ram/${ram.id}/edit`}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            aria-label="แก้ไข"
                          >
                            <FiEdit2 size={16} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(ram.id)}
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
            กำลังแสดง 1-{visibleRams.length} จากทั้งหมด {summary.totalModels} รายการ
          </p>
        </div>
      </div>
    </main>
  )
}
