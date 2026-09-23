import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { FiActivity, FiCheckCircle, FiRefreshCw, FiSearch, FiXCircle } from 'react-icons/fi'
import {
  aiTestService,
  partTypes,
  type CatalogPart,
  type CompatibilityResult,
  type PartType,
  type SearchResult,
  type Selection,
} from '../../services/aiTest.service'

const labels: Record<PartType, string> = {
  cpu: 'CPU', motherboard: 'Motherboard', gpu: 'GPU', ram: 'RAM',
  cooler: 'CPU Cooler', case: 'Case', psu: 'PSU', storage: 'Storage',
}
type LoadState = 'idle' | 'loading' | 'success' | 'error'

function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error ?? error.response?.data?.message
    if (typeof message === 'string') return message
    if (!error.response) return 'เชื่อมต่อ Backend ไม่ได้ กรุณารัน run_connected_system.bat'
    return `HTTP ${error.response.status}: เรียกบริการ AI ไม่สำเร็จ`
  }
  return error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
}

function statusStyle(status: string) {
  if (status === 'compatible') return 'bg-emerald-50 text-emerald-700'
  if (status === 'incompatible') return 'bg-red-50 text-red-700'
  return 'bg-amber-50 text-amber-700'
}

export function AiTestPage() {
  const [healthState, setHealthState] = useState<LoadState>('loading')
  const [health, setHealth] = useState<{ status?: string; catalog_source?: string; catalog_counts?: Record<string, number> } | null>(null)
  const [healthError, setHealthError] = useState('')
  const [selection, setSelection] = useState<Selection>({})
  const [selectedParts, setSelectedParts] = useState<Partial<Record<PartType, CatalogPart>>>({})
  const [activePart, setActivePart] = useState<PartType>('cpu')
  const [query, setQuery] = useState('')
  const [searchState, setSearchState] = useState<LoadState>('idle')
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [searchError, setSearchError] = useState('')
  const [recommendState, setRecommendState] = useState<LoadState>('idle')
  const [recommendResult, setRecommendResult] = useState<CompatibilityResult | null>(null)
  const [recommendError, setRecommendError] = useState('')
  const [loadingMore, setLoadingMore] = useState(false)
  const searchVersion = useRef(0)

  const checkHealth = async () => {
    setHealthState('loading')
    setHealthError('')
    try {
      setHealth(await aiTestService.health())
      setHealthState('success')
    } catch (error) {
      setHealthError(errorMessage(error))
      setHealthState('error')
    }
  }

  useEffect(() => { void checkHealth() }, [])

  // Each search sends the existing build as context. The AI filters out parts
  // that cannot complete a compatible build, just like its original web UI.
  const selectionKey = partTypes.map((part) => selection[part] ?? '').join('|')
  useEffect(() => {
    searchVersion.current += 1
    if (activePart !== 'cpu' && !selection.cpu) {
      setSearchResult(null)
      setSearchState('idle')
      return
    }
    if (activePart === 'storage' && !selection.motherboard) {
      setSearchResult(null)
      setSearchState('idle')
      return
    }
    let cancelled = false
    setSearchState('loading')
    setSearchError('')
    const timer = window.setTimeout(() => {
      aiTestService.search(activePart, query.trim(), selection)
        .then((result) => {
          if (cancelled) return
          setSearchResult(result)
          setSearchState('success')
        })
        .catch((error) => {
          if (cancelled) return
          setSearchResult(null)
          setSearchError(errorMessage(error))
          setSearchState('error')
        })
    }, 250)
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [activePart, query, selectionKey])

  useEffect(() => {
    if (!selection.cpu) {
      setRecommendResult(null)
      setRecommendState('idle')
      return
    }
    let cancelled = false
    setRecommendState('loading')
    setRecommendError('')
    aiTestService.recommend(selection)
      .then((result) => {
        if (cancelled) return
        setRecommendResult(result)
        setRecommendState('success')
      })
      .catch((error) => {
        if (cancelled) return
        setRecommendResult(null)
        setRecommendError(errorMessage(error))
        setRecommendState('error')
      })
    return () => { cancelled = true }
  }, [selectionKey])

  const changePart = (part: PartType) => {
    setActivePart(part)
    setQuery('')
    setSearchResult(null)
  }

  const choosePart = (part: PartType, product: CatalogPart | null) => {
    const index = partTypes.indexOf(part)
    const nextSelection: Selection = {}
    const nextNames: Partial<Record<PartType, CatalogPart>> = {}
    // Changing an earlier part invalidates choices further down the chain.
    for (const previous of partTypes.slice(0, index)) {
      if (selection[previous]) nextSelection[previous] = selection[previous]
      if (selectedParts[previous]) nextNames[previous] = selectedParts[previous]
    }
    if (product) {
      nextSelection[part] = product.opendb_id
      nextNames[part] = product
    }
    setSelection(nextSelection)
    setSelectedParts(nextNames)
    setQuery('')
    setSearchResult(null)
    setActivePart(product && index < partTypes.length - 1 ? partTypes[index + 1] : part)
  }

  const loadMore = async () => {
    if (!searchResult?.has_more || loadingMore) return
    const part = activePart
    const version = searchVersion.current
    const offset = searchResult.offset + searchResult.items.length
    setLoadingMore(true)
    try {
      const next = await aiTestService.search(part, query.trim(), selection, offset)
      if (version !== searchVersion.current) return
      setSearchResult((current) => current && current.type === part
        ? { ...next, items: [...current.items, ...next.items], offset: 0 }
        : current)
    } catch (error) {
      setSearchError(errorMessage(error))
    } finally {
      setLoadingMore(false)
    }
  }

  const currentCount = searchResult?.count ?? 0
  const catalogTotal = health?.catalog_counts
    ? Object.values(health.catalog_counts).reduce((sum, count) => sum + count, 0)
    : 0
  const quality = recommendResult?.validation.quality

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900"><FiActivity /> ทดสอบความเข้ากันได้ของอุปกรณ์</h1>
        <p className="mt-1 text-sm text-gray-500">เลือก CPU ก่อน แล้วเลือกชิ้นส่วนที่ AI กรองว่าเข้ากันได้กับชุดปัจจุบัน</p>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {healthState === 'success' && health?.status === 'ok'
              ? <FiCheckCircle className="text-xl text-emerald-600" />
              : <FiXCircle className="text-xl text-red-500" />}
            <div>
              <p className="font-semibold text-gray-900">สถานะบริการ AI</p>
              <p className="text-sm text-gray-500">
                {healthState === 'loading' ? 'กำลังตรวจสอบ...' : healthState === 'error' ? healthError
                  : `${health?.catalog_source ?? 'ไม่ระบุแหล่งข้อมูล'} · ${catalogTotal} สินค้า`}
              </p>
            </div>
          </div>
          <button type="button" onClick={() => void checkHealth()} className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <FiRefreshCw /> ตรวจอีกครั้ง
          </button>
        </div>
        {healthState === 'success' && catalogTotal === 0 && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
            AI ยังไม่เห็นสินค้า กรุณาปิดระบบเดิมแล้วรัน run_connected_system.bat ใหม่
          </p>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]">
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {partTypes.map((part, index) => {
              const disabled = part !== 'cpu' && (!selection.cpu || (part === 'storage' && !selection.motherboard))
              return (
                <div key={part} className={`rounded-xl border p-3 ${activePart === part ? 'border-rose-300 bg-rose-50' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-center justify-between gap-1">
                    <button type="button" disabled={disabled} onClick={() => changePart(part)} className="text-left text-sm font-semibold text-gray-800 disabled:text-gray-400">
                      {index + 1}. {labels[part]}
                    </button>
                    {selection[part] && <button type="button" onClick={() => choosePart(part, null)} className="text-xs text-rose-500 hover:underline">ล้าง</button>}
                  </div>
                  <p className="mt-2 truncate text-xs text-gray-500" title={selectedParts[part]?.name}>
                    {selectedParts[part]?.name ?? (disabled ? part === 'storage' ? 'เลือก Motherboard ก่อน' : 'เลือก CPU ก่อน' : 'ยังไม่เลือก')}
                  </p>
                  {part !== 'cpu' && !disabled && selection.cpu && (
                    <p className="mt-1 text-xs text-gray-400">เข้ากันได้ {recommendResult?.compatible_counts[part] ?? '–'} รายการ</p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900">เลือก {labels[activePart]}</h2>
            <p className="mt-1 text-xs text-gray-500">
              {activePart === 'cpu' ? 'เริ่มจาก CPU ที่มีใน catalog'
                : 'แสดงเฉพาะสินค้าที่ผ่านการกรองตามอุปกรณ์ที่เลือกแล้ว'}
            </p>
            <div className="relative mt-4">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)}
                placeholder={`ค้นหาชื่อ ${labels[activePart]} หรือ Product ID`}
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-rose-400" />
            </div>
            <div className="mt-3 text-sm text-gray-500">
              {searchState === 'loading' ? 'กำลังกรองรายการ...' : searchState === 'error' ? searchError
                : searchState === 'success' ? `พบ ${currentCount} รายการ · แสดง ${searchResult?.items.length ?? 0}`
                  : 'เลือก CPU หรือ Motherboard ก่อน'}
            </div>
            {searchState === 'success' && (
              <div className="mt-3 max-h-[460px] space-y-2 overflow-y-auto">
                {searchResult?.items.length === 0 && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
                  ไม่พบสินค้าที่เข้ากันได้ ลองเปลี่ยนคำค้นหาหรือเลือกชิ้นส่วนก่อนหน้าใหม่
                </p>}
                {searchResult?.items.map((item) => (
                  <button key={item.opendb_id} type="button" onClick={() => choosePart(activePart, item)}
                    className="w-full rounded-xl border border-gray-100 p-3 text-left hover:border-rose-300 hover:bg-rose-50">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="mt-1 text-xs text-gray-500">{item.manufacturer} · {item.opendb_id}</p>
                  </button>
                ))}
                {searchResult?.has_more && <button type="button" onClick={() => void loadMore()} disabled={loadingMore}
                  className="w-full rounded-xl border border-gray-200 p-2 text-sm text-gray-700 disabled:opacity-50">
                  {loadingMore ? 'กำลังโหลด...' : 'แสดงเพิ่มเติม'}
                </button>}
              </div>
            )}
          </div>
        </section>

        <section className="h-fit rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">ผลตรวจความเข้ากันได้</h2>
          {recommendState === 'idle' && <p className="mt-3 text-sm text-gray-500">เลือก CPU เพื่อเริ่มตรวจ</p>}
          {recommendState === 'loading' && <p className="mt-3 text-sm text-blue-600">กำลังตรวจชุดอุปกรณ์...</p>}
          {recommendState === 'error' && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{recommendError}</p>}
          {recommendState === 'success' && recommendResult && (
            <div className="mt-4 space-y-4">
              <div className={`rounded-xl p-4 ${statusStyle(recommendResult.validation.status)}`}>
                <p className="font-semibold">{quality?.label} · {quality?.score}/100</p>
                <p className="mt-1 text-xs">เลือกแล้ว {quality?.selected_parts}/{quality?.total_part_types} หมวด</p>
                <p className="mt-2 text-xs">{quality?.note}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                <p>Socket CPU: {recommendResult.constraints.cpu_socket || 'ไม่ระบุ'}</p>
                <p>กำลัง PSU ที่แนะนำ: {recommendResult.constraints.recommended_psu_watts ?? 'ไม่ระบุ'} W</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">เงื่อนไขที่ตรวจ</h3>
                {recommendResult.validation.checks.length === 0
                  ? <p className="mt-2 text-sm text-gray-500">เลือกชิ้นส่วนเพิ่มเพื่อดูผลตรวจรายคู่</p>
                  : <div className="mt-2 space-y-2">{recommendResult.validation.checks.map((check, index) => (
                    <div key={`${check.rule ?? 'check'}-${index}`} className="rounded-xl border border-gray-100 p-3 text-sm">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusStyle(check.status)}`}>{check.status}</span>
                      <p className="mt-2 text-gray-700">{check.reason}</p>
                    </div>
                  ))}</div>}
              </div>
              <details className="text-sm text-gray-600">
                <summary className="cursor-pointer font-medium">ข้อจำกัดของข้อมูลที่ตรวจได้</summary>
                <ul className="mt-2 list-disc space-y-1 pl-5">{recommendResult.validation.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
              </details>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
