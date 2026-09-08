import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const notifications = [
  'New urgent blood request near your location.',
  'Your donation request has been accepted.',
  'Reminder: Next eligible donation date is 20 Jan 2026.',
];

export default function Notifications() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Notifications</Text>

      {notifications.map((note, index) => (
        <View key={index} style={styles.notificationCard}>
          <Text style={styles.notificationText}>{note}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    backgroundColor: '#FFFDE7', // beige background
    flexGrow: 1,
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center', 
    color: '#7B1E1E', // maroon
  },
  notificationCard: {
    backgroundColor: '#FBE9E7',  // light beige with a hint of red
    padding: 15,
    marginBottom: 12,
    borderRadius: 10,
    borderLeftWidth: 6,
    borderLeftColor: '#7B1E1E',  // maroon accent
    shadowColor: '#7B1E1E',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  notificationText: {
    color: '#4A2C2C',
    fontSize: 16,
  }
});
