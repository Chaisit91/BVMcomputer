import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { FiCheckCircle } from 'react-icons/fi'

interface PendingDeleteState {
  message: string
  onUndo: () => void
}

type ScheduleDeleteFn = (message: string, performDelete: () => Promise<unknown>, onUndo: () => void) => void

const PendingDeleteContext = createContext<ScheduleDeleteFn | null>(null)

const UNDO_WINDOW_MS = 5000

// Lightweight "undo" for in-place deletes (row stays removed from view
// immediately, the real DELETE call is only fired after this window) instead
// of a full soft-delete/trash-bin system — see conversation: no real
// accidental-deletion incident has happened yet to justify that bigger build.
// ponytail: only the most recent pending delete is tracked/shown — deleting a
// second row within the 5s window silently drops the first one's undo option
// (its timer still fires and deletes it on schedule, just with no more toast
// to undo from). Upgrade to a queue if that turns out to matter in practice.
export function PendingDeleteProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PendingDeleteState | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const scheduleDelete = useCallback<ScheduleDeleteFn>((message, performDelete, onUndo) => {
    setState({ message, onUndo })
    timerRef.current = setTimeout(() => {
      setState(null)
      void performDelete()
    }, UNDO_WINDOW_MS)
  }, [])

  const handleUndo = () => {
    clearTimeout(timerRef.current)
    state?.onUndo()
    setState(null)
  }

  return (
    <PendingDeleteContext.Provider value={scheduleDelete}>
      {children}
      {state && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-xl">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
            <FiCheckCircle size={18} />
          </span>
          <p className="text-sm font-medium text-gray-800">{state.message}</p>
          <button type="button" onClick={handleUndo} className="text-sm font-semibold text-rose-500 hover:text-rose-600">
            เลิกทำ
          </button>
        </div>
      )}
    </PendingDeleteContext.Provider>
  )
}

export function useScheduleDelete(): ScheduleDeleteFn {
  const ctx = useContext(PendingDeleteContext)
  if (!ctx) throw new Error('useScheduleDelete must be used within PendingDeleteProvider')
  return ctx
}
