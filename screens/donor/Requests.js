import React, { useEffect, useState } from "react";
import {
 
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Alert,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const FIREBASE_DB_URL = "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com";

const bloodCompatibility = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

export default function Requests({ route, navigation, userId: propUserId }) {
  const userId = propUserId || route?.params?.userId;
  const [loading, setLoading] = useState(true);
  const [bloodGroup, setBloodGroup] = useState(null);
  const [requests, setRequests] = useState([]);
  const [acceptingId, setAcceptingId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Health assessment states (null means unanswered)
  const [fever, setFever] = useState(null);
  const [cbcOk, setCbcOk] = useState(null);
  const [notDonatedThisMonth, setNotDonatedThisMonth] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      try {
        const userRes = await fetch(`${FIREBASE_DB_URL}/users/${userId}.json`);
        const userData = await userRes.json();

        const userBloodGroup = userData?.profile?.bloodGroup;

        if (!userBloodGroup) {
          Alert.alert(
            "Profile Incomplete",
            "Please update your profile with your blood group to see matching requests."
          );
          setLoading(false);
          return;
        }

        setBloodGroup(userBloodGroup);

        const reqRes = await fetch(`${FIREBASE_DB_URL}/requests.json`);
        const reqData = await reqRes.json();

        if (!reqData) {
          setRequests([]);
          setLoading(false);
          return;
        }

        const compatibleGroups = bloodCompatibility[userBloodGroup] || [];

        const matching = Object.entries(reqData)
          .filter(
            ([, req]) =>
              req.status === "Pending" && compatibleGroups.includes(req.bloodGroup)
          )
          .map(([key, req]) => ({ key, ...req }));

        setRequests(matching);
      } catch {
       Alert.alert("Error", "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  // Open modal and reset health questions
  const openHealthModal = (request) => {
    setSelectedRequest(request);
    setFever(null);
    setCbcOk(null);
    setNotDonatedThisMonth(null);
    setModalVisible(true);
  };

  const closeHealthModal = () => {
    setModalVisible(false);
    setSelectedRequest(null);
  };

  // Check if all health questions answered
  const allQuestionsAnswered = fever !== null && cbcOk !== null && notDonatedThisMonth !== null;

  // Validate and submit health form
  const handleHealthAssessmentSubmit = () => {
    if (!allQuestionsAnswered) {
     Alert.alert("Validation", "Please answer all health questions.");
      return;
    }

    if (fever === true) {
      Alert.alert(
        "Not Eligible",
        "You have had fever recently and cannot accept this request."
      );
      closeHealthModal();
      return;
    }

    if (cbcOk === true && notDonatedThisMonth === true) {
      acceptRequest(selectedRequest);
      closeHealthModal();
    } else {
    Alert.alert(
        "Health Check Failed",
        "You must pass all health checks to accept this request."
      );
      closeHealthModal();
    }
  };

  // Accept request and update Firebase
  const acceptRequest = async (request) => {
    if (!request?.key) {
    Alert.alert("Error", "Invalid request data");
      return;
    }

    setAcceptingId(request.key);

    try {
      // Update request status
      const updateRes = await fetch(
        `${FIREBASE_DB_URL}/requests/${request.key}.json`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "Accepted",
            acceptedBy: userId,
            acceptedAt: new Date().toISOString(),
          }),
        }
      );

      if (!updateRes.ok) throw new Error("Failed to update request status");

      // Save in donor history
      const historyRes = await fetch(
        `${FIREBASE_DB_URL}/DonorHistory/${userId}/${request.key}.json`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId: request.key,
            bloodGroup: request.bloodGroup,
            city: request.city,
            contact: request.contact,
            urgency: request.urgency,
            units: request.units,
            status: "Accepted",
            acceptedAt: new Date().toISOString(),
            healthCheck: { fever, cbcOk, notDonatedThisMonth },
          }),
        }
      );

      if (!historyRes.ok) throw new Error("Failed to save donor history");

      Alert.alert("Success", "Request accepted successfully!");
      setRequests((prev) => prev.filter((r) => r.key !== request.key));
    } catch (err) {
     Alert.alert("Error", err.message || "Something went wrong");
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7B1E1E" />
        <Text>Loading matching requests...</Text>
      </View>
    );
  }

  if (!bloodGroup) {
    return (
      <View style={styles.emptyContainer}>
        <Text>Please update your profile with your blood group to see matching requests.</Text>
      </View>
    );
  }

  if (requests.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No matching blood requests found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#F5E9EA" />
          </Pressable>
          <Text style={styles.screenTitle}>Matching Requests</Text>
        </View>
        <Text style={styles.groupSubtitle}>Compatible with {bloodGroup}</Text>

        {requests.map((req) => (
          <View key={req.key} style={styles.requestCard}>
            <RequestRow label="Blood Group" value={req.bloodGroup} />
            <RequestRow label="Units" value={req.units} />
            <RequestRow label="City" value={req.city} />
            <RequestRow label="Contact" value={req.contact} />
            <RequestRow label="Urgency" value={req.urgency} />
            <RequestRow label="Status" value={req.status} />

            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => openHealthModal(req)}
              disabled={acceptingId === req.key}
            >
              <Text style={styles.acceptBtnText}>
                {acceptingId === req.key ? "Accepting..." : "Accept"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Health Assessment</Text>

            <CheckRow
              text="No fever in the last 7 days?"
              value={fever}
              onChange={setFever}
            />
            <CheckRow text="CBC Test is OK?" value={cbcOk} onChange={setCbcOk} />
            <CheckRow
              text="Not donated blood this month?"
              value={notDonatedThisMonth}
              onChange={setNotDonatedThisMonth}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  !allQuestionsAnswered && { backgroundColor: "#aaa" },
                ]}
                disabled={!allQuestionsAnswered}
                onPress={handleHealthAssessmentSubmit}
              >
                <Text style={styles.modalBtnText}>Submit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={closeHealthModal}
              >
                <Text style={[styles.modalBtnText, { color: "#7B1E1E" }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function RequestRow({ label, value }) {
  return (
    <View style={styles.profileRow}>
      <Text style={styles.profileLabel}>{label}</Text>
      <Text style={styles.profileValue}>{value}</Text>
    </View>
  );
}

function CheckRow({ text, value, onChange }) {
  return (
    <View style={styles.checkRow}>
      <Text style={styles.checkText}>{text}</Text>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          style={[styles.checkBtn, value === true && styles.checkBtnActive]}
          onPress={() => onChange(true)}
        >
          <Text style={styles.checkBtnText}>YES</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.checkBtn, value === false && styles.checkBtnActive]}
          onPress={() => onChange(false)}
        >
          <Text style={styles.checkBtnText}>NO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#120608" },
  scrollContent: { padding: 20, paddingBottom: 120 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2A171A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  screenTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#F5E9EA",
    marginBottom: 0,
    flex: 1,
  },

  groupSubtitle: {
    color: "#B08A8E",
    fontSize: 14,
    marginBottom: 20,
  },

  requestCard: {
    backgroundColor: "#1E0F12",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#3A2226",
  },

  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  profileLabel: {
    fontWeight: "bold",
    color: "#B08A8E",
  },

  profileValue: {
    color: "#F5E9EA",
  },

  acceptBtn: {
    marginTop: 15,
    backgroundColor: "#FF3B4E",
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: "center",
  },

  acceptBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(18,6,8,0.72)",
    justifyContent: "center",
    padding: 20,
  },

  modalContainer: {
    backgroundColor: "#2A171A",
    borderRadius: 15,
    padding: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#F5E9EA",
  },

  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  modalBtn: {
    flex: 1,
    backgroundColor: "#FF3B4E",
    borderRadius: 25,
    padding: 12,
    alignItems: "center",
    marginHorizontal: 5,
  },

  modalCancelBtn: {
    backgroundColor: "#2A171A",
    borderWidth: 1,
    borderColor: "#FF3B4E",
  },

  modalBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  checkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },

  checkText: {
    fontSize: 14,
    color: "#F5E9EA",
    flex: 1,
    marginRight: 10,
  },

  checkBtn: {
    borderWidth: 1,
    borderColor: "#FF3B4E",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: "#1E0F12",
    marginLeft: 5,
  },

  checkBtnActive: {
    backgroundColor: "#FF3B4E",
  },

  checkBtnText: {
    color: "#F5E9EA",
    fontWeight: "bold",
  },
});
