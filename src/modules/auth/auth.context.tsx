import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { AUTH_ROLES, type AuthRole } from './auth.constants'
import { authService } from './auth.service'
import type { UserSession, LoginPayload } from './auth.types'

interface AuthContextValue {
  user: UserSession
  role: AuthRole
  canEdit: boolean
  isSuperAdmin: boolean
  isAdmin: boolean
  isViewer: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<UserSession>
  logout: () => Promise<void>
  quickSwitchRole: (role: AuthRole) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession>(() => authService.getStoredSession())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const current = authService.getStoredSession()
    setUser(current)
  }, [])

  const login = async (payload: LoginPayload): Promise<UserSession> => {
    setIsLoading(true)
    try {
      const authenticatedUser = await authService.login(payload)
      setUser(authenticatedUser)
      return authenticatedUser
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const viewer = await authService.logout()
      setUser(viewer)
    } finally {
      setIsLoading(false)
    }
  }

  const quickSwitchRole = (newRole: AuthRole) => {
    let name = 'Դիտորդ'
    if (newRole === AUTH_ROLES.SUPER_ADMIN) name = 'Գլխավոր Ադմին'
    if (newRole === AUTH_ROLES.ADMIN) name = 'Ադմինիստրատոր'

    const updatedUser: UserSession = {
      id: `user-${newRole.toLowerCase()}`,
      name,
      role: newRole,
      token: `token-${newRole.toLowerCase()}`,
      authenticatedAt: new Date().toISOString(),
    }
    localStorage.setItem('academic_schedule_auth_user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  const value: AuthContextValue = {
    user,
    role: user.role,
    canEdit: authService.canEdit(user.role),
    isSuperAdmin: authService.isSuperAdmin(user.role),
    isAdmin: authService.isAdmin(user.role),
    isViewer: authService.isViewer(user.role),
    isLoading,
    login,
    logout,
    quickSwitchRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
