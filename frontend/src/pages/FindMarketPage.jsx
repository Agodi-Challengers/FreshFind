import { useMemo, useState } from "react";
import Breadcrumb from "../components/Breadcrumb.jsx";
import Dropdown from "../components/Dropdown.jsx";
import Icon from "../components/Icon.jsx";
import MarketRow from "../components/MarketRow.jsx";
import SearchBox from "../components/SearchBox.jsx";
import { useData } from "../context/DataContext.jsx";
import { useNow } from "../context/ClockContext.jsx";
import { useUserLocation } from "../context/LocationContext.jsx";
import { useDecoratedMarkets } from "../lib/useMarkets.js";
import { fitMapProjection } from "../lib/geo.js";
import { isOpenNow } from "../lib/time.js";

const PAD = 12;

/** Decorative Lagos outline: water to the east and south, a few main roads. */
function MapArt() {
  return (
    <svg
      className="ff-map__art"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <rect width="100" height="100" fill="var(--ff-map-land)" />
      <path
        d="M100 0 H60 C70 14 74 26 72 40 C70 54 75 66 87 76 C93 82 97 90 100 100 Z"
        fill="var(--ff-map-water)"
      />
      <path
        d="M0 76 C16 70 30 75 44 84 C54 90 62 96 66 100 H0 Z"
        fill="var(--ff-map-water)"
        opacity="0.8"
      />
      <g stroke="var(--ff-green-300)" strokeWidth="1" fill="none" opacity="0.7">
        <path d="M6 24 H46" />
        <path d="M4 50 H54" />
        <path d="M20 6 V40" />
        <path d="M36 42 V94" />
      </g>
    </svg>
  );
}

export default function FindMarketPage() {
  const { areas } = useData();
  const decorated = useDecoratedMarkets();
  const now = useNow();
  const { origin } = useUserLocation();
  const [q, setQ] = useState("");
  const [area, setArea] = useState("all");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return decorated.filter((m) => {
      if (area !== "all" && m.area !== area) return false;
      if (onlyOpen && !isOpenNow(m, now)) return false;
      if (!term) return true;
      return `${m.name} ${m.street} ${m.area} ${m.locality}`
        .toLowerCase()
        .includes(term);
    });
  }, [decorated, area, onlyOpen, now, q]);

  const mappable = useMemo(
    () => decorated.filter((m) => m.map && m.lat && m.lng),
    [decorated],
  );
  const canMap = mappable.length >= 2;

  const { positions, you } = useMemo(() => {
    if (!canMap) return { positions: {}, you: null };
    const project = fitMapProjection(mappable);
    const pts = mappable.map((m) => ({ id: m.id, ...project(m) }));
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const norm = (p) => ({
      left: `${PAD + ((p.x - minX) / (maxX - minX || 1)) * (100 - PAD * 2)}%`,
      top: `${PAD + ((p.y - minY) / (maxY - minY || 1)) * (100 - PAD * 2)}%`,
    });
    return {
      positions: Object.fromEntries(pts.map((p) => [p.id, norm(p)])),
      you: origin?.lat != null ? norm(project(origin)) : null,
    };
  }, [mappable, canMap, origin]);

  const areaOptions = [
    { value: "all", label: "All areas" },
    ...areas.map((a) => ({ value: a.name, label: a.name })),
  ];

  const openCount = filtered.filter((m) => isOpenNow(m, now)).length;

  return (
    <div className="ff-container ff-page">
      <Breadcrumb
        items={[{ label: "Home", to: "/" }, { label: "Find a Market" }]}
      />
      <div className="ff-page-header" style={{ paddingBottom: 0 }}>
        <div className="ff-page-header__copy">
          <span className="ff-eyebrow">Find a market</span>
          <h1 className="ff-page-title">Who is open near you</h1>
          <p className="ff-lead">
            Pick a result to highlight it on the map, or search by market,
            street or area.
          </p>
        </div>
      </div>

      <div className="ff-toolbar" style={{ marginTop: 22 }}>
        <div className="ff-toolbar__search">
          <SearchBox
            value={q}
            onChange={setQ}
            onPick={(opt) => setQ(opt.value)}
            markets={decorated}
            placeholder="Search markets or areas"
          />
        </div>
        <Dropdown
          icon="map-pin"
          label="Area"
          value={area}
          options={areaOptions}
          onChange={setArea}
        />
        <button
          type="button"
          className={`ff-chip ff-chip--lg${onlyOpen ? " is-active" : ""}`}
          aria-pressed={onlyOpen}
          onClick={() => setOnlyOpen((v) => !v)}
        >
          <span className="ff-dot ff-dot--open" aria-hidden="true" />
          Open now
        </button>
      </div>

      <div className="ff-result-bar">
        <p className="ff-result-bar__count">
          {filtered.length} {filtered.length === 1 ? "market" : "markets"} ·{" "}
          {openCount} open now
        </p>
        <button
          type="button"
          className="ff-link-arrow"
          onClick={() => setSelected(null)}
        >
          Clear selection
        </button>
      </div>

      <div className="ff-split">
        <div className="ff-split__list">
          {filtered.length === 0 ? (
            <div className="ff-empty">
              <strong>No markets match those filters</strong>
              <p>Try a different area, or turn off the “open now” filter.</p>
            </div>
          ) : (
            filtered.map((m) => (
              <MarketRow
                key={m.id}
                market={m}
                selected={selected === m.id}
                onSelect={setSelected}
                onHover={setSelected}
              />
            ))
          )}
        </div>

        <div className="ff-map-panel">
          <div className="ff-map">
            <MapArt />
            {canMap &&
              filtered.map(
                (m) =>
                  positions[m.id] && (
                    <button
                      key={m.id}
                      type="button"
                      className={`ff-map__pin${selected === m.id ? " is-active" : ""}${
                        m.status.state === "closed" ? " is-closed" : ""
                      }`}
                      style={positions[m.id]}
                      onClick={() => setSelected(m.id)}
                      onMouseEnter={() => setSelected(m.id)}
                      onMouseLeave={() => setSelected(null)}
                    >
                      <span
                        className="ff-dot ff-dot--open"
                        aria-hidden="true"
                      />
                      {m.name}
                    </button>
                  ),
              )}
            {canMap && you && (
              <span className="ff-map__you" style={you} title="Your location" />
            )}
          </div>
          <p className="ff-fineprint">
            <Icon name="info" size={14} /> Approximate positions for orientation
            only. Open a market for a real map.
          </p>
        </div>
      </div>
    </div>
  );
}
