import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const donors = [
  { id: 1, name: 'Ali Khan', bloodGroup: 'A+', city: 'Karachi', distance: '2.5 km' },
  { id: 2, name: 'Sara Ahmed', bloodGroup: 'B-', city: 'Lahore', distance: '5 km' },
  { id: 3, name: 'Hamid Raza', bloodGroup: 'O+', city: 'Islamabad', distance: '10 km' },
];

export default function Search() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Search Donors</Text>

      {donors.map(donor => (
        <View key={donor.id} style={styles.donorCard}>
          <Text style={styles.donorName}>{donor.name}</Text>
          <Text style={styles.label}>Blood Group: <Text style={styles.value}>{donor.bloodGroup}</Text></Text>
          <Text style={styles.label}>City: <Text style={styles.value}>{donor.city}</Text></Text>
          <Text style={styles.label}>Distance: <Text style={styles.value}>{donor.distance}</Text></Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 20,
    backgroundColor: '#FFF8E1', // light beige background
    flexGrow: 1,
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center',
    color: '#7B1E1E', // maroon
  },
  donorCard: {
    backgroundColor: '#FBE9E7', // very light beige with red tint
    borderRadius: 10,
    padding: 18,
    marginBottom: 15,
    borderLeftWidth: 6,
    borderLeftColor: '#7B1E1E', // maroon accent
    shadowColor: '#7B1E1E',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  donorName: {
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 8,
    color: '#4A2C2C',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6D4C41',
    marginBottom: 4,
  },
  value: {
    fontWeight: '400',
    color: '#5D4037',
  },
});
