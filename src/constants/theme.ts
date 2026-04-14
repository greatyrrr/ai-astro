import { MD3LightTheme } from "react-native-paper";

export const colors = {
  // Core backgrounds — warm cream / parchment
  background: "#FAF7F2",       // warm cream base
  surface: "#F4EFE6",          // parchment card surface
  surfaceLight: "#EDE6DA",     // elevated card / alt rows
  surfaceElevated: "#E5DDD0",  // modals / popovers

  // Brand colors — emerald green + maroon
  primary: "#00674F",          // deep emerald — main CTA / accent
  primaryLight: "#2E8B6F",     // sage green — links, outlines
  primaryDark: "#004D3A",      // forest — pressed states
  secondary: "#800000",        // rich maroon — highlights
  secondaryLight: "#A52929",   // crimson — shimmer / hover
  secondaryDark: "#5C0000",    // deep burgundy

  // Supporting accents
  accent1: "#B8860B",          // antique gold — chart elements, badges
  accent1Light: "#D4A843",     // warm gold highlight
  accent2: "#C1440E",          // terracotta — decorative / warm contrast
  accent3: "#4A6741",          // moss green — muted green sibling
  accent4: "#7A5230",          // warm umber — earthy neutral accent

  // Text — warm browns, not cold grays
  text: "#1C1410",             // warm near-black
  textSecondary: "#6B5B4E",    // muted earth tone
  textMuted: "#A0907E",        // very muted — hints

  // System
  error: "#C0392B",
  success: "#2E7D52",
  border: "#D4C9BC",           // warm neutral border
  borderGlow: "#00674F",       // glowing border on focus/hover
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceLight,
    error: colors.error,
    onPrimary: "#FFFFFF",
    onSecondary: "#FFFFFF",
    onSurface: colors.text,
    onBackground: colors.text,
    outline: colors.border,
    elevation: {
      level0: "transparent",
      level1: colors.surface,
      level2: colors.surfaceLight,
      level3: colors.surfaceElevated,
      level4: colors.surfaceElevated,
      level5: colors.surfaceElevated,
    },
  },
};