import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { asset } from "../lib/assets.js";

const DataContext = createContext(null);

async function loadJSON(path) {
  const res = await fetch(asset(path));
  if (!res.ok) throw new Error(`Could not load ${path} (${res.status})`);
  return res.json();
}

/** Loads the market and produce JSON files once and shares them with the whole app. */
export function DataProvider({ children }) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    markets: null,
    produce: null,
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadJSON("/data/markets.json"),
      loadJSON("/data/produce.json"),
    ])
      .then(([markets, produce]) => {
        if (!cancelled)
          setState({ loading: false, error: null, markets, produce });
      })
      .catch((error) => {
        if (!cancelled)
          setState({ loading: false, error, markets: null, produce: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    if (!state.markets || !state.produce)
      return { loading: state.loading, error: state.error, ready: false };
    const produceById = Object.fromEntries(
      state.produce.items.map((p) => [p.id, p]),
    );
    const marketById = Object.fromEntries(
      state.markets.markets.map((m) => [m.id, m]),
    );
    const marketsByProduce = {};
    for (const m of state.markets.markets) {
      for (const id of m.produce) (marketsByProduce[id] ||= []).push(m.id);
    }
    return {
      ready: true,
      loading: false,
      error: null,
      markets: state.markets.markets,
      marketById,
      areas: state.markets.areas,
      regions: state.markets.regions,
      defaultLocation: state.markets.defaultLocation,
      produce: state.produce.items,
      produceById,
      marketsByProduce,
      categories: state.produce.categories,
      months: state.produce.months,
    };
  }, [state]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

/* eslint-disable-next-line react-refresh/only-export-components */
export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside <DataProvider>");
  return ctx;
}
