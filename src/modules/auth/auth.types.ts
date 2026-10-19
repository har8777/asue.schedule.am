import type { AuthRole } from './auth.constants'

export interface UserSession {
  id: string
  name: string
  role: AuthRole
  token: string
  authenticatedAt: string
}

export interface LoginPayload {
  password?: string
  roleRequested?: AuthRole
}

export interface AuthResponse {
  success: boolean
  user: UserSession
  message?: string
}
