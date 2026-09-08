import React, { useEffect, useState, useMemo } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
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

export default function UserRequests({ route }) {
  const userId = route?.params?.userId;
  const theme = getTheme("dark");
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [editRequestId, setEditRequestId] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!userId) return;

    const fetchRequests = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${FIREBASE_DB_URL}/requests.json`);
        const data = await res.json();

        if (data && typeof data === "object") {
          const userRequests = Object.entries(data)
            .filter(([_, req]) => req && req.seekerId === userId)
            .map(([key, req]) => ({ key, ...req }));

          setRequests(userRequests);
        } else {
          setRequests([]);
        }
      } catch (err) {
        console.log("Fetch error:", err);
        Alert.alert("Error", "Failed to load requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your requests...</Text>
      </View>
    );
  }

  if (!requests.length) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons
          name="inbox-multiple-outline"
          size={48}
          color={theme.colors.textSecondary}
        />
        <Text style={styles.emptyText}>No requests yet</Text>
        <Text style={styles.emptySubtext}>
          Create one to start finding donors
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        entering={FadeInDown.duration(motion.entranceMs)}
        style={styles.header}
      >
        <View style={styles.titleRow}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={28}
            color={theme.colors.primary}
          />
          <Text style={styles.title}>My Requests</Text>
        </View>
        <Text style={styles.subtitle}>
          {requests.length} active request{requests.length !== 1 ? "s" : ""}
        </Text>
      </Animated.View>

      {/* Pulse Line */}
      <View style={styles.pulseLine} />

      {requests.map((req, index) =>
        editRequestId === req.key ? (
          <EditRequestForm
            key={req.key}
            req={req}
            index={index}
            theme={theme}
            styles={styles}
            formData={formData}
            setFormData={setFormData}
            onSave={async () => {
              setSavingId(editRequestId);
              try {
                await fetch(
                  `${FIREBASE_DB_URL}/requests/${editRequestId}.json`,
                  {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                  }
                );
                setRequests((prev) =>
                  prev.map((r) =>
                    r.key === editRequestId
                      ? { key: r.key, ...r, ...formData }
                      : r
                  )
                );
                setEditRequestId(null);
                setFormData({});
                Alert.alert("Success", "Request updated!");
              } catch {
                Alert.alert("Error", "Failed to update request");
              } finally {
                setSavingId(null);
              }
            }}
            onCancel={() => {
              setEditRequestId(null);
              setFormData({});
            }}
            isSaving={savingId === req.key}
          />
        ) : (
          <RequestCardDisplay
            key={req.key}
            req={req}
            index={index}
            theme={theme}
            onEdit={() => {
              setEditRequestId(req.key);
              setFormData(req);
            }}
            styles={styles}
          />
        )
      )}
    </ScrollView>
  );
}

function RequestCardDisplay({ req, index, theme, onEdit, styles }) {
  const urgencyColor = getUrgencyColor(req.urgency, theme);
  const urgencyIcon = getUrgencyIcon(req.urgency);
  const isHighUrgency = req.urgency?.toLowerCase() === "high";

  // Pulsing glow for high urgency
  const pulseOpacity = useSharedValue(0.1);

  useEffect(() => {
    if (isHighUrgency) {
      pulseOpacity.value = withRepeat(
        withTiming(0.3, {
          duration: motion.pulseDurationMs,
        }),
        -1,
        true
      );
    }
  }, [isHighUrgency]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * motion.listStaggerMs).duration(
        motion.entranceMs
      )}
      style={[
        styles.requestCard,
        { borderLeftColor: urgencyColor },
        isHighUrgency && styles.requestCardHighUrgency,
      ]}
    >
      {/* Pulsing glow background for high urgency */}
      {isHighUrgency && (
        <Animated.View
          style={[styles.urgencyGlow, pulseStyle, { borderLeftColor: urgencyColor }]}
        />
      )}

      {/* Header with Icon and Badge */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View
            style={[
              styles.urgencyIconBg,
              { backgroundColor: `${urgencyColor}20` },
            ]}
          >
            <MaterialCommunityIcons
              name={urgencyIcon}
              size={20}
              color={urgencyColor}
            />
          </View>
          <View style={styles.cardTitleSection}>
            <View style={styles.bloodGroupRow}>
              <MaterialCommunityIcons
                name="water-drop"
                size={16}
                color={theme.colors.primary}
              />
              <Text style={styles.cardTitle}>{req.bloodGroup}</Text>
            </View>
            <View style={styles.cityRow}>
              <MaterialCommunityIcons
                name="map-marker"
                size={14}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.cardSubtitle}>{req.city}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.urgencyBadge, { backgroundColor: urgencyColor }]}>
          <Text style={styles.urgencyBadgeText}>{req.urgency}</Text>
        </View>
      </View>

      {/* Request Info */}
      <View style={styles.requestInfo}>
        <InfoRow
          theme={theme}
          label="Units"
          value={`${req.units} units`}
          icon="counter"
        />
        <InfoRow
          theme={theme}
          label="Contact"
          value={req.contact || "N/A"}
          icon="phone"
        />
        <InfoRow
          theme={theme}
          label="Status"
          value={req.status || "Pending"}
          icon="information"
        />
      </View>

      {/* Edit Button */}
      <AppButton
        label="Edit Request"
        onPress={onEdit}
        style={styles.editButton}
        textStyle={styles.editButtonText}
      />
    </Animated.View>
  );
}

function EditRequestForm({
  req,
  index,
  theme,
  styles,
  formData,
  setFormData,
  onSave,
  onCancel,
  isSaving,
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * motion.listStaggerMs).duration(
        motion.entranceMs
      )}
      style={styles.editCard}
    >
      <View style={styles.editHeader}>
        <MaterialCommunityIcons
          name="pencil"
          size={24}
          color={theme.colors.primary}
        />
        <Text style={styles.editTitle}>Edit Request</Text>
      </View>

      <View style={styles.pulseLine} />

      {["bloodGroup", "units", "city", "contact", "urgency"].map((key) => (
        <View key={key} style={styles.formGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
          </View>
          <TextInput
            style={styles.input}
            value={formData[key]}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, [key]: text }))
            }
            placeholderTextColor={theme.colors.textSecondary}
            editable={!isSaving}
          />
        </View>
      ))}

      <View style={styles.buttonRow}>
        <AppButton
          label={isSaving ? "Saving..." : "Save"}
          onPress={onSave}
          disabled={isSaving}
          style={styles.saveBtn}
          textStyle={styles.saveBtnText}
        />

        <AppButton
          label="Cancel"
          onPress={onCancel}
          disabled={isSaving}
          style={styles.cancelBtn}
          textStyle={styles.cancelBtnText}
        />
      </View>
    </Animated.View>
  );
}

function InfoRow({ theme, label, value, icon }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
      }}
    >
      <MaterialCommunityIcons
        name={icon}
        size={16}
        color={theme.colors.textSecondary}
      />
      <Text style={{ fontWeight: "500", fontSize: 13, color: theme.colors.textSecondary }}>
        {label}:
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: theme.colors.textPrimary,
          fontWeight: "600",
        }}
      >
        {value}
      </Text>
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
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: spacing.xl,
      paddingBottom: spacing.xxl * 2,
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
      marginTop: spacing.md,
    },
    emptyText: {
      ...typography.h2,
      color: colors.textPrimary,
      marginTop: spacing.lg,
      textAlign: "center",
    },
    emptySubtext: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.sm,
      textAlign: "center",
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
    requestCard: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 4,
      overflow: "hidden",
    },
    requestCardHighUrgency: {
      borderColor: colors.urgencyHighGlow,
    },
    urgencyGlow: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderLeftWidth: 4,
      borderLeftColor: colors.urgencyHigh,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    cardHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    urgencyIconBg: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.md,
    },
    cardTitleSection: {
      flex: 1,
    },
    bloodGroupRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.xs,
      gap: spacing.xs,
    },
    cardTitle: {
      ...typography.body,
      fontFamily: theme.fonts.bold,
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: "700",
    },
    cityRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    cardSubtitle: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 12,
    },
    urgencyBadge: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      marginLeft: spacing.md,
    },
    urgencyBadgeText: {
      ...typography.caption,
      color: colors.textOnPrimary,
      fontWeight: "700",
      fontSize: 11,
      textTransform: "capitalize",
    },
    requestInfo: {
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: spacing.lg,
    },
    editButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
    },
    editButtonText: {
      ...typography.button,
      color: colors.textOnPrimary,
    },
    editCard: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    editHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    editTitle: {
      ...typography.h2,
      color: colors.textPrimary,
      marginLeft: spacing.md,
      fontSize: 20,
    },
    formGroup: {
      marginBottom: spacing.lg,
    },
    labelRow: {
      marginBottom: spacing.sm,
    },
    label: {
      ...typography.button,
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: "600",
    },
    input: {
      ...typography.body,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      paddingLeft: spacing.lg,
      backgroundColor: colors.surface,
    },
    buttonRow: {
      flexDirection: "row",
      gap: spacing.md,
      marginTop: spacing.lg,
    },
    saveBtn: {
      flex: 1,
      backgroundColor: colors.success,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
    },
    saveBtnText: {
      ...typography.button,
      color: colors.textOnPrimary,
    },
    cancelBtn: {
      flex: 1,
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
    },
    cancelBtnText: {
      ...typography.button,
      color: colors.textPrimary,
    },
  });
}
