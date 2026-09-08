import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import AdminScreenHeader from "../../Components/AdminScreenHeader";
import { darkColors } from "../../constants/theme";

const FIREBASE_DB_URL = "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com";

export default function FeedbackList({ navigation }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Fetch all users (Donor + Seeker)
        const usersRes = await fetch(`${FIREBASE_DB_URL}/users.json`);
        const usersData = await usersRes.json();
        setUsers(usersData || {});

        // 2️⃣ Fetch all feedbacks
        const feedbackRes = await fetch(`${FIREBASE_DB_URL}/feedback.json`);
        const feedbackData = await feedbackRes.json();
        if (feedbackData) {
          const arr = Object.entries(feedbackData)
            .filter(([id, value]) => value && value.message)
            .map(([id, value]) => ({
              id,                  // Firebase feedback key
              userId: value.userId, // ID of the user who gave feedback
              role: value.role || "Unknown",
              message: value.message,
              timestamp: value.timestamp,
              seen: value.seen ?? false,
            }));
          setFeedbacks(arr.reverse()); // latest first
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color={darkColors.tabActive}
        style={{ flex: 1, justifyContent: "center" }}
      />
    );

  const renderItem = ({ item }) => {
    const user = users[item.userId];
    const userName = user?.name || "Anonymous";

    return (
      <View
        style={[
          styles.card,
          !item.seen && { borderLeftWidth: 5, borderLeftColor: darkColors.tabActive },
        ]}
      >
        <Text style={styles.id}>Feedback ID: {item.id}</Text>
        <Text style={styles.name}>
          {userName} ({item.role})
        </Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
        {!item.seen && <Text style={styles.unseen}>New</Text>}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AdminScreenHeader
        navigation={navigation}
        title="User Feedback"
        subtitle="Review community messages"
      />
      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: darkColors.background },
  listContent: { paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: "800", color: darkColors.textPrimary, marginBottom: 20 },
  card: { backgroundColor: darkColors.card, padding: 18, marginBottom: 14, borderRadius: 14, borderWidth: 0.5, borderColor: darkColors.cardBorder },
  id: { fontSize: 11, color: darkColors.textSecondary, marginBottom: 6 },
  name: { fontWeight: "800", color: darkColors.textPrimary, marginBottom: 8 },
  message: { color: darkColors.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 10 },
  timestamp: { fontSize: 12, color: darkColors.textSecondary, textAlign: "right" },
  unseen: { color: darkColors.tabActive, fontWeight: "800", marginTop: 8 },
});
