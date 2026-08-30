import { useEffect, useMemo, useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Badge } from '../../../components/ui/Badge'
import { deleteGpu, getGpuSummary, getGpus } from '../../../services/gpu.service'
import type { Gpu, GpuStatus, GpuSummary } from '../../../types/gpu'

type LoadStatus = 'loading' | 'error' | 'success'

const brandFacet = ['ASUS', 'GIGABYTE', 'MSI', 'SAPPHIRE', 'POWERCOLOR', 'GALAX', 'ZOTAC', 'EVGA', 'PALIT', 'INNO3D']
const seriesFacet = [
  'NVIDIA GeForce RTX 40 Series',
  'NVIDIA GeForce RTX 30 Series',
  'AMD Radeon RX 7000 Series',
  'AMD Radeon RX 6000 Series',
]
const modelFacet = [
  'RTX 4090', 'RTX 4080', 'RTX 4070 Ti Super', 'RTX 4070 Ti', 'RTX 4070', 'RTX 4060 Ti', 'RTX 4060', 'RTX 3060',
  'RX 7900 XTX', 'RX 7900 XT', 'RX 7800 XT', 'RX 7600',
]
const memorySizeFacet = ['24GB', '16GB', '12GB', '8GB']
const powerRequirementFacet = ['850W', '750W', '650W', '550W']
const pcieInterfaceFacet = ['PCIe 4.0 x16', 'PCIe 3.0 x16']

const statusMap: Record<GpuStatus, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  available: { label: 'พร้อมจำหน่าย', variant: 'success' },
  preorder: { label: 'ของหมดสั่งจอง', variant: 'warning' },
  discontinued: { label: 'เลิกจำหน่าย', variant: 'danger' },
}

interface ExtraFilterDef {
  key: string
  title: string
  getValue: (gpu: Gpu) => string
}

