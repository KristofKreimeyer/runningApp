import React, { createContext, useContext, useState, useCallback } from 'react';

// Predefined user profiles so multiple "players" can be simulated on device
export const USER_PROFILES = [
  { id: 'user1', name: 'Runner Red',   color: '#E53935', fillColor: 'rgba(229,57,53,0.35)' },
  { id: 'user2', name: 'Runner Blue',  color: '#1E88E5', fillColor: 'rgba(30,136,229,0.35)' },
  { id: 'user3', name: 'Runner Green', color: '#43A047', fillColor: 'rgba(67,160,71,0.35)' },
  { id: 'user4', name: 'Runner Gold',  color: '#FB8C00', fillColor: 'rgba(251,140,0,0.35)' },
];

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Currently active user profile
  const [currentUser, setCurrentUser] = useState(USER_PROFILES[0]);

  // territory: { [tileKey]: { owner: userId, color: string, fillColor: string, coords: Array } }
  const [territory, setTerritory] = useState({});

  const claimTile = useCallback((tileKey, coords) => {
    setTerritory((prev) => ({
      ...prev,
      [tileKey]: {
        owner: currentUser.id,
        color: currentUser.color,
        fillColor: currentUser.fillColor,
        coords,
      },
    }));
  }, [currentUser]);

  return (
    <AppContext.Provider value={{ currentUser, setCurrentUser, territory, claimTile }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
