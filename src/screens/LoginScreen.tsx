import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { TextInput, Button, Text, HelperText, Snackbar } from "react-native-paper";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { colors } from "../constants/theme";
import { mediumImpact, errorFeedback } from "../utils/haptics";

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function LoginScreen({ navigation }: Props) {
  const { login, sessionExpiredMessage, clearSessionExpiredMessage } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionBanner, setSessionBanner] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (sessionExpiredMessage) {
      setSessionBanner(sessionExpiredMessage);
      clearSessionExpiredMessage();
    }
  }, [sessionExpiredMessage, clearSessionExpiredMessage]);

  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      await errorFeedback();
      return;
    }

    setLoading(true);
    await mediumImpact();
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      await errorFeedback();
      if (!err.response) {
        setError("Server unavailable, please try again later.");
      } else {
        const msg = err.response?.data?.detail || "Login failed. Try again.";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>✦</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>
        </View>

        {/* Form card */}
        <View style={styles.formCard}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
            theme={{ colors: { onSurfaceVariant: colors.textSecondary } }}
            left={<TextInput.Icon icon="email-outline" color={colors.textSecondary} />}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
            theme={{ colors: { onSurfaceVariant: colors.textSecondary } }}
            left={<TextInput.Icon icon="lock-outline" color={colors.textSecondary} />}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                color={colors.textSecondary}
                onPress={() => setShowPassword((v) => !v)}
              />
            }
          />

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          )}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.btn}
            contentStyle={styles.btnContent}
            labelStyle={styles.btnLabel}
            buttonColor={colors.primary}
          >
            Sign In
          </Button>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            mode="outlined"
            onPress={() => navigation.navigate("SignUp")}
            style={styles.linkBtn}
            labelStyle={styles.linkLabel}
            textColor={colors.primaryLight}
          >
            Create an Account
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={!!sessionBanner}
        onDismiss={() => setSessionBanner("")}
        duration={4000}
        style={styles.sessionSnackbar}
      >
        {sessionBanner}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    alignItems: "center",
    marginBottom: 36,
    gap: 6,
  },
  logo: {
    fontSize: 36,
    color: colors.primary,
    marginBottom: 8,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  input: {
    backgroundColor: colors.surfaceLight,
  },
  errorBox: {
    backgroundColor: colors.error + "22",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.error + "55",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: "500",
  },
  btn: {
    borderRadius: 12,
    marginTop: 4,
  },
  btnContent: {
    paddingVertical: 6,
  },
  btnLabel: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  linkBtn: {
    borderRadius: 12,
    borderColor: colors.border,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  sessionSnackbar: {
    backgroundColor: colors.error,
  },
});
