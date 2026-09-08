// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   ActivityIndicator,
// } from "react-native";

// const FIREBASE_DB_URL =
//   "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com";

// export default function NotificationsAdmin() {
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         const res = await fetch(`${FIREBASE_DB_URL}/notifications.json`);
//         const data = await res.json();

//         if (data) {
//           const arr = Object.entries(data).map(([id, value]) => ({
//             id,
//             message: value.message,
//             requestId: value.requestId,
//             seen: value.seen ?? false,
//             timestamp: value.timestamp,
//           }));

//           // Sort latest first
//           arr.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
//           setNotifications(arr);
//         }
//       } catch (err) {
//         console.log("Error fetching notifications:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchNotifications();
//   }, []);

//   if (loading)
//     return (
//       <ActivityIndicator
//         size="large"
//         color="#7B1E1E"
//         style={{ flex: 1, justifyContent: "center" }}
//       />
//     );

//   const renderItem = ({ item }) => {
//     return (
//       <View
//         style={[
//           styles.card,
//           !item.seen && { borderLeftWidth: 5, borderLeftColor: "#E53935" },
//         ]}
//       >
//         <Text style={styles.id}>Request ID: {item.requestId || "N/A"}</Text>
//         <Text style={styles.message}>{item.message}</Text>
//         <Text style={styles.timestamp}>
//           {item.timestamp
//             ? new Date(item.timestamp).toLocaleString()
//             : "Invalid Date"}
//         </Text>
//         {!item.seen && <Text style={styles.unseen}>New</Text>}
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Admin Notifications</Text>
//       <FlatList
//         data={notifications}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={{ paddingBottom: 30 }}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: "#FFF8E1" },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#7B1E1E",
//     marginBottom: 15,
//     textAlign: "center",
//   },
//   card: {
//     backgroundColor: "#FBE9E7",
//     padding: 15,
//     marginBottom: 12,
//     borderRadius: 12,
//   },
//   id: { fontSize: 12, color: "#999", marginBottom: 4 },
//   message: { color: "#333", fontSize: 16, marginBottom: 8 },
//   timestamp: { fontSize: 12, color: "#777", textAlign: "right" },
//   unseen: { color: "#E53935", fontWeight: "bold", marginTop: 5 },
// });
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import AdminScreenHeader from "../../Components/AdminScreenHeader";
import { darkColors } from "../../constants/theme";

const FIREBASE_DB_URL = "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com";

export default function NotificationsAdmin({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${FIREBASE_DB_URL}/notifications.json`);
        const data = await res.json();

        if (data) {
          const arr = Object.entries(data).map(([id, value]) => ({
            id,
            message: value.message,
            requestId: value.requestId || "N/A",
            seen: value.seen ?? false,
            timestamp: value.timestamp,
          }));

          arr.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // latest first
          setNotifications(arr);
        }
      } catch (err) {
        console.log("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading)
    return <ActivityIndicator size="large" color={darkColors.tabActive} style={styles.loader} />;

  const renderItem = ({ item }) => (
    <View style={[styles.card, !item.seen && { borderLeftWidth: 5, borderLeftColor: darkColors.tabActive }]}>
      <Text style={styles.id}>Request ID: {item.requestId}</Text>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.timestamp}>
        {item.timestamp ? new Date(item.timestamp).toLocaleString() : "Invalid Date"}
      </Text>
      {!item.seen && <Text style={styles.unseen}>New</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <AdminScreenHeader
        navigation={navigation}
        title="Notifications"
        subtitle="Monitor system activity"
      />
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: darkColors.background },
  listContent: { paddingBottom: 32 },
  loader: { flex: 1, justifyContent: "center", backgroundColor: darkColors.background },
  title: { fontSize: 28, fontWeight: "800", color: darkColors.textPrimary, marginBottom: 20 },
  card: { backgroundColor: darkColors.card, padding: 18, marginBottom: 14, borderRadius: 14, borderWidth: 0.5, borderColor: darkColors.cardBorder },
  id: { fontSize: 12, color: darkColors.textSecondary, marginBottom: 6 },
  message: { color: darkColors.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 10 },
  timestamp: { fontSize: 12, color: darkColors.textSecondary, textAlign: "right" },
  unseen: { color: darkColors.tabActive, fontWeight: "800", marginTop: 8 },
});
