export const AUTH_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  VIEWER: 'VIEWER', // Client role
} as const

export type AuthRole = (typeof AUTH_ROLES)[keyof typeof AUTH_ROLES]

export const AUTH_CONSTANTS = {
  MASTER_ADMIN_PASSWORD: 'admin',
  MASTER_SUPER_ADMIN_PASSWORD: 'superadmin',
  SESSION_STORAGE_KEY: 'academic_schedule_auth_user',
  TOKEN_STORAGE_KEY: 'academic_schedule_auth_token',
  ROLE_LABELS: {
    SUPER_ADMIN: 'Գլխավոր Ադմինիստրատոր (Super Admin)',
    ADMIN: 'Ադմինիստրատոր (Admin)',
    VIEWER: 'Դիտորդ / Ուսանող (Viewer)',
  },
  ROLE_DESCRIPTIONS: {
    SUPER_ADMIN: 'Ամբողջական հասանելիություն՝ ֆակուլտետների, լսարանների և դասացուցակների կառավարում',
    ADMIN: 'Դասացուցակների խմբագրում, դասախոսների և առարկաների ավելացում',
    VIEWER: 'Միայն դիտման ռեժիմ (Read-only)',
  }
} as const
