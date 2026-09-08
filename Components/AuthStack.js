

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Register from '../screens/Register.js';
import Login from '../screens/Login.js';
import Welcome from '../screens/Welcome.js';

// Stacks/Tabs
import DonorTab from './DonorTab';
import SeekerStack from "./SeekerStack";  
import AdminDrawer from './AdminDrawer'

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    // AuthStack.js


    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      {/* Authentication */}
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      {/* Role-based navigation */}
      <Stack.Screen name="DonorTab" component={DonorTab} />
    
      <Stack.Screen name="SeekerStack" component={SeekerStack} />
      <Stack.Screen name="AdminDrawer" component={AdminDrawer} />
    </Stack.Navigator>
  );
}
