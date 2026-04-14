import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

/**
 * Light impact — use for button presses, taps.
 */
export async function lightImpact(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Haptics not available on all devices — fail silently
  }
}

/**
 * Medium impact — use for significant actions (submit, send).
 */
export async function mediumImpact(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Haptics not available on all devices — fail silently
  }
}

/**
 * Selection feedback — use for selection changes, toggles.
 */
export async function selectionFeedback(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Haptics.selectionAsync();
  } catch {
    // Haptics not available on all devices — fail silently
  }
}

/**
 * Success notification — use for successful operations.
 */
export async function successFeedback(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Haptics not available on all devices — fail silently
  }
}

/**
 * Error notification — use for failed operations / validation errors.
 */
export async function errorFeedback(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // Haptics not available on all devices — fail silently
  }
}
