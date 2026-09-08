import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';

import Home from '../screens/Home';
import Search from '../screens/Search';
import Requests from '../screens/donor/Requests';
import Notifications from '../screens/Notifications';
import RateDonor from '../screens/seeker/RateDonor';
import Feedback from '../screens/seeker/Feedback';


const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#800000',      // Maroon color active tab
        tabBarInactiveTintColor: '#A67B5B',    // Beige-ish inactive tab
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={Home}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Search"
        component={Search}
        options={{ title: 'Find Donors' }}
      />
      <Tab.Screen
        name="Requests"
        component={Requests}
        options={{ title: 'My Requests' }}
      />
      <Tab.Screen
        name="Notifications"
        component={Notifications}
        options={{ title: 'Alerts' }}
      />
      <Tab.Screen
      name="Feedback"
      children={(props) => <Feedback {...props} userId={userId} role="Seeker" />}
  />

      <Tab.Screen
        name="RateDonor"
        component={RateDonor}
        options={{ title: 'Rate Donor' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#f9f0e8',  // Soft beige background
    paddingBottom: 5,
    paddingTop: 5,
    height: 60,
  },
  tabBarLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
