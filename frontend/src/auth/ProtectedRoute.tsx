import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './auth-context'
import { ui } from '../ui'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className={`flex items-center justify-center ${ui.page}`}>Loading...</div>
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
