import React, { useEffect, useState, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Alert,
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
import { getTheme, motion } from "../../constants/theme";

const FIREBASE_DB_URL = "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com";

export default function Requests({ userId }) {
  const theme = getTheme(useColorScheme());
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [acceptingId, setAcceptingId] = useState(null);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Health check
  const [fever, setFever] = useState(null);
  const [cbcOk, setCbcOk] = useState(null);
  const [notDonatedThisMonth, setNotDonatedThisMonth] = useState(null);

  useEffect(() => {
    if (!userId) return;
    loadRequests();
  }, [userId]);

  const loadRequests = async () => {
    try {
      const res = await fetch(`${FIREBASE_DB_URL}/requests.json`);
      const data = await res.json();
      if (!data) return setRequests([]);

      const pending = Object.entries(data)
        .filter(([key, req]) => req.status === "Pending")
        .map(([key, req]) => ({ key, ...req }));

      setRequests(pending);
    } catch (err) {
      Alert.alert("Error", "Error fetching requests");
    } finally {
      setLoading(false);
    }
  };

  const openHealthModal = (request) => {
    setSelectedRequest(request);
    setFever(null);
    setCbcOk(null);
    setNotDonatedThisMonth(null);
    setModalVisible(true);
  };

  const allQuestionsAnswered = fever !== null && cbcOk !== null && notDonatedThisMonth !== null;

  const submitHealthCheck = async () => {
    if (!allQuestionsAnswered) return Alert.alert("Error", "Answer all health questions");

    if (fever || !cbcOk || !notDonatedThisMonth) {
      Alert.alert("Error", "Not eligible due to health conditions");
      setModalVisible(false);
      return;
    }

    await acceptRequest(selectedRequest);
    setModalVisible(false);
  };

  const acceptRequest = async (req) => {
    setAcceptingId(req.key);
    try {
      // 1️⃣ Update request
      await fetch(`${FIREBASE_DB_URL}/requests/${req.key}.json`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Accepted",
          acceptedBy: userId,
          acceptedAt: new Date().toISOString(),
        }),
      });

      // 2️⃣ Save to donor history
      await fetch(`${FIREBASE_DB_URL}/DonorHistory/${userId}/${req.key}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...req,
          status: "Accepted",
          acceptedAt: new Date().toISOString(),
          healthCheck: { fever, cbcOk, notDonatedThisMonth },
        }),
      });

      // Remove from UI
      setRequests((prev) => prev.filter((r) => r.key !== req.key));
      Alert.alert("Success", "Request accepted!");
    } catch (err) {
      Alert.alert("Error", "Error accepting request");
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  if (requests.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No pending requests found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.Text
          entering={FadeInDown.duration(motion.entranceMs)}
          style={styles.title}
        >
          Pending Requests
        </Animated.Text>
        {requests.map((req, index) => (
          <RequestCard
            key={req.key}
            req={req}
            index={index}
            theme={theme}
            onOpenModal={() => openHealthModal(req)}
            isAccepting={acceptingId === req.key}
            styles={styles}
          />
        ))}
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Health Check</Text>

            <HealthCheckRow text="No fever last 7 days?" value={fever} onChange={setFever} theme={theme} />
            <HealthCheckRow text="CBC OK?" value={cbcOk} onChange={setCbcOk} theme={theme} />
            <HealthCheckRow text="Not donated this month?" value={notDonatedThisMonth} onChange={setNotDonatedThisMonth} theme={theme} />

            <TouchableOpacity
              style={[styles.submitBtn, !allQuestionsAnswered && { backgroundColor: theme.colors.textSecondary }]}
              disabled={!allQuestionsAnswered}
              onPress={submitHealthCheck}
            >
              <Text style={styles.submitBtnText}>{allQuestionsAnswered ? "Submit" : "Answer All Questions"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function RequestCard({ req, index, theme, onOpenModal, isAccepting, styles }) {
  const urgencyColor = getUrgencyColor(req.urgency, theme);
  const urgencyIcon = getUrgencyIcon(req.urgency);
  const isHighUrgency = req.urgency?.toLowerCase() === "high";

  const glowOpacity = useSharedValue(motion.pulseOpacityMin);

  React.useEffect(() => {
    if (isHighUrgency) {
      glowOpacity.value = withRepeat(
        withTiming(motion.pulseOpacityMax, {
          duration: motion.pulseDurationMs,
        }),
        -1,
        true
      );
    }
  }, [isHighUrgency]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: isHighUrgency ? glowOpacity.value : 0,
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * motion.listStaggerMs).duration(
        motion.entranceMs
      )}
      style={[styles.card, { borderLeftColor: urgencyColor }]}
    >
      {isHighUrgency && (
        <Animated.View
          style={[
            styles.cardGlow,
            { borderColor: urgencyColor },
            glowStyle,
          ]}
        />
      )}

      {/* Header with Icon and Badge */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <MaterialCommunityIcons
            name={urgencyIcon}
            size={20}
            color={urgencyColor}
            style={styles.cardIcon}
          />
          <View style={styles.cardTitleSection}>
            <Text style={styles.cardTitle}>
              <MaterialCommunityIcons name="droplet" size={14} color={theme.colors.primary} /> {req.bloodGroup}
            </Text>
            <Text style={styles.cardSubtitle}>{req.city} • {req.units} Units</Text>
          </View>
        </View>
        <View style={[styles.urgencyBadge, { backgroundColor: urgencyColor }]}>
          <Text style={styles.urgencyBadgeText}>
            {req.urgency?.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Accept Button */}
      <TouchableOpacity
        style={styles.acceptBtn}
        onPress={onOpenModal}
        disabled={isAccepting}
      >
        <MaterialCommunityIcons
          name="check-circle"
          size={18}
          color={theme.colors.textOnPrimary}
          style={styles.acceptBtnIcon}
        />
        <Text style={styles.acceptBtnText}>
          {isAccepting ? "Accepting..." : "Accept"}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const HealthCheckRow = ({ text, value, onChange, theme }) => (
  <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 12, alignItems: "center" }}>
    <Text style={{ color: theme.colors.textPrimary, fontFamily: theme.fonts.regular }}>{text}</Text>
    <View style={{ flexDirection: "row", gap: 8 }}>
      <TouchableOpacity
        style={{
          paddingVertical: 8,
          paddingHorizontal: 12,
          backgroundColor: value === true ? theme.colors.primary : theme.colors.surface,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: value === true ? theme.colors.primary : theme.colors.border,
        }}
        onPress={() => onChange(true)}
      >
        <Text style={{ color: value === true ? theme.colors.textOnPrimary : theme.colors.textPrimary, fontWeight: "600" }}>YES</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          paddingVertical: 8,
          paddingHorizontal: 12,
          backgroundColor: value === false ? theme.colors.danger : theme.colors.surface,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: value === false ? theme.colors.danger : theme.colors.border,
        }}
        onPress={() => onChange(false)}
      >
        <Text style={{ color: value === false ? theme.colors.textOnPrimary : theme.colors.textPrimary, fontWeight: "600" }}>NO</Text>
      </TouchableOpacity>
    </View>
  </View>
);

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
      padding: spacing.lg,
      paddingBottom: spacing.xxl,
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
    emptyText: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: "center",
    },
    title: {
      ...typography.h2,
      fontFamily: theme.fonts.bold,
      marginBottom: spacing.xl,
      textAlign: "center",
      color: colors.textPrimary,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 4,
      position: "relative",
      overflow: "hidden",
    },
    cardGlow: {
      position: "absolute",
      top: -10,
      left: -10,
      right: -10,
      bottom: -10,
      borderRadius: radius.lg,
      borderWidth: 2,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cardHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    cardIcon: {
      marginRight: spacing.md,
    },
    cardTitleSection: {
      flex: 1,
    },
    cardTitle: {
      ...typography.body,
      fontFamily: theme.fonts.bold,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    cardSubtitle: {
      ...typography.caption,
      color: colors.textSecondary,
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
      fontWeight: "600",
      fontSize: 11,
    },
    acceptBtn: {
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      marginTop: spacing.lg,
      gap: spacing.sm,
    },
    acceptBtnIcon: {
      marginRight: spacing.xs,
    },
    acceptBtnText: {
      ...typography.button,
      color: colors.textOnPrimary,
      textAlign: "center",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: "center",
      padding: spacing.xl,
    },
    modalContainer: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: {
      ...typography.h2,
      color: colors.textPrimary,
      marginBottom: spacing.lg,
      textAlign: "center",
    },
    submitBtn: {
      backgroundColor: colors.primary,
      padding: spacing.lg,
      borderRadius: radius.pill,
      marginTop: spacing.xl,
      alignItems: "center",
    },
    submitBtnText: {
      ...typography.button,
      color: colors.textOnPrimary,
      textAlign: "center",
    },
  });
}
