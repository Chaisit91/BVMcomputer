import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { canAccess } from '../lib/permissions'
import { checkSession } from '../store/authSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

export function ProtectedRoute() {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.auth.status)
  const user = useAppSelector((state) => state.auth.user)
  const location = useLocation()

  useEffect(() => {
    if (status === 'idle') {
      dispatch(checkSession())
    }
  }, [status, dispatch])

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">
        กำลังตรวจสอบสิทธิ์...
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  if (!canAccess(user?.role, location.pathname)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
