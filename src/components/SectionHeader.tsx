import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { colors } from "../constants/theme";

interface Props {
  title: string;
  icon?: string;
  accent?: string;
}

/**
 * SectionHeader — card section title with an emoji/icon prefix
 * and a coloured underline accent bar.
 */
export default function SectionHeader({ title, icon, accent }: Props) {
  const barColor = accent ?? colors.primary;
  return (
    <View style={styles.container}>
      <View style={[styles.accentBar, { backgroundColor: barColor }]} />
      <View style={styles.row}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    gap: 8,
  },
  accentBar: {
    height: 2,
    width: 32,
    borderRadius: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.2,
  },
});
