import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { checkSession } from '../store/authSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

export function ProtectedRoute() {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.auth.status)

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

  return <Outlet />
}
