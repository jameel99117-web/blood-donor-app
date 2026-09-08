import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function DonorCard({ donor, navigation }) {
  return (
    <TouchableOpacity
      style={styles.card}
onPress={() => navigation.navigate("DonorInfo", { donor })}

    >
      <Text style={styles.name}>{donor.name}</Text>
      <Text>Blood Group: {donor.bloodGroup}</Text>
      <Text>City: {donor.city}</Text>
      <Text>Contact: {donor.contact}</Text>
    </TouchableOpacity>
  );
}
 
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#7B1E1E",
  },
  name: { fontWeight: "bold", color: "#7B1E1E", marginBottom: 5 },
});
