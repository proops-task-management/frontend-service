import { ReactNode, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { token, user } = useAuth()
  const location = useLocation()
  const isForbidden = !!allowedRoles && (!user || !allowedRoles.includes(user.role))

  useEffect(() => {
    if (isForbidden) {
      toast.error('You do not have permission to access that page.')
    }
  }, [isForbidden])

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (isForbidden) {
    return <Navigate to="/tasks" replace />
  }
  return <>{children}</>
}
