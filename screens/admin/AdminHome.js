import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getTheme } from "../../constants/theme";

export default function AdminHome({ navigation }) {
  const theme = getTheme("dark");
  const styles = createStyles(theme);

  const actions = [
    ["FeedbackList", "Feedback", "message-text-outline"],
    ["DonorListAdmin", "Donors", "account-heart-outline"],
    ["SeekerListAdmin", "Seekers", "account-search-outline"],
    ["NotificationsAdmin", "Notifications", "bell-outline"],
  ];

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <MaterialCommunityIcons name="shield-account-outline" size={34} color={theme.colors.primary} />
        <View>
          <Text style={styles.eyebrow}>CONTROL CENTER</Text>
          <Text style={styles.title}>Admin Dashboard</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>Monitor the blood donation community.</Text>

      <View style={styles.grid}>
        {actions.map(([screen, label, icon]) => (
          <TouchableOpacity
            key={screen}
            style={styles.button}
            onPress={() => navigation.navigate(screen)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name={icon} size={28} color={theme.colors.primary} />
            <Text style={styles.btnText}>{label}</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function createStyles(theme) {
  const { colors, spacing, radius, typography } = theme;

  return StyleSheet.create({
    container: { flex: 1, padding: spacing.xl, backgroundColor: colors.background },
    heading: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.xl },
    eyebrow: { ...typography.caption, color: colors.primary, fontWeight: "800", letterSpacing: 1 },
    title: { ...typography.h1, color: colors.textPrimary, fontSize: 28 },
    subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xxl },
    grid: { gap: spacing.md },
    button: {
      minHeight: 84,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
    },
    btnText: { ...typography.button, color: colors.textPrimary, flex: 1 },
  });
}
