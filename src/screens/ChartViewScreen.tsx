import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Text, Divider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { getChart } from "../api/endpoints";
import VedicChartWheel, { buildHouses } from "../components/VedicChartWheel";
import CosmicCard from "../components/CosmicCard";
import CosmicLoader from "../components/CosmicLoader";
import ZodiacBadge from "../components/ZodiacBadge";
import SectionHeader from "../components/SectionHeader";
import type { BirthChart, Planet } from "../types";
import { colors } from "../constants/theme";

function retroLabel(p: Planet) {
  return p.retrograde ? " ℞" : "";
}

function findPlanet(planets: Planet[], name: string): Planet | undefined {
  return planets.find((p) => p.name === name);
}

const PLANET_ICONS: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mars: "♂", Mercury: "☿",
  Jupiter: "♃", Venus: "♀", Saturn: "♄",
  Rahu: "☊", Ketu: "☋",
};

const ASPECT_COLORS: Record<string, string> = {
  Conjunction: colors.secondary,
  Opposition: colors.error,
  Trine: "#2ECC71",
  Square: "#E67E22",
  Sextile: colors.primaryLight,
};

export default function ChartViewScreen() {
  const [chart, setChart] = useState<BirthChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadChart = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError("");
    try {
      const data = await getChart();
      setChart(data);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    } catch (err: any) {
      const status = err?.response?.status;
      if (!status || status >= 500) {
        setError("Server unavailable, please try again later.");
      } else if (status === 404) {
        setError("No birth chart found. Please complete your birth profile first.");
      } else {
        setError(
          err?.message
            ? `Could not load birth chart: ${err.message}`
            : "Could not load birth chart."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadChart(); }, []);

  const handleRefresh = () => { setRefreshing(true); loadChart(true); };

  // --- Loading state ---
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <CosmicLoader message="🔮 Reading your birth chart…" />
        </View>
      </View>
    );
  }

  // --- Error state ---
  if (error && !chart) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.center}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <CosmicCard style={styles.errorCard}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Chart Unavailable</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => loadChart()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryText}>✦ Try Again</Text>
          </TouchableOpacity>
        </CosmicCard>
      </ScrollView>
    );
  }

  const planets = chart?.chart_data.planets ?? [];
  const aspects = chart?.chart_data.aspects ?? [];

  const sun = findPlanet(planets, "Sun");
  const moon = findPlanet(planets, "Moon");
  const ascendant = findPlanet(planets, "Ascendant");
  const houses = planets.length > 0 ? buildHouses(planets) : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <Animated.View style={{ opacity: fadeAnim }}>

        {/* Visual Chart */}
        {houses.length > 0 && (
          <CosmicCard noPadding glowColor={colors.primaryDark}>
            <View style={styles.chartHeader}>
              <SectionHeader title="Birth Chart" icon="🪐" accent={colors.primary} />
            </View>
            <View style={styles.chartContent}>
              <VedicChartWheel houses={houses} size={280} />
            </View>
          </CosmicCard>
        )}

        {/* Key Signs — Zodiac Badges */}
        <CosmicCard glowColor={colors.secondary + "66"}>
          <SectionHeader title="Your Key Signs" icon="✨" accent={colors.secondary} />
          <View style={styles.keySignsRow}>
            {sun?.sign && (
              <View style={styles.keySignBox}>
                <ZodiacBadge sign={sun.sign} label="Sun Sign" size="md" />
              </View>
            )}
            {moon?.sign && (
              <View style={styles.keySignBox}>
                <ZodiacBadge sign={moon.sign} label="Moon Sign" size="md" />
              </View>
            )}
            {ascendant?.sign && (
              <View style={styles.keySignBox}>
                <ZodiacBadge sign={ascendant.sign} label="Ascendant" size="md" />
              </View>
            )}
          </View>
        </CosmicCard>

        {/* Planetary Positions */}
        <CosmicCard noPadding>
          <View style={styles.tablePadding}>
            <SectionHeader title="Planetary Positions" icon="🌌" accent={colors.accent1} />
          </View>
          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 1.2 }]}>Planet</Text>
            <Text style={[styles.headerCell, styles.headerRight]}>Sign & Degree</Text>
          </View>
          <Divider style={styles.divider} />
          {planets.map((p, index) => (
            <View
              key={p.name}
              style={[
                styles.tableRow,
                index % 2 === 1 && styles.tableRowAlt,
              ]}
            >
              <View style={styles.planetNameCell}>
                <Text style={styles.planetIcon}>
                  {PLANET_ICONS[p.name] ?? "•"}
                </Text>
                <Text style={styles.planetName}>{p.name}</Text>
                {p.retrograde && (
                  <View style={styles.retroBadge}>
                    <Text style={styles.retroText}>℞</Text>
                  </View>
                )}
              </View>
              <Text style={styles.planetPosition}>
                {p.sign}{"  "}{p.degree_in_sign.toFixed(1)}°
              </Text>
            </View>
          ))}
        </CosmicCard>

        {/* Major Aspects */}
        {aspects.length > 0 && (
          <CosmicCard>
            <SectionHeader title="Major Aspects" icon="⚡" accent={colors.secondary} />
            <View style={styles.aspectsList}>
              {aspects.map((a, i) => {
                const aspectColor = ASPECT_COLORS[a.aspect] ?? colors.primaryLight;
                return (
                  <View key={i} style={styles.aspectRow}>
                    <Text style={styles.aspectPlanet}>{a.planet1}</Text>
                    <View style={[styles.aspectTypeBadge, { borderColor: aspectColor + "66", backgroundColor: aspectColor + "18" }]}>
                      <Text style={[styles.aspectType, { color: aspectColor }]}>{a.aspect}</Text>
                    </View>
                    <Text style={styles.aspectPlanet}>{a.planet2}</Text>
                    <Text style={styles.aspectOrb}>orb {a.orb}°</Text>
                  </View>
                );
              })}
            </View>
          </CosmicCard>
        )}

      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  // Error
  errorCard: {
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 28,
    marginTop: 4,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  // Chart card
  chartHeader: {
    padding: 16,
    paddingBottom: 0,
  },
  chartContent: {
    alignItems: "center",
    paddingVertical: 12,
    paddingBottom: 20,
  },
  // Key Signs
  keySignsRow: {
    gap: 16,
  },
  keySignBox: {
    paddingVertical: 4,
  },
  // Planet table
  tablePadding: {
    padding: 16,
    paddingBottom: 0,
  },
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surfaceElevated,
  },
  headerCell: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    flex: 1,
  },
  headerRight: {
    textAlign: "right",
  },
  divider: {
    backgroundColor: colors.border,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tableRowAlt: {
    backgroundColor: colors.surfaceLight + "80",
  },
  planetNameCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1.2,
  },
  planetIcon: {
    fontSize: 16,
    color: colors.secondary,
    width: 22,
    textAlign: "center",
  },
  planetName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  retroBadge: {
    backgroundColor: colors.secondary + "25",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: colors.secondary + "50",
  },
  retroText: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: "700",
  },
  planetPosition: {
    color: colors.textSecondary,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
    textAlign: "right",
    flex: 1,
  },
  // Aspects
  aspectsList: {
    gap: 10,
  },
  aspectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  aspectPlanet: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  aspectTypeBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  aspectType: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  aspectOrb: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: "right",
  },
});