const extraFilterDefs: ExtraFilterDef[] = [
  { key: 'status', title: 'สถานะ', getValue: (gpu) => statusMap[gpu.status].label },
  { key: 'baseClock', title: 'Base Clock', getValue: (gpu) => gpu.specs.baseClock },
  { key: 'memoryClock', title: 'Memory Clock', getValue: (gpu) => gpu.specs.memoryClock },
  { key: 'memoryInterface', title: 'Memory Interface', getValue: (gpu) => gpu.specs.memoryInterface },
  { key: 'hdmiPort', title: 'HDMI Port', getValue: (gpu) => gpu.specs.hdmiPort },
  { key: 'displayPort', title: 'Display Port', getValue: (gpu) => gpu.specs.displayPort },
  { key: 'powerConnector', title: 'Power Connector', getValue: (gpu) => gpu.specs.powerConnector },
  { key: 'warranty', title: 'Warranty', getValue: (gpu) => gpu.specs.warranty },
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

export function GpuListPage() {
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [summary, setSummary] = useState<GpuSummary | null>(null)
  const [gpus, setGpus] = useState<Gpu[]>([])
  const [search, setSearch] = useState('')

  const brands = useToggleSet()
  const series = useToggleSet()
  const models = useToggleSet()
  const memorySizes = useToggleSet()
  const powerRequirements = useToggleSet()
  const pcieInterfaces = useToggleSet()

  const [addedFilterKeys, setAddedFilterKeys] = useState<string[]>([])
  const [addedSelections, setAddedSelections] = useState<Record<string, Set<string>>>({})
  const [showAddMenu, setShowAddMenu] = useState(false)

  useEffect(() => {
    let cancelled = false

    Promise.all([getGpuSummary(), getGpus()])
      .then(([summaryResult, gpusResult]) => {
        if (!cancelled) {
          setSummary(summaryResult)
          setGpus(gpusResult)
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
    models.clear()
    memorySizes.clear()
    powerRequirements.clear()
    pcieInterfaces.clear()
    setAddedSelections((prev) => {
      const cleared: Record<string, Set<string>> = {}
      for (const key of Object.keys(prev)) cleared[key] = new Set()
      return cleared
    })
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('ยืนยันการลบการ์ดจอนี้?')) return
    await deleteGpu(id)
    setGpus((prev) => prev.filter((gpu) => gpu.id !== id))
  }

  const availableToAdd = extraFilterDefs.filter((def) => !addedFilterKeys.includes(def.key))

  const optionsByKey = useMemo(() => {
    const map: Record<string, string[]> = {}
    for (const def of extraFilterDefs) {
      map[def.key] = Array.from(new Set(gpus.map(def.getValue).filter(Boolean))).sort()
    }
    return map
  }, [gpus])

  const visibleGpus = useMemo(() => {
    const query = search.trim().toLowerCase()
    return gpus.filter((gpu) => {
      const matchesSearch =
        query === '' || gpu.name.toLowerCase().includes(query) || gpu.sku.toLowerCase().includes(query)
      const matchesBrand = brands.selected.size === 0 || brands.selected.has(gpu.brand)
      const matchesSeries = series.selected.size === 0 || series.selected.has(gpu.series)
      const matchesModel = models.selected.size === 0 || models.selected.has(gpu.model)
      const matchesMemory = memorySizes.selected.size === 0 || memorySizes.selected.has(gpu.memorySize)
      const matchesPower =
        powerRequirements.selected.size === 0 || powerRequirements.selected.has(gpu.specs.powerRequirement)
      const matchesInterface =
        pcieInterfaces.selected.size === 0 || pcieInterfaces.selected.has(gpu.specs.pcieInterface)
      const matchesAdded = addedFilterKeys.every((key) => {
        const def = extraFilterDefs.find((item) => item.key === key)
        const selected = addedSelections[key] ?? new Set<string>()
        if (!def || selected.size === 0) return true
        return selected.has(def.getValue(gpu))
      })
      return (
        matchesSearch &&
        matchesBrand &&
        matchesSeries &&
        matchesModel &&
        matchesMemory &&
        matchesPower &&
        matchesInterface &&
        matchesAdded
      )
    })
  }, [
    gpus,
    search,
    brands.selected,
    series.selected,
    models.selected,
    memorySizes.selected,
    powerRequirements.selected,
    pcieInterfaces.selected,
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
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">การ์ดจอทั้งหมดในคลัง</h1>
          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-500">
            {summary.total} รายการ
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาชื่อสินค้า หรือ SKU..."
            className="min-w-[220px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
          <Link
            to="/inventory/gpu/new"
            className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
          >
            <FiPlus size={16} />
            เพิ่มการ์ดจอใหม่
          </Link>
        </div>
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
          <FilterGroup title="GPU Series" options={seriesFacet} selected={series.selected} onToggle={series.toggle} />
          <FilterGroup title="GPU Model" options={modelFacet} selected={models.selected} onToggle={models.toggle} />
          <FilterGroup
            title="Memory Size"
            options={memorySizeFacet}
            selected={memorySizes.selected}
            onToggle={memorySizes.toggle}
          />
          <FilterGroup
            title="Power Requirement"
            options={powerRequirementFacet}
            selected={powerRequirements.selected}
            onToggle={powerRequirements.toggle}
          />
          <FilterGroup
            title="Interface"
            options={pcieInterfaceFacet}
            selected={pcieInterfaces.selected}
            onToggle={pcieInterfaces.toggle}
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
          {visibleGpus.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">ไม่พบสินค้าที่ค้นหา</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="whitespace-nowrap text-xs text-gray-400">
                    <th className="pb-3 pr-4 font-medium">ชื่อสินค้า</th>
                    <th className="pb-3 pr-4 font-medium">ยี่ห้อ</th>
                    <th className="pb-3 pr-4 font-medium">รุ่นชิปเซ็ต</th>
                    <th className="pb-3 pr-4 font-medium">ราคา</th>
                    <th className="pb-3 pr-4 font-medium">คงเหลือ</th>
                    <th className="pb-3 pr-4 font-medium">สถานะ</th>
                    <th className="pb-3 pr-4 font-medium">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visibleGpus.map((gpu) => (
                    <tr key={gpu.id}>
                      <td className="max-w-xs py-3 pr-4">
                        <Link to={`/inventory/gpu/${gpu.id}`} className="block truncate font-medium text-gray-800 hover:text-rose-500">
                          {gpu.name}
                        </Link>
                        <span className="text-xs text-gray-400">ID: {gpu.sku}</span>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{gpu.brand}</td>
                      <td className="py-3 pr-4 text-gray-600">{gpu.chipsetModel}</td>
                      <td className="whitespace-nowrap py-3 pr-4 font-medium text-gray-800">
                        {gpu.price.toLocaleString()} ฿
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4">
                        <span className={`flex items-center gap-1.5 ${gpu.stock > 0 ? 'text-gray-600' : 'text-rose-500'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${gpu.stock > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          {gpu.stock} ชิ้น
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4">
                        <Badge variant={statusMap[gpu.status].variant}>{statusMap[gpu.status].label}</Badge>
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/inventory/gpu/${gpu.id}/edit`}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            aria-label="แก้ไข"
                          >
                            <FiEdit2 size={16} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(gpu.id)}
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
            แสดงสินค้า 1-{visibleGpus.length} จากทั้งหมด {summary.total} รายการ
          </p>
        </div>
      </div>
    </main>
  )
}
