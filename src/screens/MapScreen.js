import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';

import Avatar from '../components/Avatar';
import { useApp } from '../context/AppContext';
import { getTileForLocation, isJogging } from '../utils/territory';

// How often we request a new GPS fix (milliseconds)
const LOCATION_INTERVAL_MS = 2000;

// Minimum distance (metres) the device must move before a new location event fires
const LOCATION_DISTANCE_M = 5;

export default function MapScreen({ onChangeUser }) {
  const { currentUser, territory, claimTile } = useApp();

  const [location, setLocation] = useState(null);
  const [speed, setSpeed]       = useState(null);
  const [tracking, setTracking] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const mapRef   = useRef(null);
  const subRef   = useRef(null);   // location subscription

  const jogging = isJogging(speed);

  // ─── Permissions ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission is required to track your run.');
        return;
      }
      // Get an initial fix so the map is not empty on first launch
      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(initial.coords);
      centerMap(initial.coords);
    })();
  }, []);

  // ─── Clean up subscription on unmount ─────────────────────────────────────
  useEffect(() => {
    return () => stopTracking();
  }, []);

  // ─── Map helpers ──────────────────────────────────────────────────────────
  function centerMap(coords) {
    mapRef.current?.animateToRegion(
      {
        latitude:       coords.latitude,
        longitude:      coords.longitude,
        latitudeDelta:  0.003,
        longitudeDelta: 0.003,
      },
      500
    );
  }

  // ─── Location update handler ───────────────────────────────────────────────
  const handleLocationUpdate = useCallback(
    (locationData) => {
      const { coords } = locationData;
      setLocation(coords);
      setSpeed(coords.speed ?? null);

      if (isJogging(coords.speed)) {
        const { key, coords: tileCoords } = getTileForLocation(
          coords.latitude,
          coords.longitude
        );
        claimTile(key, tileCoords);
      }
    },
    [claimTile]
  );

  // ─── Start / stop tracking ────────────────────────────────────────────────
  async function startTracking() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Location permission is required to track your run.');
      return;
    }

    const sub = await Location.watchPositionAsync(
      {
        accuracy:          Location.Accuracy.BestForNavigation,
        timeInterval:      LOCATION_INTERVAL_MS,
        distanceInterval:  LOCATION_DISTANCE_M,
      },
      handleLocationUpdate
    );

    subRef.current = sub;
    setTracking(true);
  }

  function stopTracking() {
    subRef.current?.remove();
    subRef.current = null;
    setTracking(false);
    setSpeed(null);
  }

  function toggleTracking() {
    if (tracking) {
      stopTracking();
    } else {
      startTracking();
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  if (errorMsg) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  const initialRegion = location
    ? {
        latitude:       location.latitude,
        longitude:      location.longitude,
        latitudeDelta:  0.003,
        longitudeDelta: 0.003,
      }
    : {
        // Default to a central European location until GPS fix arrives
        latitude:       48.137154,
        longitude:      11.576124,
        latitudeDelta:  0.05,
        longitudeDelta: 0.05,
      };

  const tileEntries = Object.entries(territory);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        rotateEnabled={false}
        mapType="standard"
      >
        {/* Conquered territory polygons */}
        {tileEntries.map(([key, tile]) => (
          <Polygon
            key={key}
            coordinates={tile.coords}
            strokeColor={tile.color}
            fillColor={tile.fillColor}
            strokeWidth={1}
          />
        ))}

        {/* Player avatar marker */}
        {location && (
          <Marker
            coordinate={{
              latitude:  location.latitude,
              longitude: location.longitude,
            }}
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={jogging}
          >
            <Avatar jogging={jogging} color={currentUser.color} />
          </Marker>
        )}
      </MapView>

      {/* ── HUD overlay ── */}
      <View style={styles.hud}>
        {/* Speed badge */}
        <View style={styles.speedBadge}>
          <Text style={styles.speedValue}>
            {speed != null ? (speed * 3.6).toFixed(1) : '—'}
          </Text>
          <Text style={styles.speedUnit}>km/h</Text>
        </View>

        {/* Status badge */}
        <View style={[styles.statusBadge, jogging ? styles.joggingBadge : styles.walkingBadge]}>
          <Text style={styles.statusText}>{jogging ? '🏃 Jogging' : '🧍 Standing'}</Text>
        </View>

        {/* Tiles badge */}
        <View style={styles.tilesBadge}>
          <Text style={styles.tilesValue}>{tileEntries.length}</Text>
          <Text style={styles.tilesLabel}>tiles</Text>
        </View>
      </View>

      {/* ── Bottom bar ── */}
      <View style={styles.bottomBar}>
        {/* Change user */}
        <TouchableOpacity
          style={[styles.userButton, { borderColor: currentUser.color }]}
          onPress={onChangeUser}
          accessibilityRole="button"
          accessibilityLabel="Change runner"
        >
          <View style={[styles.userDot, { backgroundColor: currentUser.color }]} />
          <Text style={[styles.userName, { color: currentUser.color }]}>{currentUser.name}</Text>
        </TouchableOpacity>

        {/* Track / Stop */}
        <TouchableOpacity
          style={[styles.trackButton, tracking ? styles.trackButtonStop : styles.trackButtonStart]}
          onPress={toggleTracking}
          accessibilityRole="button"
          accessibilityLabel={tracking ? 'Stop tracking' : 'Start tracking'}
        >
          <Text style={styles.trackButtonText}>{tracking ? '■ Stop' : '▶ Start'}</Text>
        </TouchableOpacity>

        {/* Center map */}
        <TouchableOpacity
          style={styles.centerButton}
          onPress={() => location && centerMap(location)}
          accessibilityRole="button"
          accessibilityLabel="Center map on my location"
        >
          <Text style={styles.centerIcon}>⊕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    textAlign: 'center',
  },

  // ── HUD ──────────────────────────────────────────────────────────────────
  hud: {
    position: 'absolute',
    top: 52,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    pointerEvents: 'none',
  },
  speedBadge: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  speedValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A237E',
  },
  speedUnit: {
    fontSize: 11,
    color: '#555',
    fontWeight: '600',
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  joggingBadge: {
    backgroundColor: 'rgba(67,160,71,0.92)',
  },
  walkingBadge: {
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A237E',
  },
  tilesBadge: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  tilesValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A237E',
  },
  tilesLabel: {
    fontSize: 11,
    color: '#555',
    fontWeight: '600',
  },

  // ── Bottom bar ────────────────────────────────────────────────────────────
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 12,
  },
  userDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
  },
  trackButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    paddingVertical: 12,
  },
  trackButtonStart: {
    backgroundColor: '#1E88E5',
  },
  trackButtonStop: {
    backgroundColor: '#E53935',
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  centerButton: {
    marginLeft: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerIcon: {
    fontSize: 22,
    color: '#1A237E',
  },
});
