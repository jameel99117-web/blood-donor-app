import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { darkTheme } from "../constants/theme";

export const SUCCESS_HOLD_MS = 720;

export default function SuccessCheck({
  visible,
  message = "Success",
  colors = darkTheme.colors,
}) {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(160)}
      pointerEvents="none"
      style={styles.overlay}
    >
      <Animated.View
        entering={ZoomIn.duration(280).springify().damping(14)}
        style={[styles.badge, { backgroundColor: colors.success }]}
      >
        <Ionicons name="checkmark" size={36} color={colors.textOnPrimary} />
      </Animated.View>
      <Text style={[styles.message, { color: colors.textPrimary }]}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(18, 6, 8, 0.55)",
    zIndex: 20,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
  },
});
