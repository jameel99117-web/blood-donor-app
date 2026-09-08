/**
 * Design system — dark-first, with a complete light theme.
 *
 * Visual language (see redesign-prompt Design Direction + Refinements):
 * - Near-black base so brand red reads as urgent, not decorative.
 * - Reserve primary / primaryGlow for genuinely urgent UI (emergency CTA,
 *   high-urgency cards). Routine screens stay on surface + textSecondary.
 * - Light theme is a full second palette for daylight / older users, not a
 *   handful of inverted hexes.
 * - Pulse motion is slow and low-opacity so it stays reassuring, not noisy.
 * - Emergency Request must stay fast: these tokens do not add delay; screens
 *   should skip decorative animation on that flow.
 */

import * as Font from 'expo-font';

// ---------------------------------------------------------------------------
// Color palettes
// ---------------------------------------------------------------------------

export const darkColors = {
  background: '#0A0A0A',
  surface: '#1C1414',
  surfaceElevated: '#1C1414',
  primary: '#E24B4A',
  primaryGlow: 'rgba(255, 59, 78, 0.25)',
  textPrimary: '#F5E9EA',
  textSecondary: '#9A9A9A',
  textOnPrimary: '#FFFFFF',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F43F5E',
  border: '#3A2424',
  card: '#1C1414',
  cardBorder: '#3A2424',
  tabActive: '#E24B4A',
  tabInactive: '#6A6A6A',
  overlay: 'rgba(18, 6, 8, 0.72)',
  // Calmer red for rare, non-urgent accents on routine screens
  primaryMuted: 'rgba(255, 59, 78, 0.14)',
  pulseLine: 'rgba(245, 233, 234, 0.22)',
  urgencyLow: '#34D399',
  urgencyMedium: '#FBBF24',
  urgencyHigh: '#F43F5E',
  urgencyHighGlow: 'rgba(244, 63, 94, 0.28)',
};

/** Prompt aliases for the light page/card fills */
export const lightBackground = '#FCEDEE';
export const lightSurface = '#FFFFFF';

export const lightColors = {
  background: lightBackground,
  surface: lightSurface,
  surfaceElevated: '#FFF6F7',
  primary: '#E11D3A',
  primaryGlow: 'rgba(225, 29, 58, 0.12)',
  textPrimary: '#1C0F11',
  textSecondary: '#6F5558',
  textOnPrimary: '#FFFFFF',
  success: '#047857',
  warning: '#B45309',
  danger: '#BE123C',
  border: '#E8D4D6',
  overlay: 'rgba(28, 15, 17, 0.45)',
  primaryMuted: 'rgba(225, 29, 58, 0.08)',
  pulseLine: 'rgba(28, 15, 17, 0.12)',
  urgencyLow: '#047857',
  urgencyMedium: '#B45309',
  urgencyHigh: '#BE123C',
  urgencyHighGlow: 'rgba(190, 18, 60, 0.14)',
};

// ---------------------------------------------------------------------------
// Spacing / radius
// ---------------------------------------------------------------------------

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
};

// ---------------------------------------------------------------------------
// Typography — Manrope (health-adjacent, highly legible body; H1 is display)
// ---------------------------------------------------------------------------

export const fontFamilies = {
  regular: 'Manrope_400Regular',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extraBold: 'Manrope_800ExtraBold',
};

/**
 * Load Manrope 400/600/700/800 via expo-font.
 * Requires `@expo-google-fonts/manrope`. Call once from the root layout
 * before rendering screens (not wired in Stage 1).
 */
export async function loadThemeFonts() {
  const {
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  } = await import('@expo-google-fonts/manrope');

  await Font.loadAsync({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
}

export const typography = {
  h1: {
    fontFamily: fontFamilies.extraBold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  h2: {
    fontFamily: fontFamilies.bold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  body: {
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  caption: {
    fontFamily: fontFamilies.regular,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  button: {
    fontFamily: fontFamilies.semibold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
};

// ---------------------------------------------------------------------------
// Motion — pulse is slow + narrow opacity swing (watch 10s; should not irritate)
// ---------------------------------------------------------------------------

export const motion = {
  pulseDurationMs: 2800,
  pulseOpacityMin: 0.1,
  pulseOpacityMax: 0.26,
  entranceMs: 200,
  listStaggerMs: 60,
  pressScale: 0.95,
};

// ---------------------------------------------------------------------------
// Themes
// ---------------------------------------------------------------------------

const shared = {
  spacing,
  radius,
  typography,
  fonts: fontFamilies,
  motion,
};

export const darkTheme = {
  ...shared,
  mode: 'dark',
  colors: darkColors,
};

export const lightTheme = {
  ...shared,
  mode: 'light',
  colors: lightColors,
};

export const themes = {
  dark: darkTheme,
  light: lightTheme,
};

/**
 * Always defaults to dark theme per Design Direction.
 * Pass 'light' explicitly to get light theme.
 */
export function getTheme(scheme) {
  // Force dark theme by default — useColorScheme() returns user OS preference
  // which we don't want to use. Always default to dark unless explicitly requested.
  return scheme === 'light' ? lightTheme : darkTheme;
}

/**
 * Use this in components to force dark theme regardless of OS setting.
 */
export function getDarkTheme() {
  return darkTheme;
}

/** App default is dark-first, not light-with-a-toggle. */
export default darkTheme;
