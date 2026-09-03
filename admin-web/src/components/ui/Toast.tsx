import { useEffect, useState } from 'react'
import { FiCheckCircle, FiXCircle } from 'react-icons/fi'

export interface ToastMessage {
  type: 'success' | 'error'
  message: string
}

interface ToastProps {
  toast: ToastMessage
  onDismiss: () => void
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 10)
    const hideTimer = setTimeout(onDismiss, 3000)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [onDismiss])

  const isSuccess = toast.type === 'success'

  return (
    <div
      role="status"
      className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-xl transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isSuccess ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
        }`}
      >
        {isSuccess ? <FiCheckCircle size={18} /> : <FiXCircle size={18} />}
      </span>
      <p className="text-sm font-medium text-gray-800">{toast.message}</p>
    </div>
  )
}
