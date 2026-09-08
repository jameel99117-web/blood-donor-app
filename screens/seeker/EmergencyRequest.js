import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppButton from "../../Components/AppButton";
import { getTheme, motion } from "../../constants/theme";

const FIREBASE_DB_URL =
  "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function EmergencyRequest({ route, navigation }) {
  const userId = route?.params?.userId;
  const theme = getTheme("dark");
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [formData, setFormData] = useState({
    bloodGroup: "",
    units: "",
    city: "",
    contact: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.bloodGroup) newErrors.bloodGroup = "Blood group required";
    if (!formData.units || parseInt(formData.units) <= 0)
      newErrors.units = "Valid units required";
    if (!formData.city.trim()) newErrors.city = "City required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Required Fields", "Fill blood group, units, and city");
      return;
    }

    setLoading(true);

    try {
      // Create emergency request
      const response = await fetch(`${FIREBASE_DB_URL}/emergencyRequests.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          seekerId: userId,
          urgency: "High",
          status: "Pending",
          createdAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to create emergency request");

      // Fetch all donors
      const donorsRes = await fetch(`${FIREBASE_DB_URL}/users.json`);
      const donorsData = await donorsRes.json();
      const donorsArray = Object.entries(donorsData || {})
        .filter(([_, u]) => u && u.role === "Donor")
        .map(([id, _]) => id);

      // Send notifications to all donors
      const notificationPromises = donorsArray.map((donorId) =>
        fetch(`${FIREBASE_DB_URL}/notifications/${donorId}.json`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `🚨 EMERGENCY: ${formData.bloodGroup} needed in ${formData.city}!`,
            type: "emergency",
            seekerId: userId,
            bloodGroup: formData.bloodGroup,
            city: formData.city,
            timestamp: new Date().toISOString(),
          }),
        })
      );

      await Promise.all(notificationPromises);

      setSubmitted(true);
      setTimeout(() => {
        navigation.navigate("Home");
      }, 1500);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to submit emergency request");
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={styles.successContainer}
        >
          <MaterialCommunityIcons
            name="check-circle"
            size={72}
            color={theme.colors.success}
          />
          <Text style={styles.successTitle}>Emergency Alert Sent!</Text>
          <Text style={styles.successSubtext}>
            All donors have been notified
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Animated.View
        entering={FadeInDown.duration(motion.entranceMs)}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={32}
            color={theme.colors.urgencyHigh}
          />
          <Text style={styles.title}>Emergency Request</Text>
        </View>
        <Text style={styles.subtitle}>
          Notify all donors instantly
        </Text>
      </Animated.View>

      {/* Pulse Line */}
      <View style={styles.pulseLine} />

      {/* Blood Group Selection */}
      <Animated.View
        entering={FadeInDown.delay(motion.listStaggerMs).duration(motion.entranceMs)}
        style={styles.formField}
      >
        <View style={styles.labelRow}>
          <MaterialCommunityIcons
            name="water-drop"
            size={18}
            color={theme.colors.primary}
          />
          <Text style={styles.label}>Blood Group *</Text>
        </View>

        <View style={[styles.selectContainer, errors.bloodGroup && styles.fieldError]}>
          {BLOOD_GROUPS.map((bg) => (
            <AppButton
              key={bg}
              label={bg}
              onPress={() => {
                setFormData((prev) => ({ ...prev, bloodGroup: bg }));
                setErrors((prev) => ({ ...prev, bloodGroup: "" }));
              }}
              style={[
                styles.selectButton,
                formData.bloodGroup === bg && styles.selectButtonActive,
              ]}
              textStyle={[
                styles.selectButtonText,
                formData.bloodGroup === bg && styles.selectButtonTextActive,
              ]}
            />
          ))}
        </View>
        {errors.bloodGroup && (
          <Text style={styles.errorText}>{errors.bloodGroup}</Text>
        )}
      </Animated.View>

      {/* Units */}
      <Animated.View
        entering={FadeInDown.delay(motion.listStaggerMs * 2).duration(motion.entranceMs)}
        style={styles.formField}
      >
        <View style={styles.labelRow}>
          <MaterialCommunityIcons
            name="counter"
            size={18}
            color={theme.colors.primary}
          />
          <Text style={styles.label}>Units Needed *</Text>
        </View>
        <TextInput
          style={[styles.input, errors.units && styles.inputError]}
          placeholder="e.g., 2"
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.units}
          onChangeText={(text) => {
            setFormData((prev) => ({ ...prev, units: text }));
            if (errors.units) setErrors((prev) => ({ ...prev, units: "" }));
          }}
          keyboardType="numeric"
          editable={!loading}
        />
        {errors.units && (
          <Text style={styles.errorText}>{errors.units}</Text>
        )}
      </Animated.View>

      {/* City */}
      <Animated.View
        entering={FadeInDown.delay(motion.listStaggerMs * 3).duration(motion.entranceMs)}
        style={styles.formField}
      >
        <View style={styles.labelRow}>
          <MaterialCommunityIcons
            name="map-marker"
            size={18}
            color={theme.colors.primary}
          />
          <Text style={styles.label}>City / Location *</Text>
        </View>
        <TextInput
          style={[styles.input, errors.city && styles.inputError]}
          placeholder="Your city"
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.city}
          onChangeText={(text) => {
            setFormData((prev) => ({ ...prev, city: text }));
            if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
          }}
          editable={!loading}
        />
        {errors.city && (
          <Text style={styles.errorText}>{errors.city}</Text>
        )}
      </Animated.View>

      {/* Contact (Optional) */}
      <Animated.View
        entering={FadeInDown.delay(motion.listStaggerMs * 4).duration(motion.entranceMs)}
        style={styles.formField}
      >
        <View style={styles.labelRow}>
          <MaterialCommunityIcons
            name="phone"
            size={18}
            color={theme.colors.primary}
          />
          <Text style={styles.label}>Contact Number</Text>
          <Text style={styles.optional}>(optional)</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="+1 (555) 000-0000"
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.contact}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, contact: text }))}
          keyboardType="phone-pad"
          editable={!loading}
        />
      </Animated.View>

      {/* Submit Button */}
      <Animated.View
        entering={FadeInDown.delay(motion.listStaggerMs * 5).duration(motion.entranceMs)}
        style={styles.submitContainer}
      >
        <AppButton
          label={loading ? "Sending..." : "Send Emergency Alert"}
          onPress={handleSubmit}
          disabled={loading}
          style={styles.submitButton}
          textStyle={styles.submitButtonText}
        />
        <Text style={styles.warningText}>
          ⚠️ All donors in the database will be notified immediately
        </Text>
      </Animated.View>
    </ScrollView>
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
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    title: {
      ...typography.h1,
      color: colors.urgencyHigh,
      marginLeft: spacing.md,
      fontSize: 28,
      fontWeight: "800",
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
      fontSize: 14,
    },
    pulseLine: {
      height: 2,
      backgroundColor: colors.urgencyHigh,
      marginBottom: spacing.xl,
      borderRadius: 1,
      shadowColor: colors.urgencyHigh,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 1,
    },
    formField: {
      marginBottom: spacing.xl,
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.md,
      gap: spacing.xs,
    },
    label: {
      ...typography.button,
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "700",
    },
    optional: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: "400",
      marginLeft: spacing.xs,
    },
    selectContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    selectButton: {
      flex: 0,
      minWidth: "22%",
      paddingVertical: spacing.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
    },
    selectButtonActive: {
      backgroundColor: colors.urgencyHigh,
      borderColor: colors.urgencyHigh,
    },
    selectButtonText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
    },
    selectButtonTextActive: {
      color: colors.textOnPrimary,
      fontWeight: "700",
    },
    fieldError: {
      borderColor: colors.urgencyHigh,
      opacity: 0.8,
    },
    input: {
      ...typography.body,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.lg,
      backgroundColor: colors.surface,
      fontSize: 14,
    },
    inputError: {
      borderColor: colors.urgencyHigh,
      borderWidth: 2,
    },
    errorText: {
      ...typography.caption,
      color: colors.urgencyHigh,
      marginTop: spacing.sm,
      fontWeight: "600",
    },
    submitContainer: {
      marginTop: spacing.xxl,
    },
    submitButton: {
      backgroundColor: colors.urgencyHigh,
      paddingVertical: spacing.lg,
      borderRadius: radius.md,
      marginBottom: spacing.lg,
    },
    submitButtonText: {
      ...typography.button,
      color: colors.textOnPrimary,
      fontSize: 16,
      fontWeight: "700",
    },
    warningText: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: "center",
      fontSize: 12,
      fontStyle: "italic",
    },
    successContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.xl,
    },
    successTitle: {
      ...typography.h1,
      color: colors.success,
      marginTop: spacing.xl,
      fontSize: 28,
      textAlign: "center",
      fontWeight: "800",
    },
    successSubtext: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.md,
      textAlign: "center",
      fontSize: 14,
    },
  });
}
