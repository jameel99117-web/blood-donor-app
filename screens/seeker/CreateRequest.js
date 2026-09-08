import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  ZoomIn,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppButton from "../../Components/AppButton";
import { getTheme, motion } from "../../constants/theme";

const FIREBASE_DB_URL =
  "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCY_LEVELS = ["Low", "Medium", "High"];

export default function CreateRequest({ userId, navigation }) {
  const theme = getTheme("dark");
  const styles = createStyles(theme);

  const [formData, setFormData] = useState({
    bloodGroup: "",
    units: "",
    city: "",
    contact: "",
    urgency: "",
    status: "Pending",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const successScale = useSharedValue(0);

  const successScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
  }));

  const triggerSuccessAnimation = () => {
    successScale.value = withSpring(1, {
      damping: 12,
      stiffness: 150,
    });
    setTimeout(() => {
      setSubmitted(true);
      setTimeout(() => {
        navigation.navigate("Home");
      }, 1000);
    }, 600);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.bloodGroup) newErrors.bloodGroup = "Blood group required";
    if (!formData.units || parseInt(formData.units) <= 0)
      newErrors.units = "Valid units required";
    if (!formData.city.trim()) newErrors.city = "City required";
    if (!formData.contact.trim()) newErrors.contact = "Contact required";
    if (!formData.urgency) newErrors.urgency = "Urgency level required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${FIREBASE_DB_URL}/requests.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          seekerId: userId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to create request");

      triggerSuccessAnimation();

      setFormData({
        bloodGroup: "",
        units: "",
        city: "",
        contact: "",
        urgency: "",
        status: "Pending",
      });
      setErrors({});
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not create request. Please try again.");
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <Animated.View
          entering={ZoomIn.duration(400)}
          style={[styles.successContainer, successScaleStyle]}
        >
          <MaterialCommunityIcons
            name="check-circle"
            size={64}
            color={theme.colors.success}
          />
          <Text style={styles.successText}>Request Created!</Text>
          <Text style={styles.successSubtext}>
            Donors will see your request soon
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={FadeInDown.duration(motion.entranceMs)}
          style={styles.content}
        >
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons
              name="plus-circle"
              size={28}
              color={theme.colors.primary}
            />
            <Text style={styles.title}>Create Request</Text>
          </View>

          <Text style={styles.subtitle}>
            Tell donors what blood type you need
          </Text>

          {/* Pulse Line */}
          <View style={styles.pulseLine} />

          {/* Form Fields */}
          {[
            {
              key: "bloodGroup",
              label: "Blood Group",
              icon: "water-drop",
              type: "select",
              options: BLOOD_GROUPS,
            },
            {
              key: "units",
              label: "Units Needed",
              icon: "counter",
              type: "number",
              placeholder: "e.g., 2",
            },
            {
              key: "city",
              label: "City",
              icon: "map-marker",
              type: "text",
              placeholder: "Your city",
            },
            {
              key: "contact",
              label: "Contact Number",
              icon: "phone",
              type: "text",
              placeholder: "+1 (555) 000-0000",
            },
            {
              key: "urgency",
              label: "Urgency Level",
              icon: "alert-circle",
              type: "select",
              options: URGENCY_LEVELS,
            },
          ].map((field, idx) => (
            <Animated.View
              key={field.key}
              entering={FadeInDown.delay(motion.listStaggerMs * (idx + 1)).duration(
                motion.entranceMs
              )}
              style={styles.formField}
            >
              <View style={styles.labelRow}>
                <MaterialCommunityIcons
                  name={field.icon}
                  size={18}
                  color={theme.colors.primary}
                  style={styles.fieldIcon}
                />
                <Text style={styles.label}>{field.label}</Text>
              </View>

              {field.type === "select" ? (
                <View style={[styles.selectContainer, errors[field.key] && styles.fieldError]}>
                  {field.options.map((option) => (
                    <AppButton
                      key={option}
                      label={option}
                      onPress={() => {
                        setFormData((prev) => ({
                          ...prev,
                          [field.key]: option,
                        }));
                        setErrors((prev) => ({
                          ...prev,
                          [field.key]: "",
                        }));
                      }}
                      style={[
                        styles.selectButton,
                        formData[field.key] === option &&
                          styles.selectButtonActive,
                      ]}
                      textStyle={[
                        styles.selectButtonText,
                        formData[field.key] === option &&
                          styles.selectButtonTextActive,
                      ]}
                    />
                  ))}
                </View>
              ) : (
                <TextInput
                  style={[
                    styles.input,
                    errors[field.key] && styles.inputError,
                  ]}
                  placeholder={field.placeholder}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={formData[field.key]}
                  onChangeText={(text) => {
                    setFormData((prev) => ({
                      ...prev,
                      [field.key]: text,
                    }));
                    if (errors[field.key]) {
                      setErrors((prev) => ({
                        ...prev,
                        [field.key]: "",
                      }));
                    }
                  }}
                  keyboardType={field.type === "number" ? "numeric" : "default"}
                  editable={!loading}
                />
              )}

              {errors[field.key] && (
                <Text style={styles.errorText}>{errors[field.key]}</Text>
              )}
            </Animated.View>
          ))}

          {/* Action Buttons */}
          <Animated.View
            entering={FadeInDown.delay(motion.listStaggerMs * 6).duration(
              motion.entranceMs
            )}
            style={styles.buttonGroup}
          >
            <AppButton
              label={loading ? "Creating..." : "Create Request"}
              onPress={handleSubmit}
              disabled={loading}
              style={styles.submitButton}
              textStyle={styles.submitButtonText}
            />
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(theme) {
  const { colors, spacing, radius, typography } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.xl,
      paddingBottom: spacing.xxl * 2,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.md,
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
      marginBottom: spacing.lg,
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
    formField: {
      marginBottom: spacing.lg,
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    fieldIcon: {
      marginRight: spacing.sm,
    },
    label: {
      ...typography.button,
      color: colors.textPrimary,
      fontSize: 14,
    },
    input: {
      ...typography.body,
      color: colors.textPrimary,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      paddingLeft: spacing.lg,
    },
    inputError: {
      borderColor: colors.danger,
      backgroundColor: `rgba(244, 63, 94, 0.05)`,
    },
    selectContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    selectButton: {
      flex: 0,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.pill,
      minWidth: "30%",
    },
    selectButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    selectButtonText: {
      ...typography.caption,
      color: colors.textPrimary,
      fontSize: 12,
      textAlign: "center",
    },
    selectButtonTextActive: {
      color: colors.textOnPrimary,
    },
    errorText: {
      ...typography.caption,
      color: colors.danger,
      marginTop: spacing.xs,
      marginLeft: spacing.sm,
    },
    fieldError: {
      borderColor: colors.danger,
    },
    buttonGroup: {
      gap: spacing.md,
      marginTop: spacing.xl,
    },
    submitButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: radius.pill,
    },
    submitButtonText: {
      ...typography.button,
      color: colors.textOnPrimary,
      fontSize: 16,
    },
    successContainer: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },
    successText: {
      ...typography.h1,
      color: colors.textPrimary,
      marginTop: spacing.lg,
      fontSize: 28,
    },
    successSubtext: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.sm,
      textAlign: "center",
    },
  });
}
