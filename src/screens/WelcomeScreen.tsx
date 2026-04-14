import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import type { StackNavigationProp } from "@react-navigation/stack";
import { colors } from "../constants/theme";

type Props = {
  navigation: StackNavigationProp<any>;
};

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>✦</Text>
        <Text style={styles.title}>Astro AI</Text>
        <Text style={styles.subtitle}>
          Your personal Vedic astrology guide, powered by AI
        </Text>
      </View>

      <View style={styles.buttons}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("SignUp")}
          style={styles.btn}
          contentStyle={styles.btnContent}
          labelStyle={styles.btnLabel}
        >
          Create Account
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate("Login")}
          style={[styles.btn, styles.btnOutline]}
          contentStyle={styles.btnContent}
          labelStyle={styles.btnLabelOutline}
        >
          Sign In
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  hero: {
    alignItems: "center",
    marginBottom: 64,
  },
  logo: {
    fontSize: 72,
    color: colors.primary,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  buttons: {
    gap: 12,
  },
  btn: {
    borderRadius: 12,
  },
  btnOutline: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  btnContent: {
    paddingVertical: 6,
  },
  btnLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  btnLabelOutline: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primaryLight,
  },
});
