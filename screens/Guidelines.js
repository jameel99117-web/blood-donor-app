import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const guidelines = [
  'Stay hydrated before and after donation.',
  'Eat a healthy meal before donating blood.',
  'Avoid alcohol and smoking 24 hours prior.',
  'Rest well and avoid heavy exercise post donation.',
];

export default function Guidelines() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Donation Guidelines</Text>

      {guidelines.map((guide, index) => (
        <Text key={index} style={styles.guideText}>• {guide}</Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  guideText: { fontSize: 16, marginBottom: 10, lineHeight: 22 },
});
