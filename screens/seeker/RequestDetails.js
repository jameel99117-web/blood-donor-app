import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getTheme, motion } from "../../constants/theme";

export default function RequestDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = getTheme(useColorScheme());
  const styles = useMemo(() => createStyles(theme), [theme]);

  const item = route?.params?.item;

  const glowOpacity = useSharedValue(motion.pulseOpacityMin);

  // Setup pulsing glow for High urgency
  React.useEffect(() => {
    if (item?.urgency?.toLowerCase() === "high") {
      glowOpacity.value = withRepeat(
        withTiming(motion.pulseOpacityMax, {
          duration: motion.pulseDurationMs,
        }),
        -1,
        true
      );
    }
  }, [item?.urgency]);

  // SAFETY CHECK (IMPORTANT)
  if (!item) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No request data found</Text>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const urgencyColor = getUrgencyColor(item.urgency, theme);
  const urgencyIcon = getUrgencyIcon(item.urgency);
  const isHighUrgency = item.urgency?.toLowerCase() === "high";

  const glowStyle = useAnimatedStyle(() => ({
    opacity: isHighUrgency ? glowOpacity.value : 0,
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Animated.Text
        entering={FadeInDown.duration(motion.entranceMs)}
        style={styles.title}
      >
        Request Details
      </Animated.Text>

      {/* Pulsing glow background for high urgency */}
      {isHighUrgency && (
        <Animated.View
          style={[
            styles.glowBackdrop,
            { borderColor: urgencyColor },
            glowStyle,
          ]}
        />
      )}

      <Animated.View
        entering={FadeInDown.delay(motion.listStaggerMs).duration(
          motion.entranceMs
        )}
        style={[styles.detailCard, { borderLeftColor: urgencyColor }]}
      >
        {/* Header with Icon and Badge */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons
              name={urgencyIcon}
              size={24}
              color={urgencyColor}
              style={styles.headerIcon}
            />
            <Text style={styles.headerTitle}>
              {item.bloodGroup}
            </Text>
          </View>
          <View style={[styles.urgencyBadge, { backgroundColor: urgencyColor }]}>
            <Text style={styles.urgencyBadgeText}>
              {item.urgency?.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Detail Rows */}
        <DetailRow
          label="Blood Group"
          value={item.bloodGroup}
          icon="droplet"
          iconColor={theme.colors.primary}
          theme={theme}
        />
        <DetailRow
          label="Units"
          value={item.units}
          icon="beaker"
          iconColor={theme.colors.textSecondary}
          theme={theme}
        />
        <DetailRow
          label="City"
          value={item.city}
          icon="map-marker"
          iconColor={theme.colors.textSecondary}
          theme={theme}
        />
        <DetailRow
          label="Contact"
          value={item.contact || "N/A"}
          icon="phone"
          iconColor={theme.colors.textSecondary}
          theme={theme}
        />
        <DetailRow
          label="Status"
          value={item.status || "Pending"}
          icon="clipboard-check"
          iconColor={theme.colors.success}
          theme={theme}
        />
      </Animated.View>
    </View>
  );
}

function DetailRow({ label, value, icon, iconColor, theme }) {
  const styles = useMemo(() => createDetailRowStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={iconColor}
          style={styles.rowIcon}
        />
        <Text style={styles.label}>{label}:</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function getUrgencyColor(urgency, theme) {
  switch (urgency?.toLowerCase()) {
    case "high":
      return theme.colors.urgencyHigh;
    case "medium":
      return theme.colors.urgencyMedium;
    case "low":
      return theme.colors.urgencyLow;
    default:
      return theme.colors.warning;
  }
}

function getUrgencyIcon(urgency) {
  switch (urgency?.toLowerCase()) {
    case "high":
      return "alert-circle";
    case "medium":
      return "alert";
    case "low":
      return "check-circle";
    default:
      return "help-circle";
  }
}

function createStyles(theme) {
  const { colors, spacing, radius, typography } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.lg,
      backgroundColor: colors.background,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    title: {
      ...typography.h2,
      color: colors.textPrimary,
      marginBottom: spacing.xl,
      textAlign: "center",
    },
    backBtn: {
      marginBottom: spacing.lg,
    },
    backText: {
      color: colors.primary,
      fontFamily: theme.fonts.bold,
      fontSize: 16,
    },
    errorText: {
      color: colors.textPrimary,
      marginBottom: spacing.lg,
      fontSize: 16,
    },
    glowBackdrop: {
      position: "absolute",
      top: spacing.xxl + 40,
      left: spacing.lg,
      right: spacing.lg,
      height: 300,
      borderRadius: radius.lg,
      borderWidth: 2,
      borderColor: colors.danger,
    },
    detailCard: {
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderLeftWidth: 4,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    headerIcon: {
      marginRight: spacing.md,
    },
    headerTitle: {
      ...typography.h2,
      color: colors.textPrimary,
    },
    urgencyBadge: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
    },
    urgencyBadgeText: {
      ...typography.caption,
      color: colors.textOnPrimary,
      fontWeight: "600",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    rowIcon: {
      marginRight: spacing.sm,
    },
    label: {
      fontFamily: theme.fonts.bold,
      color: colors.textSecondary,
      marginRight: spacing.md,
    },
    value: {
      ...typography.body,
      color: colors.textPrimary,
      textAlign: "right",
      flex: 1,
    },
  });
}

function createDetailRowStyles(theme) {
  const { colors, spacing, typography } = theme;

  return StyleSheet.create({
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    rowIcon: {
      marginRight: spacing.sm,
    },
    label: {
      fontFamily: theme.fonts.bold,
      color: colors.textSecondary,
    },
    value: {
      ...typography.body,
      color: colors.textPrimary,
    },
  });
}
