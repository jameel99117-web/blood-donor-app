import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getTheme } from "../../constants/theme";

const FIREBASE_DB_URL =
  "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com";

export default function RateDonor({ route, navigation }) {
  const { seekerId, donorId, donorName = "Donor" } = route.params || {};
  const theme = getTheme("dark");
  const styles = createStyles(theme);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const submitRating = async () => {
    if (!rating || rating < 1 || rating > 5) {
      Alert.alert("Error", "Please select a rating between 1 and 5 stars");
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const ratingId = "RT-" + Date.now();

      // Save rating in Firebase
      await fetch(`${FIREBASE_DB_URL}/ratings.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seekerId,
          donorId,
          rating,
          comment,
          timestamp,
          ratingId,
        }),
      });

      Alert.alert("Success", "Rating submitted successfully!");
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to submit rating");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Rate {donorName}</Text>
      </View>

      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <MaterialCommunityIcons
              name={star <= rating ? "star" : "star-outline"}
              size={38}
              color={star <= rating ? theme.colors.warning : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Optional comment..."
        value={comment}
        onChangeText={setComment}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={submitRating}>
        <Text style={styles.btnText}>Submit Rating</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(theme) {
  const { colors, spacing, radius, typography } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.xl,
      paddingBottom: 120,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.xxl,
    },
    backButton: {
      width: 42,
      height: 42,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },
    title: {
      ...typography.h1,
      color: colors.textPrimary,
      flex: 1,
      fontSize: 26,
    },
    starsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      gap: spacing.sm,
      marginBottom: spacing.xxl,
    },
    input: {
      ...typography.body,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      minHeight: 120,
      backgroundColor: colors.surface,
      marginBottom: spacing.lg,
      textAlignVertical: "top",
    },
    button: {
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: radius.pill,
    },
    btnText: {
      ...typography.button,
      color: colors.textOnPrimary,
      textAlign: "center",
    },
  });
}
