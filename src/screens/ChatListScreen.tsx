import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
} from "react-native";
import { Text, FAB, Snackbar } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { getConversations, createConversation } from "../api/endpoints";
import type { Conversation } from "../types";
import { colors } from "../constants/theme";
import { lightImpact, mediumImpact } from "../utils/haptics";

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function ChatListScreen({ navigation }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (err: any) {
      const status = err?.response?.status;
      if (!status || status >= 500) {
        setError("Server unavailable, please try again later.");
      } else {
        setError("Could not load conversations. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reload when tab is focused
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleNewChat = async () => {
    await mediumImpact();
    try {
      const conv = await createConversation();
      navigation.navigate("Chat", { conversationId: conv.id, title: conv.title });
    } catch (err: any) {
      const status = err?.response?.status;
      if (!status || status >= 500) {
        setError("Server unavailable, please try again later.");
      } else {
        setError("Could not create conversation. Please try again.");
      }
    }
  };

  const handleItemPress = async (item: Conversation) => {
    await lightImpact();
    navigation.navigate("Chat", {
      conversationId: item.id,
      title: item.title,
    });
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <Pressable
      style={styles.item}
      onPress={() => handleItemPress(item)}
      android_ripple={{ color: colors.surfaceLight }}
    >
      <View style={styles.itemIcon}>
        <Ionicons name="chatbubble-outline" size={20} color={colors.primaryLight} />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.itemDate}>
          {format(new Date(item.created_at), "MMM d, h:mm a")}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  );

  const empty = !loading && conversations.length === 0;

  return (
    <View style={styles.container}>
      {empty ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={56} color={colors.border} />
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>
            Start your first conversation with your AI astrologer
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}

      <FAB
        icon="plus"
        onPress={handleNewChat}
        style={styles.fab}
        color="#FFFFFF"
      />

      <Snackbar
        visible={!!error}
        onDismiss={() => setError("")}
        duration={4000}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingVertical: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  itemDate: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: colors.primary,
    borderRadius: 28,
  },
  snackbar: {
    backgroundColor: colors.error,
  },
});
