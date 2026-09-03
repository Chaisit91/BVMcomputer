import { Outlet } from 'react-router-dom'
import { useFlashToast } from '../../lib/useFlashToast'
import { Toast } from '../ui/Toast'
import { Topbar } from './Topbar'

export function AppLayout() {
  const { toast, dismiss } = useFlashToast()

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <Outlet />
      {toast && <Toast toast={toast} onDismiss={dismiss} />}
    </div>
  )
}
