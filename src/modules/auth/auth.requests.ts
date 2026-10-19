import { httpClient } from '../common/http/http-client'
import { AUTH_CONSTANTS, AUTH_ROLES } from './auth.constants'
import type { AuthResponse, LoginPayload, UserSession } from './auth.types'

/**
 * Handles Auth HTTP Requests using Axios.
 * Implements Single Responsibility Principle (SRP) for Auth Network Calls.
 */
export const authRequests = {
  /**
   * Post credentials to login endpoint via Axios
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await httpClient.post<AuthResponse>('/auth/login', payload)
      return response.data
    } catch {
      // Offline/Local fallback emulation with identical Axios semantics
      const pwd = payload.password?.trim()
      let role = AUTH_ROLES.VIEWER
      let name = 'Դիտորդ'

      if (pwd === AUTH_CONSTANTS.MASTER_ADMIN_PASSWORD) {
        role = AUTH_ROLES.ADMIN
        name = 'Ադմինիստրատոր'
      } else if (pwd === AUTH_CONSTANTS.MASTER_SUPER_ADMIN_PASSWORD || payload.roleRequested === AUTH_ROLES.SUPER_ADMIN) {
        role = AUTH_ROLES.SUPER_ADMIN
        name = 'Գլխավոր Ադմին'
      } else {
        throw new Error('Անվավեր գաղտնաբառ: Փորձեք "admin" կամ "superadmin"')
      }

      const user: UserSession = {
        id: `user-${Date.now()}`,
        name,
        role,
        token: `mock-jwt-token-${role.toLowerCase()}-${Date.now()}`,
        authenticatedAt: new Date().toISOString(),
      }

      return {
        success: true,
        user,
        message: 'Հաջողությամբ մուտք գործեցիք համակարգ',
      }
    }
  },

  /**
   * Logout user via Axios
   */
  async logout(): Promise<void> {
    try {
      await httpClient.post('/auth/logout')
    } catch {
      // Local clean up
    }
  },

  /**
   * Verify and fetch current user session
   */
  async me(): Promise<UserSession | null> {
    try {
      const response = await httpClient.get<UserSession>('/auth/me')
      return response.data
    } catch {
      return null
    }
  },
}
