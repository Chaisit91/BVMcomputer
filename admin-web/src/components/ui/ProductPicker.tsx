import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

interface CatalogProduct {
  id: string
  name: string
  sku?: string
}

// Module-scoped so navigating between multiple component slots (or re-opening
// a create/edit form) on the same category doesn't re-fetch every time.
const cache = new Map<string, CatalogProduct[]>()

export function ProductPicker({
  category,
  value,
  onChange,
  className,
  disabled = false,
}: {
  category: string
  value: string
  onChange: (productId: string) => void
  className?: string
  disabled?: boolean
}) {
  const [options, setOptions] = useState<CatalogProduct[]>(cache.get(category) ?? [])
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(cache.has(category) ? 'success' : 'loading')

  useEffect(() => {
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
