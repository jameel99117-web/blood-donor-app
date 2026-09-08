import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";

export default function RequestHistory({ navigation, userId }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!userId) return;

    fetch(`https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com/users.json`,)
      .then(res => res.json())
      .then(data => {
        const list = Object.values(data || {}).filter(r => r.seekerId === userId);
        setRequests(list);
      });
  }, [userId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request History</Text>

      <FlatList
        data={requests}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.requestCard}
            onPress={() => navigation.navigate("RequestDetails", { item })}
          >
            <Text>Blood: {item.bloodGroup}</Text>
            <Text>City: {item.city}</Text>
            <Text>Units: {item.units}</Text>
            <Text>Status: {item.status}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, color: "#7B1E1E" },
  requestCard: { padding: 15, borderWidth: 1, borderColor: "#7B1E1E", borderRadius: 12, marginBottom: 10 }
});
