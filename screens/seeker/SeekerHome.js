import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Pressable,
} from "react-native";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppButton from "../../Components/AppButton";
import { getTheme, motion } from "../../constants/theme";

const FIREBASE_DB_URL =
  "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com";

export default function SeekerHome({ navigation, route, userId: propUserId }) {
  const userId = propUserId || route?.params?.userId;
  // Always use dark theme by design direction — ignore OS color scheme preference
  const theme = getTheme('dark');
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("Seeker");
  const [nearbyDonors, setNearbyDonors] = useState([]);

  const pulseOpacity = useSharedValue(motion.pulseOpacityMin);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withTiming(motion.pulseOpacityMax, {
        duration: motion.pulseDurationMs,
      }),
      -1,
      true
    );
  }, [pulseOpacity]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch(`${FIREBASE_DB_URL}/requests.json`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          const myRequests = Object.entries(data)
            .filter(([_, req]) => req.seekerId === userId)
            .map(([key, req]) => ({ key, ...req }));

          setRequests(myRequests);
        } else {
          setRequests([]);
        }
      })
      .catch(() => {
        Alert.alert("Error", "Failed to load requests");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    fetch(`${FIREBASE_DB_URL}/users.json`)
      .then((response) => response.json())
      .then((data) => {
        const donors = Object.entries(data || {})
          .filter(([, user]) => user?.role === "Donor")
          .map(([id, user]) => ({ id, ...user, profile: user.profile || {} }))
          .slice(0, 3);
        setNearbyDonors(donors);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetch(`${FIREBASE_DB_URL}/users/${userId}.json`)
      .then((response) => response.json())
      .then((user) => setDisplayName(user?.fullName || user?.name || "Seeker"))
      .catch(() => {});
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  const activeRequest = requests.find((r) => r.status !== "Completed");
  const urgencyColor = getUrgencyColor(activeRequest?.urgency, theme);
  const navigateTo = (screen) => {
    const parentNavigation = navigation.getParent?.();
    (parentNavigation || navigation).navigate(screen, { userId });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(motion.entranceMs)} style={styles.topBar}>
        <View>
          <Text style={styles.eyebrow}>BLOOD DONOR FINDER</Text>
          <Text style={styles.greeting}>Hi {displayName}</Text>
        </View>
        <View style={styles.topActions}>
          <Pressable style={styles.iconButton} onPress={() => navigation.navigate("Feedback", { userId, role: "Seeker" })}>
            <MaterialCommunityIcons name="bell-outline" size={21} color={theme.colors.textPrimary} />
          </Pressable>
          <Pressable style={styles.avatar} onPress={() => navigation.navigate("SearchDonors", { userId })}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* Bento Grid Layout */}
      <View style={styles.bentoGrid}>
        {/* Large Status Tile */}
        <Animated.View
          entering={FadeInDown.delay(motion.listStaggerMs).duration(
            motion.entranceMs
          )}
          style={styles.largeCard}
        >
          <View style={[styles.leftBorder, { borderLeftColor: urgencyColor }]} />
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="water-drop"
                size={28}
                color={theme.colors.primary}
              />
              <View
                style={[
                  styles.urgencyDot,
                  { backgroundColor: urgencyColor },
                ]}
              />
            </View>
            <Text style={styles.cardLabel}>YOUR REQUEST STATUS</Text>
            {activeRequest ? (
              <>
                <Text style={styles.largeValue}>{activeRequest.bloodGroup}</Text>
                <View style={styles.cardDetails}>
                  <Text style={styles.detailText}>
                    {activeRequest.city} • {activeRequest.units} Units
                  </Text>
                  <Text style={[styles.urgencyTag, { color: urgencyColor }]}>
                    {activeRequest.urgency}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.noActiveText}>No active requests</Text>
            )}
          </View>
        </Animated.View>

        {/* Stat Tiles Row */}
        <View style={styles.statRow}>
          {/* Total Requests Tile */}
          <Animated.View
            entering={FadeInDown.delay(motion.listStaggerMs * 2).duration(
              motion.entranceMs
            )}
            style={styles.statCard}
          >
            <Text style={styles.statValue}>{requests.length}</Text>
            <Text style={styles.statLabel}>Total Requests</Text>
          </Animated.View>

          {/* Pending Requests Tile */}
          <Animated.View
            entering={FadeInDown.delay(motion.listStaggerMs * 3).duration(
              motion.entranceMs
            )}
            style={styles.statCard}
          >
            <Text style={styles.statValue}>
              {requests.filter((r) => r.status !== "Completed").length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Animated.View>
        </View>
      </View>

      <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
      <View style={styles.quickActions}>
        {[
          ["CreateRequest", "request blood", "plus-circle-outline"],
          ["SearchDonors", "find donors", "account-search-outline"],
          ["UserRequests", "my requests", "file-document-outline"],
          ["EmergencyRequest", "emergency", "alert-circle-outline"],
        ].map(([screen, label, icon]) => (
          <Pressable key={screen} style={styles.quickAction} onPress={() => navigateTo(screen)}>
            <MaterialCommunityIcons name={icon} size={22} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>REQUEST OVERVIEW</Text>
      <Text style={styles.sectionLabel}>AVAILABLE DONORS</Text>
      {nearbyDonors.length > 0 ? nearbyDonors.map((donor) => (
        <View key={donor.id} style={styles.donorCard}>
          <View style={styles.donorAvatar}><Text style={styles.donorAvatarText}>{(donor.fullName || donor.name || "D").charAt(0).toUpperCase()}</Text></View>
          <View style={styles.donorCopy}>
            <Text style={styles.donorName}>{donor.fullName || donor.name || "Available donor"}</Text>
            <Text style={styles.donorMeta}>{donor.profile.bloodGroup || donor.bloodGroup || "Blood group pending"}  ·  {donor.profile.city || donor.city || "Nearby"}</Text>
          </View>
          <Pressable onPress={() => navigation.navigate("SearchDonors", { userId })}>
            <Text style={styles.helpLink}>VIEW  ›</Text>
          </Pressable>
        </View>
      )) : <Text style={styles.emptyText}>No donor profiles available yet.</Text>}

      {/* Create Request Button with Pulse Ring */}
      <Animated.View
        entering={FadeInDown.delay(motion.listStaggerMs * 4).duration(
          motion.entranceMs
        )}
      >
        <View style={styles.buttonContainer}>
          <PulseRingButton theme={theme} pulseOpacity={pulseOpacity} styles={styles} />
          <AppButton
            label="Create Request"
            onPress={() => {
              const parentNav = navigation.getParent?.();

              if (parentNav && typeof parentNav.navigate === "function") {
                parentNav.navigate("CreateRequest", { userId });
                return;
              }

              navigation.navigate("CreateRequest", { userId });
            }}
            style={styles.createButton}
            textStyle={styles.btnText}
          />
        </View>
      </Animated.View>

      {/* Navigation Buttons */}
      <Animated.View
        entering={FadeInDown.delay(motion.listStaggerMs * 5).duration(
          motion.entranceMs
        )}
        style={styles.navButtonsRow}
      >
        <Pressable
          onPress={() => navigation.navigate("UserRequests", { userId })}
          style={({ pressed }) => [
            styles.outlinedButton,
            pressed && { backgroundColor: styles.outlinedButtonPressed.backgroundColor },
          ]}
        >
          <MaterialCommunityIcons
            name="file-document-outline"
            size={18}
            color={theme.colors.textPrimary}
            style={styles.buttonIcon}
          />
          <Text style={styles.outlinedButtonText}>My Requests</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("SearchDonors")}
          style={({ pressed }) => [
            styles.outlinedButton,
            pressed && { backgroundColor: styles.outlinedButtonPressed.backgroundColor },
          ]}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={18}
            color={theme.colors.textPrimary}
            style={styles.buttonIcon}
          />
          <Text style={styles.outlinedButtonText}>Search Donors</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

function PulseRingButton({ theme, pulseOpacity, styles }) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={styles.pulseRingWrapper}>
      <Animated.View
        style={[
          styles.pulseRing,
          { borderColor: theme.colors.primary },
          animatedStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.pulseRing,
          {
            borderColor: theme.colors.primary,
            transform: [{ scale: 0.8 }],
          },
          animatedStyle,
        ]}
      />
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

function createStyles(theme) {
  const { colors, spacing, radius, typography } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingBottom: spacing.xl * 3,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: spacing.xl,
      paddingBottom: spacing.xxxl,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    loadingText: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.sm,
    },
    title: {
      ...typography.h1,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    eyebrow: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: "800",
      letterSpacing: 1.1,
      marginBottom: spacing.xs,
    },
    greeting: {
      fontFamily: "Georgia",
      fontSize: 30,
      lineHeight: 36,
      color: colors.textPrimary,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.xxl,
    },
    topActions: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    iconButton: {
      width: 42,
      height: 42,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { ...typography.button, color: colors.textOnPrimary },
    pulseLine: {
      height: 2,
      backgroundColor: colors.pulseLine,
      marginBottom: spacing.xl,
      borderRadius: 1,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    bentoGrid: {
      marginBottom: spacing.xxl,
    },
    sectionLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: "800",
      letterSpacing: 1,
      marginBottom: spacing.md,
    },
    quickActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginBottom: spacing.xxl,
    },
    quickAction: {
      width: "48%",
      minHeight: 64,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
    },
    quickActionText: { ...typography.caption, color: colors.textPrimary, fontWeight: "700" },
    donorCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
    donorAvatar: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.primaryMuted, alignItems: "center", justifyContent: "center" },
    donorAvatarText: { ...typography.button, color: colors.primary },
    donorCopy: { flex: 1, marginHorizontal: spacing.md },
    donorName: { ...typography.button, color: colors.textPrimary },
    donorMeta: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
    helpLink: { ...typography.caption, color: colors.primary, fontWeight: "800", letterSpacing: 0.8 },
    emptyText: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
    largeCard: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 4,
      overflow: "hidden",
      flexDirection: "row",
    },
    leftBorder: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
    },
    cardContent: {
      flex: 1,
      paddingLeft: spacing.md,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.sm,
      justifyContent: "space-between",
    },
    urgencyDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    cardLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    largeValue: {
      ...typography.h1,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    cardDetails: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    detailText: {
      ...typography.body,
      color: colors.textSecondary,
      fontSize: 14,
    },
    urgencyTag: {
      ...typography.button,
      fontSize: 12,
      fontWeight: "600",
      textTransform: "capitalize",
    },
    noActiveText: {
      ...typography.body,
      color: colors.textSecondary,
      fontStyle: "italic",
    },
    statRow: {
      flexDirection: "row",
      gap: spacing.lg,
      justifyContent: "space-between",
      marginBottom: spacing.xl,
    },
    statCard: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.md,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
      minHeight: 130,
      width: '48%',
    },
    statValue: {
      ...typography.h1,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    statLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    buttonContainer: {
      alignItems: "center",
      marginBottom: spacing.xxl,
      position: "relative",
    },
    pulseRingWrapper: {
      position: "absolute",
      width: 100,
      height: 100,
      justifyContent: "center",
      alignItems: "center",
      top: "-30%",
      left: "50%",
      marginLeft: -50,
    },
    pulseRing: {
      position: "absolute",
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 2,
    },
    createButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: radius.pill,
      marginTop: spacing.lg,
      minWidth: "70%",
    },
    btnText: {
      ...typography.button,
      color: colors.textOnPrimary,
      textAlign: "center",
    },
    navButtonsRow: {
      flexDirection: "row",
      gap: spacing.md,
      marginTop: spacing.xl,
      marginBottom: spacing.xxl,
    },
    outlinedButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
    },
    outlinedButtonPressed: {
      backgroundColor: colors.surfaceElevated,
    },
    buttonIcon: {
      marginRight: spacing.sm,
    },
    outlinedButtonText: {
      ...typography.button,
      color: colors.textPrimary,
      fontSize: 14,
    },
    navButton: {
      flex: 1,
      backgroundColor: colors.surface,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    navBtnText: {
      ...typography.button,
      color: colors.textPrimary,
      fontSize: 13,
      textAlign: "center",
    },
  });
}


