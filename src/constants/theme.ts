/**
 * Enterprise healthcare design tokens — 8px grid, 60-30-10 color rule.
 * 60% sterile neutrals, 30% deep medical blue, 10% clinical green accents.
 */
export const COLORS = {
  medical: {
    50: '#f0f6fb',
    100: '#dceaf5',
    200: '#b5d2e9',
    400: '#5292c6',
    500: '#2e74ac',
    600: '#1c5a8d',
    700: '#154569',
    900: '#091e2e',
  },
  clinical: {
    50: '#ecfdf5',
    100: '#d1fae5',
    600: '#0e9f6e',
    700: '#047857',
  },
  semantic: {
    success: '#0e9f6e',
    warning: '#d97706',
    error: '#dc2626',
    info: '#2e74ac',
  },
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    400: '#94a3b8',
    500: '#64748b',
    700: '#334155',
    900: '#0f172a',
  },
  surface: {
    light: '#ffffff',
    canvas: '#f4f8fb',
    dark: '#091e2e',
  },
} as const;

export const BRAND = {
  primary: COLORS.medical[600],
  primaryDark: COLORS.medical[700],
  accent: COLORS.clinical[600],
  tabInactive: COLORS.neutral[500],
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
