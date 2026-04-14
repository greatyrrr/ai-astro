import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { Text } from "react-native-paper";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/theme";

interface Props {
  onRecordComplete: (audioUri: string) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({ onRecordComplete, disabled }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Native recording refs ---
  const recordingRef = useRef<Audio.Recording | null>(null);
  const pressedRef = useRef(false);

  // --- Web MediaRecorder refs ---
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const webChunksRef = useRef<BlobPart[]>([]);
  const webStreamRef = useRef<MediaStream | null>(null);

  // Pulse animation
  useEffect(() => {
    if (isRecording) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2, duration: 600,
            easing: Easing.inOut(Easing.ease), useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1, duration: 600,
            easing: Easing.inOut(Easing.ease), useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  // --- Stop ---
  const stopRecording = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setDuration(0);

    if (Platform.OS === "web") {
      // Web: stop MediaRecorder — onstop fires and calls onRecordComplete
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    // Native
    const rec = recordingRef.current;
    if (!rec) return;
    recordingRef.current = null;
    try {
      await rec.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = rec.getURI();
      if (uri) onRecordComplete(uri);
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  }, [onRecordComplete]);

  // Stable ref for document mouseup listener
  const handlePressOutRef = useRef<(() => void) | null>(null);

  // --- Start ---
  const startRecording = useCallback(async () => {
    if (disabled) return;
    pressedRef.current = true;

    if (Platform.OS === "web") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        webStreamRef.current = stream;
        webChunksRef.current = [];

        // Pick a supported MIME type (webm/opus preferred by Whisper)
        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";

        const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        mediaRecorderRef.current = mr;

        mr.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) webChunksRef.current.push(e.data);
        };

        mr.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          const recordedMime = mr.mimeType || "audio/webm";
          webStreamRef.current = null;
          mediaRecorderRef.current = null;

          const blob = new Blob(webChunksRef.current, { type: recordedMime });
          const uri = URL.createObjectURL(blob);
          webChunksRef.current = [];
          onRecordComplete(uri);
        };

        // 250 ms timeslice — forces ondataavailable to fire periodically
        // so even short recordings always have actual audio data in the chunks.
        mr.start(250);
        setIsRecording(true);
        setDuration(0);
        timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);

        // Already released before MediaRecorder started
        if (!pressedRef.current) stopRecording();
      } catch (err) {
        console.error("Web MediaRecorder error", err);
      }
      return;
    }

    // Native (Android / iOS)
    try {
      if (recordingRef.current) {
        try { await recordingRef.current.stopAndUnloadAsync(); } catch {}
        recordingRef.current = null;
      }

      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) return;

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = rec;
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);

      if (!pressedRef.current) await stopRecording();
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }, [disabled, stopRecording]);

  const handlePressOut = useCallback(() => {
    pressedRef.current = false;
    stopRecording();
  }, [stopRecording]);

  handlePressOutRef.current = handlePressOut;

  // Web: catch mouseup even if cursor drifts outside the button
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const onMouseUp = () => {
      if (pressedRef.current) handlePressOutRef.current?.();
    };
    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
  }, []);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      {isRecording && (
        <View style={styles.statusRow}>
          <View style={styles.redDot} />
          <Text style={styles.listeningText}>Listening...</Text>
          <Text style={styles.timerText}>{formatDuration(duration)}</Text>
        </View>
      )}

      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <Pressable
          onPressIn={startRecording}
          onPressOut={handlePressOut}
          style={[
            styles.recordBtn,
            isRecording && styles.recordBtnActive,
            disabled && styles.recordBtnDisabled,
          ]}
          disabled={disabled}
        >
          <Ionicons
            name={isRecording ? "mic" : "mic-outline"}
            size={36}
            color="#FFFFFF"
          />
        </Pressable>
      </Animated.View>

      <Text style={styles.hint}>
        {disabled ? "Processing..." : "Press & hold to speak"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: 12 },
  statusRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
  redDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.error },
  listeningText: { color: colors.text, fontSize: 15, fontWeight: "600" },
  timerText: { color: colors.textSecondary, fontSize: 14, fontFamily: "monospace" },
  recordBtn: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: "center", alignItems: "center",
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8,
  },
  recordBtnActive: { backgroundColor: colors.error },
  recordBtnDisabled: { backgroundColor: colors.border, opacity: 0.6 },
  hint: { color: colors.textSecondary, fontSize: 12, marginTop: 8 },
});
