import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Text, Button, Divider, Snackbar } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { getBirthProfile, getChart } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import VedicChartWheel, { buildHouses } from "../components/VedicChartWheel";
import CosmicCard from "../components/CosmicCard";
import SectionHeader from "../components/SectionHeader";
import ZodiacBadge from "../components/ZodiacBadge";
import type { BirthProfile, BirthChart } from "../types";
import { colors } from "../constants/theme";

// Logic unchanged — UI only
type Props = { navigation: NativeStackNavigationProp<any> };

function findPlanet(planets: any[], name: string) {
  return planets.find((p) => p.name === name);
}

const DetailRow = ({ label, value, icon }: { label: string; value: string; icon?: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>
      {icon ? `${icon}  ` : ""}{label}
    </Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

export default function ProfileScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<BirthProfile | null>(null);
  const [chart, setChart] = useState<BirthChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      setError("");

      (async () => {
        try {
          const data = await getBirthProfile();
          if (!cancelled) setProfile(data);
        } catch (err: any) {
          if (!cancelled) {
            const status = err?.response?.status;
            if (!status || status >= 500) {
              setError("Server unavailable, please try again later.");
            } else {
              setError("Could not load profile. Please try again.");
            }
          }
        }

        try {
          const data = await getChart();
          if (!cancelled) setChart(data);
        } catch {
          // chart may not be available yet — silent fail is fine
        }

        if (!cancelled) setLoading(false);
      })();

      return () => { cancelled = true; };
    }, [])
  );

  const planets = chart?.chart_data.planets ?? [];
  const houses = planets.length > 0 ? buildHouses(planets) : [];
  const sun = findPlanet(planets, "Sun");
  const moon = findPlanet(planets, "Moon");

  if (loading) {
    return (
      <View style={styles.loader}>
        <Text style={styles.loadingIcon}>✦</Text>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 12 }} />
        <Text style={styles.loadingText}>Loading your profile…</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Mini Chart */}
        {houses.length > 0 && (
          <CosmicCard noPadding glowColor={colors.primaryDark}>
            <View style={styles.chartPadding}>
              <SectionHeader title="Your Chart" icon="🪐" accent={colors.primary} />
            </View>
            <View style={styles.chartContent}>
              <VedicChartWheel houses={houses} size={220} />
              {/* Key signs under chart */}
              {(sun || moon) && (
                <View style={styles.keySignsRow}>
                  {sun?.sign && <ZodiacBadge sign={sun.sign} label="Sun" size="sm" />}
                  {moon?.sign && <ZodiacBadge sign={moon.sign} label="Moon" size="sm" />}
                </View>
              )}
            </View>
          </CosmicCard>
        )}

        {/* Birth Details card */}
        <CosmicCard>
          <SectionHeader title="Birth Details" icon="🌟" accent={colors.secondary} />

          {profile ? (
            <>
              <DetailRow label="Name"     value={profile.full_name}      icon="👤" />
              <DetailRow label="Gender"   value={profile.gender}         icon="⚥" />
              <DetailRow label="Date"     value={profile.birth_date}     icon="📅" />
              <DetailRow label="Time"     value={profile.birth_time}     icon="🕐" />
              <DetailRow label="Location" value={profile.birth_location} icon="📍" />
            </>
          ) : (
            <Text style={styles.emptyText}>No birth profile found</Text>
          )}

          <View style={styles.actionsRow}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("ChartView")}
              style={styles.actionBtn}
              buttonColor={colors.primary}
              labelStyle={styles.actionBtnLabel}
              compact
            >
              View Chart
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate("EditProfile", { profile })}
              style={[styles.actionBtn, styles.actionBtnOutline]}
              textColor={colors.primaryLight}
              labelStyle={styles.actionBtnLabel}
              compact
            >
              Edit Details
            </Button>
          </View>
        </CosmicCard>

        {/* Logout section */}
        <Divider style={styles.divider} />

        <Button
          mode="text"
          onPress={logout}
          textColor={colors.error}
          icon="logout"
          style={styles.logoutBtn}
          labelStyle={styles.logoutLabel}
        >
          Sign Out
        </Button>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError("")}
        duration={4000}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    gap: 8,
  },
  loadingIcon: {
    fontSize: 40,
    color: colors.primary,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  chartPadding: {
    padding: 16,
    paddingBottom: 0,
  },
  chartContent: {
    alignItems: "center",
    paddingBottom: 20,
    gap: 16,
  },
  keySignsRow: {
    flexDirection: "row",
    gap: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
    flexShrink: 0,
    marginRight: 12,
  },
  detailValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    paddingVertical: 8,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
  },
  actionBtnOutline: {
    borderColor: colors.border,
  },
  actionBtnLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  divider: {
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  logoutBtn: {
    marginTop: 4,
  },
  logoutLabel: {
    fontSize: 14,
  },
  snackbar: {
    backgroundColor: colors.error,
  },
});
