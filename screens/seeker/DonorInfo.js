import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getTheme } from "../../constants/theme";

const FIREBASE_URL = "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com";

export default function DonorInfo({ route, navigation }) {
  const { donor, seekerId } = route.params || {};
  const theme = getTheme("dark");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!donor) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No donor data available</Text>
      </View>
    );
  }

  const submitRating = async () => {
    if (rating === 0) return Alert.alert("Error", "Please select a rating");

    setLoading(true);

    try {
      await fetch(`${FIREBASE_URL}/ratings.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorId: donor.id,
          seekerId,
          rating,
          timestamp: new Date().toISOString(),
        }),
      });

      Alert.alert("Success", "Rating submitted!");
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Blood Group", value: donor.bloodGroup || "N/A", icon: "water-drop" },
    { label: "City", value: donor.city || "Not shared", icon: "map-marker" },
    { label: "Age", value: donor.age ? `${donor.age} yrs` : "N/A", icon: "cake-variant" },
    { label: "Weight", value: donor.weight ? `${donor.weight} kg` : "N/A", icon: "scale-balance" },
    { label: "Height", value: donor.height ? `${donor.height} cm` : "N/A", icon: "human-male-height" },
    { label: "Phone", value: donor.contact || "Not shared", icon: "phone" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.avatarBadge}>
          <MaterialCommunityIcons name="account-heart" size={28} color={theme.colors.textOnPrimary} />
        </View>
        <Text style={styles.title}>{donor.name || "Donor Profile"}</Text>
        <Text style={styles.subtitle}>Verified donor profile</Text>
      </View>

      <View style={styles.infoCard}>
        {stats.map((item) => (
          <View key={item.label} style={styles.infoRow}>
            <View style={styles.infoLabelWrap}>
              <MaterialCommunityIcons name={item.icon} size={18} color={theme.colors.primary} />
              <Text style={styles.infoLabel}>{item.label}</Text>
            </View>
            <Text style={styles.infoValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.ratingCard}>
        <Text style={styles.ratingTitle}>Rate this donor</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Ionicons
                name={star <= rating ? "star" : "star-outline"}
                size={32}
                color={star <= rating ? "#FFD166" : theme.colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={submitRating}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? "Submitting..." : "Submit Rating"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#120608",
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#120608",
  },
  emptyText: {
    color: "#F5E9EA",
    fontSize: 16,
    fontWeight: "600",
  },
  headerCard: {
    backgroundColor: "#1E0F12",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#3A2226",
    padding: 20,
    alignItems: "center",
    marginBottom: 18,
  },
  avatarBadge: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: "#FF3B4E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#F5E9EA",
    textAlign: "center",
  },
  subtitle: {
    color: "#B08A8E",
    fontSize: 14,
    marginTop: 6,
  },
  infoCard: {
    backgroundColor: "#1E0F12",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3A2226",
    padding: 16,
    marginBottom: 18,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#3A2226",
  },
  infoLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  infoLabel: {
    color: "#B08A8E",
    fontSize: 14,
    fontWeight: "600",
  },
  infoValue: {
    color: "#F5E9EA",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
    flexShrink: 1,
  },
  ratingCard: {
    backgroundColor: "#1E0F12",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3A2226",
    padding: 18,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F5E9EA",
    marginBottom: 12,
  },
  stars: {
    flexDirection: "row",
    marginVertical: 10,
    justifyContent: "space-between",
    marginBottom: 18,
  },
  submitBtn: {
    backgroundColor: "#FF3B4E",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
});
