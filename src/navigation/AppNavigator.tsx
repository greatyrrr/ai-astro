import React from "react";
import { TouchableOpacity } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import ChatListScreen from "../screens/ChatListScreen";
import ChatScreen from "../screens/ChatScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ChartViewScreen from "../screens/ChartViewScreen";
import ChartPreviewScreen from "../screens/ChartPreviewScreen";
import BirthProfileInputScreen from "../screens/BirthProfileInputScreen";
import { colors } from "../constants/theme";
import { useAuth } from "../context/AuthContext";

const ChatStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const ChartStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function SignOutButton() {
  const { logout } = useAuth();
  return (
    <TouchableOpacity onPress={logout} style={{ marginRight: 16 }}>
      <Ionicons name="log-out-outline" size={24} color={colors.text} />
    </TouchableOpacity>
  );
}

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerShadowVisible: false,       // replaces elevation: 0, shadowOpacity: 0
  contentStyle: { backgroundColor: colors.background }, // replaces cardStyle
  headerRight: () => <SignOutButton />,
};

function ChatStackNavigator() {
  return (
    <ChatStack.Navigator screenOptions={stackScreenOptions}>
      <ChatStack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ title: "Conversations" }}
      />
      <ChatStack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: "Chat" }}
      />
    </ChatStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={stackScreenOptions}>
      <ProfileStack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={BirthProfileInputScreen}
        options={{ title: "Edit Birth Details" }}
      />
    </ProfileStack.Navigator>
  );
}

function ChartStackNavigator() {
  return (
    <ChartStack.Navigator screenOptions={stackScreenOptions}>
      <ChartStack.Screen
        name="ChartView"
        component={ChartViewScreen}
        options={{ title: "My Birth Chart" }}
      />
      <ChartStack.Screen
        name="ChartPreview"
        component={ChartPreviewScreen}
        options={{ title: "Chart Preview" }}
      />
    </ChartStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="ChartTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ color, size }) => {
          let icon: keyof typeof Ionicons.glyphMap = "person-outline";
          if (route.name === "ChartTab") icon = "planet-outline";
          else if (route.name === "ChatTab") icon = "chatbubbles-outline";
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ tabBarLabel: "Profile" }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatStackNavigator}
        options={{ tabBarLabel: "Chat" }}
      />
      <Tab.Screen
        name="ChartTab"
        component={ChartStackNavigator}
        options={{ tabBarLabel: "My Chart", headerShown: false }}
      />
    </Tab.Navigator>
  );
}