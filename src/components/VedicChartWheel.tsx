import React from "react";
import { View } from "react-native";
import Svg, { Polygon, Line, Text as SvgText } from "react-native-svg";
import type { HouseData } from "../types";
import type { Planet } from "../types";
import { colors } from "../constants/theme";

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const SIGN_ABBR: Record<string, string> = {
  Aries: "Ari", Taurus: "Tau", Gemini: "Gem", Cancer: "Can",
  Leo: "Leo", Virgo: "Vir", Libra: "Lib", Scorpio: "Sco",
  Sagittarius: "Sag", Capricorn: "Cap", Aquarius: "Aqu", Pisces: "Pis",
};

const PLANET_ABBR: Record<string, string> = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me",
  Jupiter: "Ju", Venus: "Ve", Saturn: "Sa", Rahu: "Ra",
  Ketu: "Ke", Uranus: "Ur", Neptune: "Ne", Pluto: "Pl",
};

/** Build 12 HouseData entries from planet list. House 1 = Ascendant sign. */
export function buildHouses(planets: Planet[]): HouseData[] {
  // Use the first planet's sign as Ascendant approximation,
  // or if an "Ascendant" entry exists, use that
  const ascPlanet = planets.find(
    (p) => p.name === "Ascendant" || p.name === "Lagna"
  );
  const ascSign = ascPlanet?.sign ?? planets[0]?.sign ?? "Aries";
  const ascIdx = ZODIAC_SIGNS.indexOf(ascSign);

  const houses: HouseData[] = Array.from({ length: 12 }, (_, i) => ({
    house: i + 1,
    sign: ZODIAC_SIGNS[(ascIdx + i) % 12],
    planets: [],
  }));

  for (const p of planets) {
    if (p.name === "Ascendant" || p.name === "Lagna") continue;
    const pIdx = ZODIAC_SIGNS.indexOf(p.sign);
    if (pIdx === -1) continue;
    const houseNum = ((pIdx - ascIdx + 12) % 12) + 1;
    const abbr = PLANET_ABBR[p.name] ?? p.name.slice(0, 2);
    houses[houseNum - 1].planets.push(abbr + (p.retrograde ? "R" : ""));
  }

  return houses;
}

interface Props {
  houses: HouseData[];
  size?: number;
}

/**
 * North Indian diamond-style Vedic birth chart rendered with SVG.
 *
 * Geometry for a square of side `s`:
 *   Corners: A(0,0) B(s,0) C(s,s) D(0,s)
 *   Midpoints: E(s/2,0) F(s,s/2) G(s/2,s) H(0,s/2)
 *   Center: O(s/2,s/2)
 *   Intersection: P1(s/4,s/4) P2(3s/4,s/4) P3(3s/4,3s/4) P4(s/4,3s/4)
 */
export default function VedicChartWheel({ houses, size = 300 }: Props) {
  const s = size;
  const m = 2; // margin/padding inside SVG

  // Key points
  const A = [m, m];
  const B = [s - m, m];
  const C = [s - m, s - m];
  const D = [m, s - m];
  const E = [s / 2, m];         // top mid
  const F = [s - m, s / 2];     // right mid
  const G = [s / 2, s - m];     // bottom mid
  const H = [m, s / 2];         // left mid
  const O = [s / 2, s / 2];     // center
  const P1 = [s / 4, s / 4];
  const P2 = [3 * s / 4, s / 4];
  const P3 = [3 * s / 4, 3 * s / 4];
  const P4 = [s / 4, 3 * s / 4];

  // 12 house polygons (clockwise from top = house 1)
  const housePolygons: number[][][] = [
    [E, P2, O, P1],       // House 1  - top kite
    [B, E, P2],           // House 2  - TR upper
    [B, P2, F],           // House 3  - TR lower
    [P2, F, P3, O],       // House 4  - right kite
    [F, C, P3],           // House 5  - BR upper
    [C, G, P3],           // House 6  - BR lower
    [G, P3, O, P4],       // House 7  - bottom kite
    [D, G, P4],           // House 8  - BL lower
    [D, P4, H],           // House 9  - BL upper
    [P4, H, P1, O],       // House 10 - left kite
    [A, P1, H],           // House 11 - TL lower
    [A, E, P1],           // House 12 - TL upper
  ];

  // Compute centroid for label placement
  const centroid = (pts: number[][]) => {
    const cx = pts.reduce((sum, p) => sum + p[0], 0) / pts.length;
    const cy = pts.reduce((sum, p) => sum + p[1], 0) / pts.length;
    return [cx, cy];
  };

  const lineColor = colors.border;
  const fontSize = Math.max(8, s / 30);
  const planetFontSize = Math.max(7, s / 35);

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        {/* House regions (transparent fill, just for structure) */}
        {housePolygons.map((pts, i) => (
          <Polygon
            key={`house-${i}`}
            points={pts.map((p) => p.join(",")).join(" ")}
            fill="transparent"
            stroke={lineColor}
            strokeWidth={1.2}
          />
        ))}

        {/* Outer border */}
        <Polygon
          points={`${A} ${B} ${C} ${D}`}
          fill="none"
          stroke={colors.primaryLight}
          strokeWidth={2}
        />

        {/* Inner diamond */}
        <Polygon
          points={`${E} ${F} ${G} ${H}`}
          fill="none"
          stroke={colors.primaryLight}
          strokeWidth={1.5}
        />

        {/* Diagonals */}
        <Line x1={A[0]} y1={A[1]} x2={C[0]} y2={C[1]} stroke={lineColor} strokeWidth={1} />
        <Line x1={B[0]} y1={B[1]} x2={D[0]} y2={D[1]} stroke={lineColor} strokeWidth={1} />

        {/* House labels */}
        {housePolygons.map((pts, i) => {
          const [cx, cy] = centroid(pts);
          const house = houses[i];
          if (!house) return null;

          const signAbbr = SIGN_ABBR[house.sign] ?? house.sign.slice(0, 3);
          const planetText = house.planets.join(" ");
          const isAsc = i === 0;

          return (
            <React.Fragment key={`label-${i}`}>
              {/* House number */}
              <SvgText
                x={cx}
                y={cy - fontSize * 0.8}
                fill={colors.textSecondary}
                fontSize={fontSize * 0.75}
                textAnchor="middle"
                fontWeight="400"
              >
                {house.house}
              </SvgText>

              {/* Sign abbreviation */}
              <SvgText
                x={cx}
                y={cy + fontSize * 0.3}
                fill={isAsc ? colors.secondary : colors.text}
                fontSize={fontSize}
                textAnchor="middle"
                fontWeight={isAsc ? "700" : "500"}
              >
                {isAsc ? `${signAbbr}*` : signAbbr}
              </SvgText>

              {/* Planet abbreviations */}
              {planetText.length > 0 && (
                <SvgText
                  x={cx}
                  y={cy + fontSize * 1.4}
                  fill={colors.secondary}
                  fontSize={planetFontSize}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {planetText}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
