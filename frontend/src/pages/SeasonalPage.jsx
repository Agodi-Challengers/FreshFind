import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";
import Icon from "../components/Icon.jsx";
import BookmarkButton from "../components/BookmarkButton.jsx";
import MarketCard from "../components/MarketCard.jsx";
import { useData } from "../context/DataContext.jsx";
import { useNow } from "../context/ClockContext.jsx";
import { useDecoratedMarkets } from "../lib/useMarkets.js";
import { sortMarkets } from "../lib/filters.js";
import {
  seasonalHighlights,
  arrivingItems,
  endingItems,
  pickOfTheMonth,
} from "../lib/seasonal.js";
import { MONTH_SHORT } from "../lib/time.js";
import { asset } from "../lib/assets.js";
import "./SeasonalPage.css";

function weekLabel(now) {
  const d = new Date(Date.UTC(now.year, now.month, now.day));
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - start) / 86400000 + start.getUTCDay() + 1) / 7);
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const fmt = (x) => `${x.getUTCDate()} ${MONTH_SHORT[x.getUTCMonth()]}`;
  return `Week ${week} · ${fmt(monday)} – ${fmt(sunday)}`;
}

function ItemList({ items, empty }) {
  if (!items.length) return <p className="seasonal__none">{empty}</p>;
  return (
    <ul className="seasonal__items">
      {items.slice(0, 4).map((p) => (
        <li key={p.id}>
          <Link to={`/produce/${p.id}`} className="seasonal__item hover-card">
            <img
              src={asset(p.icon || p.image)}
              alt=""
              width="52"
              height="52"
              loading="lazy"
            />
            <span>
              <strong>{p.name}</strong>
              <span>{p.note}</span>
            </span>
            <Icon name="chevron-right" size={18} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function SeasonalPage() {
  const { produce, months, marketsByProduce } = useData();
  const now = useNow();
  const markets = useDecoratedMarkets();
  const [params, setParams] = useSearchParams();
  const m =
    Number.isInteger(Number(params.get("m"))) && params.get("m") !== null
      ? Math.min(11, Math.max(0, Number(params.get("m"))))
      : now.month;
  const monthName = months[m].name;

  const highlights = useMemo(
    () => seasonalHighlights(produce, m),
    [produce, m],
  );
  const pick = useMemo(() => pickOfTheMonth(produce, m), [produce, m]);
  const side = highlights.filter((p) => p.id !== pick?.id).slice(0, 3);
  const arriving = useMemo(() => arrivingItems(produce, m), [produce, m]);
  const ending = useMemo(() => endingItems(produce, m), [produce, m]);

  // markets that sell the most in-season items and open this weekend
  const best = useMemo(() => {
    const ids = new Set(highlights.map((p) => p.id));
    return sortMarkets(
      markets.filter((mk) => mk.schedule.sat || mk.schedule.sun),
      "nearest",
    )
      .map((mk) => ({
        mk,
        score: mk.produce.filter((id) => ids.has(id)).length,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((x) => x.mk);
  }, [markets, highlights]);

  const pickCount = pick ? marketsByProduce[pick.id]?.length || 0 : 0;

  return (
    <div className="seasonal">
      <section className="seasonal__hero">
        <div className="container">
          <Breadcrumb
            items={[{ label: "Home", to: "/" }, { label: "Seasonal" }]}
            light
          />
          <div className="seasonal__hero-row">
            <div className="seasonal__hero-copy">
              <span className="eyebrow eyebrow--yellow">
                Fresh right now · Lagos
              </span>
              <h1>What’s in season in {monthName}</h1>
              <p>{months[m].intro}</p>
            </div>
            {m === now.month && (
              <span className="seasonal__week">
                <Icon name="sun" size={18} />
                {weekLabel(now)}
              </span>
            )}
          </div>
          <div
            className="seasonal__months"
            role="group"
            aria-label="Choose a month"
          >
            {MONTH_SHORT.map((label, i) => (
              <button
                key={label}
                type="button"
                aria-pressed={i === m}
                aria-label={months[i].name}
                onClick={() => {
                  const next = new URLSearchParams(params);
                  if (i === now.month) next.delete("m");
                  else next.set("m", String(i));
                  setParams(next, { replace: true });
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        className="container seasonal__peak"
        aria-labelledby="peak-title"
      >
        <h2 id="peak-title" className="seasonal__h2">
          Peak this month
        </h2>
        <div className="seasonal__peak-row">
          {pick && (
            <div className="seasonal__feature">
              <img
                src={asset(pick.pick?.image || pick.photo || pick.image)}
                alt=""
              />
              <div className="seasonal__feature-copy">
                <span className="seasonal__badge">Pick of the week</span>
                <h3>{pick.pick?.title || pick.name}</h3>
                <p>{pick.pick?.text || pick.description}</p>
                <div className="seasonal__feature-btns">
                  <Link
                    to={`/directory?q=${encodeURIComponent(pick.shortName || pick.name)}`}
                    className="btn btn--yellow"
                  >
                    Find at {pickCount} {pickCount === 1 ? "market" : "markets"}
                  </Link>
                  <BookmarkButton
                    type="produce"
                    id={pick.id}
                    name={pick.name}
                    variant="button"
                    light
                  />
                </div>
              </div>
            </div>
          )}
          <ul className="seasonal__side">
            {side.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/produce/${p.id}`}
                  className="seasonal__mini card hover-card"
                >
                  <img
                    src={asset(p.icon || p.image)}
                    alt=""
                    width="100"
                    height="100"
                    loading="lazy"
                  />
                  <span>
                    <strong>{p.name}</strong>
                    <span>
                      {p.badge || "In season"}
                      {p.price ? ` · ${p.price}` : ""}
                    </span>
                    <span className="seasonal__see">See markets →</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="container seasonal__lists"
        aria-label="Arriving and ending"
      >
        <div className="seasonal__list seasonal__list--green">
          <h2>
            <span aria-hidden="true">
              <Icon name="trending-up" size={18} />
            </span>
            Just arriving
          </h2>
          <ItemList items={arriving} empty="Nothing new arriving this month." />
        </div>
        <div className="seasonal__list seasonal__list--orange">
          <h2>
            <span aria-hidden="true">
              <Icon name="hourglass" size={18} />
            </span>
            Ending soon
          </h2>
          <ItemList
            items={ending}
            empty="Nothing is going out of season this month."
          />
        </div>
      </section>

      <section
        className="container seasonal__best"
        aria-labelledby="best-title"
      >
        <div className="detail__nearby-head">
          <h2 id="best-title" className="seasonal__h2">
            Best markets for seasonal picks this weekend
          </h2>
          <Link to="/directory?day=sat,sun" className="link-arrow">
            Open directory →
          </Link>
        </div>
        <div className="grid grid--4 scroll-row">
          {best.map((mk) => (
            <MarketCard key={mk.id} market={mk} variant="local" />
          ))}
        </div>
      </section>
    </div>
  );
}
