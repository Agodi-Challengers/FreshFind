import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";
import Dropdown from "../components/Dropdown.jsx";
import Icon from "../components/Icon.jsx";
import MarketCard from "../components/MarketCard.jsx";
import SearchBox from "../components/SearchBox.jsx";
import { useData } from "../context/DataContext.jsx";
import { useNow } from "../context/ClockContext.jsx";
import { useDecoratedMarkets } from "../lib/useMarkets.js";
import {
  FEATURES,
  SORTS,
  activeFilterChips,
  applyFilters,
  filtersFromParams,
  filtersToParams,
  hasActiveFilters,
  sortMarkets,
} from "../lib/filters.js";
import { DAY_LONG, WEEK_ORDER } from "../lib/time.js";

export default function DirectoryPage() {
  const { areas, categories, produceById } = useData();
  const decorated = useDecoratedMarkets();
  const now = useNow();
  const [params, setParams] = useSearchParams();

  const f = useMemo(() => filtersFromParams(params), [params]);
  const setFilters = (next) =>
    setParams(filtersToParams(next), { replace: true });

  const results = useMemo(
    () => sortMarkets(applyFilters(decorated, f, produceById), f.sort),
    [decorated, f, produceById],
  );

  const areaValue = f.areas[0] || "all";
  const dayValue = f.days[0] || "all";
  const catValue = f.cats[0] || "all";

  const areaOptions = [
    { value: "all", label: "All areas" },
    ...areas.map((a) => ({ value: a.name, label: a.name })),
  ];
  const dayOptions = [
    { value: "all", label: "Any day" },
    ...WEEK_ORDER.map((d) => ({ value: d, label: DAY_LONG[d] })),
  ];
  const catOptions = [
    { value: "all", label: "All produce" },
    ...categories.map((c) => ({ value: c.name, label: c.label || c.name })),
  ];
  const sortOptions = Object.entries(SORTS).map(([value, label]) => ({
    value,
    label,
  }));

  const chips = activeFilterChips(f, now);

  return (
    <div className="ff-container ff-page">
      <Breadcrumb
        items={[{ label: "Home", to: "/" }, { label: "Directory" }]}
      />
      <div className="ff-page-header" style={{ paddingBottom: 0 }}>
        <div className="ff-page-header__copy">
          <span className="ff-eyebrow">Market directory</span>
          <h1 className="ff-page-title">Every market in one place</h1>
          <p className="ff-lead">
            Filter by area, trading day, produce and facilities. Every filter
            lives in the URL, so you can share the exact list.
          </p>
        </div>
      </div>

      <div className="ff-toolbar" style={{ marginTop: 22 }}>
        <div className="ff-toolbar__search">
          <SearchBox
            value={f.q}
            onChange={(v) => setFilters({ ...f, q: v })}
            onPick={(opt) => setFilters({ ...f, q: opt.value })}
            markets={decorated}
            placeholder="Search this list"
          />
        </div>
        <Dropdown
          icon="map-pin"
          label="Area"
          value={areaValue}
          options={areaOptions}
          onChange={(v) => setFilters({ ...f, areas: v === "all" ? [] : [v] })}
        />
        <Dropdown
          icon="calendar-days"
          label="Trading day"
          value={dayValue}
          options={dayOptions}
          onChange={(v) => setFilters({ ...f, days: v === "all" ? [] : [v] })}
        />
        <Dropdown
          icon="carrot"
          label="Produce"
          value={catValue}
          options={catOptions}
          onChange={(v) => setFilters({ ...f, cats: v === "all" ? [] : [v] })}
        />
        <Dropdown
          icon="arrow-up-down"
          label="Sort"
          value={f.sort}
          options={sortOptions}
          onChange={(v) => setFilters({ ...f, sort: v })}
          align="right"
        />
      </div>

      <div className="ff-filter-block">
        <span className="ff-field-label">Facilities</span>
        <div className="ff-chip-row">
          <button
            type="button"
            className={`ff-chip${f.open ? " is-active" : ""}`}
            aria-pressed={f.open}
            onClick={() => setFilters({ ...f, open: !f.open })}
          >
            <span className="ff-dot ff-dot--open" aria-hidden="true" />
            Open now
          </button>
          {Object.entries(FEATURES).map(([key, feat]) => (
            <button
              key={key}
              type="button"
              className={`ff-chip${f.feats.includes(key) ? " is-active" : ""}`}
              aria-pressed={f.feats.includes(key)}
              onClick={() =>
                setFilters({
                  ...f,
                  feats: f.feats.includes(key)
                    ? f.feats.filter((x) => x !== key)
                    : [...f.feats, key],
                })
              }
            >
              {feat.label}
            </button>
          ))}
        </div>
      </div>

      {chips.length > 0 && (
        <div className="ff-active-chips">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              className="ff-chip is-active"
              onClick={() => setFilters(c.remove(f))}
            >
              {c.label}
              <Icon name="x" size={13} />
            </button>
          ))}
          {hasActiveFilters(f) && (
            <button
              type="button"
              className="ff-link-arrow"
              onClick={() =>
                setFilters({
                  ...f,
                  ...{
                    q: "",
                    open: false,
                    areas: [],
                    days: [],
                    time: "any",
                    cats: [],
                    feats: [],
                  },
                })
              }
            >
              Clear all
            </button>
          )}
        </div>
      )}

      <div className="ff-result-bar">
        <p className="ff-result-bar__count">
          {results.length} {results.length === 1 ? "market" : "markets"}
        </p>
      </div>

      <div className="ff-section--tight">
        {results.length === 0 ? (
          <div className="ff-empty">
            <strong>No markets match these filters</strong>
            <p>Try clearing a filter or widening the area.</p>
          </div>
        ) : (
          <div className="ff-grid ff-grid--3">
            {results.map((m) => (
              <MarketCard key={m.id} market={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
