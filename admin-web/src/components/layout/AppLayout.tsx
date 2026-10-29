import { Outlet } from 'react-router-dom'
import { useFlashToast } from '../../lib/useFlashToast'
import { Toast } from '../ui/Toast'
import { Topbar } from './Topbar'

export function AppLayout() {
  const { toast, dismiss } = useFlashToast()

  return (
    <div className="app-backdrop min-h-screen">
      <Topbar />
      <Outlet />
      {toast && <Toast toast={toast} onDismiss={dismiss} />}
    </div>
  )
}
