import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppButton from "../../Components/AppButton";
import { getTheme } from "../../constants/theme";


const FIREBASE_DB_URL =
  "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com";

export default function DonationHistory({ route, navigation, userId: propUserId }) {
  const userId = propUserId || route?.params?.userId;
  const theme = getTheme("dark");
  const styles = createStyles(theme);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const loadHistory = async () => {
      try {
        const res = await fetch(
          `${FIREBASE_DB_URL}/DonorHistory/${userId}.json`
        );
        const data = await res.json();

        if (!data) {
          setHistory([]);
        } else {
          // data is an object of request keys -> request data
          const historyArray = Object.entries(data).map(([key, value]) => ({
            key,
            ...value,
          }));

          // Optionally sort by acceptedAt descending
          historyArray.sort(
            (a, b) => new Date(b.acceptedAt) - new Date(a.acceptedAt)
          );

          setHistory(historyArray);
        }
      } catch {
        Alert.alert("Error", "Failed to load donation history.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7B1E1E" />
        <Text>Loading donation history...</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No accepted donation requests found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Donation History</Text>
      </View>
      {history.map((item) => (
        <View key={item.key} style={styles.card}>
          <Text style={styles.label}>
            Blood Group: <Text style={styles.value}>{item.bloodGroup}</Text>
          </Text>
          <Text style={styles.label}>
            Units: <Text style={styles.value}>{item.units}</Text>
          </Text>
          <Text style={styles.label}>
            City: <Text style={styles.value}>{item.city}</Text>
          </Text>
          <Text style={styles.label}>
            Contact: <Text style={styles.value}>{item.contact}</Text>
          </Text>
          <Text style={styles.label}>
            Urgency: <Text style={styles.value}>{item.urgency}</Text>
          </Text>
          <Text style={styles.label}>
            Status: <Text style={styles.value}>{item.status}</Text>
          </Text>
          <Text style={styles.label}>
            Accepted At:{" "}
            <Text style={styles.value}>
              {new Date(item.acceptedAt).toLocaleString()}
            </Text>
          </Text>
                <AppButton
        label="Rate Donor"
        onPress={() =>
          navigation.navigate("RateDonor", {
            donorId: item.donorId,
            donorName: item.donorName || "Donor",
            seekerId: userId,
          })
        }
        style={styles.rateButton}
        textStyle={styles.rateButtonText}
      />
        </View>
      ))}
    </ScrollView>
  );
}

function createStyles(theme) {
  const { colors, spacing, radius, typography } = theme;

  return StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    flex: 1,
    fontSize: 26,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  value: {
    color: colors.textPrimary,
  },
  rateButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  rateButtonText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
  });
}
