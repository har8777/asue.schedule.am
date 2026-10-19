export const HTTP_CLIENT_CONSTANTS = {
  BASE_URL: '/api/v1',
  TIMEOUT_MS: 15000,
  HEADERS: {
    CONTENT_TYPE: 'application/json',
    ACCEPT: 'application/json',
  },
  STORAGE_KEYS: {
    AUTH_TOKEN: 'schedule_sys_auth_token',
    FACULTIES_DATA: 'schedule_sys_faculties_v1',
    SYSTEM_ROLES: 'schedule_sys_role_state',
  }
} as const
