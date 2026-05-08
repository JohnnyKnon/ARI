/**
 * Copyright © BZ'NEXA. All rights reserved.
 * ARI Platform - React Native 테마 설정
 * ARI_STYLE_sheet.md 기반 통일 디자인 시스템
 */

// ──── 브랜드 컬러 팔레트 ────
export const colors = {
  // Primary
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryDark: '#5B21B6',
  primarySoft: '#EDE9FE',

  // Secondary
  coral: '#F97316',
  teal: '#14B8A6',
  rose: '#F43F5E',

  // Semantic
  success: '#22C55E',
  warning: '#EAB308',
  error: '#EF4444',
  info: '#3B82F6',

  // Neutral (Light Mode)
  gray900: '#111827',
  gray700: '#374151',
  gray500: '#6B7280',
  gray300: '#D1D5DB',
  gray100: '#F3F4F6',
  white: '#FFFFFF',

  // Dark Mode
  dark: {
    bgPrimary: '#0F0F1A',
    bgSecondary: '#1A1A2E',
    bgTertiary: '#252540',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
  },
} as const;

// ──── 타이포그래피 (Pretendard) ────
export const typography = {
  fontFamily: 'Pretendard',
  sizes: {
    display: 28,
    h1: 22,
    h2: 18,
    h3: 16,
    body: 14,
    bodySmall: 12,
    caption: 11,
    button: 14,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    display: 36,
    h1: 30,
    h2: 25,
    h3: 22,
    body: 22,
    bodySmall: 18,
    caption: 15,
  },
} as const;

// ──── 간격 ────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// ──── 라운딩 ────
export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ──── 그림자 ────
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

// ──── 라이트/다크 테마 ────
export const lightTheme = {
  colors: {
    background: colors.white,
    surface: colors.gray100,
    text: colors.gray900,
    textSecondary: colors.gray700,
    textTertiary: colors.gray500,
    border: colors.gray300,
    ...colors,
  },
} as const;

export const darkTheme = {
  colors: {
    background: colors.dark.bgPrimary,
    surface: colors.dark.bgSecondary,
    text: colors.dark.textPrimary,
    textSecondary: colors.dark.textSecondary,
    textTertiary: colors.gray500,
    border: colors.dark.border,
    ...colors,
  },
} as const;

export type Theme = typeof lightTheme | typeof darkTheme;
