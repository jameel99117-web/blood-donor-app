// import React, { useEffect, useState } from "react";
// import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";

// const FIREBASE_DB_URL = "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com";

// export default function NotificationsAdmin() {
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         const res = await fetch(`${FIREBASE_DB_URL}/notifications.json`);
//         const data = await res.json();
//         if (data) {
//           const notifArray = Object.entries(data).map(([id, value]) => ({ id, ...value }));
//           setNotifications(notifArray.reverse()); // latest first
//         }
//       } catch (err) {
//         console.log(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchNotifications();
//   }, []);

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <Text style={styles.text}>{item.message}</Text>
//       <Text style={styles.time}>{new Date(item.timestamp).toLocaleString()}</Text>
//     </View>
//   );

//   if (loading) return <ActivityIndicator size="large" color="#7B1E1E" style={{ flex: 1, justifyContent: "center" }} />;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>All Notifications</Text>
//       <FlatList
//         data={notifications}
//         keyExtractor={item => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={{ paddingBottom: 30 }}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: "#FFF8E1" },
//   title: { fontSize: 24, fontWeight: "bold", color: "#7B1E1E", marginBottom: 15, textAlign: "center" },
//   card: { backgroundColor: "#FBE9E7", padding: 15, marginBottom: 12, borderRadius: 10 },
//   text: { fontSize: 16, color: "#4A2C2C" },
//   time: { fontSize: 12, color: "#6D4C41", marginTop: 6, textAlign: "right" },
// });

import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { darkColors } from "../../constants/theme";
import AdminScreenHeader from "../../Components/AdminScreenHeader";

const FIREBASE_DB_URL = "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com";

export default function SeekerListAdmin({ navigation }) {
  const [seekers, setSeekers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeekers = async () => {
      try {
        const res = await fetch(`${FIREBASE_DB_URL}/users.json`);
        const data = await res.json();
        if (data) {
          const seekerArr = Object.entries(data)
            .filter(([id, user]) => user.role === "Seeker")
            .map(([id, user]) => ({ id, ...user })); // just spread all Firebase fields
          setSeekers(seekerArr);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSeekers();
  }, []);

  if (loading)
    return <ActivityIndicator size="large" color={darkColors.tabActive} style={styles.loader} />;

  return (
    <View style={styles.container}>
      <AdminScreenHeader
        navigation={navigation}
        title="Seeker Directory"
        subtitle="Review registered seekers"
      />
      <FlatList
        data={seekers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>Email: {item.email}</Text>
            <Text style={styles.meta}>Phone: {item.phone}</Text>
            <Text style={styles.meta}>Role: {item.role}</Text>
            <Text style={styles.timestamp}>Created At: {item.createdAt}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: darkColors.background },
  listContent: { paddingBottom: 32 },
  loader: { flex: 1, justifyContent: "center", backgroundColor: darkColors.background },
  title: { fontSize: 28, fontWeight: "800", color: darkColors.textPrimary, marginBottom: 20 },
  card: { backgroundColor: darkColors.card, padding: 18, borderRadius: 14, marginBottom: 14, borderWidth: 0.5, borderColor: darkColors.cardBorder },
  name: { fontSize: 18, fontWeight: "800", color: darkColors.textPrimary, marginBottom: 10 },
  meta: { color: darkColors.textSecondary, fontSize: 14, lineHeight: 22 },
  timestamp: { color: darkColors.textSecondary, fontSize: 12, marginTop: 8 },
});
