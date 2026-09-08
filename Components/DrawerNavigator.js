import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Profile from '../screens/Profile';
import TabNavigator from './TabNavigator';  
import DonationHistory from '../screens/donor/DonationHistory';
import BloodBanks from '../screens/BloodBanks';
import DonorDetails from '../screens/DonorDetails';  // import donor details screen
import Feedback from '../screens/Feedback';          // import feedback screen
import Requests from '../screens/donor/Requests';
import CreateProfile from '../screens/donor/CreateProfile';
import EditProfile from '../screens/EditProfile';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#800000',
        drawerInactiveTintColor: '#A67B5B',
        drawerStyle: {
          backgroundColor: '#f9f0e8',
          width: 240,
        },
        drawerLabelStyle: {
          fontWeight: '600',
          fontSize: 16,
        },
      }}
    >
      <Drawer.Screen name="Home" component={TabNavigator} />
      <Drawer.Screen name="Profile" component={Profile} />
      <Drawer.Screen name="Donation History" component={DonationHistory} />
      <Drawer.Screen name="Blood Banks" component={BloodBanks} />
      {/* Removed Search from Drawer */}
      <Drawer.Screen name="Requests" component={Requests} />
      <Drawer.Screen name="Donor Details" component={DonorDetails} />
      <Drawer.Screen name="Feedback" component={Feedback} />
      <Drawer.Screen name="Create Profile" component={CreateProfile} />
      <Drawer.Screen name="Edit Profile" component={EditProfile} />             
    </Drawer.Navigator>
  );
}
