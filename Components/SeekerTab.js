import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { darkColors } from "../constants/theme";

import SeekerHome from "../screens/seeker/SeekerHome";
import EmergencyRequest from "../screens/seeker/EmergencyRequest";
import Feedback from "../screens/seeker/Feedback";

const Tab = createBottomTabNavigator();

// Dark theme colors from theme.js
const darkSurface = darkColors.card;
const darkBorder = darkColors.cardBorder;
const primaryRed = darkColors.tabActive;
const mutedSecondary = darkColors.tabInactive;

export default function SeekerTab({ route }) {
  const { userId } = route.params || {};

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: primaryRed,
        tabBarInactiveTintColor: mutedSecondary,
        tabBarLabelPosition: "below-icon",
        tabBarIconStyle: styles.tabBarIcon,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="Home"
        component={SeekerHome}
        initialParams={{ userId }}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="EmergencyRequest"
        options={{
          tabBarLabel: "Emergency",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="alert-circle" size={size} color={color} />
          ),
        }}
        component={EmergencyRequest}
        initialParams={{ userId }}
      />

      <Tab.Screen
        name="Feedback"
        component={Feedback}
        initialParams={{ userId, role: "Seeker" }}
        options={{
          tabBarLabel: "Feedback",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message-text" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: darkSurface,
    borderTopWidth: 1,
    borderTopColor: darkBorder,
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    borderRadius: 18,
    height: 70,
    paddingHorizontal: 8,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  tabBarIcon: {
    marginTop: 0,
    marginBottom: 2,
  },
  tabBarItem: {
    flex: 1,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBarLabel: {
    fontSize: 10,
    marginTop: 0,
    lineHeight: 14,
    fontWeight: "700",
    marginHorizontal: 2,
    maxWidth: 90,
    textAlign: "center",
    includeFontPadding: false,
  },
});
