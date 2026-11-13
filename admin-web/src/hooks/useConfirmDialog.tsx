import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

interface ConfirmOptions {
  title?: string
  confirmLabel?: string
  cancelLabel?: string
}

type ConfirmFn = (message: string, options?: ConfirmOptions) => Promise<boolean>

interface DialogState {
  message: string
  title: string
  confirmLabel?: string
  cancelLabel?: string
}

const ConfirmContext = createContext<ConfirmFn | null>(null)

// Single dialog instance for the whole app — a drop-in Promise-based
// replacement for window.confirm() so every delete/suspend confirmation
// gets the app's own styled ConfirmDialog instead of the unstyled browser
// prompt, without each page having to hold its own open/onConfirm/onCancel
// state (see Sidebar.tsx's logout confirm for that pattern, kept as-is there
// since it also tracks a `confirming` in-flight state this generic version doesn't need).
export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState | null>(null)
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((message, options) => {
    setState({ message, title: options?.title ?? 'ยืนยันการทำรายการ', confirmLabel: options?.confirmLabel, cancelLabel: options?.cancelLabel })
    return new Promise((resolve) => {
      resolveRef.current = resolve
    })
  }, [])

  const close = (result: boolean) => {
    resolveRef.current?.(result)
    setState(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={state !== null}
        title={state?.title ?? ''}
        message={state?.message ?? ''}
        confirmLabel={state?.confirmLabel}
        cancelLabel={state?.cancelLabel}
        onConfirm={() => close(true)}
        onCancel={() => close(false)}
      />
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmDialogProvider')
  return ctx
}
