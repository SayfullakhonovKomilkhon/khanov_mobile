export const colors = {
  clay: '#EF8E38',
  blue: '#2650BB',
  teal: '#108174',
  wool: '#372F57',
  cream: '#FFF8F0',
  background: '#F8F8FF',
  surface: '#FFFFFF',
  ink: '#0A0F29',
  inkSecondary: 'rgba(10, 15, 41, 0.58)',
  inkMuted: 'rgba(10, 15, 41, 0.34)',
  border: 'rgba(55, 47, 87, 0.10)',
  success: '#00A866',
  warning: '#F5B544',
  danger: '#E25858',
  white: '#FFFFFF',
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radius = {
  sm: 12,
  md: 20,
  lg: 28,
  pill: 999,
} as const;

export const shadows = {
  card: {
    shadowColor: colors.wool,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  floating: {
    shadowColor: colors.wool,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;
