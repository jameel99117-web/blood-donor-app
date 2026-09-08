import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppButton from "../Components/AppButton";
import { getTheme, motion } from "../constants/theme";

export default function Register({ navigation }) {
  const theme = getTheme("dark");
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Donor");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !phone || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (phone.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com/users.json",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName,
            email,
            phone,
            password,
            role,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create account");
      }

      Alert.alert("Success", "Account created successfully");
      setFullName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setRole("Donor");
      setLoading(false);
      navigation.replace("Login");
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "Failed to create account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.bg}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View
        entering={FadeInDown.duration(motion.entranceMs)}
        style={styles.card}
      >
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Choose how you want to make a difference.</Text>

        <View style={styles.inputWrap}>
          <MaterialCommunityIcons
            name="account-outline"
            size={20}
            color={theme.colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Full Name"
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.inputWrap}>
          <MaterialCommunityIcons
            name="email-outline"
            size={20}
            color={theme.colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Email"
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputWrap}>
          <MaterialCommunityIcons
            name="phone-outline"
            size={20}
            color={theme.colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Phone Number"
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.input}
            value={phone}
            onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, "").slice(0, 11))}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputWrap}>
          <MaterialCommunityIcons
            name="lock-outline"
            size={20}
            color={theme.colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.roleWrap}>
          <Text style={styles.roleLabel}>I am a</Text>
          <View style={styles.roleRow}>
            {['Donor', 'Seeker'].map((item) => {
              const selected = role === item;
              return (
                <AppButton
                  key={item}
                  variant={selected ? "primary" : "ghost"}
                  onPress={() => setRole(item)}
                  style={[
                    styles.roleButton,
                    selected ? styles.roleButtonSelected : styles.roleButtonUnselected,
                  ]}
                  textStyle={selected ? styles.roleButtonTextSelected : styles.roleButtonText}
                  label={item}
                />
              );
            })}
          </View>
        </View>

        <AppButton
          label={loading ? "Creating..." : "Create Account"}
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={styles.primaryBtn}
          textStyle={styles.primaryBtnText}
        />

        <AppButton
          onPress={() => navigation.navigate("Login")}
          style={styles.resetBtn}
        >
          <MaterialCommunityIcons
            name="lock-reset"
            size={24}
            color={theme.colors.primary}
          />
          <Text style={styles.resetText}>Reset Password</Text>
        </AppButton>

        <AppButton
          variant="ghost"
          onPress={() => navigation.navigate("Login")}
          style={styles.loginBtn}
        >
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.link}>Login</Text>
          </Text>
        </AppButton>
      </Animated.View>
    </ScrollView>
  );
}

function createStyles(theme) {
  const { colors, spacing, radius, typography } = theme;

  return StyleSheet.create({
    bg: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xl,
      paddingTop: spacing.xxl,
      paddingBottom: spacing.xxl,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
      width: "100%",
      maxWidth: 520,
    },
    title: {
      ...typography.h2,
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: spacing.xl,
    },
    inputWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
      minHeight: 52,
    },
    inputIcon: {
      marginRight: spacing.sm,
    },
    input: {
      flex: 1,
      ...typography.body,
      color: colors.textPrimary,
      paddingVertical: spacing.md,
    },
    roleWrap: {
      marginBottom: spacing.lg,
    },
    roleLabel: {
      ...typography.caption,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    roleRow: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    roleButton: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: radius.pill,
    },
    roleButtonSelected: {
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    roleButtonUnselected: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.primary,
    },
    roleButtonText: {
      color: colors.primary,
      ...typography.button,
    },
    roleButtonTextSelected: {
      color: colors.textOnPrimary,
      ...typography.button,
    },
    primaryBtn: {
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      marginBottom: spacing.md,
      backgroundColor: colors.primary,
    },
    primaryBtnText: {
      ...typography.button,
      color: colors.textOnPrimary,
    },
    resetBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    resetText: {
      ...typography.button,
      color: colors.primary,
    },
    loginBtn: {
      alignSelf: "center",
      marginTop: spacing.xs,
    },
    loginText: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: "center",
    },
    link: {
      color: colors.primary,
      fontWeight: "700",
    },
  });
}
