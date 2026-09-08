import React from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { motion } from "../constants/theme";

const spring = { damping: 18, stiffness: 420, mass: 0.35 };

export default function AppButton({
  onPress,
  disabled = false,
  loading = false,
  label,
  children,
  style,
  textStyle,
  variant = "primary",
}) {
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        disabled={isDisabled}
        onPress={onPress}
        onPressIn={() => {
          if (!isDisabled) {
            scale.value = withSpring(motion.pressScale, spring);
          }
        }}
        onPressOut={() => {
          scale.value = withSpring(1, spring);
        }}
        style={[
          styles.base,
          variant === "primary" && styles.primary,
          variant === "ghost" && styles.ghost,
          isDisabled && styles.disabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : label ? (
          <Text style={[styles.label, textStyle]}>{label}</Text>
        ) : (
          children
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {},
  ghost: {
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.7,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
