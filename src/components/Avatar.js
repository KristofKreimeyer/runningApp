import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

/**
 * A simple avatar marker shown on the map.
 *
 * When `jogging` is true the avatar bobs up and down to convey movement.
 * The avatar colour matches the current user's profile colour.
 */
export default function Avatar({ jogging, color }) {
  const bobAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef(null);

  useEffect(() => {
    if (jogging) {
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(bobAnim, {
            toValue: -6,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(bobAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ])
      );
      loopRef.current.start();
    } else {
      if (loopRef.current) {
        loopRef.current.stop();
      }
      Animated.timing(bobAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (loopRef.current) {
        loopRef.current.stop();
      }
    };
  }, [jogging, bobAnim]);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: bobAnim }] }]}>
      {/* Colour indicator ring */}
      <View style={[styles.ring, { borderColor: color }]}>
        <Text style={styles.emoji}>{jogging ? '🏃' : '🧍'}</Text>
      </View>
      {/* Drop shadow dot */}
      <View style={[styles.shadow, { backgroundColor: color }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  ring: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  shadow: {
    width: 10,
    height: 4,
    borderRadius: 5,
    opacity: 0.3,
    marginTop: 2,
  },
});
