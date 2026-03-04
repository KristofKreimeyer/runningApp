# runningApp

A mobile jogging app for iOS and Android that lets you conquer territory on a real map, inspired by Pokémon Go.

## Features

- **Live map** – Your avatar moves on the map as you jog
- **Jogging detection** – The avatar animates while running (speed ≥ 1.5 m/s)
- **Territory conquest** – Tiles (~11 m × 11 m) are coloured in your colour as you jog through them
- **Reconquer** – Another player can take your tiles by jogging through them
- **Multiple players** – Pick from four colour-coded runner profiles

## Tech Stack

| Dependency | Purpose |
|---|---|
| [Expo](https://expo.dev) ~55 | Build & run on iOS and Android |
| [expo-location](https://docs.expo.dev/versions/latest/sdk/location/) | GPS tracking |
| [react-native-maps](https://github.com/react-native-maps/react-native-maps) | Interactive map |
| [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) | Persistence |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo Go](https://expo.dev/go) app on your phone **or** an iOS / Android simulator

### Install

```bash
npm install
```

### Run

```bash
# Start the Expo dev server
npm start

# Open on Android
npm run android

# Open on iOS (macOS only for simulator; use Expo Go app otherwise)
npm run ios
```

Scan the QR code with Expo Go or press `a` / `i` in the terminal to open a simulator.

### Test

```bash
npm test
```

## Project Structure

```
App.js                        # Root component – screen router
app.json                      # Expo config (permissions, icons)
src/
  context/AppContext.js        # Global state: current user, territory map
  screens/
    UserSelectScreen.js        # Player selection screen
    MapScreen.js               # Main map + tracking screen
  components/
    Avatar.js                  # Animated player marker
  utils/
    territory.js               # Tile key calculation & jogging detection
__tests__/
  territory.test.js            # Unit tests for territory utilities
```

## How Territory Works

The map is divided into a grid of tiles (~11 m × 11 m each). As you jog (GPS speed ≥ 1.5 m/s), every tile you pass through is coloured in your runner colour. If a different player jogs through the same tile later, it changes to their colour — reconquered!

> **Note:** Territory data is stored on-device. A production version would use a shared backend (e.g., Firebase) to synchronise tiles between players in real time.

