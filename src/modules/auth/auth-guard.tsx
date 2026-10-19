import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './auth.context'
import { AUTH_ROLES } from './auth.constants'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

/**
 * Basic authentication guard.
 * If requireAuth is true and user is in VIEWER mode, redirects to schedule or triggers login modal.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = false }) => {
  const { role } = useAuth()
  const location = useLocation()

  if (requireAuth && role === AUTH_ROLES.VIEWER) {
    return <Navigate to="/" state={{ from: location, requireLogin: true }} replace />
  }

  return <>{children}</>
}
