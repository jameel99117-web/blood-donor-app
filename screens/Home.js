import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const stats = [
  { id: '1', label: 'Registered Donors', value: '1,250+', icon: 'account-group' },
  { id: '2', label: 'Successful Donations', value: '320+', icon: 'heart' },
  { id: '3', label: 'Blood Requests', value: '85', icon: 'clipboard-list' },
  { id: '4', label: 'Blood Banks', value: '12', icon: 'hospital-building' },
];

const activities = [
  'New blood request added in Karachi',
  '5 donors registered today',
  'Blood bank updated availability',
  'Feedback received from donor John Doe',
];

export default function Home({ navigation }) {
  const heroAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const statsAnim = useRef(stats.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(heroAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();

    // Hero pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    // Stats stagger
    Animated.stagger(
      150,
      statsAnim.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>

      {/* HERO */}
      <Animated.View
        style={[
          styles.hero,
          {
            opacity: heroAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Text style={styles.heroTitle}>Blood Donor Finder</Text>
        <Text style={styles.heroSubtitle}>
          Connecting lives through kindness ❤️
        </Text>
      </Animated.View>

      {/* STATS */}
      <View style={styles.statsContainer}>
        {stats.map((item, index) => (
          <Animated.View
            key={item.id}
            style={[
              styles.statCard,
              {
                opacity: statsAnim[index],
                transform: [
                  {
                    scale: statsAnim[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.7, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <MaterialCommunityIcons name={item.icon} size={44} color="#B11226" />
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </Animated.View>
        ))}
      </View>

      {/* ACTIVITY */}
      <View style={styles.activityContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>

        {activities.map((activity, index) => (
          <Animated.View
            key={index}
            style={[
              styles.activityItem,
              {
                opacity: heroAnim,
                transform: [{ translateX: heroAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-40, 0],
                })}],
              },
            ]}
          >
            <FontAwesome5 name="heartbeat" size={16} color="#B11226" />
            <Text style={styles.activityText}>{activity}</Text>
          </Animated.View>
        ))}
      </View>

      
    
    </ScrollView>
  );
}

/* BUTTON */
const ActionButton = ({ icon, text, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <TouchableOpacity
        style={styles.actionButton}
        activeOpacity={0.9}
        onPressIn={() => Animated.spring(scale, { toValue: 0.93, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start()}
        onPress={onPress}
      >
        {icon}
        <Text style={styles.actionText}>{text}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCEDEE',
    paddingHorizontal: 20,
    paddingTop: 35,
  },

  hero: {
    alignItems: 'center',
    marginBottom: 35,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#4A0F16',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#7A2A33',
    marginTop: 8,
  },

  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 35,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFF',
    paddingVertical: 28,
    borderRadius: 22,
    marginBottom: 18,
    alignItems: 'center',
    elevation: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A0F16',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 14,
    color: '#777',
    marginTop: 6,
    textAlign: 'center',
  },

  activityContainer: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4A0F16',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    elevation: 5,
  },
  activityText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
  },

  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    marginHorizontal: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4A0F16',
    marginLeft: 10,
  },
});
