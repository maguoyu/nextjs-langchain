export const STATUS = {
  ENABLED: 1,
  DISABLED: 0,
} as const

export const MENU_TYPE = {
  CATALOG: 'CATALOG',
  MENU: 'MENU',
  BUTTON: 'BUTTON',
} as const

export const PERMISSION_TYPE = {
  CATALOG: 'CATALOG',
  MENU: 'MENU',
  BUTTON: 'BUTTON',
} as const

export const SESSION_MAX_AGE = 60 * 60 * 24 // 24 hours in seconds

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const
