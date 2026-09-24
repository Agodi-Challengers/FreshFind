import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";
import Icon from "../components/Icon.jsx";
import Dropdown from "../components/Dropdown.jsx";
import SearchBox from "../components/SearchBox.jsx";
import MarketCard from "../components/MarketCard.jsx";
import FilterSidebar from "../components/FilterSidebar.jsx";
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
  SORTS,
} from "../lib/filters.js";
import {
  areaDropdown,
  dayDropdown,
  timeDropdown,
  produceDropdown,
  sortDropdown,
} from "../lib/quickFilters.js";
import "./DirectoryPage.css";

export default function DirectoryPage() {
  const data = useData();
  const now = useNow();
  const { origin } = useUserLocation();
  const markets = useDecoratedMarkets();
  const [filters, setFilters] = useUrlFilters();
  const [sheetOpen, setSheetOpen] = useState(false);

  const results = useMemo(
    () =>
      sortMarkets(
        applyFilters(markets, filters, data.produceById),
        filters.sort,
      ),
    [markets, filters, data.produceById],
  );
  const openCount = markets.filter((m) => m.status.state !== "closed").length;
  const chips = activeFilterChips(filters, now);
  const query = filtersToParams({ ...filters, sort: "nearest" }).toString();

  const area = areaDropdown(filters, { ...data, markets });
  const day = dayDropdown(filters, now);
  const time = timeDropdown(filters, markets);
  const cat = produceDropdown(filters, { ...data, markets });
  const sort = sortDropdown(filters);

  useEffect(() => {
    if (!sheetOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setSheetOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  const activeCount =
    (filters.open ? 1 : 0) +
    filters.areas.length +
    filters.days.length +
    (filters.time !== "any" ? 1 : 0) +
    filters.cats.length +
    filters.feats.length;

  return (
    <div className="directory">
      <header className="container page-header">
        <Breadcrumb
          items={[{ label: "Home", to: "/" }, { label: "Market Directory" }]}
        />
        <div className="page-header__copy">
          <span className="eyebrow">{markets.length} markets · Lagos</span>
          <h1 className="page-title">Market Directory</h1>
          <p className="lead">
            Every farmers market we know about, with days, hours and what they
            usually sell. Filter by area, day, time or produce to find the one
            that fits your week.
          </p>
        </div>
      </header>

      <div className="container directory__body">
        <aside className="directory__sidebar card" aria-label="Filters">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            markets={markets}
            openCount={openCount}
            idPrefix="side"
          />
        </aside>

        <section className="directory__main" aria-labelledby="dir-results">
          <div className="directory__toolbar">
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
              placeholder="Search markets, streets or produce"
              className="directory__search"
            />
            <Dropdown
              icon="arrow-up-down"
              label="Sort by"
              value={sort.value}
              options={sort.options}
              onChange={(v) => setFilters({ ...filters, sort: v })}
              className="directory__sort"
              align="right"
            />
            <div className="view-toggle" role="group" aria-label="View">
              <span
                className="view-toggle__btn is-active"
                aria-current="true"
                title="Grid view"
              >
                <Icon name="layout-grid" size={16} />
                <span className="visually-hidden">Grid view</span>
              </span>
              <Link
                to={`/find${query ? `?${query}` : ""}`}
                className="view-toggle__btn"
                title="Map view"
              >
                <Icon name="map" size={16} />
                <span className="visually-hidden">Map view</span>
              </Link>
            </div>
          </div>

          <div className="directory__quick">
            <span className="directory__quick-label">Quick filters</span>
            <Dropdown
              icon="map-pin"
              label="Area"
              value={area.value}
              options={area.options}
              onChange={(v) => setFilters({ ...filters, areas: area.apply(v) })}
            />
            <Dropdown
              icon="calendar"
              label="Day"
              value={day.value}
              options={day.options}
              onChange={(v) => setFilters({ ...filters, days: day.apply(v) })}
            />
            <Dropdown
              icon="clock"
              label="Time"
              value={time.value}
              options={time.options}
              onChange={(v) => setFilters({ ...filters, time: time.apply(v) })}
              panelWidth={300}
            />
            <Dropdown
              icon="carrot"
              label="Produce"
              value={cat.value}
              options={cat.options}
              onChange={(v) => setFilters({ ...filters, cats: cat.apply(v) })}
              align="right"
            />
          </div>

          <button
            type="button"
            className="btn btn--primary directory__filters-btn"
            onClick={() => setSheetOpen(true)}
          >
            <Icon name="sliders-horizontal" size={16} />
            Filters{activeCount ? ` · ${activeCount}` : ""}
          </button>

          <div className="result-meta" aria-live="polite">
            <h2 id="dir-results" className="result-meta__count">
              Showing {results.length} of {markets.length} markets
            </h2>
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                className="filter-chip"
                onClick={() => setFilters(c.remove(filters))}
                aria-label={`Remove filter ${c.label}`}
              >
                {c.label} ×
              </button>
            ))}
            {hasActiveFilters(filters) && (
              <button
                type="button"
                className="text-btn text-btn--accent"
                onClick={() =>
                  setFilters({ ...EMPTY_FILTERS, sort: filters.sort })
                }
              >
                Clear all
              </button>
            )}
            <span className="result-meta__sort">
              · Sorted by {SORTS[filters.sort].toLowerCase()}
              {filters.sort === "nearest" ? ` from ${origin.label}` : ""}
            </span>
          </div>

          {results.length ? (
            <div className="directory__grid">
              {results.map((m) => (
                <MarketCard key={m.id} market={m} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <strong>No markets match these filters</strong>
              <span>
                Try another day or area, or clear the filters to see all{" "}
                {markets.length} markets.
              </span>
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
      </div>

      {/* Mobile bottom sheet (M2b) */}
      <div
        className={`sheet-backdrop${sheetOpen ? " is-open" : ""}`}
        onClick={() => setSheetOpen(false)}
        aria-hidden="true"
      />
      <div
        className={`sheet${sheetOpen ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        aria-hidden={!sheetOpen}
        inert={sheetOpen ? undefined : true}
      >
        <span className="sheet__handle" aria-hidden="true" />
        <div className="sheet__body">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            markets={markets}
            openCount={openCount}
            idPrefix="sheet"
          />
        </div>
        <div className="sheet__foot">
          <button
            type="button"
            className="btn btn--primary btn--lg btn--block"
            onClick={() => setSheetOpen(false)}
          >
            Show {results.length} {results.length === 1 ? "market" : "markets"}
          </button>
        </div>
      </div>
    </div>
  );
}
