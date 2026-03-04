const { getTileForLocation, isJogging, TILE_SIZE, JOGGING_SPEED_THRESHOLD } = require('../src/utils/territory');

describe('getTileForLocation', () => {
  test('returns a consistent key for the same position', () => {
    const a = getTileForLocation(48.137154, 11.576124);
    const b = getTileForLocation(48.137154, 11.576124);
    expect(a.key).toBe(b.key);
  });

  test('returns a different key for a position in the next tile', () => {
    const a = getTileForLocation(48.137000, 11.576000);
    const b = getTileForLocation(48.137000 + TILE_SIZE, 11.576000 + TILE_SIZE);
    expect(a.key).not.toBe(b.key);
  });

  test('returns 4 coordinates forming a closed square tile', () => {
    const { coords } = getTileForLocation(48.137154, 11.576124);
    expect(coords).toHaveLength(4);
    // All four corners must share the same south-west base
    const lats = coords.map((c) => parseFloat(c.latitude.toFixed(4)));
    const lngs = coords.map((c) => parseFloat(c.longitude.toFixed(4)));
    // Two distinct latitudes (south and north edges) and two distinct longitudes
    expect(new Set(lats).size).toBe(2);
    expect(new Set(lngs).size).toBe(2);
  });

  test('tile width and height equal TILE_SIZE', () => {
    const { coords } = getTileForLocation(48.0, 11.0);
    const latMin = Math.min(...coords.map((c) => c.latitude));
    const latMax = Math.max(...coords.map((c) => c.latitude));
    const lngMin = Math.min(...coords.map((c) => c.longitude));
    const lngMax = Math.max(...coords.map((c) => c.longitude));
    expect(latMax - latMin).toBeCloseTo(TILE_SIZE, 8);
    expect(lngMax - lngMin).toBeCloseTo(TILE_SIZE, 8);
  });

  test('nearby points within the same tile share a key', () => {
    // Use coordinates that avoid floating-point edge cases
    // 48.1000 / 0.0001 = 481000 exactly, so tile starts at 48.1000
    const base = 48.1000;
    // A second point a tiny fraction into the same tile
    const a = getTileForLocation(base + 0.000005, 11.0 + 0.000005);
    const b = getTileForLocation(base + 0.000008, 11.0 + 0.000008);
    expect(a.key).toBe(b.key);
  });
});

describe('isJogging', () => {
  test('returns true at exactly the threshold', () => {
    expect(isJogging(JOGGING_SPEED_THRESHOLD)).toBe(true);
  });

  test('returns true above the threshold', () => {
    expect(isJogging(3.5)).toBe(true);
  });

  test('returns false below the threshold', () => {
    expect(isJogging(0.8)).toBe(false);
  });

  test('returns false for zero speed', () => {
    expect(isJogging(0)).toBe(false);
  });

  test('returns false for null', () => {
    expect(isJogging(null)).toBe(false);
  });

  test('returns false for undefined', () => {
    expect(isJogging(undefined)).toBe(false);
  });
});
