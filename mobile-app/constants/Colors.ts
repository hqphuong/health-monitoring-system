/**
 * HealthGuard App - Color Palette
 * Primary: Bach Khoa HCM Blue
 */

export const Colors = {
  // Primary - Bach Khoa Blue
  primary: {
    main: '#1E3A8A',       // Navy Blue - màu chính
    light: '#3B82F6',      // Blue 500 - màu nhạt hơn
    lighter: '#60A5FA',    // Blue 400 - highlights
    dark: '#1E40AF',       // Blue 800 - màu đậm hơn
    darker: '#172554',     // Blue 950 - màu rất đậm
  },

  // Secondary - Accent colors
  secondary: {
    teal: '#14B8A6',       // Teal - cho health metrics
    green: '#22C55E',      // Green - success, healthy
    orange: '#F97316',     // Orange - warnings
    red: '#EF4444',        // Red - alerts, danger
    purple: '#8B5CF6',     // Purple - sleep metrics
  },

  // Neutral - Backgrounds & Text
  neutral: {
    white: '#FFFFFF',
    background: '#F8FAFC', // Slate 50 - main background
    card: '#FFFFFF',       // Card background
    border: '#E2E8F0',     // Slate 200 - borders
    disabled: '#CBD5E1',   // Slate 300 - disabled elements
    placeholder: '#94A3B8', // Slate 400 - placeholder text
    textSecondary: '#64748B', // Slate 500 - secondary text
    textPrimary: '#1E293B',   // Slate 800 - primary text
    black: '#0F172A',      // Slate 900 - darkest
  },

  // Status colors
  status: {
    success: '#22C55E',
    successLight: '#DCFCE7',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
  },

  // Health metrics colors
  health: {
    heartRate: '#EF4444',
    steps: '#22C55E',
    sleep: '#8B5CF6',
    calories: '#F97316',
    water: '#06B6D4',
    stress: '#F59E0B',
    oxygen: '#3B82F6',
  },

  // Gradients (for use with LinearGradient)
  gradients: {
    primary: ['#1E3A8A', '#3B82F6'],
    primaryDark: ['#172554', '#1E3A8A'],
    success: ['#16A34A', '#22C55E'],
    warning: ['#D97706', '#F59E0B'],
    danger: ['#DC2626', '#EF4444'],
  },

  // Dark mode (for future implementation)
  dark: {
    background: '#0F172A',
    card: '#1E293B',
    border: '#334155',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
  },
} as const;

// Typography
export const Typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Border Radius
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Shadows
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
