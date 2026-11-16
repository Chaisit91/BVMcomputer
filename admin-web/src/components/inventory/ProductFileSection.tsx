import { useEffect, useRef, useState } from 'react'
import { FiBox, FiTrash2, FiUpload } from 'react-icons/fi'
import { useConfirm } from '../../hooks/useConfirmDialog'

interface FileItem {
  id: string
  url: string
  label: string
}

interface ProductFileSectionProps<T> {
  productId?: string
  readOnly?: boolean
  title: string
  description: string
  emptyLabel: string
  savePrompt: string
  accept?: string
  previewAsImage?: boolean
  inputId: string
  confirmDeleteLabel: (label: string) => string
  // Create pages have no productId yet — files are held here until the
  // product is saved, then uploaded in one batch (see onSubmit in each
  // CreatePage). Edit pages pass productId instead and skip staging entirely.
  stagedFiles?: File[]
  onStagedFilesChange?: (files: File[]) => void
  list: (productId: string) => Promise<T[]>
  upload: (productId: string, files: File[]) => Promise<T[]>
  remove: (productId: string, id: string) => Promise<void>
  toItem: (value: T) => FileItem
}

export function ProductFileSection<T>({
  productId,
  readOnly = false,
  title,
  description,
  emptyLabel,
  savePrompt,
  accept,
  previewAsImage = false,
  inputId,
  confirmDeleteLabel,
  stagedFiles,
  onStagedFilesChange,
  list,
  upload,
  remove,
  toItem,
}: ProductFileSectionProps<T>) {
  const [items, setItems] = useState<FileItem[]>([])
  const [busy, setBusy] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const confirm = useConfirm()
  const staging = !productId && onStagedFilesChange !== undefined

  useEffect(() => {
    if (!productId) return
    let cancelled = false
    list(productId).then((result) => {
      if (!cancelled) setItems(result.map(toItem))
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    if (staging) {
      onStagedFilesChange!([...(stagedFiles ?? []), ...Array.from(files)])
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (!productId) return
    setBusy(true)
    try {
      const created = await upload(productId, Array.from(files))
      setItems((prev) => [...prev, ...created.map(toItem)])
    } finally {
      setBusy(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveStaged = (file: File) => {
    onStagedFilesChange!((stagedFiles ?? []).filter((f) => f !== file))
  }

  const handleDelete = async (item: FileItem) => {
    if (!productId) return
    if (!(await confirm(confirmDeleteLabel(item.label)))) return
    await remove(productId, item.id)
    setItems((prev) => prev.filter((i) => i.id !== item.id))
  }

  const nothingYet = staging ? (stagedFiles ?? []).length === 0 : items.length === 0

  return (
    <section className="card p-5">
      <h2 className="mb-1 text-sm font-semibold text-gray-800">{title}</h2>
      <p className="mb-4 text-xs text-gray-400">{description}</p>

      {!productId && !staging ? (
        <p className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-center text-xs text-gray-400">
          {savePrompt}
        </p>
      ) : (
        <>
          {nothingYet && <p className="mb-2 text-xs text-gray-400">{emptyLabel}</p>}

          {previewAsImage ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {staging
                ? (stagedFiles ?? []).map((file, index) => (
                    <div key={`${file.name}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                      <img src={URL.createObjectURL(file)} alt={file.name} className="h-full w-full object-cover" />
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStaged(file)}
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))
                : items.map((item) => (
                    <div key={item.id} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                      <img src={item.url} alt={item.label} className="h-full w-full object-cover" />
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
            </div>
          ) : (
            <div className="space-y-2">
              {(staging ? (stagedFiles ?? []).map((f) => ({ id: f.name, url: '', label: f.name })) : items).map(
                (item) => (
                  <div key={item.id} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                    <FiBox className="shrink-0 text-gray-400" size={16} />
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noreferrer" className="flex-1 truncate text-sm text-gray-600 hover:underline">
                        {item.label}
                      </a>
                    ) : (
                      <span className="flex-1 truncate text-sm text-gray-600">{item.label}</span>
                    )}
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() =>
                          staging
                            ? handleRemoveStaged((stagedFiles ?? []).find((f) => f.name === item.id)!)
                            : handleDelete(item)
                        }
                        className="shrink-0 text-gray-400 hover:text-rose-500"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                ),
              )}
            </div>
          )}

          {!readOnly && (
            <>
              <input
                ref={fileInputRef}
                id={inputId}
                type="file"
                multiple
                accept={accept}
                className="hidden"
                onChange={(event) => handleFilesSelected(event.target.files)}
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:bg-gray-50 disabled:cursor-default disabled:opacity-60"
              >
                <FiUpload size={14} /> {busy ? 'กำลังอัปโหลด...' : 'อัปโหลดไฟล์'}
              </button>
            </>
          )}
        </>
      )}
    </section>
  )
}
