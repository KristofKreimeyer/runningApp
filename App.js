import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';

import { AppProvider } from './src/context/AppContext';
import UserSelectScreen from './src/screens/UserSelectScreen';
import MapScreen from './src/screens/MapScreen';

export default function App() {
  const [screen, setScreen] = useState('select'); // 'select' | 'map'

  return (
    <AppProvider>
      <StatusBar style="dark" />
      {screen === 'select' ? (
        <UserSelectScreen onSelect={() => setScreen('map')} />
      ) : (
        <MapScreen onChangeUser={() => setScreen('select')} />
      )}
    </AppProvider>
  );
}
