import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import DonorHome from "../screens/donor/DonorHome";
import Requests from "../screens/donor/Requests";
import DonationHistory from "../screens/donor/DonationHistory";
import CreateProfile from "../screens/donor/CreateProfile";
import Notifications from "../screens/donor/Notifications"; // notification screen
import RateDonor from "../screens/seeker/RateDonor";
import { darkColors, getTheme } from "../constants/theme";
// import RateDonor from "../screens//RateDonor";

const Tab = createBottomTabNavigator();

export default function DonorTab({ route }) {
  // Get userId from Login navigation
  const { userId } = route.params || {};
  const theme = getTheme("dark");

  return (
    <Tab.Navigator
      screenOptions={({ route: tabRoute }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: theme.colors.tabActive,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIconStyle: styles.tabBarIcon,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: "view-dashboard-outline",
            Profile: "account-circle-outline",
            Notifications: "bell-outline",
          };

          return (
            <MaterialCommunityIcons
              name={icons[tabRoute.name] || "circle-outline"}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={DonorHome}
        initialParams={{ userId }}
      />

      <Tab.Screen
        name="Requests"
        component={Requests}
        initialParams={{ userId }}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: styles.hiddenTabItem,
        }}
      />

      <Tab.Screen
        name="History"
        component={DonationHistory}
        initialParams={{ userId }}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: styles.hiddenTabItem,
        }}
      />
      <Tab.Screen
        name="RateDonor"
        component={RateDonor}
        initialParams={{ userId }}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: styles.hiddenTabItem,
        }}
      />
       {/* <Tab.Screen
        name="RateDonor"
        children={(props) => <RateDonor {...props} userId={userId} />}
      /> */}
      <Tab.Screen
        name="Profile"
        component={CreateProfile}
        initialParams={{ userId }}
      />

     <Tab.Screen
  name="Notifications"
  component={Notifications}
  initialParams={{ userId }}
/>

    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: darkColors.card,
    borderTopWidth: 1,
    borderTopColor: darkColors.cardBorder,
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    borderRadius: 18,
    height: 70,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  tabBarItem: {
    flex: 1,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  hiddenTabItem: {
    display: "none",
  },
  tabBarIcon: {
    marginTop: 0,
    marginBottom: 2,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 0,
    lineHeight: 14,
    includeFontPadding: false,
    textAlign: "center",
  },
});
