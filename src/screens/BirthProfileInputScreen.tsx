import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { TextInput, Button, Text, HelperText } from "react-native-paper";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useRoute } from "@react-navigation/native";
import { createBirthProfile } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import type { BirthProfile } from "../types";
import { colors } from "../constants/theme";

const GENDER_OPTIONS = ["Male", "Female", "Other"] as const;

function parseDateString(dateStr: string): Date | null {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function parseTimeString(timeStr: string): Date | null {
  const parts = timeStr.split(":");
  if (parts.length < 2) return null;
  const d = new Date();
  d.setHours(Number(parts[0]), Number(parts[1]), 0, 0);
  return d;
}

type Props = {
  navigation: StackNavigationProp<any>;
};

export default function BirthProfileInputScreen({ navigation }: Props) {
  const route = useRoute();
  const { setHasProfile } = useAuth();
  const existingProfile = (route.params as { profile?: BirthProfile })?.profile;
  const isEditMode = !!existingProfile;

  const [fullName, setFullName] = useState(existingProfile?.full_name ?? "");
  const [gender, setGender] = useState(existingProfile?.gender ?? "");
  const [birthDate, setBirthDate] = useState<Date | null>(
    existingProfile?.birth_date ? parseDateString(existingProfile.birth_date) : null
  );
  const [birthTime, setBirthTime] = useState<Date | null>(
    existingProfile?.birth_time ? parseTimeString(existingProfile.birth_time) : null
  );
  const [birthLocation, setBirthLocation] = useState(existingProfile?.birth_location ?? "");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTime = (d: Date) => {
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setBirthDate(selectedDate);
  };

  const onTimeChange = (_event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) setBirthTime(selectedTime);
  };

  const validate = (): string | null => {
    if (!fullName.trim()) return "Full name is required";
    if (!gender) return "Please select a gender";
    if (!birthDate) return "Date of birth is required";
    if (!birthTime) return "Time of birth is required";
    if (!birthLocation.trim()) return "Place of birth is required";
    return null;
  };

  const handleSubmit = async () => {
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const profile = await createBirthProfile({
        full_name: fullName.trim(),
        gender,
        birth_date: formatDate(birthDate!),
        birth_time: formatTime(birthTime!),
        birth_location: birthLocation.trim(),
      });
      if (isEditMode) {
        navigation.goBack();
      } else {
        setHasProfile(true);
        (navigation as any).navigate("ChartPreview", { profile });
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || "Failed to create profile. Try again.";
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
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {isEditMode ? "Edit Birth Details" : "Tell us about your birth"}
        </Text>
        <Text style={styles.subtitle}>
          {isEditMode
            ? "Update your details to regenerate your Vedic birth chart"
            : "We'll generate your Vedic birth chart from this information"}
        </Text>

        <View style={styles.form}>
          {/* Full Name */}
          <TextInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
          />

          {/* Gender Picker */}
          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.genderRow}>
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.genderOption,
                  gender === option && styles.genderOptionSelected,
                ]}
                onPress={() => setGender(option)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === option && styles.genderTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date of Birth */}
          {Platform.OS === "web" ? (
            <View>
              <Text style={styles.fieldLabel}>Date of Birth</Text>
              {/* @ts-ignore - web input element */}
              <input
                type="date"
                value={birthDate ? formatDate(birthDate) : ""}
                onChange={(e: any) => {
                  const date = parseDateString(e.target.value);
                  if (date) setBirthDate(date);
                }}
                max={formatDate(new Date())}
                style={{
                  width: "100%",
                  padding: "12px",
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
              <Text style={styles.fieldLabel}>Exact Time of Birth</Text>
              {/* @ts-ignore - web input element */}
              <input
                type="time"
                value={birthTime ? formatTime(birthTime) : ""}
                onChange={(e: any) => {
                  const time = parseTimeString(e.target.value);
                  if (time) setBirthTime(time);
                }}
                style={{
                  width: "100%",
                  padding: "12px",
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
                    label="Exact Time of Birth"
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
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.btn}
            contentStyle={styles.btnContent}
            labelStyle={styles.btnLabel}
          >
            {isEditMode ? "Update My Chart" : "Generate My Chart"}
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
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 28,
    lineHeight: 20,
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
  genderRow: {
    flexDirection: "row",
    gap: 10,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  genderOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "22",
  },
  genderText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  genderTextSelected: {
    color: colors.primary,
    fontWeight: "700",
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
});
