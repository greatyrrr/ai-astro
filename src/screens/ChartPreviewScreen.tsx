import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import { getChart } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import VedicChartWheel, { buildHouses } from "../components/VedicChartWheel";
import type { BirthChart, BirthProfile } from "../types";
import { colors } from "../constants/theme";

export default function ChartPreviewScreen() {
  const { setHasProfile } = useAuth();
  const route = useRoute();
  const { profile } = route.params as { profile: BirthProfile };

  const [chart, setChart] = useState<BirthChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getChart();
        setChart(data);
      } catch {
        setError("Could not load chart. You can view it later from your profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const planets = chart?.chart_data.planets ?? [];
  const houses = planets.length > 0 ? buildHouses(planets) : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.title}>Your Birth Chart</Text>
      <Text style={styles.subtitle}>
        {profile.full_name} — {profile.birth_date} at {profile.birth_time}
      </Text>
      <Text style={styles.location}>{profile.birth_location}</Text>

      <View style={styles.chartContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : houses.length > 0 ? (
          <VedicChartWheel houses={houses} size={300} />
        ) : (
          <Text style={styles.errorText}>{error || "No chart data available."}</Text>
        )}
      </View>

      {!loading && houses.length > 0 && (
        <Text style={styles.hint}>
          * marks your Ascendant (Lagna) sign
        </Text>
      )}

      <Button
        mode="contained"
        onPress={() => setHasProfile(true)}
        style={styles.btn}
        contentStyle={styles.btnContent}
        labelStyle={styles.btnLabel}
      >
        Continue to Chat
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  location: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  chartContainer: {
    marginVertical: 16,
    minHeight: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  btn: {
    borderRadius: 12,
    marginTop: 8,
    width: "100%",
  },
  btnContent: {
    paddingVertical: 6,
  },
  btnLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});
