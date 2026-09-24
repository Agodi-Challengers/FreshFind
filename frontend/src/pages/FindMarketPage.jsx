import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";
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
  filtersToParams,
  EMPTY_FILTERS,
} from "../lib/filters.js";
import {
  areaDropdown,
  dayDropdown,
  timeDropdown,
  sortDropdown,
} from "../lib/quickFilters.js";
import { DAY_SHORT, formatMinutes } from "../lib/time.js";
import "./FindMarketPage.css";

export default function FindMarketPage() {
  const data = useData();
  const now = useNow();
  const { origin, status, requestDeviceLocation, chooseArea, reset } =
    useUserLocation();
  const markets = useDecoratedMarkets();
  const [filters, setFilters] = useUrlFilters();
  const [selectedId, setSelectedId] = useState(null);
  const [hoverId, setHoverId] = useState(null);

  const results = useMemo(
    () =>
      sortMarkets(
        applyFilters(markets, filters, data.produceById),
        filters.sort,
      ),
    [markets, filters, data.produceById],
  );
  const chips = activeFilterChips(filters, now);
  const listQuery = filtersToParams(filters).toString();

  const area = areaDropdown(filters, { ...data, markets });
  const day = dayDropdown(filters, now);
  const time = timeDropdown(filters, markets);
  const sort = sortDropdown(filters);

  const locationOptions = [
    {
      value: "device",
      label: status === "locating" ? "Finding you…" : "Use my current location",
      strong: true,
    },
    { value: "default", label: `${data.defaultLocation.label} (default)` },
    { header: "Choose an area" },
    ...data.areas.map((a) => ({ value: `area:${a.name}`, label: a.place })),
  ];
  const locationValue =
    origin.source === "device"
      ? "device"
      : origin.source === "area"
        ? `area:${origin.area}`
        : "default";
  const onLocation = (v) => {
    if (v === "device") requestDeviceLocation();
    else if (v === "default") reset();
    else chooseArea(v.slice(5));
  };

  const crumbs = [
    { label: "Home", to: "/" },
    { label: "Find a Market", to: chips.length ? "/find" : undefined },
  ];
  if (chips.length === 1) crumbs.push({ label: chips[0].label });

  return (
    <div className="find">
      <div className="find__toolbar">
        <div className="container find__toolbar-inner">
          <Dropdown
            icon="locate-fixed"
            label={origin.source === "device" ? "Your location" : "Location"}
            value={locationValue}
            options={
              origin.source === "device"
                ? [
                    { value: "device", label: origin.label, strong: true },
                    ...locationOptions.slice(1),
                  ]
                : locationOptions
            }
            onChange={onLocation}
            className="find__loc"
          />
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
            label="Day"
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
          <SearchBox
            value={filters.q}
            onChange={(q) => setFilters({ ...filters, q })}
            onSubmit={(q) => setFilters({ ...filters, q })}
            onPick={(opt) =>
              opt.type === "category"
                ? setFilters({ ...filters, q: "", cats: [opt.value] })
                : setFilters({ ...filters, q: opt.value })
            }
            markets={markets}
            className="find__search"
          />
          <Link
            to={`/directory${listQuery ? `?${listQuery}` : ""}`}
            className="btn btn--outline find__list"
          >
            <Icon name="layout-grid" size={16} />
            List view
          </Link>
        </div>
      </div>

      {status === "denied" && (
        <p className="find__notice container" role="status">
          Location access is off, so distances are measured from {origin.label}.
          You can pick an area instead.
        </p>
      )}

      <div className="find__split">
        <section className="find__list-col" aria-labelledby="find-count">
          <div className="find__head">
            <div>
              <Breadcrumb items={crumbs} />
              <h1 id="find-count" className="find__count" aria-live="polite">
                {results.length}{" "}
                {results.length === 1 ? "market matches" : "markets match"}
              </h1>
            </div>
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
