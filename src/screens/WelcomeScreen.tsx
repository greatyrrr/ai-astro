import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Button, Text } from "react-native-paper";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../constants/theme";

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function WelcomeScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const starAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade + slide in hero
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 10,
        bounciness: 6,
      }),
    ]).start();

    // Pulse the star logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(starAnim, {
          toValue: 1.15,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(starAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Decorative background stars */}
      <View style={styles.bgStar1} />
      <View style={styles.bgStar2} />
      <View style={styles.bgStar3} />
      <View style={styles.bgStar4} />

      <Animated.View
        style={[
          styles.hero,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Glowing logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoGlow} />
          <Animated.Text
            style={[styles.logo, { transform: [{ scale: starAnim }] }]}
          >
            ✦
          </Animated.Text>
        </View>

        <Text style={styles.title}>Astro AI</Text>
        <Text style={styles.tagline}>Vedic · AI · Cosmic</Text>
        <Text style={styles.subtitle}>
          Your personal Vedic astrology guide, powered by AI
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.buttons,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Button
          mode="contained"
          onPress={() => navigation.navigate("SignUp")}
          style={styles.btn}
          contentStyle={styles.btnContent}
          labelStyle={styles.btnLabel}
          buttonColor={colors.primary}
        >
          Create Account
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate("Login")}
          style={[styles.btn, styles.btnOutline]}
          contentStyle={styles.btnContent}
          labelStyle={styles.btnLabelOutline}
          textColor={colors.primaryLight}
        >
          Sign In
        </Button>

        {/* Decorative divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>guided by the stars</Text>
          <View style={styles.dividerLine} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    paddingHorizontal: 32,
    overflow: "hidden",
  },
  // --- Decorative bg dots ---
  bgStar1: {
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primaryLight,
    opacity: 0.5,
    top: "15%",
    left: "10%",
  },
  bgStar2: {
    position: "absolute",
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.secondary,
    opacity: 0.6,
    top: "25%",
    right: "18%",
  },
  bgStar3: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    opacity: 0.3,
    bottom: "30%",
    left: "20%",
  },
  bgStar4: {
    position: "absolute",
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.secondaryLight,
    opacity: 0.4,
    bottom: "20%",
    right: "12%",
  },
  // --- Hero ---
  hero: {
    alignItems: "center",
    marginBottom: 56,
  },
  logoContainer: {
    position: "relative",
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoGlow: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primaryDark,
    opacity: 0.35,
  },
  logo: {
    fontSize: 64,
    color: colors.primary,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  title: {
    fontSize: 38,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: 1,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 12,
    color: colors.secondary,
    letterSpacing: 4,
    textTransform: "uppercase",
    marginBottom: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  // --- Buttons ---
  buttons: {
    gap: 12,
  },
  btn: {
    borderRadius: 14,
  },
  btnContent: {
    paddingVertical: 7,
  },
  btnLabel: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  btnOutline: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  btnLabelOutline: {
    fontSize: 16,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
});
