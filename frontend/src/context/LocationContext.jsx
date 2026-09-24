import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useData } from './DataContext.jsx';
import { nearestArea } from '../lib/geo.js';
import { readJSON, sessionStore, writeJSON } from '../lib/storage.js';

const LocationContext = createContext(null);
const KEY = 'ff:location';

/**
 * Where distances are measured from. Starts at the default (Lekki Phase 1),
 * can be set to the visitor's real position (browser geolocation) or to an area they pick.
 * The position is only kept for this browser session and never leaves the device.
 */
export function LocationProvider({ children }) {
  const { ready, areas, defaultLocation } = useData();
  const [stored, setStored] = useState(() => readJSON(sessionStore, KEY, null));
  const [status, setStatus] = useState('idle'); // idle | locating | denied | unavailable

  const save = useCallback((value) => {
    setStored(value);
    writeJSON(sessionStore, KEY, value);
  }, []);

  const requestDeviceLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unavailable');
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus('idle');
        save({ source: 'device', lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, [save]);

  const chooseArea = useCallback(
    (name) => {
      const area = areas?.find((a) => a.name === name);
      if (area) save({ source: 'area', area: area.name, lat: area.lat, lng: area.lng });
    },
    [areas, save],
  );

  const reset = useCallback(() => save(null), [save]);

  const value = useMemo(() => {
    if (!ready) return null;
    let origin;
    if (stored?.source === 'device') {
      const area = nearestArea(stored, areas);
      origin = { lat: stored.lat, lng: stored.lng, source: 'device', area: area?.name, label: area ? area.place : 'Your location' };
    } else if (stored?.source === 'area') {
      const area = areas.find((a) => a.name === stored.area) || areas[0];
      origin = { lat: area.lat, lng: area.lng, source: 'area', area: area.name, label: area.place };
    } else {
      origin = { ...defaultLocation, source: 'default' };
    }
    return { origin, status, requestDeviceLocation, chooseArea, reset };
  }, [ready, stored, areas, defaultLocation, status, requestDeviceLocation, chooseArea, reset]);

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useUserLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useUserLocation must be used inside <LocationProvider> after data has loaded');
  return ctx;
}
