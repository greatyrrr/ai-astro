import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { TextInput, Button, Text, HelperText } from "react-native-paper";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { colors } from "../constants/theme";

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(d: Date): string {
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export default function SignUpScreen({ navigation }: Props) {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [birthTime, setBirthTime] = useState<Date | null>(null);
  const [birthLocation, setBirthLocation] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setBirthDate(selectedDate);
  };

  const onTimeChange = (_event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) setBirthTime(selectedTime);
  };

  const handleSignUp = async () => {
    setError("");

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("All fields are required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!birthDate) {
      setError("Date of birth is required");
      return;
    }
    if (!birthTime) {
      setError("Time of birth is required");
      return;
    }
    if (!birthLocation.trim()) {
      setError("Place of birth is required");
      return;
    }

    setLoading(true);
    try {
      await register(
        email.trim(),
        password,
        name.trim(),
        formatDate(birthDate),
        formatTime(birthTime),
        birthLocation.trim()
      );
      // hasProfile = true → RootNavigator renders AppNavigator → ChartTab
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || "Registration failed. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start your astrological journey</Text>

        <View style={styles.form}>
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
          />

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
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword((v) => !v)}
              />
            }
          />

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={!showConfirm}
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
            right={
              <TextInput.Icon
                icon={showConfirm ? "eye-off" : "eye"}
                onPress={() => setShowConfirm((v) => !v)}
              />
            }
          />

          {/* Date of Birth */}
          {Platform.OS === "web" ? (
            <View>
              <Text style={styles.fieldLabel}>Date of Birth</Text>
              {/* @ts-ignore */}
              <input
                type="date"
                value={birthDate ? formatDate(birthDate) : ""}
                onChange={(e: any) => {
                  const parts = e.target.value.split("-");
                  if (parts.length === 3) {
                    setBirthDate(new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
                  }
                }}
                max={formatDate(new Date())}
                style={{
                  width: "100%",
                  padding: "12px",
                  boxSizing: "border-box",
                  borderRadius: "4px",
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.text,
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
              />
            </View>
          ) : (
            <>
              <View style={styles.pickerWrapper}>
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  style={styles.pickerPressable}
                >
                  <TextInput
                    label="Date of Birth"
                    value={birthDate ? formatDate(birthDate) : ""}
                    placeholder="Select date"
                    mode="outlined"
                    style={styles.input}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                    textColor={colors.text}
                    editable={false}
                    pointerEvents="none"
                    right={<TextInput.Icon icon="calendar" />}
                  />
                </Pressable>
              </View>
              {showDatePicker && (
                <DateTimePicker
                  value={birthDate ?? new Date(2000, 0, 1)}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}
            </>
          )}

          {/* Time of Birth */}
          {Platform.OS === "web" ? (
            <View>
              <Text style={styles.fieldLabel}>Time of Birth</Text>
              {/* @ts-ignore */}
              <input
                type="time"
                value={birthTime ? formatTime(birthTime) : ""}
                onChange={(e: any) => {
                  const parts = e.target.value.split(":");
                  if (parts.length >= 2) {
                    const d = new Date();
                    d.setHours(Number(parts[0]), Number(parts[1]), 0, 0);
                    setBirthTime(d);
                  }
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  boxSizing: "border-box",
                  borderRadius: "4px",
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.text,
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
              />
            </View>
          ) : (
            <>
              <View style={styles.pickerWrapper}>
                <Pressable
                  onPress={() => setShowTimePicker(true)}
                  style={styles.pickerPressable}
                >
                  <TextInput
                    label="Time of Birth"
                    value={birthTime ? formatTime(birthTime) : ""}
                    placeholder="Select time (HH:MM)"
                    mode="outlined"
                    style={styles.input}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                    textColor={colors.text}
                    editable={false}
                    pointerEvents="none"
                    right={<TextInput.Icon icon="clock-outline" />}
                  />
                </Pressable>
              </View>
              {showTimePicker && (
                <DateTimePicker
                  value={birthTime ?? new Date()}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onTimeChange}
                  is24Hour={true}
                />
              )}
            </>
          )}

          {/* Place of Birth */}
          <TextInput
            label="Place of Birth"
            value={birthLocation}
            onChangeText={setBirthLocation}
            placeholder="City, Country"
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
          />

          {!!error && (
            <HelperText type="error" visible>
              {error}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleSignUp}
            loading={loading}
            disabled={loading}
            style={styles.btn}
            contentStyle={styles.btnContent}
            labelStyle={styles.btnLabel}
          >
            Create Account
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate("Login")}
            labelStyle={styles.linkLabel}
          >
            Already have an account? Sign In
          </Button>
        </View>
      </ScrollView>
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
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: colors.surface,
  },
  pickerWrapper: {
    position: "relative",
  },
  pickerPressable: {
    width: "100%",
  },
  fieldLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: 4,
  },
  btn: {
    borderRadius: 12,
    marginTop: 8,
  },
  btnContent: {
    paddingVertical: 6,
  },
  btnLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  linkLabel: {
    color: colors.primaryLight,
    fontSize: 14,
  },
});
