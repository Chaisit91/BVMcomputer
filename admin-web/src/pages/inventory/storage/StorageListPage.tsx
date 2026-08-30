import { useEffect, useMemo, useState } from 'react'
import { FiAlertTriangle, FiBox, FiEdit2, FiPackage, FiPlus, FiTrash2, FiX, FiXCircle } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Badge } from '../../../components/ui/Badge'
import { SummaryCard } from '../../../components/ui/SummaryCard'
import { deleteStorage, getStorageSummary, getStorages } from '../../../services/storage.service'
import type { Storage, StorageSummary } from '../../../types/storage'

type LoadStatus = 'loading' | 'error' | 'success'

const brandFacet = ['SAMSUNG', 'WD', 'SEAGATE', 'KINGSTON', 'CRUCIAL', 'SANDISK', 'TOSHIBA']
const typeFacet = ['SSD M.2 NVMe', 'SSD SATA 2.5 inch', 'HDD Internal 3.5 inch', 'HDD Internal 2.5 inch']
const capacityFacet = ['256 GB', '512 GB', '1 TB', '2 TB', '4 TB', '8 TB']
const interfaceFacet = ['PCIe Gen 4.0 x4', 'PCIe Gen 3.0 x4', 'SATA III', 'PCIe Gen 5.0 x4']

function getStockStatus(stock: number): { label: string; variant: 'success' | 'warning' | 'danger' } {
  if (stock === 0) return { label: 'สินค้าหมด', variant: 'danger' }
  if (stock <= 5) return { label: 'ใกล้หมด', variant: 'warning' }
  return { label: 'พร้อมจำหน่าย', variant: 'success' }
}

interface ExtraFilterDef {
  key: string
  title: string
  getValue: (item: Storage) => string
}

