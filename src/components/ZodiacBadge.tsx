import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { colors } from "../constants/theme";

const ZODIAC_MAP: Record<string, { symbol: string; color: string }> = {
  Aries:       { symbol: "♈", color: "#E74C3C" },
  Taurus:      { symbol: "♉", color: "#27AE60" },
  Gemini:      { symbol: "♊", color: "#F39C12" },
  Cancer:      { symbol: "♋", color: "#3498DB" },
  Leo:         { symbol: "♌", color: "#E67E22" },
  Virgo:       { symbol: "♍", color: "#8E44AD" },
  Libra:       { symbol: "♎", color: "#1ABC9C" },
  Scorpio:     { symbol: "♏", color: "#C0392B" },
  Sagittarius: { symbol: "♐", color: "#D35400" },
  Capricorn:   { symbol: "♑", color: "#2C3E50" },
  Aquarius:    { symbol: "♒", color: "#2980B9" },
  Pisces:      { symbol: "♓", color: "#8E44AD" },
};

interface Props {
  sign: string;
  label?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * ZodiacBadge — displays a zodiac symbol + sign name
 * in a pill-shaped badge with sign-specific color accent.
 */
export default function ZodiacBadge({ sign, label, size = "md" }: Props) {
  const zodiac = ZODIAC_MAP[sign] ?? { symbol: "✦", color: colors.primary };

  const symbolSize = size === "lg" ? 32 : size === "sm" ? 16 : 22;
  const labelFontSize = size === "lg" ? 15 : size === "sm" ? 11 : 13;
  const signFontSize = size === "lg" ? 18 : size === "sm" ? 13 : 15;

  return (
    <View style={styles.container}>
      {/* Symbol circle */}
      <View
        style={[
          styles.symbolCircle,
          {
            backgroundColor: zodiac.color + "22", // 13% opacity tint
            borderColor: zodiac.color + "66",      // 40% opacity border
            width: symbolSize + 16,
            height: symbolSize + 16,
            borderRadius: (symbolSize + 16) / 2,
          },
        ]}
      >
        <Text style={[styles.symbol, { fontSize: symbolSize, color: zodiac.color }]}>
          {zodiac.symbol}
        </Text>
      </View>

      {/* Labels */}
      <View style={styles.labels}>
        {label && (
          <Text style={[styles.label, { fontSize: labelFontSize }]}>{label}</Text>
        )}
        <Text
          style={[
            styles.sign,
            { fontSize: signFontSize, color: zodiac.color },
          ]}
        >
          {sign}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  symbolCircle: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  symbol: {
    textAlign: "center",
  },
  labels: {
    gap: 2,
  },
  label: {
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "500",
  },
  sign: {
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
