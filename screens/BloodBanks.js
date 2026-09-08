import { useEffect, useRef } from 'react';
import {
  Animated,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const BloodBanks = [
  { id: 1, name: 'Karachi Blood Bank', address: '123 Main St, Karachi', phone: '0300-1234567' },
  { id: 2, name: 'Lahore Blood Center', address: '45 Street, Lahore', phone: '0321-7654321' },
  { id: 3, name: 'Islamabad Blood Bank', address: '67 Street, Islamabad', phone: '0312-1122334' },
  { id: 4, name: 'Multan Blood Bank', address: '89 Street, Multan', phone: '0333-4455667' },
];

export default function BloodBanks() {
  const animatedValues = useRef(bloodBanks.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = animatedValues.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: i * 150,
        useNativeDriver: true,
      })
    );
    Animated.stagger(150, animations).start();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nearby Blood Banks</Text>

      <View style={styles.row}>
        {bloodBanks.map((bank, index) => {
          const scale = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          });
          const opacity = animatedValues[index];

          return (
            <Animated.View 
              key={bank.id} 
              style={[styles.bankCard, { transform: [{ scale }], opacity }]}
            >
              <Text style={styles.bankName}>{bank.name}</Text>
              <Text style={styles.address}>{bank.address}</Text>
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${bank.phone}`)}>
                <Text style={styles.phone}>📞 {bank.phone}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    paddingVertical: 20, 
    paddingHorizontal: 10, 
    backgroundColor: '#FFFDE7',
    alignItems: 'center', // center everything
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 25, 
    textAlign: 'center', 
    color: '#7B1E1E',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap', // allow multiple rows
    justifyContent: 'center', // center the cards
  },
  bankCard: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    margin: 8, // space between cards
    alignSelf: 'flex-start', // allow card to shrink to content
    shadowColor: '#7B1E1E',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  bankName: { 
    fontWeight: '900', 
    fontSize: 20, 
    marginBottom: 6,
    color: '#7B1E1E',
  },
  address: {
    fontSize: 16,
    color: '#4A4A4A',
    marginBottom: 10,
  },
  phone: { 
    color: '#B00020',  
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
