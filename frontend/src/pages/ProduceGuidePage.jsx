import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";
import Icon from "../components/Icon.jsx";
import ProduceCard from "../components/ProduceCard.jsx";
import SearchBox from "../components/SearchBox.jsx";
import { useData } from "../context/DataContext.jsx";
import { useNow } from "../context/ClockContext.jsx";
import { useDecoratedMarkets } from "../lib/useMarkets.js";
import { inSeason } from "../lib/time.js";
import { inSeasonItems, arrivingItems } from "../lib/seasonal.js";

export default function ProduceGuidePage() {
  const { produce, categories } = useData();
  const decorated = useDecoratedMarkets();
  const now = useNow();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [seasonalOnly, setSeasonalOnly] = useState(false);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return produce.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (seasonalOnly && !inSeason(p.season, now.month)) return false;
      if (!term) return true;
      return `${p.name} ${p.shortName || ""} ${p.description}`
        .toLowerCase()
        .includes(term);
    });
  }, [produce, cat, seasonalOnly, now.month, q]);

  const inSeasonNow = useMemo(
    () => inSeasonItems(produce, now.month).length,
    [produce, now.month],
  );
  const arriving = useMemo(
    () => arrivingItems(produce, now.month),
    [produce, now.month],
  );

  return (
    <div className="ff-container ff-page">
      <Breadcrumb
        items={[{ label: "Home", to: "/" }, { label: "Produce Guide" }]}
      />
      <div className="ff-page-header" style={{ paddingBottom: 0 }}>
        <div className="ff-page-header__copy">
          <span className="ff-eyebrow">Produce guide</span>
          <h1 className="ff-page-title">What to buy, and when</h1>
          <p className="ff-lead">
            {inSeasonNow} of {produce.length} items are in season this month.
            Each guide shows the twelve-month season and the markets that sell
            it.
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
            placeholder="Search produce"
          />
        </div>
        <button
          type="button"
          className={`ff-chip ff-chip--lg${seasonalOnly ? " is-active" : ""}`}
          aria-pressed={seasonalOnly}
          onClick={() => setSeasonalOnly((v) => !v)}
        >
          <Icon name="sun" size={15} />
          In season
        </button>
      </div>

      <div className="ff-filter-block">
        <div className="ff-chip-row">
          <button
            type="button"
            className={`ff-chip${cat === "all" ? " is-active" : ""}`}
            onClick={() => setCat("all")}
          >
            All produce
          </button>
          {categories.map((c) => (
            <button
              key={c.name}
              type="button"
              className={`ff-chip${cat === c.name ? " is-active" : ""}`}
              onClick={() => setCat(c.name)}
            >
              {c.label || c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="ff-result-bar">
        <p className="ff-result-bar__count">
          {results.length} {results.length === 1 ? "item" : "items"}
        </p>
        <Link to="/seasonal" className="ff-link-arrow">
          See seasonal picks →
        </Link>
      </div>

      <div className="ff-section--tight">
        {results.length === 0 ? (
          <div className="ff-empty">
            <strong>Nothing matches that search</strong>
            <p>
              Try another name
              {arriving.length
                ? `, or look for ${arriving[0].name} arriving soon`
                : ""}
              .
            </p>
          </div>
        ) : (
          <div className="ff-grid ff-grid--3">
            {results.map((p) => (
              <ProduceCard key={p.id} item={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
