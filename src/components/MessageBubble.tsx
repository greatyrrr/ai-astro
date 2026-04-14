import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import Markdown from "react-native-markdown-display";
import { colors } from "../constants/theme";
import type { Message } from "../types";

interface Props {
  message: Message;
  onPlayAudio?: (messageId: string) => void;
}

export default function MessageBubble({ message, onPlayAudio }: Props) {
  const isUser = message.role === "user";

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        {isUser ? (
          <Text style={[styles.content, styles.contentUser]}>
            {message.content}
          </Text>
        ) : (
          <Markdown
            style={{
              body: styles.content,
              paragraph: styles.content,
              text: styles.content,
              heading1: { ...styles.content, fontSize: 20, fontWeight: "700", marginBottom: 8 },
              heading2: { ...styles.content, fontSize: 18, fontWeight: "700", marginBottom: 6 },
              heading3: { ...styles.content, fontSize: 16, fontWeight: "600", marginBottom: 4 },
              strong: { ...styles.content, fontWeight: "700" },
              em: { ...styles.content, fontStyle: "italic" },
              link: { ...styles.content, color: colors.primary },
              list_item: styles.content,
              bullet_list: { marginBottom: 4 },
              ordered_list: { marginBottom: 4 },
              code_inline: {
                ...styles.content,
                backgroundColor: "rgba(0,0,0,0.1)",
                paddingHorizontal: 4,
                paddingVertical: 2,
                borderRadius: 4,
                fontFamily: "monospace",
              },
              code_block: {
                ...styles.content,
                backgroundColor: "rgba(0,0,0,0.1)",
                padding: 8,
                borderRadius: 4,
                fontFamily: "monospace",
                marginVertical: 4,
              },
            }}
          >
            {message.content}
          </Markdown>
        )}

        <View style={styles.footer}>
          <Text style={[styles.time, isUser && styles.timeUser]}>
            {format(new Date(message.created_at), "h:mm a")}
          </Text>

          {!isUser && onPlayAudio && (
            <Pressable
              onPress={() => onPlayAudio(message.id)}
              hitSlop={8}
              style={styles.speakerBtn}
            >
              <Ionicons
                name="volume-medium-outline"
                size={16}
                color={colors.textSecondary}
              />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  rowUser: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: colors.surfaceLight,
    borderBottomLeftRadius: 4,
  },
  content: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  contentUser: {
    color: "#FFFFFF",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 8,
  },
  time: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  timeUser: {
    color: "rgba(255,255,255,0.65)",
  },
  speakerBtn: {
    padding: 2,
  },
});
