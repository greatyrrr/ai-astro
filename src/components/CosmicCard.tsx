import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Pressable,
  ViewStyle,
} from "react-native";
import { colors } from "../constants/theme";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  glowColor?: string;
  noPadding?: boolean;
  disabled?: boolean;
}

/**
 * CosmicCard — the primary surface container for the dark cosmic theme.
 * Supports an optional press animation (subtle scale + border glow).
 */
export default function CosmicCard({
  children,
  style,
  onPress,
  glowColor,
  noPadding = false,
  disabled = false,
}: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const activeGlow = glowColor ?? colors.primaryDark;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.975,
        useNativeDriver: true,
        speed: 30,
        bounciness: 4,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, activeGlow],
  });

  const content = (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ scale: onPress && !disabled ? scaleAnim : 1 }],
          borderColor,
        },
        !noPadding && styles.padding,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    overflow: "hidden",
    // subtle shadow for depth
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  padding: {
    padding: 16,
  },
});
