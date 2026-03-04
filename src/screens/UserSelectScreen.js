import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { USER_PROFILES, useApp } from '../context/AppContext';

/**
 * Simple player-selection screen shown before the map.
 * Lets the user pick their runner profile (name + colour).
 */
export default function UserSelectScreen({ onSelect }) {
  const { setCurrentUser } = useApp();

  function handleSelect(profile) {
    setCurrentUser(profile);
    onSelect();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>🏃 Running App</Text>
        <Text style={styles.subtitle}>Choose your runner</Text>

        {USER_PROFILES.map((profile) => (
          <TouchableOpacity
            key={profile.id}
            style={[styles.card, { borderColor: profile.color }]}
            onPress={() => handleSelect(profile)}
            accessibilityRole="button"
            accessibilityLabel={`Select ${profile.name}`}
          >
            <View style={[styles.dot, { backgroundColor: profile.color }]} />
            <Text style={[styles.cardText, { color: profile.color }]}>{profile.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    color: '#1A237E',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 18,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: '#fff',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 14,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
