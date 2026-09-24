import { createContext, useContext, useEffect, useState } from 'react';
import { lagosParts } from '../lib/time.js';

const ClockContext = createContext(null);

/**
 * Real-time clock in Lagos time. It checks every second but only re-renders
 * when the minute changes, which is all the UI shows.
 */
export function ClockProvider({ children }) {
  const [now, setNow] = useState(() => lagosParts());

  useEffect(() => {
    const id = window.setInterval(() => {
      const next = lagosParts();
      setNow((prev) => (prev.minutes === next.minutes && prev.day === next.day ? prev : next));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return <ClockContext.Provider value={now}>{children}</ClockContext.Provider>;
}

export function useNow() {
  const ctx = useContext(ClockContext);
  if (!ctx) throw new Error('useNow must be used inside <ClockProvider>');
  return ctx;
}