const extraFilterDefs: ExtraFilterDef[] = [
  { key: 'formFactor', title: 'ฟอร์มแฟกเตอร์', getValue: (item) => item.specs.formFactor },
  { key: 'cacheMemory', title: 'หน่วยความจำแคช', getValue: (item) => item.specs.cacheMemory },
  { key: 'warranty', title: 'ระยะเวลารับประกัน', getValue: (item) => item.specs.warranty },
  { key: 'mtbf', title: 'อายุการใช้งานเฉลี่ย (MTBF)', getValue: (item) => item.specs.mtbf },
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

export function StorageListPage() {
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [summary, setSummary] = useState<StorageSummary | null>(null)
  const [items, setItems] = useState<Storage[]>([])
  const [search, setSearch] = useState('')

  const brands = useToggleSet()
  const types = useToggleSet()
  const capacities = useToggleSet()
  const interfaces = useToggleSet()

  const [addedFilterKeys, setAddedFilterKeys] = useState<string[]>([])
  const [addedSelections, setAddedSelections] = useState<Record<string, Set<string>>>({})
  const [showAddMenu, setShowAddMenu] = useState(false)

  useEffect(() => {
    let cancelled = false

    Promise.all([getStorageSummary(), getStorages()])
      .then(([summaryResult, itemsResult]) => {
        if (!cancelled) {
          setSummary(summaryResult)
          setItems(itemsResult)
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
    types.clear()
    capacities.clear()
    interfaces.clear()
    setAddedSelections((prev) => {
      const cleared: Record<string, Set<string>> = {}
      for (const key of Object.keys(prev)) cleared[key] = new Set()
      return cleared
    })
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('ยืนยันการลบอุปกรณ์จัดเก็บข้อมูลนี้?')) return
    await deleteStorage(id)
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const availableToAdd = extraFilterDefs.filter((def) => !addedFilterKeys.includes(def.key))

  const optionsByKey = useMemo(() => {
    const map: Record<string, string[]> = {}
    for (const def of extraFilterDefs) {
      map[def.key] = Array.from(new Set(items.map(def.getValue).filter(Boolean))).sort()
    }
    return map
  }, [items])

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) => {
      const matchesSearch =
        query === '' || item.name.toLowerCase().includes(query) || item.sku.toLowerCase().includes(query)
      const matchesBrand = brands.selected.size === 0 || brands.selected.has(item.brand)
      const matchesType = types.selected.size === 0 || types.selected.has(item.specs.type)
      const matchesCapacity = capacities.selected.size === 0 || capacities.selected.has(item.specs.capacity)
      const matchesInterface = interfaces.selected.size === 0 || interfaces.selected.has(item.specs.interface)
      const matchesAdded = addedFilterKeys.every((key) => {
        const def = extraFilterDefs.find((d) => d.key === key)
        const selected = addedSelections[key] ?? new Set<string>()
        if (!def || selected.size === 0) return true
        return selected.has(def.getValue(item))
      })
      return matchesSearch && matchesBrand && matchesType && matchesCapacity && matchesInterface && matchesAdded
    })
  }, [
    items,
    search,
    brands.selected,
    types.selected,
    capacities.selected,
    interfaces.selected,
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
        <h1 className="text-xl font-bold text-gray-900">ฮาร์ดดิสก์ และ เอสเอสดี (HDD & SSD Storage)</h1>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาอุปกรณ์จัดเก็บข้อมูล รุ่น หรือ แบรนด์..."
            className="min-w-[220px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
          <Link
            to="/inventory/storage/new"
            className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
          >
            <FiPlus size={16} />
            เพิ่มสินค้าใหม่
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="จำนวนรายการสินค้าเก็บข้อมูลทั้งหมด" value={`${summary.totalModels} รุ่น`} icon={<FiBox />} tone="rose" />
        <SummaryCard label="คงเหลือรวมในคลังสินค้า" value={`${summary.totalStock.toLocaleString()} ชิ้น`} icon={<FiPackage />} tone="rose" />
        <SummaryCard label="สินค้าใกล้หมดระบบเดือน" value={`${summary.lowStockCount} รายการ`} icon={<FiAlertTriangle />} tone="amber" />
        <SummaryCard label="สินค้าที่หมดสต๊อค" value={`${summary.outOfStockCount} รายการ`} icon={<FiXCircle />} tone="rose" />
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
          <FilterGroup title="ประเภทการทำงาน (Type)" options={typeFacet} selected={types.selected} onToggle={types.toggle} />
          <FilterGroup title="ความจุ (Capacity)" options={capacityFacet} selected={capacities.selected} onToggle={capacities.toggle} />
          <FilterGroup title="อินเทอร์เฟส (Interface)" options={interfaceFacet} selected={interfaces.selected} onToggle={interfaces.toggle} />

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
                <FiPlus size={14} /> เพิ่มตัวกรองเสริม
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
          <h2 className="mb-4 text-sm font-semibold text-gray-800">รายการสินค้าในคลังเก็บข้อมูลทั้งหมด</h2>
          {visibleItems.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">ไม่พบสินค้าที่ค้นหา</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="whitespace-nowrap text-xs text-gray-400">
                    <th className="pb-3 pr-4 font-medium">รหัส</th>
                    <th className="pb-3 pr-4 font-medium">ชื่อสินค้า</th>
                    <th className="pb-3 pr-4 font-medium">แบรนด์</th>
                    <th className="pb-3 pr-4 font-medium">ประเภท</th>
                    <th className="pb-3 pr-4 font-medium">ความจุ</th>
                    <th className="pb-3 pr-4 font-medium">อินเทอร์เฟส</th>
                    <th className="pb-3 pr-4 font-medium">ราคาเริ่มต้น</th>
                    <th className="pb-3 pr-4 font-medium">คงเหลือ</th>
                    <th className="pb-3 pr-4 font-medium">สถานะ</th>
                    <th className="pb-3 pr-4 font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visibleItems.map((item) => (
                    <tr key={item.id} className="whitespace-nowrap">
                      <td className="py-3 pr-4 text-gray-500">{item.sku}</td>
                      <td className="max-w-xs py-3 pr-4">
                        <Link to={`/inventory/storage/${item.id}`} className="block truncate font-medium text-gray-800 hover:text-rose-500">
                          {item.name}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{item.brand}</td>
                      <td className="py-3 pr-4 text-gray-600">{item.specs.type}</td>
                      <td className="py-3 pr-4 text-gray-600">{item.specs.capacity}</td>
                      <td className="py-3 pr-4 text-gray-600">{item.specs.interface}</td>
                      <td className="py-3 pr-4 font-medium text-gray-800">{item.sellingPrice.toLocaleString()} ฿</td>
                      <td className="py-3 pr-4 text-gray-600">{item.stock} ชิ้น</td>
                      <td className="py-3 pr-4">
                        <Badge variant={getStockStatus(item.stock).variant}>{getStockStatus(item.stock).label}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/inventory/storage/${item.id}/edit`}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            aria-label="แก้ไข"
                          >
                            <FiEdit2 size={16} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
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
            กำลังแสดง 1-{visibleItems.length} จากทั้งหมด {summary.totalModels} รายการ
          </p>
        </div>
      </div>
    </main>
  )
}
