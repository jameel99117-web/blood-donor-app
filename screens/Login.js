import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppButton from "../Components/AppButton";
import ShakeView from "../Components/ShakeView";
import { getTheme, motion } from "../constants/theme";

export default function Login({ navigation }) {
  const theme = getTheme("dark");
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const emailShake = useRef(null);
  const passwordShake = useRef(null);

  const handleResetPassword = async () => {
    if (!resetEmail || !resetPassword) {
      Alert.alert("Error", "Please enter both your email and a new password.");
      return;
    }

    if (resetPassword.trim().length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long.");
      return;
    }

    setResetLoading(true);

    try {
      const usersResponse = await fetch(
        "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com/users.json"
      );
      const usersData = await usersResponse.json();

      if (usersData) {
        const usersArray = Object.entries(usersData).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const matchedUser = usersArray.find(
          (user) =>
            user.email?.toLowerCase().trim() === resetEmail.toLowerCase().trim()
        );

        if (matchedUser) {
          const updateResponse = await fetch(
            `https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com/users/${matchedUser.id}.json`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ password: resetPassword.trim() }),
            }
          );

          if (!updateResponse.ok) {
            throw new Error("Failed to update password.");
          }

          setResetEmail("");
          setResetPassword("");
          setShowResetForm(false);
          setResetLoading(false);
          Alert.alert("Success", "Your password has been reset successfully.");
          return;
        }
      }

      const adminResponse = await fetch(
        "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com/Admin.json"
      );
      const admin = await adminResponse.json();

      if (
        admin &&
        admin.Email?.toLowerCase().trim() === resetEmail.toLowerCase().trim()
      ) {
        const updateResponse = await fetch(
          "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com/Admin.json",
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...admin, password: resetPassword.trim() }),
          }
        );

        if (!updateResponse.ok) {
          throw new Error("Failed to update admin password.");
        }

        setResetEmail("");
        setResetPassword("");
        setShowResetForm(false);
        setResetLoading(false);
        Alert.alert("Success", "Admin password has been reset successfully.");
        return;
      }

      Alert.alert("Error", "No account was found for that email address.");
    } catch (error) {
      console.error("Reset password error:", error);
      Alert.alert("Error", "Unable to reset password right now. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      if (!email) emailShake.current?.shake();
      if (!password) passwordShake.current?.shake();
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com/users.json"
      );
      const data = await response.json();

      if (data) {
        const usersArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const matchedUser = usersArray.find(
          (user) =>
            user.email?.toLowerCase().trim() === email.toLowerCase().trim() &&
            user.password?.trim() === password.trim()
        );

        if (matchedUser) {
          setLoading(false);

          if (matchedUser.role === "Donor") {
            navigation.replace("DonorTab", { userId: matchedUser.id });
          } else if (matchedUser.role === "Seeker") {
            navigation.replace("SeekerStack", { userId: matchedUser.id });
          }

          return; // ✅ STOP execution if Donor/Seeker matched
        }
      }

      // 🔹 SINGLE ADMIN
      const adminRes = await fetch(
        "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com/Admin.json"
      );
      const admin = await adminRes.json();

      if (
        admin &&
        admin.Email?.toLowerCase().trim() === email.toLowerCase().trim() &&
        admin.password?.trim() === password.trim()
      ) {
        setLoading(false);
        navigation.replace("AdminDrawer"); // now it will navigate
        return;
      }

      // ❌ If no match found
      emailShake.current?.shake();
      passwordShake.current?.shake();
      Alert.alert("Error", "Invalid email or password");
      setLoading(false);
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Failed to connect to database");
      setLoading(false);
    }
  };

  return (
    <View style={styles.bg}>
      <View style={styles.container}>
        <Animated.View
          entering={FadeInDown.duration(motion.entranceMs)}
          style={styles.card}
        >
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue helping where it matters.</Text>

          {/* Email Input with Icon */}
          <ShakeView ref={emailShake} style={styles.inputWrap}>
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
          </ShakeView>

          {/* Password Input with Icon */}
          <ShakeView ref={passwordShake} style={styles.inputWrap}>
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
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </ShakeView>

          {/* Primary Login Button */}
          <AppButton
            label="Login"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginBtn}
            textStyle={styles.loginText}
          />

          {showResetForm ? (
            <View style={styles.resetPanel}>
              <Text style={styles.resetTitle}>Reset Password</Text>

              <ShakeView style={styles.inputWrap}>
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
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </ShakeView>

              <ShakeView style={styles.inputWrap}>
                <MaterialCommunityIcons
                  name="lock-reset"
                  size={20}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="New password"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={styles.input}
                  value={resetPassword}
                  onChangeText={setResetPassword}
                  secureTextEntry
                />
              </ShakeView>

              <AppButton
                label={resetLoading ? "Updating..." : "Update Password"}
                onPress={handleResetPassword}
                loading={resetLoading}
                disabled={resetLoading}
                style={styles.resetSubmitBtn}
                textStyle={styles.resetSubmitText}
              />

              <AppButton
                variant="ghost"
                onPress={() => {
                  setShowResetForm(false);
                  setResetEmail("");
                  setResetPassword("");
                }}
                style={styles.cancelResetBtn}
              >
                <Text style={styles.cancelResetText}>Cancel</Text>
              </AppButton>
            </View>
          ) : (
            <AppButton
              onPress={() => setShowResetForm(true)}
              style={styles.resetBtn}
            >
              <MaterialCommunityIcons
                name="lock-reset"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.resetText}>Reset Password</Text>
            </AppButton>
          )}

          {/* Register Link */}
          <AppButton
            variant="ghost"
            onPress={() => navigation.navigate("Register")}
            style={styles.registerBtn}
          >
            <Text style={styles.registerText}>
              New to the community?{" "}
              <Text style={styles.link}>Create Account</Text>
            </Text>
          </AppButton>
        </Animated.View>
      </View>
    </View>
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
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xl,
      paddingVertical: spacing.xxl,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
      width: "100%",
      maxWidth: 460,
    },
    title: {
      ...typography.h2,
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...typography.body,
      textAlign: "center",
      marginBottom: spacing.xl,
      color: colors.textSecondary,
    },
    inputWrap: {
      marginBottom: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingLeft: spacing.md,
    },
    inputIcon: {
      marginRight: spacing.sm,
    },
    input: {
      flex: 1,
      padding: spacing.md,
      color: colors.textPrimary,
      ...typography.body,
    },
    loginBtn: {
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: radius.md,
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
    loginText: {
      ...typography.button,
      color: colors.textOnPrimary,
      textAlign: "center",
    },
    resetPanel: {
      marginBottom: spacing.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceElevated,
    },
    resetTitle: {
      ...typography.h3,
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: spacing.md,
    },
    resetBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    resetText: {
      ...typography.button,
      color: colors.primary,
      textAlign: "center",
    },
    resetSubmitBtn: {
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    resetSubmitText: {
      ...typography.button,
      color: colors.textOnPrimary,
      textAlign: "center",
    },
    cancelResetBtn: {
      paddingVertical: spacing.sm,
    },
    cancelResetText: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: "center",
    },
    registerBtn: {
      marginTop: spacing.lg,
      paddingVertical: spacing.sm,
    },
    registerText: {
      ...typography.body,
      textAlign: "center",
      color: colors.textSecondary,
    },
    link: {
      color: colors.primary,
      fontFamily: theme.fonts.bold,
    },
  });
}
