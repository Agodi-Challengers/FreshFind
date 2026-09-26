import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageBanner from "../components/PageBanner.jsx";
import Icon from "../components/Icon.jsx";
import BookmarkButton from "../components/BookmarkButton.jsx";
import MarketCard from "../components/MarketCard.jsx";
import { useData } from "../context/DataContext.jsx";
import { useNow } from "../context/ClockContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useDecoratedMarkets } from "../lib/useMarkets.js";
import { sortMarkets } from "../lib/filters.js";
import {
  seasonalHighlights,
  endingItems,
  pickOfTheMonth,
} from "../lib/seasonal.js";
import { MONTH_SHORT } from "../lib/time.js";
import { shareLink } from "../lib/share.js";
import { asset } from "../lib/assets.js";
import "./SeasonalPage.css";

/** Removes empty values and duplicates so the gallery only shows real photos. */
const unique = (list) => [...new Set(list.filter(Boolean))];

export default function SeasonalPage() {
  const { produce, months, categories, marketsByProduce } = useData();
  const now = useNow();
  const toast = useToast();
  const markets = useDecoratedMarkets();
  const [params, setParams] = useSearchParams();
  const [shot, setShot] = useState(0);

  const m =
    Number.isInteger(Number(params.get("m"))) && params.get("m") !== null
      ? Math.min(11, Math.max(0, Number(params.get("m"))))
      : now.month;

  const highlights = useMemo(
    () => seasonalHighlights(produce, m),
    [produce, m],
  );
  const pick = useMemo(() => pickOfTheMonth(produce, m), [produce, m]);
  const ending = useMemo(() => endingItems(produce, m), [produce, m]);
  const endingIds = useMemo(() => new Set(ending.map((p) => p.id)), [ending]);

  // Mini cards: everything in season this month except the big pick.
  const cards = highlights.filter((p) => p.id !== pick?.id).slice(0, 6);

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

  // Photos available for the pick, used by the vertical thumbnail slider.
  const images = pick
    ? unique([pick.pick?.image, pick.round, pick.photo, pick.image, pick.icon])
    : [];
  const index = images.length
    ? ((shot % images.length) + images.length) % images.length
    : 0;
  const activeImage = images[index] || "";
  const catLabel =
    categories.find((c) => c.name === pick?.category)?.label || pick?.category;

  const goToMonth = (i) => {
    const next = new URLSearchParams(params);
    if (i === now.month) next.delete("m");
    else next.set("m", String(i));
    setParams(next, { replace: true });
  };

  return (
    <div className="seasonal">
      <PageBanner
        crumbs={[{ label: "Home", to: "/" }, { label: "Seasonal" }]}
        title="Peak this month"
      >
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
              onClick={() => goToMonth(i)}
            >
              {label}
            </button>
          ))}
        </div>
      </PageBanner>

      {pick && (
        <section
          className="container seasonal__pick"
          aria-labelledby="pick-title"
        >
          <div className="seasonal__pick-row">
            <div className="seasonal__gallery">
              <div className="seasonal__thumbs">
                <button
                  type="button"
                  className="seasonal__arrow"
                  aria-label="Previous photo"
                  onClick={() => setShot((s) => s - 1)}
                >
                  <Icon
                    name="chevron-down"
                    size={16}
                    className="seasonal__arrow-ic seasonal__arrow-ic--up"
                  />
                </button>
                {images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    className="seasonal__thumb"
                    aria-pressed={i === index}
                    aria-label={`Show photo ${i + 1}`}
                    onClick={() => setShot(i)}
                  >
                    <img
                      src={asset(src)}
                      alt=""
                      width="84"
                      height="72"
                      loading="lazy"
                    />
                  </button>
                ))}
                <button
                  type="button"
                  className="seasonal__arrow"
                  aria-label="Next photo"
                  onClick={() => setShot((s) => s + 1)}
                >
                  <Icon
                    name="chevron-down"
                    size={16}
                    className="seasonal__arrow-ic"
                  />
                </button>
              </div>
              <div className="seasonal__stage">
                <img src={asset(activeImage)} alt={pick.name} />
              </div>
            </div>

            <div className="seasonal__pick-copy">
              <span className="eyebrow">Pick of the month</span>
              <h2 id="pick-title" className="seasonal__pick-name">
                {pick.pick?.title || pick.name}
              </h2>
              <div className="seasonal__pills">
                <span className="pill pill--green">
                  <span className="dot dot--open" aria-hidden="true" />
                  In season
                </span>
                <span className="pill pill--amber">Pick of the week</span>
              </div>
              <p className="seasonal__pick-text">
                {pick.pick?.text || pick.description}
              </p>
              <p className="seasonal__cat">
                Category: <strong>{catLabel}</strong>
              </p>
              <Link
                to={`/directory?q=${encodeURIComponent(pick.shortName || pick.name)}`}
                className="btn btn--primary seasonal__find"
              >
                Find at {pickCount} {pickCount === 1 ? "market" : "markets"}
              </Link>
              <div className="seasonal__pick-actions">
                <BookmarkButton
                  type="produce"
                  id={pick.id}
                  name={pick.name}
                  variant="button"
                />
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() =>
                    shareLink(
                      {
                        title: `${pick.name} — FreshFind`,
                        text: pick.description,
                        url: window.location.href,
                      },
                      toast,
                    )
                  }
                >
                  <Icon name="share-2" size={16} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {cards.length > 0 && (
        <section
          className="container seasonal__in-season"
          aria-labelledby="in-season-title"
        >
          <h2 id="in-season-title" className="seasonal__h2">
            Also in season
          </h2>
          <div className="seasonal__grid">
            {cards.map((p) => (
              <article key={p.id} className="seasonal__card card hover-card">
                <img
                  src={asset(p.icon || p.image || p.photo)}
                  alt=""
                  width="132"
                  height="98"
                  loading="lazy"
                />
                <div className="seasonal__card-body">
                  <h3 className="seasonal__card-title">{p.name}</h3>
                  {endingIds.has(p.id) ? (
                    <span className="pill pill--amber">Ending soon</span>
                  ) : (
                    <span className="pill pill--green">In season</span>
                  )}
                  <p className="seasonal__card-note">
                    {p.note || p.description}
                  </p>
                  <Link
                    to={`/directory?q=${encodeURIComponent(p.shortName || p.name)}`}
                    className="seasonal__see"
                  >
                    See markets →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section
        className="container seasonal__best"
        aria-labelledby="best-title"
      >
        <div className="seasonal__best-head">
          <h2 id="best-title" className="seasonal__h2">
            Top Markets for Seasonal Picks
          </h2>
          <Link to="/directory?day=sat,sun" className="link-arrow">
            Open directory →
          </Link>
        </div>
        <div className="grid grid--4 scroll-row">
          {best.map((mk) => (
            <MarketCard key={mk.id} market={mk} />
          ))}
        </div>
      </section>
    </div>
  );
}
