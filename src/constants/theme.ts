/**
 * Design tokens — 8px grid, 60-30-10 color rule (see using-ui-stack skill).
 */
export const COLORS = {
  brand: {
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    accent: '#0ea5e9',
  },
  semantic: {
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
    info: '#2563eb',
  },
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    500: '#64748b',
    700: '#334155',
    900: '#0f172a',
  },
  surface: {
    light: '#ffffff',
    dark: '#0f172a',
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const TYPOGRAPHY = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
} as const;

export const TOUCH_TARGET_MIN = 44;
