import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { Audio, AVPlaybackStatus } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/theme";

interface Props {
  audioUri: string;
  autoPlay?: boolean;
}

export default function AudioPlayer({ audioUri, autoPlay }: Props) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [durationMs, setDurationMs] = useState(0);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: !!autoPlay },
          (status: AVPlaybackStatus) => {
            if (!mounted || !status.isLoaded) return;
            setPosition(status.positionMillis);
            setDurationMs(status.durationMillis ?? 0);
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPosition(0);
            }
          }
        );
        soundRef.current = sound;
      } catch (err) {
        console.error("AudioPlayer load error", err);
      }
    };
    load();

    return () => {
      mounted = false;
      soundRef.current?.unloadAsync();
    };
  }, [audioUri, autoPlay]);

  const togglePlay = async () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      // If at end, replay from start
      if (durationMs > 0 && position >= durationMs - 100) {
        await soundRef.current.setPositionAsync(0);
      }
      await soundRef.current.playAsync();
    }
  };

  const formatMs = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = durationMs > 0 ? position / durationMs : 0;

  return (
    <View style={styles.container}>
      <Pressable onPress={togglePlay} style={styles.playBtn}>
        <Ionicons
          name={isPlaying ? "pause" : "play"}
          size={18}
          color={colors.primary}
        />
      </Pressable>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { flex: progress }]} />
        <View style={{ flex: 1 - progress }} />
      </View>

      <Text style={styles.time}>{formatMs(position)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  playBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    flexDirection: "row",
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: colors.primary,
  },
  time: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: "monospace",
    width: 36,
    textAlign: "right",
  },
});
