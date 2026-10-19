import { AUTH_CONSTANTS, AUTH_ROLES, type AuthRole } from './auth.constants'
import { authRequests } from './auth.requests'
import type { LoginPayload, UserSession } from './auth.types'

/**
 * Service managing user authentication state and permissions.
 * SOLID Principle: Single Responsibility for authorization business logic.
 */
class AuthService {
  private static instance: AuthService

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  public getStoredSession(): UserSession {
    try {
      const stored = localStorage.getItem(AUTH_CONSTANTS.SESSION_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (e) {
      console.error('Failed reading session', e)
    }

    return this.getDefaultViewerSession()
  }

  public getDefaultViewerSession(): UserSession {
    return {
      id: 'viewer-guest',
      name: 'Դիտորդ (Հյուր)',
      role: AUTH_ROLES.VIEWER,
      token: '',
      authenticatedAt: new Date().toISOString(),
    }
  }

  public async login(payload: LoginPayload): Promise<UserSession> {
    const response = await authRequests.login(payload)
    if (response.success && response.user) {
      localStorage.setItem(AUTH_CONSTANTS.SESSION_STORAGE_KEY, JSON.stringify(response.user))
      localStorage.setItem(AUTH_CONSTANTS.TOKEN_STORAGE_KEY, response.user.token)
      return response.user
    }
    throw new Error(response.message || 'Մուտքը ձախողվեց')
  }

  public async logout(): Promise<UserSession> {
    await authRequests.logout()
    localStorage.removeItem(AUTH_CONSTANTS.SESSION_STORAGE_KEY)
    localStorage.removeItem(AUTH_CONSTANTS.TOKEN_STORAGE_KEY)
    return this.getDefaultViewerSession()
  }

  public canEdit(role: AuthRole): boolean {
    return role === AUTH_ROLES.ADMIN || role === AUTH_ROLES.SUPER_ADMIN
  }

  public isSuperAdmin(role: AuthRole): boolean {
    return role === AUTH_ROLES.SUPER_ADMIN
  }

  public isAdmin(role: AuthRole): boolean {
    return role === AUTH_ROLES.ADMIN
  }

  public isViewer(role: AuthRole): boolean {
    return role === AUTH_ROLES.VIEWER
  }
}

export const authService = AuthService.getInstance()
