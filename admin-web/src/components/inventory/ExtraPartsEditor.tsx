import { FiPlus, FiX } from 'react-icons/fi'
import type { PromoSetExtraPart } from '../../types/promoSet'

interface ExtraPartsEditorProps {
  parts: PromoSetExtraPart[]
  onChange: (parts: PromoSetExtraPart[]) => void
  readOnly?: boolean
}

export function ExtraPartsEditor({ parts, onChange, readOnly = false }: ExtraPartsEditorProps) {
  const addPart = () => {
    onChange([...parts, { id: crypto.randomUUID(), name: '', value: '' }])
  }

  const updatePart = (id: string, field: 'name' | 'value', text: string) => {
    onChange(parts.map((part) => (part.id === id ? { ...part, [field]: text } : part)))
  }

  const removePart = (id: string) => {
    onChange(parts.filter((part) => part.id !== id))
  }

  if (readOnly && parts.length === 0) {
    return <p className="text-xs text-gray-400">ไม่มีอุปกรณ์เสริมอื่นๆ</p>
  }

  return (
    <div className="space-y-3">
      {parts.map((part) => (
        <div key={part.id} className="flex items-center gap-3">
          <input
            type="text"
            disabled={readOnly}
            value={part.name}
            onChange={(event) => updatePart(part.id, 'name', event.target.value)}
            placeholder="ชื่ออุปกรณ์ เช่น เมาส์เกมมิ่ง"
            className="w-40 shrink-0 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 disabled:cursor-default disabled:text-gray-500"
          />
          <input
            type="text"
            disabled={readOnly}
            value={part.value}
            onChange={(event) => updatePart(part.id, 'value', event.target.value)}
            placeholder="ค้นหาหรือเลือก..."
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 disabled:cursor-default disabled:text-gray-500"
          />
          {!readOnly && (
            <button
              type="button"
              onClick={() => removePart(part.id)}
              className="text-gray-400 hover:text-rose-500"
              aria-label="ลบอุปกรณ์เสริม"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      ))}
      {!readOnly && (
        <button type="button" onClick={addPart} className="flex items-center gap-1 text-sm text-rose-500 hover:underline">
          <FiPlus size={14} /> เพิ่มอุปกรณ์เสริมอื่นๆ
        </button>
      )}
    </div>
  )
}
