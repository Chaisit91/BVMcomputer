import { useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api'
import { USE_MOCK_DATA } from '../../lib/mockMode'

interface CatalogProduct {
  id: string
  name: string
  sku?: string
}

// Module-scoped so navigating between multiple component slots (or re-opening
// a create/edit form) on the same category doesn't re-fetch every time.
const cache = new Map<string, CatalogProduct[]>()

const MOCK_CATEGORY_LABELS: Record<string, string> = {
  cpus: 'ซีพียู',
  gpus: 'การ์ดจอ',
  motherboards: 'เมนบอร์ด',
  rams: 'แรม',
  storages: 'ฮาร์ดดิสก์/เอสเอสดี',
  cases: 'เคส',
  psus: 'พาวเวอร์ซัพพลาย',
  coolings: 'ชุดระบายความร้อน',
}

const MOCK_OPTIONS_PER_CATEGORY = 5

// USE_MOCK_DATA=true means every category's real service.ts already returns
// canned data — but ProductPicker calls the API directly (not through those
// services), so it never got the memo and always hit the (empty) real
// backend, leaving every component-picker dropdown looking broken in
// preview mode. Generate matching fake options here instead, and make sure
// whatever id is already selected (from another module's mock componentIds,
// which use a different numbering scheme) still resolves to a real option.
// `selectedLabel` is the real component name/SKU the caller already has on
// hand for the current selection (e.g. CustomBuild.components.cpu) — shown
// verbatim instead of a generic "ตัวอย่าง..." placeholder, since the whole
// point of mock preview data is to look like real records, not obviously fake ones.
function buildMockOptions(category: string, currentValue: string, selectedLabel?: string): CatalogProduct[] {
  const label = MOCK_CATEGORY_LABELS[category] ?? category
  const generated: CatalogProduct[] = Array.from({ length: MOCK_OPTIONS_PER_CATEGORY }, (_, i) => ({
    id: `mock-${category}-${i + 1}`,
    name: `ตัวอย่าง${label} #${i + 1}`,
    sku: `MOCK-${category.toUpperCase()}-${i + 1}`,
  }))
  if (currentValue && !generated.some((option) => option.id === currentValue)) {
    generated.unshift({ id: currentValue, name: selectedLabel ?? `ตัวอย่าง${label} (เลือกไว้แล้ว)` })
  }
  return generated
}

export function ProductPicker({
  category,
  value,
  onChange,
  className,
  disabled = false,
  selectedLabel,
}: {
  category: string
  value: string
  onChange: (productId: string) => void
  className?: string
  disabled?: boolean
  // Real display name for the current `value`, when the caller already
  // knows it (mock preview only — ignored against the real backend, which
  // always resolves this itself).
  selectedLabel?: string
}) {
  const mockOptions = useMemo(() => buildMockOptions(category, value, selectedLabel), [category, value, selectedLabel])
  const [options, setOptions] = useState<CatalogProduct[]>(cache.get(category) ?? [])
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(cache.has(category) ? 'success' : 'loading')

  useEffect(() => {
    if (USE_MOCK_DATA) return

    if (cache.has(category)) {
      setOptions(cache.get(category)!)
      setStatus('success')
      return
    }

    let cancelled = false
    api
      .get<CatalogProduct[]>(`/${category}`)
      .then((res) => {
        if (cancelled) return
        cache.set(category, res.data)
        setOptions(res.data)
        setStatus('success')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [category])

  if (USE_MOCK_DATA) {
    return (
      <select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className={className}>
        <option value="">-- เลือกสินค้า --</option>
        {mockOptions.map((product) => (
          <option key={product.id} value={product.id}>
            {product.sku ? `${product.name} (${product.sku})` : product.name}
          </option>
        ))}
      </select>
    )
  }

  if (status === 'error') {
    return <p className="text-xs text-red-500">โหลดรายการสินค้าไม่สำเร็จ กรุณาลองใหม่</p>
  }

  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled || status === 'loading'}
      className={className}
    >
      <option value="">{status === 'loading' ? 'กำลังโหลดสินค้า...' : '-- เลือกสินค้า --'}</option>
      {options.map((product) => (
        <option key={product.id} value={product.id}>
          {product.sku ? `${product.name} (${product.sku})` : product.name}
        </option>
      ))}
    </select>
  )
}
