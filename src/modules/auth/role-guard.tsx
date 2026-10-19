import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './auth.context'
import { AUTH_ROLES, type AuthRole } from './auth.constants'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: AuthRole[]
  fallbackPath?: string
}

/**
 * Role-Based Route Guard.
 * Restricts route rendering to users with specific roles (e.g. SUPER_ADMIN, ADMIN).
 * If user lacks required role, redirects to fallback or unauthorized page.
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/unauthorized',
}) => {
  const { role, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-600">Ստուգվում են հասանելիության իրավունքները...</p>
        </div>
      </div>
    )
  }

  const hasAccess = allowedRoles.includes(role)

  if (!hasAccess) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />
  }

  return <>{children}</>
}

/**
 * Super Admin Route Guard shortcut
 */
export const SuperAdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RoleGuard allowedRoles={[AUTH_ROLES.SUPER_ADMIN]}>
      {children}
    </RoleGuard>
  )
}

/**
 * Admin Route Guard shortcut (Admin or SuperAdmin)
 */
export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RoleGuard allowedRoles={[AUTH_ROLES.ADMIN, AUTH_ROLES.SUPER_ADMIN]}>
      {children}
    </RoleGuard>
  )
}
