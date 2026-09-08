import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SeekerTab from "./SeekerTab";
import RequestDetails from "../screens/seeker/RequestDetails";
import DonorInfo from "../screens/seeker/DonorInfo";
import SearchDonors from "../screens/seeker/SearchDonors";
import UserRequests from "../screens/seeker/UserRequests";
import CreateRequest from "../screens/seeker/CreateRequest";
import EmergencyRequest from "../screens/seeker/EmergencyRequest";
import RateDonor from "../screens/seeker/RateDonor"; // ✅ new screen

import Feedback from "../screens/seeker/Feedback";

const Stack = createNativeStackNavigator();

export default function SeekerStack({ route }) {
  const { userId } = route.params || {};

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="SeekerTab"
        component={SeekerTab}
        initialParams={{ userId }}
      />
      <Stack.Screen name="RequestDetails" component={RequestDetails} />
      <Stack.Screen name="DonorInfo" component={DonorInfo} />
      <Stack.Screen
        name="SearchDonors"
        component={SearchDonors}
        options={{ headerShown: true, title: "Search Donors" }}
      />
      <Stack.Screen
        name="CreateRequest"
        component={CreateRequest}
        options={{ headerShown: true, title: "Create Request" }}
      />
      <Stack.Screen
        name="UserRequests"
        component={UserRequests}
        options={{ headerShown: true, title: "My Requests" }}
      />
      <Stack.Screen
        name="EmergencyRequest"
        component={EmergencyRequest}
        options={{ headerShown: true, title: "Emergency Blood Request" }}
      />
      
      
      
      <Stack.Screen
  name="RateDonor"
  component={RateDonor}
  options={{ headerShown: true, title: "Rate Donor" }}
/>
    </Stack.Navigator>
  );
}
