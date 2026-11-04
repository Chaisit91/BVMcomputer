import { FiAlertTriangle } from 'react-icons/fi'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirming?: boolean
  onConfirm: () => void
  onCancel: () => void
}

// Shared by every "are you sure?" moment (currently: logout) — a real modal
// with its own animation instead of the browser's native confirm(), which
// can't be styled or animated at all.
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  confirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fade-in bg-black/80" onClick={onCancel} />
      <div className="card relative w-full max-w-sm animate-modal-in p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <FiAlertTriangle size={20} />
          </span>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        </div>
        <p className="mb-6 text-sm text-gray-500">{message}</p>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary" disabled={confirming}>
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className="btn-primary" disabled={confirming}>
            {confirming ? 'กำลังออกจากระบบ...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
