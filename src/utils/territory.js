/**
 * Territory utility helpers.
 *
 * The map is divided into a grid of tiles.  Each tile is TILE_SIZE degrees wide
 * and tall (≈ 11 m at most latitudes for 0.0001°).  A tile is identified by a
 * string key built from the rounded south-west corner of that tile.
 */

// Tile size in decimal degrees  (~11 m at the equator)
export const TILE_SIZE = 0.0001;

/**
 * Return the tile key and the four corner coordinates for the tile that
 * contains the given latitude / longitude.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {{ key: string, coords: Array<{latitude: number, longitude: number}> }}
 */
export function getTileForLocation(latitude, longitude) {
  const tileLat = Math.floor(latitude / TILE_SIZE) * TILE_SIZE;
  const tileLng = Math.floor(longitude / TILE_SIZE) * TILE_SIZE;

  const key = `${tileLat.toFixed(6)}_${tileLng.toFixed(6)}`;

  const coords = [
    { latitude: tileLat,             longitude: tileLng },
    { latitude: tileLat + TILE_SIZE, longitude: tileLng },
    { latitude: tileLat + TILE_SIZE, longitude: tileLng + TILE_SIZE },
    { latitude: tileLat,             longitude: tileLng + TILE_SIZE },
  ];

  return { key, coords };
}

/**
 * Speed threshold (m/s) above which the user is considered to be jogging.
 * Walking is typically < 1.5 m/s; jogging starts around 2 m/s.
 */
export const JOGGING_SPEED_THRESHOLD = 1.5;

/**
 * Returns true when the given speed (m/s) qualifies as jogging.
 * @param {number|null} speed
 */
export function isJogging(speed) {
  return typeof speed === 'number' && speed >= JOGGING_SPEED_THRESHOLD;
}
