import { useEffect, useMemo, useState } from 'react'
import { FiBox, FiCheckCircle, FiEdit2, FiPlus, FiSlash, FiTrash2, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Badge } from '../../../components/ui/Badge'
import { SummaryCard } from '../../../components/ui/SummaryCard'
import { deleteMotherboard, getMotherboardSummary, getMotherboards } from '../../../services/motherboard.service'
import type { Motherboard, MotherboardSummary } from '../../../types/motherboard'

type LoadStatus = 'loading' | 'error' | 'success'

const brandFacet = ['ASROCK', 'ASUS', 'COLORFUL', 'GIGABYTE', 'MSI', 'COLORFIRE']
const cpuSupportFacet = [
  '12th Gen Intel Core', '13th Gen Intel Core', '14th Gen Intel Core', 'Intel Core Ultra',
  'AMD Ryzen 3000 Series', 'AMD Ryzen 3000G Series', 'AMD Ryzen 4000 Series', 'AMD Ryzen 4000G Series',
  'AMD Ryzen 5000 Series', 'AMD Ryzen 5000G Series', 'AMD Ryzen 7000 Series', 'AMD Ryzen 8000 Series', 'AMD Ryzen 9000 Series',
]
const socketFacet = ['AM4', 'AM5', 'LGA 1700', 'LGA 1851']
const chipsetFacet = [
  'Intel H610', 'AMD A520', 'Intel Z790', 'Intel B760', 'AMD B650', 'AMD X870',
  'Intel Z890', 'Intel B860', 'AMD B850', 'Intel H810', 'AMD A620A', 'AMD B840',
]
const mainboardSupportFacet = ['ATX', 'Micro-ATX', 'Mini-ITX']
const memorySlotsFacet = ['2x DIMM', '4x DIMM']
const memoryTypeFacet = ['DDR5', 'DDR4']
const maxMemoryFacet = ['64GB', '96GB', '128GB', '192GB', '256GB']
const formFactorFacet = ['ATX', 'Mini-ITX', 'Micro-ATX']

const LOW_STOCK_THRESHOLD = 5

function getStockStatus(stock: number): { label: string; variant: 'success' | 'warning' | 'danger' } {
  if (stock === 0) return { label: 'สินค้าหมด', variant: 'danger' }
  if (stock <= LOW_STOCK_THRESHOLD) return { label: 'ใกล้หมด', variant: 'warning' }
  return { label: 'พร้อมจำหน่าย', variant: 'success' }
}

interface ExtraFilterDef {
  key: string
  title: string
  getValue: (mb: Motherboard) => string
}

