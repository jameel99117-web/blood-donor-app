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
const MIN_DAYS_BETWEEN_DONATIONS = 90; // 3 months approx

export default function DonorHome({ navigation, route, userId: propUserId }) {
  const userId = propUserId || route?.params?.userId;
  // Always use dark theme by design direction — ignore OS color scheme preference
  const theme = getTheme('dark');
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [loading, setLoading] = useState(true);
  const [nextEligibleDate, setNextEligibleDate] = useState(null);
  const [donationStats, setDonationStats] = useState({
    totalDonations: 0,
    totalUnits: 0,
  });
  const [displayName, setDisplayName] = useState("Donor");
  const [pendingRequests, setPendingRequests] = useState([]);

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
      Alert.alert("Error", "User ID is required");
      setLoading(false);
      return;
    }

    const fetchDonationHistory = async () => {
      try {
        const response = await fetch(
          `${FIREBASE_DB_URL}/DonorHistory/${userId}.json`
        );
        const data = await response.json();

        if (!data) {
          setNextEligibleDate(null);
          setDonationStats({ totalDonations: 0, totalUnits: 0 });
          setLoading(false);
          return;
        }

        const donations = Object.values(data);
        donations.sort(
          (a, b) => new Date(b.acceptedAt) - new Date(a.acceptedAt)
        );

        const lastDonationDate = new Date(donations[0].acceptedAt);
        const eligibleDate = new Date(lastDonationDate);
        eligibleDate.setDate(
          eligibleDate.getDate() + MIN_DAYS_BETWEEN_DONATIONS
        );

        setNextEligibleDate(eligibleDate);

        // Calculate stats
        const totalUnits = donations.reduce(
          (sum, d) => sum + (parseInt(d.units) || 0),
          0
        );
        setDonationStats({
          totalDonations: donations.length,
          totalUnits,
        });
      } catch {
        Alert.alert("Error", "Failed to fetch donation history");
      } finally {
        setLoading(false);
      }
    };

    fetchDonationHistory();
  }, [userId]);

  useEffect(() => {
    fetch(`${FIREBASE_DB_URL}/requests.json`)
      .then((response) => response.json())
      .then((data) => {
        const items = Object.entries(data || {})
          .filter(([, request]) => request?.status === "Pending")
          .map(([id, request]) => ({ id, ...request }))
          .slice(0, 3);
        setPendingRequests(items);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetch(`${FIREBASE_DB_URL}/users/${userId}.json`)
      .then((response) => response.json())
      .then((user) => setDisplayName(user?.fullName || user?.name || "Donor"))
      .catch(() => {});
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading eligibility date...</Text>
      </View>
    );
  }

  const isEligible =
    !nextEligibleDate || new Date() >= nextEligibleDate;
  const statusColor = isEligible ? theme.colors.success : theme.colors.warning;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(motion.entranceMs)} style={styles.topBar}>
        <View>
          <Text style={styles.eyebrow}>BLOOD DONOR FINDER</Text>
          <Text style={styles.greeting}>Hi {displayName}</Text>
        </View>
        <View style={styles.topActions}>
          <Pressable style={styles.iconButton} onPress={() => navigation.navigate("Notifications", { userId })}>
            <MaterialCommunityIcons name="bell-outline" size={21} color={theme.colors.textPrimary} />
          </Pressable>
          <Pressable style={styles.avatar} onPress={() => navigation.navigate("Profile", { userId })}>
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
          <View style={[styles.leftBorder, { borderLeftColor: statusColor }]} />
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="water-drop"
                size={28}
                color={theme.colors.primary}
              />
              <View
                style={[styles.statusDot, { backgroundColor: statusColor }]}
              />
            </View>
            <Text style={styles.cardLabel}>YOUR DONATION STATUS</Text>
            <Text style={styles.largeValue}>
              {isEligible ? "Ready to Donate" : "Not Yet Eligible"}
            </Text>
            <View style={styles.cardDetails}>
              <Text style={styles.detailText}>
                {isEligible
                  ? "You can donate now"
                  : `Next eligible: ${nextEligibleDate?.toLocaleDateString()}`}
              </Text>
              <Text style={[styles.statusTag, { color: statusColor }]}>
                {isEligible ? "ELIGIBLE" : "PENDING"}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Stat Tiles Row */}
        <View style={styles.statRow}>
          {/* Total Donations Tile */}
          <Animated.View
            entering={FadeInDown.delay(motion.listStaggerMs * 2).duration(
              motion.entranceMs
            )}
            style={styles.statCard}
          >
            <Text style={styles.statValue}>
              {donationStats.totalDonations}
            </Text>
            <Text style={styles.statLabel}>Total Donations</Text>
          </Animated.View>

          {/* Units Collected Tile */}
          <Animated.View
            entering={FadeInDown.delay(motion.listStaggerMs * 3).duration(
              motion.entranceMs
            )}
            style={styles.statCard}
          >
            <Text style={styles.statValue}>{donationStats.totalUnits}</Text>
            <Text style={styles.statLabel}>Units Donated</Text>
          </Animated.View>
        </View>
      </View>

      <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
      <View style={styles.quickActions}>
        {[
          ["Requests", "find requests", "heart-search"],
          ["History", "my donations", "history"],
          ["Profile", "my profile", "account-outline"],
          ["Notifications", "updates", "bell-outline"],
        ].map(([screen, label, icon]) => (
          <Pressable key={screen} style={styles.quickAction} onPress={() => navigation.navigate(screen, { userId })}>
            <MaterialCommunityIcons name={icon} size={22} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>YOUR IMPACT</Text>

      <Text style={styles.sectionLabel}>NEARBY REQUESTS</Text>
      {pendingRequests.length > 0 ? pendingRequests.map((request) => (
        <View key={request.id} style={styles.requestCard}>
          <View style={styles.requestCardTop}>
            <View>
              <Text style={styles.requestTitle}>{request.city || "Local request"}</Text>
              <Text style={styles.requestMeta}>{request.units || 1} units needed</Text>
            </View>
            <View style={styles.bloodBadge}><Text style={styles.bloodBadgeText}>{request.bloodGroup || "?"}</Text></View>
          </View>
          <View style={styles.requestFooter}>
            <Text style={styles.requestMeta}>{request.urgency || "Pending"} urgency</Text>
            <Pressable onPress={() => navigation.navigate("Requests", { userId })}>
              <Text style={styles.helpLink}>HELP NOW  ›</Text>
            </Pressable>
          </View>
        </View>
      )) : <Text style={styles.emptyText}>No pending requests nearby.</Text>}

      {/* Action Button with Pulse Ring */}
      <Animated.View
        entering={FadeInDown.delay(motion.listStaggerMs * 4).duration(
          motion.entranceMs
        )}
      >
        <View style={styles.buttonContainer}>
          <PulseRingButton theme={theme} pulseOpacity={pulseOpacity} styles={styles} />
          <AppButton
            label={isEligible ? "Donate Now" : "Schedule Donation"}
            onPress={() =>
              navigation.navigate("Requests", { userId })
            }
            style={styles.actionButton}
            textStyle={styles.btnText}
          />
        </View>
      </Animated.View>

      {/* Navigation Button */}
      <Animated.View
        entering={FadeInDown.delay(motion.listStaggerMs * 5).duration(
          motion.entranceMs
        )}
        style={styles.navButtonsRow}
      >
        <View style={styles.navButtonWrapper}>
          <AppButton
            onPress={() => navigation.navigate("History", { userId })}
            style={styles.navButton}
          >
            <MaterialCommunityIcons
              name="history"
              size={20}
              color={theme.colors.primary}
              style={styles.navButtonIcon}
            />
            <Text style={styles.navBtnText}>Donation History</Text>
          </AppButton>
        </View>
        <View style={styles.navButtonWrapper}>
          <AppButton
            onPress={() => navigation.navigate("Requests", { userId })}
            style={styles.navButton}
          >
            <MaterialCommunityIcons
              name="file-document-outline"
              size={20}
              color={theme.colors.primary}
              style={styles.navButtonIcon}
            />
            <Text style={styles.navBtnText}>My Requests</Text>
          </AppButton>
        </View>
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

function createStyles(theme) {
  const { colors, spacing, radius, typography } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
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
    requestCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    requestCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    requestTitle: { ...typography.button, color: colors.textPrimary },
    requestMeta: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
    bloodBadge: { minWidth: 48, height: 42, borderRadius: radius.md, backgroundColor: colors.primaryMuted, alignItems: "center", justifyContent: "center" },
    bloodBadgeText: { ...typography.button, color: colors.primary },
    requestFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.md },
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
    statusDot: {
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
    statusTag: {
      ...typography.button,
      fontSize: 12,
      fontWeight: "600",
      textTransform: "uppercase",
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
    actionButton: {
      backgroundColor: colors.success,
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
      alignItems: "stretch",
    },
    navButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      minHeight: 58,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
    },
    navButtonWrapper: {
      flex: 1,
      alignItems: "stretch",
    },
    navButtonIcon: {
      marginRight: spacing.sm,
    },
    navBtnText: {
      ...typography.button,
      color: colors.textPrimary,
      fontSize: 12,
      lineHeight: 16,
      textAlign: "center",
    },
  });
}
