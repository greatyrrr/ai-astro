import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Text } from "react-native";
import { colors } from "../constants/theme";

interface Props {
  message?: string;
  mini?: boolean;
}

/**
 * CosmicLoader — themed loading indicator with pulsing star animation.
 * Use `mini` for inline/compact contexts (e.g. chat processing row).
 */
export default function CosmicLoader({
  message = "🔮 Reading your stars…",
  mini = false,
}: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    glow.start();
    return () => {
      pulse.stop();
      glow.stop();
    };
  }, [pulseAnim, glowAnim]);

  if (mini) {
    return (
      <View style={styles.miniRow}>
        <Animated.Text
          style={[
            styles.miniStar,
            { transform: [{ scale: pulseAnim }], opacity: glowAnim },
          ]}
        >
          ✦
        </Animated.Text>
        <Text style={styles.miniText}>{message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.star,
          {
            transform: [{ scale: pulseAnim }],
            opacity: glowAnim,
          },
        ]}
      >
        ✦
      </Animated.Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                opacity: glowAnim.interpolate
                  ? glowAnim.interpolate({
                      inputRange: [0.4, 1],
                      outputRange: [0.2 + i * 0.2, 1 - i * 0.15],
                    })
                  : glowAnim,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 32,
  },
  star: {
    fontSize: 52,
    color: colors.primary,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  miniRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
  },
  miniStar: {
    fontSize: 16,
    color: colors.primary,
  },
  miniText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
});
