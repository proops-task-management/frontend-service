import { ReactNode, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { token, user } = useAuth()
  const { showToast } = useToast()
  const location = useLocation()
  const isForbidden = !!allowedRoles && (!user || !allowedRoles.includes(user.role))

  useEffect(() => {
    if (isForbidden) {
      showToast('You do not have permission to access that page.', 'error')
    }
  }, [isForbidden, showToast])

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (isForbidden) {
    return <Navigate to="/tasks" replace />
  }
  return <>{children}</>
}
