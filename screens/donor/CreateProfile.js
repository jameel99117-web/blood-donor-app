import React, { useEffect, useState } from "react";
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

export default function CreateProfile({ route, userId: propUserId }) {
  const userId = propUserId || route?.params?.userId;
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    bloodGroup: "",
    city: "",
    height: "",
    weight: "",
    availabilityDate: "",
    availabilityTime: "",
    availabilityLocation: "",
    distance: "", // NEW FIELD
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [hasProfile, setHasProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // 🔹 Load profile from Firebase
  useEffect(() => {
    if (!userId) return;

    fetch(
      `https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com/users/${userId}/profile.json`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setProfile({
            name: data.name || "",
            age: data.age || "",
            bloodGroup: data.bloodGroup || "",
            city: data.city || "",
            height: data.height || "",
            weight: data.weight || "",
            availabilityDate: data.availabilityDate || "",
            availabilityTime: data.availabilityTime || "",
            availabilityLocation: data.availabilityLocation || "",
            distance: data.distance || "", // LOAD DISTANCE
          });
          setHasProfile(true);
          setEditMode(false);
        }
      })
      .catch(() => {
        Alert.alert("Error", "Failed to load profile");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // 🔹 Save / Update Profile
  const handleSaveProfile = async () => {
    if (
      !profile.name ||
      !profile.age ||
      !profile.bloodGroup ||
      !profile.city ||
      !profile.height ||
      !profile.weight
    ) {
      Alert.alert("Validation", "Please fill all required fields");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com/users/${userId}/profile.json`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...profile,
            updatedAt: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save");

      Alert.alert("Success", "Profile saved successfully");
      setHasProfile(true);
      setEditMode(false);
    } catch {
      Alert.alert("Error", "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7B1E1E" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  const isAvailable =
    profile.availabilityDate &&
    profile.availabilityTime &&
    profile.availabilityLocation;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.screenTitle}>My Profile</Text>

      <View style={styles.bigDiv}>
        {/* VIEW MODE */}
        {hasProfile && !editMode && (
          <>
            <ProfileRow label="Name" value={profile.name} />
            <ProfileRow label="Age" value={profile.age} />
            <ProfileRow label="Blood Group" value={profile.bloodGroup} />
            <ProfileRow label="City" value={profile.city} />
            <ProfileRow label="Height" value={profile.height} />
            <ProfileRow label="Weight" value={profile.weight} />
            <ProfileRow
              label="Availability Date"
              value={profile.availabilityDate || "Not Set"}
            />
            <ProfileRow
              label="Availability Time"
              value={profile.availabilityTime || "Not Set"}
            />
            <ProfileRow
              label="Availability Location"
              value={profile.availabilityLocation || "Not Set"}
            />
            <ProfileRow
              label="Distance (km)"
              value={profile.distance ? `${profile.distance} km` : "Not Set"}
            />

            <ProfileRow
              label="Status"
              value={isAvailable ? "Available" : "Not Available"}
            />

            <TouchableOpacity
              style={[styles.button, styles.activeBtn]}
              onPress={() => setEditMode(true)}
            >
              <Text style={styles.btnText}>Edit Profile</Text>
            </TouchableOpacity>
          </>
        )}

        {/* EDIT MODE */}
        {(!hasProfile || editMode) && (
          <>
            {[
              "name",
              "age",
              "bloodGroup",
              "city",
              "height",
              "weight",
              "availabilityDate",
              "availabilityTime",
              "availabilityLocation",
              "distance", // ADD DISTANCE FIELD
            ].map((field) => (
              <View key={field} style={styles.inputWrapper}>
                <Text style={styles.label}>
                  {field
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (s) => s.toUpperCase())}
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder={`Enter ${field}`}
                  placeholderTextColor="#AAA"
                  keyboardType={["age", "height", "weight", "distance"].includes(
                    field
                  )
                    ? "numeric"
                    : "default"}
                  value={profile[field]}
                  onChangeText={(text) =>
                    setProfile({ ...profile, [field]: text })
                  }
                />
              </View>
            ))}

            <TouchableOpacity
              style={[styles.button, styles.activeBtn]}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>
                  {hasProfile ? "Update Profile" : "Save Profile"}
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

// 🔹 Reusable Row
function ProfileRow({ label, value }) {
  return (
    <View style={styles.profileRow}>
      <Text style={styles.profileLabel}>{label}</Text>
      <Text style={styles.profileValue}>{value}</Text>
    </View>
  );
}

// 🎨 Styles (unchanged)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#120608",
    padding: 20,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 120,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#F5E9EA",
    textAlign: "center",
    marginBottom: 25,
  },
  bigDiv: {
    width: "90%",
    borderWidth: 2,
    borderColor: "#3A2226",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#1E0F12",
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 12,
  },
  label: {
    color: "#B08A8E",
    fontWeight: "bold",
    marginBottom: 4,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#3A2226",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#2A171A",
    fontSize: 14,
  },
  profileRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: "#3A2226",
  },
  profileLabel: {
    fontWeight: "bold",
    color: "#B08A8E",
  },
  profileValue: {
    color: "#F5E9EA",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 15,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  activeBtn: {
    backgroundColor: "#FF3B4E",
  },
  btnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#120608",
  },
});
