import { Outlet } from 'react-router-dom'
import { useFlashToast } from '../../lib/useFlashToast'
import { useAppSelector } from '../../store/hooks'
import { Toast } from '../ui/Toast'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

// super_admin spans every department at once, so it keeps the horizontal
// Topbar with its dropdowns; every single-department role gets a sidebar
// pulling in just that one department's own pages instead.
export function AppLayout() {
  const { toast, dismiss } = useFlashToast()
  const isSuperAdmin = useAppSelector((state) => state.auth.user?.role === 'super_admin')

  return (
    <div className="app-backdrop min-h-screen">
      {isSuperAdmin ? (
        <>
          <Topbar />
          <Outlet />
        </>
      ) : (
        <div className="md:flex md:min-h-screen">
          <Sidebar />
          <div className="min-w-0 flex-1">
            <Outlet />
          </div>
        </div>
      )}
      {toast && <Toast toast={toast} onDismiss={dismiss} />}
    </div>
  )
}
