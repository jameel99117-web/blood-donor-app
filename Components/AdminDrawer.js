// Components/AdminDrawer.js
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import AdminHome from "../screens/admin/AdminHome";
import FeedBackList from "../screens/admin/FeedBackList";
import DonorListAdmin from "../screens/admin/DonorListAdmin";
import SeekerListAdmin from "../screens/admin/SeekerListAdmin";
import NotificationsAdmin from "../screens/admin/NotificationsAdmin";
import { getTheme } from "../constants/theme";

const Drawer = createDrawerNavigator();

export default function AdminDrawer() {
  const theme = getTheme("dark");

  return (
    <Drawer.Navigator
      initialRouteName="AdminHome"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: { fontWeight: "700" },
        drawerStyle: { backgroundColor: theme.colors.surface, width: 286 },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.textSecondary,
        drawerLabelStyle: { fontSize: 14, fontWeight: "700" },
        drawerItemStyle: { borderRadius: 12, marginHorizontal: 10 },
      }}
    >
      <Drawer.Screen name="AdminHome" component={AdminHome} />
      <Drawer.Screen name="FeedbackList" component={FeedBackList} />
      <Drawer.Screen name="DonorListAdmin" component={DonorListAdmin} />
      <Drawer.Screen name="SeekerListAdmin" component={SeekerListAdmin} />
      <Drawer.Screen name="NotificationsAdmin" component={NotificationsAdmin} />
    </Drawer.Navigator>
  );
}
