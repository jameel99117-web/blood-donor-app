// import React, { useEffect, useState } from "react";
// import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";

// const FIREBASE_DB_URL = "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com";

// export default function DonorListAdmin() {
//   const [donors, setDonors] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch(`${FIREBASE_DB_URL}/users.json`)
//       .then(res => res.json())
//       .then(data => {
//         if (data) {
//           const donorArr = Object.entries(data)
//             .filter(([id, user]) => user.role === "Donor")
//             .map(([id, user]) => ({ id, ...user }));
//           setDonors(donorArr);
//         }
//         setLoading(false);
//       })
//       .catch(err => { console.log(err); setLoading(false); });
//   }, []);

//   if (loading) return <ActivityIndicator size="large" color="#7B1E1E" style={{flex:1,justifyContent:"center"}} />;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Donors List</Text>
//       <FlatList
//         data={donors}
//         keyExtractor={item => item.id}
//         renderItem={({item}) => (
//           <View style={styles.card}>
//             <Text style={styles.name}>{item.name}</Text>
//             <Text>Email: {item.email}</Text>
//             <Text>Blood Group: {item.bloodGroup}</Text>
//             <Text>City: {item.city}</Text>
//           </View>
//         )}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container:{ flex:1, padding:20, backgroundColor:"#FFF8E1" },
//   title:{ fontSize:24, fontWeight:"bold", color:"#7B1E1E", marginBottom:15, textAlign:"center" },
//   card:{ backgroundColor:"#FBE9E7", padding:15, borderRadius:12, marginBottom:12 },
//   name:{ fontWeight:"700", color:"#4A2C2C", marginBottom:5 }
// });
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { darkColors } from "../../constants/theme";
import AdminScreenHeader from "../../Components/AdminScreenHeader";

const FIREBASE_DB_URL = "https://blooddonationapp-4fbdc-default-rtdb.firebaseio.com";

export default function DonorListAdmin({ navigation }) {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const res = await fetch(`${FIREBASE_DB_URL}/users.json`);
        const data = await res.json();
        if (data) {
          const donorArr = Object.entries(data)
            .filter(([id, user]) => user.role === "Donor")
            .map(([id, user]) => ({ id, ...user })); // just spread all Firebase fields
          setDonors(donorArr);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonors();
  }, []);

  if (loading)
    return <ActivityIndicator size="large" color={darkColors.tabActive} style={styles.loader} />;

  return (
    <View style={styles.container}>
      <AdminScreenHeader
        navigation={navigation}
        title="Donor Directory"
        subtitle="Review registered donors"
      />
      <FlatList
        data={donors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>Email: {item.email}</Text>
            {item.bloodGroup && <Text style={styles.meta}>Blood Group: {item.bloodGroup}</Text>}
            {item.city && <Text style={styles.meta}>City: {item.city}</Text>}
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
