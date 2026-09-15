import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { ToastMessage } from '../components/ui/Toast'

// Reads a one-shot toast passed via navigate(to, { state: { toast } }) — used
// when a save redirects to a different page but should still confirm success
// there. Clears the flash from history state right after showing it, so a
// refresh or back-navigation doesn't replay the same toast.
export function useFlashToast() {
  const location = useLocation()
  const navigate = useNavigate()
  const [toast, setToast] = useState<ToastMessage | null>(null)

  useEffect(() => {
    const state = location.state as { toast?: ToastMessage } | null
    if (state?.toast) {
      setToast(state.toast)
      navigate(location.pathname, { replace: true, state: {} })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  return { toast, dismiss: () => setToast(null) }
}
