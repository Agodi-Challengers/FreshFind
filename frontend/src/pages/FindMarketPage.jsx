import { useEffect, useMemo, useRef, useState } from "react";
import PageBanner from "../components/PageBanner.jsx";
import Icon from "../components/Icon.jsx";
import Dropdown from "../components/Dropdown.jsx";
import SearchBox from "../components/SearchBox.jsx";
import MarketRow from "../components/MarketRow.jsx";
import LagosMap from "../components/LagosMap.jsx";
import { useData } from "../context/DataContext.jsx";
import { useNow } from "../context/ClockContext.jsx";
import { useUserLocation } from "../context/LocationContext.jsx";
import { useDecoratedMarkets } from "../lib/useMarkets.js";
import { useUrlFilters } from "../lib/useFilters.js";
import {
  applyFilters,
  sortMarkets,
  activeFilterChips,
  hasActiveFilters,
  EMPTY_FILTERS,
} from "../lib/filters.js";
import {
  areaDropdown,
  dayDropdown,
  timeDropdown,
  produceDropdown,
  sortDropdown,
} from "../lib/quickFilters.js";
import { DAY_SHORT, formatMinutes } from "../lib/time.js";
import "./FindMarketPage.css";

export default function FindMarketPage() {
  const data = useData();
  const now = useNow();
  const { origin, status, requestDeviceLocation } = useUserLocation();
  const markets = useDecoratedMarkets();
  const [filters, setFilters] = useUrlFilters();
  const [selectedId, setSelectedId] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchWrapRef = useRef(null);

  useEffect(() => {
    if (!searchOpen) return undefined;
    const close = (e) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    const onDown = (e) => {
      if (!searchWrapRef.current?.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("mousedown", onDown);
    };
  }, [searchOpen]);

  const results = useMemo(
    () =>
      sortMarkets(
        applyFilters(markets, filters, data.produceById),
        filters.sort,
      ),
    [markets, filters, data.produceById],
  );
  const chips = activeFilterChips(filters, now);

  const area = areaDropdown(filters, { ...data, markets });
  const day = dayDropdown(filters, now);
  const time = timeDropdown(filters, markets);
  const produceFilter = produceDropdown(filters, { ...data, markets });
  const sort = sortDropdown(filters);

  return (
    <div className="find">
      <PageBanner
        crumbs={[{ label: "Home", to: "/" }, { label: "Find a Market" }]}
      />

      <div className="find__toolbar">
        <div className="container find__toolbar-inner">
          <Dropdown
            icon="map-pin"
            label="Area"
            value={area.value}
            options={area.options}
            onChange={(v) => setFilters({ ...filters, areas: area.apply(v) })}
            className="find__dd"
          />
          <Dropdown
            icon="calendar"
            label="Date"
            value={day.value}
            options={day.options}
            onChange={(v) => setFilters({ ...filters, days: day.apply(v) })}
            className="find__dd"
          />
          <Dropdown
            icon="clock"
            label="Time"
            value={time.value}
            options={time.options}
            onChange={(v) => setFilters({ ...filters, time: time.apply(v) })}
            className="find__dd find__dd--time"
            panelWidth={300}
          />
          <Dropdown
            icon="carrot"
            label="Produce"
            value={produceFilter.value}
            options={produceFilter.options}
            onChange={(v) =>
              setFilters({ ...filters, cats: produceFilter.apply(v) })
            }
            className="find__dd find__dd--produce"
          />
          <button
            type="button"
            className="find__use-location"
            onClick={requestDeviceLocation}
          >
            <Icon name="locate-fixed" size={16} />
            {status === "locating" ? "Finding you…" : "Use my location"}
          </button>
          <div className="find__search-wrap" ref={searchWrapRef}>
            {searchOpen ? (
              <SearchBox
                value={filters.q}
                onChange={(q) => setFilters({ ...filters, q })}
                onSubmit={(q) => {
                  setFilters({ ...filters, q });
                  setSearchOpen(false);
                }}
                onPick={(opt) => {
                  setSearchOpen(false);
                  opt.type === "category"
                    ? setFilters({ ...filters, q: "", cats: [opt.value] })
                    : setFilters({ ...filters, q: opt.value });
                }}
                markets={markets}
                className="find__search"
                autoFocus
              />
            ) : (
              <button
                type="button"
                className="btn btn--primary find__search-btn"
                onClick={() => setSearchOpen(true)}
              >
                <Icon name="search" size={16} />
                Search
              </button>
            )}
          </div>
        </div>
      </div>

      {status === "denied" && (
        <p className="find__notice container" role="status">
          Location access is off, so distances are measured from {origin.label}.
          You can pick an area instead.
        </p>
      )}

      <div className="container find__split">
        <section className="find__list-col" aria-labelledby="find-count">
          <div className="find__head">
            <h1 id="find-count" className="find__count" aria-live="polite">
              {results.length}{" "}
              {results.length === 1 ? "market matches" : "markets match"}
            </h1>
            <Dropdown
              icon="arrow-up-down"
              label="Sort by"
              value={sort.value}
              options={sort.options}
              onChange={(v) => setFilters({ ...filters, sort: v })}
              className="find__sort"
              align="right"
            />
          </div>

          <div className="find__active">
            {hasActiveFilters(filters) ? (
              <>
                {chips.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    className="filter-chip filter-chip--dark"
                    onClick={() => setFilters(c.remove(filters))}
                    aria-label={`Remove filter ${c.label}`}
                  >
                    {c.label} ×
                  </button>
                ))}
                <button
                  type="button"
                  className="text-btn text-btn--accent"
                  onClick={() =>
                    setFilters({ ...EMPTY_FILTERS, sort: filters.sort })
                  }
                >
                  Clear all
                </button>
              </>
            ) : (
              <span className="muted">
                Distances from {origin.label} · {DAY_SHORT[now.dayKey]}{" "}
                {formatMinutes(now.minutes)}
              </span>
            )}
          </div>

          {results.length ? (
            <div className="find__rows">
              {results.map((m) => (
                <MarketRow
                  key={m.id}
                  market={m}
                  selected={m.id === selectedId}
                  onSelect={setSelectedId}
                  onHover={setHoverId}
                />
              ))}
            </div>
          ) : (
            <div className="empty">
              <strong>No markets match</strong>
              <span>Try another day, time or area.</span>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() =>
                  setFilters({ ...EMPTY_FILTERS, sort: filters.sort })
                }
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        <section className="find__map-col" aria-label="Map of markets">
          <LagosMap
            markets={results}
            selectedId={selectedId}
            hoverId={hoverId}
            onSelect={setSelectedId}
          />
        </section>
      </div>
    </div>
  );
}
