import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { TextInput, Text, Snackbar, ActivityIndicator } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import {
  getConversation,
  sendMessage,
  getMessageAudio,
} from "../api/endpoints";
import type { Message } from "../types";
import MessageBubble from "../components/MessageBubble";
import VoiceRecorder from "../components/VoiceRecorder";
import AudioPlayer from "../components/AudioPlayer";
import { colors } from "../constants/theme";
import { lightImpact, mediumImpact } from "../utils/haptics";

// ---------------------------------------------------------------------------
// Derive WebSocket base from the same API base used by the Axios client.
// This ensures all networking reads from the same environment config.
// ---------------------------------------------------------------------------
const HTTP_BASE: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  "https://astroai.duckdns.org";
const WS_BASE = HTTP_BASE.replace("https://", "wss://").replace("http://", "ws://");

export default function ChatScreen({ route, navigation }: any) {
  const { conversationId, title } = route.params;
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState("");
  const [textMode, setTextMode] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loadingChat, setLoadingChat] = useState(true);
  const [error, setError] = useState("");

  // Audio playback for text-message TTS (handlePlayAudio)
  const [audioUri, setAudioUri] = useState<string | null>(null);

  // --- Audio queue for streaming voice responses ---
  const audioQueueRef = useRef<Array<{ uri: string; index: number }>>([]);
  const isPlayingRef = useRef(false);
  const currentSoundRef = useRef<Audio.Sound | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  // Load existing messages
  useEffect(() => {
    (async () => {
      try {
        const conv = await getConversation(conversationId);
        setMessages(conv.messages);
      } catch (err: any) {
        const status = err?.response?.status;
        if (!status || status >= 500) {
          setError("Server unavailable, please try again later.");
        } else {
          setError("Could not load conversation.");
        }
      } finally {
        setLoadingChat(false);
      }
    })();
  }, [conversationId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.close();
      currentSoundRef.current?.unloadAsync();
    };
  }, []);

  // --- Sequential audio queue player ---
  const playNextInQueue = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;

    const item = audioQueueRef.current.shift()!;
    isPlayingRef.current = true;

    try {
      if (currentSoundRef.current) {
        await currentSoundRef.current.unloadAsync();
        currentSoundRef.current = null;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: item.uri },
        { shouldPlay: true },
        async (status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            isPlayingRef.current = false;
            currentSoundRef.current = null;
            playNextInQueue();
          }
        }
      );
      currentSoundRef.current = sound;
    } catch (err) {
      console.error("Audio queue playback error", err);
      isPlayingRef.current = false;
      playNextInQueue();
    }
  }, []);

  // --- Voice flow — WebSocket streaming ---
  const handleVoiceComplete = async (uri: string) => {
    if (processing) return;
    setProcessing(true);
    setAudioUri(null);
    audioQueueRef.current = [];

    try {
      // Read audio as base64
      let audioB64: string;
      let filename: string;

      if (Platform.OS === "web") {
        const response = await fetch(uri);
        const blob = await response.blob();
        const mime = blob.type || "audio/webm";
        filename = mime.includes("ogg") ? "audio.ogg" : "audio.webm";
        audioB64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.readAsDataURL(blob);
        });
      } else {
        filename = "audio.m4a";
        audioB64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No auth token");

      const wsUrl = `${WS_BASE}/chat/conversations/${conversationId}/voice-stream?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const tmpUserMsgId = `tmp-user-${Date.now()}`;
      const tmpAssistantId = `tmp-asst-${Date.now()}`;

      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => {
          ws.send(JSON.stringify({ type: "audio", audio: audioB64, filename }));
        };

        ws.onmessage = async (event) => {
          const data = JSON.parse(event.data);

          if (data.type === "transcript") {
            setMessages((prev) => [
              ...prev,
              {
                id: tmpUserMsgId,
                role: "user",
                content: data.text,
                created_at: new Date().toISOString(),
              },
            ]);
          }

          if (data.type === "audio_chunk") {
            let tmpPath: string;
            if (Platform.OS === "web") {
              const byteStr = atob(data.audio);
              const ab = new ArrayBuffer(byteStr.length);
              const ia = new Uint8Array(ab);
              for (let i = 0; i < byteStr.length; i++) ia[i] = byteStr.charCodeAt(i);
              const blob = new Blob([ab], { type: "audio/mpeg" });
              tmpPath = URL.createObjectURL(blob);
            } else {
              tmpPath = `${FileSystem.cacheDirectory}vchunk_${data.index}_${Date.now()}.mp3`;
              await FileSystem.writeAsStringAsync(tmpPath, data.audio, {
                encoding: FileSystem.EncodingType.Base64,
              });
            }

            audioQueueRef.current.push({ uri: tmpPath, index: data.index });
            if (!isPlayingRef.current) {
              playNextInQueue();
            }

            setMessages((prev) => {
              const existing = prev.find((m) => m.id === tmpAssistantId);
              if (existing) {
                return prev.map((m) =>
                  m.id === tmpAssistantId
                    ? { ...m, content: m.content + (m.content ? " " : "") + data.text }
                    : m
                );
              }
              return [
                ...prev,
                {
                  id: tmpAssistantId,
                  role: "assistant",
                  content: data.text,
                  created_at: new Date().toISOString(),
                },
              ];
            });
          }

          if (data.type === "text_chunk") {
            setMessages((prev) => {
              const existing = prev.find((m) => m.id === tmpAssistantId);
              if (existing) {
                return prev.map((m) =>
                  m.id === tmpAssistantId
                    ? { ...m, content: m.content + (m.content ? " " : "") + data.text }
                    : m
                );
              }
              return [
                ...prev,
                {
                  id: tmpAssistantId,
                  role: "assistant",
                  content: data.text,
                  created_at: new Date().toISOString(),
                },
              ];
            });
          }

          if (data.type === "done") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === tmpAssistantId ? { ...m, id: data.message_id } : m
              )
            );
            setProcessing(false);
            ws.close();
            resolve();
          }

          if (data.type === "error") {
            setProcessing(false);
            setError(data.message || "Voice error");
            ws.close();
            reject(new Error(data.message));
          }
        };

        ws.onerror = () => {
          setProcessing(false);
          setError("Connection error — check your network");
          reject(new Error("WebSocket error"));
        };

        ws.onclose = () => {
          wsRef.current = null;
        };
      });
    } catch (err: any) {
      console.error("Voice stream error", err);
      if (!err.message?.includes("WebSocket")) {
        setError("Voice message failed. Please try again.");
      }
      setProcessing(false);
    }
  };

  // --- Text flow ---
  const handleSendText = async () => {
    const text = textInput.trim();
    if (!text || processing) return;

    await lightImpact();
    setTextInput("");
    setProcessing(true);
    setAudioUri(null);

    const tmpUser: Message = {
      id: `tmp-user-${Date.now()}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tmpUser]);

    try {
      const assistantMsg = await sendMessage(conversationId, text);
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const status = err?.response?.status;
      if (!status || status >= 500) {
        setError("Server unavailable, please try again later.");
      } else {
        setError("Failed to send message. Please try again.");
      }
    } finally {
      setProcessing(false);
    }
  };

  // --- Play TTS for any assistant message (tap speaker icon) ---
  const handlePlayAudio = async (messageId: string) => {
    await lightImpact();
    try {
      const { audio_base64 } = await getMessageAudio(messageId);
      const tmpPath = `${FileSystem.cacheDirectory}tts_${messageId}.mp3`;
      await FileSystem.writeAsStringAsync(tmpPath, audio_base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setAudioUri(tmpPath);
    } catch {
      setError("Could not load audio. Please try again.");
    }
  };

  const handleToggleTextMode = async () => {
    await lightImpact();
    setTextMode((v) => !v);
  };

  const scrollToEnd = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToEnd();
  }, [messages.length, scrollToEnd]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {loadingChat ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} onPlayAudio={handlePlayAudio} />
          )}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={scrollToEnd}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Ionicons name="sparkles-outline" size={40} color={colors.border} />
              <Text style={styles.emptyChatText}>
                Hold the mic button and ask about your chart
              </Text>
            </View>
          }
        />
      )}

      {/* Text-message audio playback bar */}
      {audioUri && (
        <View style={styles.audioBar}>
          <AudioPlayer audioUri={audioUri} autoPlay />
        </View>
      )}

      {processing && (
        <View style={styles.processingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.processingText}>
            {audioQueueRef.current.length > 0 || isPlayingRef.current
              ? "Speaking…"
              : "Thinking…"}
          </Text>
        </View>
      )}

      <View style={styles.inputArea}>
        <VoiceRecorder onRecordComplete={handleVoiceComplete} disabled={processing} />

        <Pressable onPress={handleToggleTextMode} style={styles.textToggle}>
          <Ionicons
            name={textMode ? "chevron-down" : "keypad-outline"}
            size={18}
            color={colors.textSecondary}
          />
          <Text style={styles.textToggleLabel}>
            {textMode ? "Hide keyboard" : "Type instead"}
          </Text>
        </Pressable>

        {textMode && (
          <View style={styles.textRow}>
            <TextInput
              value={textInput}
              onChangeText={setTextInput}
              placeholder="Type a message..."
              placeholderTextColor={colors.textSecondary}
              mode="outlined"
              style={styles.textInput}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
              dense
              right={
                <TextInput.Icon
                  icon="send"
                  color={textInput.trim() ? colors.primary : colors.border}
                  onPress={handleSendText}
                />
              }
              onSubmitEditing={handleSendText}
            />
          </View>
        )}
      </View>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError("")}
        duration={4000}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  messagesList: { paddingVertical: 12, flexGrow: 1 },
  emptyChat: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    gap: 12,
  },
  emptyChatText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  audioBar: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  processingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    gap: 8,
  },
  processingText: { color: colors.textSecondary, fontSize: 13 },
  inputArea: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
  },
  textToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 4,
  },
  textToggleLabel: { color: colors.textSecondary, fontSize: 12 },
  textRow: { paddingHorizontal: 12, paddingBottom: 4 },
  textInput: { backgroundColor: colors.background, fontSize: 14 },
  snackbar: { backgroundColor: colors.error },
});
