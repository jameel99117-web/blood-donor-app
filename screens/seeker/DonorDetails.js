import { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

export default function DonorDetails() {
  // Static donor data example
  const donor = {
    name: 'Ali Khan',
    bloodGroup: 'A+',
    age: 29,
    city: 'Karachi',
    phone: '0300-1234567',
    lastDonationDate: '2025-12-01',
    eligibleDate: '2026-02-01',
    donationCount: 5,
  };

  const keys = Object.keys(donor);

  // Animated values for each field
  const animatedValues = useRef(keys.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = keys.map((_, i) => {
      return Animated.timing(animatedValues[i], {
        toValue: 1,
        duration: 500,
        delay: i * 150,
        useNativeDriver: true,
      });
    });
    Animated.stagger(100, animations).start();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Donor Details</Text>

      {keys.map((key, index) => {
        const opacity = animatedValues[index];
        const translateY = animatedValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        });

        const scaleAnim = useRef(new Animated.Value(1)).current;

        const onPressIn = () => {
          Animated.spring(scaleAnim, {
            toValue: 0.97,
            useNativeDriver: true,
          }).start();
        };

        const onPressOut = () => {
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }).start();
        };

        return (
          <Animated.View
            key={key}
            style={[
              styles.detailCard,
              { opacity, transform: [{ translateY }, { scale: scaleAnim }] },
            ]}
          >
            <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut}>
              <View style={styles.cardContent}>
                <Text style={styles.label}>{formatLabel(key)}</Text>
                <Text style={styles.value}>{donor[key]}</Text>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}

// Helper to convert camelCase keys to readable labels
function formatLabel(key) {
  switch(key) {
    case 'name': return 'Name';
    case 'bloodGroup': return 'Blood Group';
    case 'age': return 'Age';
    case 'city': return 'City';
    case 'phone': return 'Phone';
    case 'lastDonationDate': return 'Last Donation Date';
    case 'eligibleDate': return 'Next Eligible Donation Date';
    case 'donationCount': return 'Total Donations';
    default: return key;
  }
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#FFF8E1',
    flexGrow: 1,
    alignItems: 'center', // center all cards horizontally
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 30,
    textAlign: 'center',
    color: '#7B1E1E',
  },
  detailCard: {
    width: '80%', // smaller width for form-like look
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
    shadowColor: '#7B1E1E',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  label: {
    fontWeight: '600',
    fontSize: 15,
    color: '#7B1E1E',
  },
  value: {
    fontSize: 15,
    color: '#3E2723',
    textAlign: 'right',
  },
});
