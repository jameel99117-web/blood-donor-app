import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import Animated, {
  FadeInDown,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppButton from "../../Components/AppButton";
import { getTheme, motion } from "../../constants/theme";

const FIREBASE_URL =
  "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function SearchDonors({ navigation, route }) {
  const { userId } = route.params || {};
  const theme = getTheme("dark");
  const styles = createStyles(theme);

  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchDonors = async () => {
    if (!bloodGroup && !city) {
      Alert.alert("Search", "Enter at least one search criterion");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`${FIREBASE_URL}/users.json`);
      const data = await res.json();

      const donorsArray = Object.entries(data || {})
        .filter(([id, u]) => u.role === "Donor" && u.profile)
        .map(([id, u]) => ({ id, ...u.profile }));

      const filtered = donorsArray.filter((d) => {
        const bgMatch =
          !bloodGroup ||
          d.bloodGroup?.trim().toLowerCase() === bloodGroup.trim().toLowerCase();
        const cityMatch =
          !city ||
          d.city?.trim().toLowerCase().includes(city.trim().toLowerCase());
        return bgMatch && cityMatch;
      });

      setDonors(filtered);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch donors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          entering={FadeInDown.duration(motion.entranceMs)}
          style={styles.header}
        >
          <View style={styles.titleRow}>
            <MaterialCommunityIcons
              name="magnify"
              size={28}
              color={theme.colors.primary}
            />
            <Text style={styles.title}>Find Donors</Text>
          </View>
          <Text style={styles.subtitle}>Search by blood type and location</Text>
        </Animated.View>

        {/* Pulse Line */}
        <View style={styles.pulseLine} />

        {/* Blood Group Selection */}
        <Animated.View
          entering={FadeInDown.delay(motion.listStaggerMs).duration(
            motion.entranceMs
          )}
          style={styles.filterCard}
        >
          <View style={styles.filterLabel}>
            <MaterialCommunityIcons
              name="water-drop"
              size={18}
              color={theme.colors.primary}
            />
            <Text style={styles.filterTitle}>Blood Group</Text>
          </View>
          <View style={styles.bloodGroupGrid}>
            {BLOOD_GROUPS.map((bg) => (
              <AppButton
                key={bg}
                label={bg}
                onPress={() => setBloodGroup(bloodGroup === bg ? "" : bg)}
                style={[
                  styles.bgButton,
                  bloodGroup === bg && styles.bgButtonActive,
                ]}
                textStyle={[
                  styles.bgButtonText,
                  bloodGroup === bg && styles.bgButtonTextActive,
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* City Input */}
        <Animated.View
          entering={FadeInDown.delay(motion.listStaggerMs * 2).duration(
            motion.entranceMs
          )}
          style={styles.filterCard}
        >
          <View style={styles.filterLabel}>
            <MaterialCommunityIcons
              name="map-marker"
              size={18}
              color={theme.colors.primary}
            />
            <Text style={styles.filterTitle}>City</Text>
          </View>
          <TextInput
            placeholder="Enter city name..."
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.input}
            value={city}
            onChangeText={setCity}
            editable={!loading}
          />
        </Animated.View>

        {/* Search Button */}
        <Animated.View
          entering={FadeInDown.delay(motion.listStaggerMs * 3).duration(
            motion.entranceMs
          )}
          style={styles.buttonContainer}
        >
          <AppButton
            label={loading ? "Searching..." : "Search Donors"}
            onPress={searchDonors}
            disabled={loading || (!bloodGroup && !city)}
            style={styles.searchButton}
            textStyle={styles.searchButtonText}
          />
        </Animated.View>

        {/* Results */}
        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
            />
            <Text style={styles.loadingText}>Finding donors...</Text>
          </View>
        )}

        {!loading && searched && donors.length === 0 && (
          <View style={styles.centerContainer}>
            <MaterialCommunityIcons
              name="magnify-close"
              size={48}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.noResultText}>No donors found</Text>
            <Text style={styles.noResultSubtext}>
              Try adjusting your search filters
            </Text>
          </View>
        )}

        {!loading &&
          donors.map((donor, index) => (
            <Animated.View
              key={donor.id}
              entering={FadeInDown.delay(
                motion.listStaggerMs * (4 + index)
              ).duration(motion.entranceMs)}
              style={styles.donorCard}
            >
              {/* Blood Group Badge */}
              <View style={styles.bloodGroupBadge}>
                <MaterialCommunityIcons
                  name="water-drop"
                  size={20}
                  color={theme.colors.textOnPrimary}
                />
                <Text style={styles.bloodGroupBadgeText}>
                  {donor.bloodGroup}
                </Text>
              </View>

              {/* Donor Info */}
              <View style={styles.donorInfo}>
                <Text style={styles.donorName}>{donor.name}</Text>

                <View style={styles.statRow}>
                  <View style={styles.stat}>
                    <MaterialCommunityIcons
                      name="cake"
                      size={16}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.statText}>{donor.age} years</Text>
                  </View>
                  <View style={styles.stat}>
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={16}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.statText}>{donor.city}</Text>
                  </View>
                </View>

                <View style={styles.statRow}>
                  <View style={styles.stat}>
                    <MaterialCommunityIcons
                      name="scale"
                      size={16}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.statText}>
                      {donor.weight} kg
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <MaterialCommunityIcons
                      name="human-height"
                      size={16}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.statText}>
                      {donor.height} cm
                    </Text>
                  </View>
                </View>

                {donor.availabilityDate && (
                  <View style={styles.availabilityRow}>
                    <MaterialCommunityIcons
                      name="clock"
                      size={16}
                      color={theme.colors.success}
                    />
                    <Text style={styles.availabilityText}>
                      {donor.availabilityDate} at{" "}
                      {donor.availabilityTime}
                    </Text>
                  </View>
                )}

                {donor.distance && (
                  <View style={styles.distanceRow}>
                    <MaterialCommunityIcons
                      name="road"
                      size={16}
                      color={theme.colors.warning}
                    />
                    <Text style={styles.distanceText}>
                      {donor.distance} km away
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Button */}
              <AppButton
                label="View Profile"
                onPress={() =>
                  navigation.navigate("DonorInfo", {
                    donor,
                    seekerId: userId,
                  })
                }
                style={styles.viewButton}
                textStyle={styles.viewButtonText}
              />
            </Animated.View>
          ))}
      </ScrollView>
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
      paddingBottom: spacing.xxl * 2,
    },
    header: {
      marginBottom: spacing.lg,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    title: {
      ...typography.h1,
      color: colors.textPrimary,
      marginLeft: spacing.md,
      fontSize: 28,
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
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
    filterCard: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterLabel: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    filterTitle: {
      ...typography.button,
      color: colors.textPrimary,
      marginLeft: spacing.sm,
      fontSize: 14,
    },
    bloodGroupGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    bgButton: {
      flex: 0,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.pill,
      minWidth: "22%",
    },
    bgButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    bgButtonText: {
      ...typography.caption,
      color: colors.textPrimary,
      fontSize: 12,
      textAlign: "center",
      fontWeight: "600",
    },
    bgButtonTextActive: {
      color: colors.textOnPrimary,
    },
    input: {
      ...typography.body,
      color: colors.textPrimary,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      paddingLeft: spacing.lg,
    },
    buttonContainer: {
      marginBottom: spacing.xl,
    },
    searchButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: radius.pill,
    },
    searchButtonText: {
      ...typography.button,
      color: colors.textOnPrimary,
      fontSize: 16,
    },
    centerContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.xxl,
    },
    loadingText: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.md,
    },
    noResultText: {
      ...typography.h2,
      color: colors.textPrimary,
      marginTop: spacing.lg,
      textAlign: "center",
    },
    noResultSubtext: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.sm,
      textAlign: "center",
    },
    donorCard: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    bloodGroupBadge: {
      position: "absolute",
      top: spacing.lg,
      right: spacing.lg,
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    bloodGroupBadgeText: {
      ...typography.button,
      color: colors.textOnPrimary,
      fontSize: 13,
      fontWeight: "700",
    },
    donorInfo: {
      marginRight: spacing.xl,
      marginBottom: spacing.lg,
    },
    donorName: {
      ...typography.h2,
      color: colors.textPrimary,
      marginBottom: spacing.md,
      fontSize: 20,
    },
    statRow: {
      flexDirection: "row",
      gap: spacing.lg,
      marginBottom: spacing.sm,
    },
    stat: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      flex: 1,
    },
    statText: {
      ...typography.body,
      color: colors.textSecondary,
      fontSize: 13,
    },
    availabilityRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    availabilityText: {
      ...typography.caption,
      color: colors.success,
      fontSize: 12,
    },
    distanceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    distanceText: {
      ...typography.caption,
      color: colors.warning,
      fontSize: 12,
    },
    viewButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      marginTop: spacing.sm,
    },
    viewButtonText: {
      ...typography.button,
      color: colors.textOnPrimary,
      fontSize: 13,
    },
  });
}
