import { MD3LightTheme } from "react-native-paper";

export const colors = {
  primary: "#00674F",       // deep forest green – main CTA / accent
  primaryLight: "#2D8C6F",  // lighter green – links, outlines
  primaryDark: "#004D3B",   // deep emerald – pressed states
  secondary: "#800000",     // deep maroon
  accent1: "#A0522D",       // sienna – warm earthy brown
  accent2: "#4CAF88",       // mint green – complementary vibrancy
  accent3: "#B8D8C8",       // sage teal – soft cool balance
  accent4: "#C8A96E",       // warm gold – rich contrast
  background: "#FFFFFF",    // pure white
  surface: "#F4F8F6",       // light green-tinted white
  surfaceLight: "#EDF5F1",  // card surface
  text: "#1A2B25",          // warm dark green-black
  textSecondary: "#5A7A6E", // muted green-grey
  error: "#C0392B",
  success: "#4CAF88",
  border: "#C4DDD4",        // soft green border
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    onPrimary: "#FFFFFF",
    onSurface: colors.text,
    onBackground: colors.text,
    outline: colors.border,
  },
};