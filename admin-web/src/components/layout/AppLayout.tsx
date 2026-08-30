import { Outlet } from 'react-router-dom'
import { Topbar } from './Topbar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <Outlet />
    </div>
  )
}
