import Icon from "./Icon.jsx";
import { useData } from "../context/DataContext.jsx";
import { useNow } from "../context/ClockContext.jsx";
import { FEATURES, EMPTY_FILTERS } from "../lib/filters.js";
import {
  DAY_LONG,
  DAY_SHORT,
  TIME_WINDOWS,
  WEEK_ORDER,
  matchesTimeWindow,
} from "../lib/time.js";

const toggle = (list, value) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

function Check({ checked, onChange, label, count, round = false, name }) {
  return (
    <label className={`check${checked ? " is-checked" : ""}`}>
      <input
        type={round ? "radio" : "checkbox"}
        name={name}
        className="visually-hidden"
        checked={checked}
        onChange={onChange}
      />
      <span
        className={`check__box${round ? " check__box--round" : ""}`}
        aria-hidden="true"
      />
      <span className="check__label">{label}</span>
      {count != null && <span className="check__count">{count}</span>}
    </label>
  );
}

/**
 * Filter panel for the Market Directory (desktop sidebar, and the mobile bottom sheet).
 * Counts are totals for each option across all markets, as in the design.
 */
export default function FilterSidebar({
  filters,
  onChange,
  markets,
  openCount,
  idPrefix = "f",
}) {
  const { areas, regions, categories } = useData();
  const now = useNow();
  const set = (patch) => onChange({ ...filters, ...patch });
  const total = (fn) => markets.filter(fn).length;
  const weekendOn =
    filters.days.includes("sat") && filters.days.includes("sun");

  return (
    <div className="filters">
      <div className="filters__head">
        <h2 className="filters__title">
          <Icon name="sliders-horizontal" size={16} />
          Filters
        </h2>
        <button
          type="button"
          className="text-btn text-btn--accent"
          onClick={() => onChange({ ...EMPTY_FILTERS, sort: filters.sort })}
        >
          Reset all
        </button>
      </div>

      <label className="switch-row">
        <span>Open right now ({openCount})</span>
        <input
          type="checkbox"
          role="switch"
          className="visually-hidden"
          checked={filters.open}
          onChange={() => set({ open: !filters.open })}
        />
        <span
          className={`switch${filters.open ? " is-on" : ""}`}
          aria-hidden="true"
        />
      </label>

      <fieldset className="filters__group">
        <legend>Location</legend>
        {regions.map((region) => {
          const names = areas
            .filter((a) => a.region === region)
            .map((a) => a.name);
          const all = names.every((n) => filters.areas.includes(n));
          return (
            <div key={region} className="filters__region">
              <div className="filters__region-head">
                <span>{region}</span>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() =>
                    set({
                      areas: all
                        ? filters.areas.filter((a) => !names.includes(a))
                        : [...new Set([...filters.areas, ...names])],
                    })
                  }
                >
                  {all ? "Clear" : "Select all"}
                </button>
              </div>
              {names.map((n) => (
                <Check
                  key={n}
                  label={n}
                  count={total((m) => m.area === n)}
                  checked={filters.areas.includes(n)}
                  onChange={() => set({ areas: toggle(filters.areas, n) })}
                />
              ))}
            </div>
          );
        })}
      </fieldset>

      <fieldset className="filters__group">
        <legend>Day of the week</legend>
        <div className="filters__days">
          {WEEK_ORDER.map((d) => (
            <button
              key={d}
              type="button"
              className="chip"
              aria-pressed={filters.days.includes(d)}
              aria-label={DAY_LONG[d]}
              onClick={() => set({ days: toggle(filters.days, d) })}
            >
              {DAY_SHORT[d]}
            </button>
          ))}
          <button
            type="button"
            className="chip"
            aria-pressed={weekendOn}
            onClick={() =>
              set({
                days: weekendOn
                  ? filters.days.filter((d) => d !== "sat" && d !== "sun")
                  : [...new Set([...filters.days, "sat", "sun"])],
              })
            }
          >
            Weekend
          </button>
        </div>
        <p className="filters__hint">Today is {DAY_LONG[now.dayKey]}</p>
      </fieldset>

      <fieldset className="filters__group">
        <legend>Time of day</legend>
        <Check
          round
          name={`${idPrefix}-time`}
          label="Any time"
          checked={filters.time === "any"}
          onChange={() => set({ time: "any" })}
        />
        {Object.entries(TIME_WINDOWS).map(([key, w]) => (
          <Check
            key={key}
            round
            name={`${idPrefix}-time`}
            label={`${w.label} · ${w.range}`}
            count={total((m) => matchesTimeWindow(m, key))}
            checked={filters.time === key}
            onChange={() => set({ time: key })}
          />
        ))}
      </fieldset>

      <fieldset className="filters__group">
        <legend>Produce category</legend>
        {categories.map((c) => (
          <Check
            key={c.name}
            label={c.name}
            count={total((m) => m.categories.includes(c.name))}
            checked={filters.cats.includes(c.name)}
            onChange={() => set({ cats: toggle(filters.cats, c.name) })}
          />
        ))}
      </fieldset>

      <fieldset className="filters__group">
        <legend>Market features</legend>
        {Object.entries(FEATURES).map(([key, f]) => (
          <Check
            key={key}
            label={f.label}
            count={total(f.test)}
            checked={filters.feats.includes(key)}
            onChange={() => set({ feats: toggle(filters.feats, key) })}
          />
        ))}
      </fieldset>
    </div>
  );
}
