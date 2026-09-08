import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getTheme } from "../constants/theme";

export default function AdminScreenHeader({ navigation, title, subtitle }) {
  const theme = getTheme("dark");
  const styles = createStyles(theme);

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="Go back"
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={24}
          color={theme.colors.textPrimary}
        />
      </Pressable>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

function createStyles(theme) {
  const { colors, spacing, radius, typography } = theme;

  return StyleSheet.create({
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
    copy: {
      flex: 1,
    },
    title: {
      ...typography.h1,
      color: colors.textPrimary,
      fontSize: 26,
    },
    subtitle: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
  });
}
