import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getTheme } from "../../constants/theme";

const FIREBASE_DB_URL = "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com";

export default function Notifications({ route, userId: propUserId }) {
  const userId = propUserId || route?.params?.userId;
  const theme = getTheme("dark");
  const styles = createStyles(theme);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${FIREBASE_DB_URL}/notifications/${userId}.json`);
        const data = await res.json();

        if (data) {
          const notifArray = Object.entries(data)
            .map(([id, notif]) => ({ id, ...notif }))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

          setNotifications(notifArray);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  if (loading) {
    return <ActivityIndicator size="large" color={theme.colors.primary} />;
  }

  if (notifications.length === 0)
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons name="bell-off-outline" size={42} color={theme.colors.textSecondary} />
        <Text style={styles.emptyText}>No notifications</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.seen && { borderColor: "#E53935" }]}>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

function createStyles(theme) {
  const { colors, spacing, radius, typography } = theme;

  return StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, backgroundColor: colors.background },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  message: { ...typography.body, fontWeight: "700", color: colors.textPrimary, marginBottom: spacing.xs },
  timestamp: { ...typography.caption, color: colors.textSecondary },
  emptyText: { ...typography.body, textAlign: "center", marginTop: spacing.md, color: colors.textSecondary },
  });
}
