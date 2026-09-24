import { useMemo } from 'react';
import { useData } from '../context/DataContext.jsx';
import { useNow } from '../context/ClockContext.jsx';
import { useUserLocation } from '../context/LocationContext.jsx';
import { decorate } from './filters.js';

/** All markets with live status and distance from the current location. */
export function useDecoratedMarkets() {
  const { markets } = useData();
  const now = useNow();
  const { origin } = useUserLocation();
  return useMemo(() => decorate(markets, { now, origin }), [markets, now, origin]);
}