const extraFilterDefs: ExtraFilterDef[] = [
  { key: 'stockStatus', title: 'สถานะสต็อก', getValue: (mb) => getStockStatus(mb.stock).label },
  { key: 'maxMemorySpeed', title: 'ความเร็วแรมสูงสุด', getValue: (mb) => mb.specs.maxMemorySpeed },
  { key: 'm2Slots', title: 'สล็อต M.2', getValue: (mb) => mb.specs.m2Slots },
  { key: 'pcieSlots', title: 'สล็อต PCIe x16', getValue: (mb) => mb.specs.pcieSlots },
  { key: 'usbPorts', title: 'ช่องต่อ USB', getValue: (mb) => mb.specs.usbPorts },
  { key: 'audio', title: 'ชิปเสียง', getValue: (mb) => mb.specs.audio },
  { key: 'lan', title: 'LAN', getValue: (mb) => mb.specs.lan },
  { key: 'wifi', title: 'WiFi', getValue: (mb) => mb.specs.wifi },
  { key: 'bluetooth', title: 'Bluetooth', getValue: (mb) => mb.specs.bluetooth },
  { key: 'warranty', title: 'ระยะเวลารับประกัน', getValue: (mb) => mb.specs.warranty },
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

export function MotherboardListPage() {
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [summary, setSummary] = useState<MotherboardSummary | null>(null)
  const [motherboards, setMotherboards] = useState<Motherboard[]>([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'newest' | 'price_asc' | 'price_desc' | 'stock_desc'>('newest')

  const brands = useToggleSet()
  const cpuSupports = useToggleSet()
  const sockets = useToggleSet()
  const chipsets = useToggleSet()
  const mainboardSupports = useToggleSet()
  const memorySlots = useToggleSet()
  const memoryTypes = useToggleSet()
  const maxMemories = useToggleSet()
  const formFactors = useToggleSet()

  const [addedFilterKeys, setAddedFilterKeys] = useState<string[]>([])
  const [addedSelections, setAddedSelections] = useState<Record<string, Set<string>>>({})
  const [showAddMenu, setShowAddMenu] = useState(false)

  useEffect(() => {
    let cancelled = false

    Promise.all([getMotherboardSummary(), getMotherboards()])
      .then(([summaryResult, mbResult]) => {
        if (!cancelled) {
          setSummary(summaryResult)
          setMotherboards(mbResult)
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
    cpuSupports.clear()
    sockets.clear()
    chipsets.clear()
    mainboardSupports.clear()
    memorySlots.clear()
    memoryTypes.clear()
    maxMemories.clear()
    formFactors.clear()
    setAddedSelections((prev) => {
      const cleared: Record<string, Set<string>> = {}
      for (const key of Object.keys(prev)) cleared[key] = new Set()
      return cleared
    })
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('ยืนยันการลบเมนบอร์ดนี้?')) return
    await deleteMotherboard(id)
    setMotherboards((prev) => prev.filter((mb) => mb.id !== id))
  }

  const availableToAdd = extraFilterDefs.filter((def) => !addedFilterKeys.includes(def.key))

  const optionsByKey = useMemo(() => {
    const map: Record<string, string[]> = {}
    for (const def of extraFilterDefs) {
      map[def.key] = Array.from(new Set(motherboards.map(def.getValue).filter(Boolean))).sort()
    }
    return map
  }, [motherboards])

  const visibleMotherboards = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = motherboards.filter((mb) => {
      const matchesSearch =
        query === '' || mb.name.toLowerCase().includes(query) || mb.sku.toLowerCase().includes(query)
      const matchesBrand = brands.selected.size === 0 || brands.selected.has(mb.brand)
      const matchesCpu = cpuSupports.selected.size === 0 || cpuSupports.selected.has(mb.specs.cpuSupport)
      const matchesSocket = sockets.selected.size === 0 || sockets.selected.has(mb.specs.socket)
      const matchesChipset = chipsets.selected.size === 0 || chipsets.selected.has(mb.specs.chipset)
      const matchesSupport =
        mainboardSupports.selected.size === 0 || mainboardSupports.selected.has(mb.specs.mainboardSupport)
      const matchesSlots = memorySlots.selected.size === 0 || memorySlots.selected.has(mb.specs.memorySlots)
      const matchesMemType = memoryTypes.selected.size === 0 || memoryTypes.selected.has(mb.specs.memoryType)
      const matchesMaxMem = maxMemories.selected.size === 0 || maxMemories.selected.has(mb.specs.maxMemory)
      const matchesForm = formFactors.selected.size === 0 || formFactors.selected.has(mb.specs.formFactor)
      const matchesAdded = addedFilterKeys.every((key) => {
        const def = extraFilterDefs.find((item) => item.key === key)
        const selected = addedSelections[key] ?? new Set<string>()
        if (!def || selected.size === 0) return true
        return selected.has(def.getValue(mb))
      })
      return (
        matchesSearch &&
        matchesBrand &&
        matchesCpu &&
        matchesSocket &&
        matchesChipset &&
        matchesSupport &&
        matchesSlots &&
        matchesMemType &&
        matchesMaxMem &&
        matchesForm &&
        matchesAdded
      )
    })

    const sorted = [...filtered]
    if (sort === 'price_asc') sorted.sort((a, b) => a.sellingPrice - b.sellingPrice)
    if (sort === 'price_desc') sorted.sort((a, b) => b.sellingPrice - a.sellingPrice)
    if (sort === 'stock_desc') sorted.sort((a, b) => b.stock - a.stock)
    return sorted
  }, [
    motherboards,
    search,
    sort,
    brands.selected,
    cpuSupports.selected,
    sockets.selected,
    chipsets.selected,
    mainboardSupports.selected,
    memorySlots.selected,
    memoryTypes.selected,
    maxMemories.selected,
    formFactors.selected,
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
        <h1 className="text-xl font-bold text-gray-900">เมนบอร์ด (Motherboard)</h1>
        <Link
          to="/inventory/motherboard/new"
          className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
        >
          <FiPlus size={16} />
          เพิ่มสินค้าใหม่
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="จำนวนแบบรุ่นทั้งหมด" value={`${summary.totalModels} รุ่น`} icon={<FiBox />} tone="rose" />
        <SummaryCard label="คงเหลือทั้งหมด" value={`${summary.totalStock} ชิ้น`} icon={<FiCheckCircle />} tone="emerald" />
        <SummaryCard label="สินค้าใกล้หมดสต็อก" value={`${summary.lowStock} รายการ`} icon={<FiPlus />} tone="amber" />
        <SummaryCard label="สินค้าที่หมดสต็อก" value={`${summary.outOfStock} รายการ`} icon={<FiSlash />} tone="gray" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="ค้นหาเมนบอร์ด รุ่น หรือ ID..."
          className="min-w-[220px] flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as typeof sort)}
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-rose-400"
        >
          <option value="newest">เรียงตาม: ล่าสุด</option>
          <option value="price_asc">ราคาต่ำ-สูง</option>
          <option value="price_desc">ราคาสูง-ต่ำ</option>
          <option value="stock_desc">คงเหลือมากสุด</option>
        </select>
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
          <FilterGroup title="CPU Support" options={cpuSupportFacet} selected={cpuSupports.selected} onToggle={cpuSupports.toggle} />
          <FilterGroup title="ซ็อกเก็ต (CPU Socket)" options={socketFacet} selected={sockets.selected} onToggle={sockets.toggle} />
          <FilterGroup title="ชิปเซ็ต (Chipset)" options={chipsetFacet} selected={chipsets.selected} onToggle={chipsets.toggle} />
          <FilterGroup
            title="Mainboard Support"
            options={mainboardSupportFacet}
            selected={mainboardSupports.selected}
            onToggle={mainboardSupports.toggle}
          />
          <FilterGroup
            title="ช่องเสียบ (Memory Slots)"
            options={memorySlotsFacet}
            selected={memorySlots.selected}
            onToggle={memorySlots.toggle}
          />
          <FilterGroup
            title="ประเภทแรม (Memory Type)"
            options={memoryTypeFacet}
            selected={memoryTypes.selected}
            onToggle={memoryTypes.toggle}
          />
          <FilterGroup
            title="แรมสูงสุด (Max Memory)"
            options={maxMemoryFacet}
            selected={maxMemories.selected}
            onToggle={maxMemories.toggle}
          />
          <FilterGroup
            title="ฟอร์มแฟคเตอร์ (Form Factor)"
            options={formFactorFacet}
            selected={formFactors.selected}
            onToggle={formFactors.toggle}
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
          <h2 className="mb-4 text-sm font-semibold text-gray-800">รายการเมนบอร์ดทั้งหมดที่รองรับเครื่องใช้</h2>
          {visibleMotherboards.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">ไม่พบสินค้าที่ค้นหา</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="whitespace-nowrap text-xs text-gray-400">
                    <th className="pb-3 pr-4 font-medium">รหัส</th>
                    <th className="pb-3 pr-4 font-medium">ชื่อสินค้า</th>
                    <th className="pb-3 pr-4 font-medium">แบรนด์</th>
                    <th className="pb-3 pr-4 font-medium">ชิปเซ็ต</th>
                    <th className="pb-3 pr-4 font-medium">ซ็อกเก็ต</th>
                    <th className="pb-3 pr-4 font-medium">ราคาเริ่มต้น</th>
                    <th className="pb-3 pr-4 font-medium">คงเหลือ</th>
                    <th className="pb-3 pr-4 font-medium">สถานะ</th>
                    <th className="pb-3 pr-4 font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visibleMotherboards.map((mb) => (
                    <tr key={mb.id} className="whitespace-nowrap">
                      <td className="py-3 pr-4 font-medium text-gray-800">{mb.sku}</td>
                      <td className="max-w-xs truncate py-3 pr-4">
                        <Link to={`/inventory/motherboard/${mb.id}`} className="text-gray-800 hover:text-rose-500">
                          {mb.name}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{mb.brand}</td>
                      <td className="py-3 pr-4 text-gray-600">{mb.specs.chipset}</td>
                      <td className="py-3 pr-4 text-gray-600">{mb.specs.socket}</td>
                      <td className="py-3 pr-4 font-medium text-gray-800">{mb.sellingPrice.toLocaleString()} ฿</td>
                      <td className="py-3 pr-4 text-gray-600">{mb.stock} ชิ้น</td>
                      <td className="py-3 pr-4">
                        <Badge variant={getStockStatus(mb.stock).variant}>{getStockStatus(mb.stock).label}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/inventory/motherboard/${mb.id}/edit`}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            aria-label="แก้ไข"
                          >
                            <FiEdit2 size={16} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(mb.id)}
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
            กำลังแสดง 1-{visibleMotherboards.length} จากทั้งหมด {summary.totalModels} รายการ
          </p>
        </div>
      </div>
    </main>
  )
}
