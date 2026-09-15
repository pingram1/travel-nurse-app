/**
 * Careflow design tokens — premium clinical UI for travel clinicians.
 * Inspired by Material 3 Expressive motion/shape, SDS soft surfaces,
 * and healthcare app patterns (bright azure, pill chrome, soft elevation).
 * 8px grid · 60-30-10 color balance · min touch 44×44.
 */
export const COLORS = {
  medical: {
    50: '#eef5ff',
    100: '#dcecff',
    200: '#c2dcff',
    300: '#93c0ff',
    400: '#5a9dff',
    500: '#4894fe',
    600: '#2f7ae8',
    700: '#1f63c9',
    800: '#1a4f9e',
    900: '#163f7c',
  },
  clinical: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    600: '#0e9f6e',
    700: '#047857',
  },
  semantic: {
    success: '#0e9f6e',
    warning: '#e8a317',
    error: '#e5484d',
    info: '#4894fe',
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
    canvas: '#f2f6fc',
    mist: '#e8f0fb',
    dark: '#0b1f38',
  },
} as const;

export const BRAND = {
  primary: COLORS.medical[500],
  primaryDark: COLORS.medical[700],
  accent: COLORS.clinical[600],
  tabInactive: COLORS.neutral[400],
  tabActiveBg: COLORS.medical[100],
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
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

/** Soft blue-tinted elevations — avoid flat gray “prototype” shadows. */
export const SHADOWS = {
  card: {
    shadowColor: '#2f7ae8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
  featured: {
    shadowColor: '#1f63c9',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.32,
    shadowRadius: 24,
    elevation: 10,
  },
  soft: {
    shadowColor: '#163f7c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  press: {
    shadowColor: '#2f7ae8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 1,
  },
} as const;

export const MOTION = {
  spring: { damping: 16, stiffness: 380, mass: 0.6 },
  springSoft: { damping: 18, stiffness: 220, mass: 0.8 },
  pressScale: 0.97,
} as const;
