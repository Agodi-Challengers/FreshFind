import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import SearchBox from "../components/SearchBox.jsx";
import MarketCard from "../components/MarketCard.jsx";
import ProduceCard from "../components/ProduceCard.jsx";
import SeasonStrip from "../components/SeasonStrip.jsx";
import { useData } from "../context/DataContext.jsx";
import { useNow } from "../context/ClockContext.jsx";
import { useUserLocation } from "../context/LocationContext.jsx";
import { useDecoratedMarkets } from "../lib/useMarkets.js";
import { isOpenNow } from "../lib/time.js";
import {
  seasonalHighlights,
  pickOfTheMonth,
  arrivingItems,
} from "../lib/seasonal.js";
import { asset } from "../lib/assets.js";

const FEATURES = [
  {
    icon: "clock",
    title: "Live opening hours",
    text: "Every market page shows the weekly schedule in Lagos time, and cards tell you who is open right now.",
  },
  {
    icon: "sparkles",
    title: "Seasonal guidance",
    text: "The produce guide tracks a twelve-month season for each item, so you know what to buy this week.",
  },
  {
    icon: "bookmark",
    title: "Save and take notes",
    text: "Bookmark markets and produce and keep a short note for the next trip. Notes stay in this browser session.",
  },
];

export default function HomePage() {
  const { markets, produce, areas } = useData();
  const decorated = useDecoratedMarkets();
  const now = useNow();
  const { origin, status, requestDeviceLocation } = useUserLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const openCount = useMemo(
    () => markets.filter((m) => isOpenNow(m, now)).length,
    [markets, now],
  );
  const nearest = useMemo(
    () => [...decorated].sort((a, b) => (a.km ?? 0) - (b.km ?? 0)).slice(0, 4),
    [decorated],
  );
  const highlights = useMemo(
    () => seasonalHighlights(produce, now.month).slice(0, 4),
    [produce, now.month],
  );
  const pick = useMemo(
    () => pickOfTheMonth(produce, now.month),
    [produce, now.month],
  );
  const arriving = useMemo(
    () => arrivingItems(produce, now.month).slice(0, 3),
    [produce, now.month],
  );

  const go = (value) =>
    navigate(`/directory${value ? `?q=${encodeURIComponent(value)}` : ""}`);

  return (
    <>
      <section className="ff-hero">
        <div className="ff-container">
          <div className="ff-hero__grid">
            <div className="ff-hero__copy">
              <span className="ff-eyebrow">Fresh all along</span>
              <h1 className="ff-page-title">
                Find the freshest markets in Lagos
              </h1>
              <p className="ff-lead">
                Discover farmers markets near you, see who is open right now and
                learn what is in season this week.
              </p>
              <div className="ff-hero__search">
                <SearchBox
                  value={q}
                  onChange={setQ}
                  onSubmit={go}
                  onPick={(opt) => go(opt.value)}
                  markets={decorated}
                  label="Search"
                  placeholder="Search markets, produce or areas"
                />
              </div>
              <div className="ff-hero__actions">
                <Link
                  to="/directory"
                  className="ff-btn ff-btn--primary ff-btn--lg"
                >
                  Browse the directory
                </Link>
                <button
                  type="button"
                  className="ff-btn ff-btn--outline ff-btn--lg"
                  onClick={requestDeviceLocation}
                >
                  <Icon name="locate-fixed" size={17} />
                  {status === "locating" ? "Finding you…" : "Use my location"}
                </button>
              </div>
              <div className="ff-stats">
                <div className="ff-stat">
                  <span className="ff-stat__n">{markets.length}</span>
                  <span className="ff-stat__l">markets listed</span>
                </div>
                <div className="ff-stat">
                  <span className="ff-stat__n">{openCount}</span>
                  <span className="ff-stat__l">open right now</span>
                </div>
                <div className="ff-stat">
                  <span className="ff-stat__n">{areas.length}</span>
                  <span className="ff-stat__l">areas covered</span>
                </div>
              </div>
            </div>
            <div className="ff-hero__media">
              <div className="ff-hero__photo">
                <img
                  src={asset("/images/placeholder-market.svg")}
                  alt=""
                  width="640"
                  height="480"
                />
              </div>
              {nearest[0] && (
                <div className="ff-hero__badge">
                  <Icon name="map-pin" size={18} />
                  <span>
                    <strong>{nearest[0].name}</strong>
                    <br />
                    <span>
                      Nearest to {origin.label} · {nearest[0].status.label}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="ff-section">
        <div className="ff-container">
          <div className="ff-section-head">
            <div className="ff-section-head__copy">
              <span className="ff-eyebrow">Near you</span>
              <h2 className="ff-section-title">
                Markets around {origin.label}
              </h2>
              <p className="ff-lead">
                {origin.source === "device"
                  ? "Sorted by how close they are to your current location."
                  : "Sorted from the default location until you share yours."}
              </p>
            </div>
            <Link to="/directory" className="ff-link-arrow">
              See all markets →
            </Link>
          </div>
          <div className="ff-grid ff-grid--4 ff-scroll-row">
            {nearest.map((m) => (
              <MarketCard key={m.id} market={m} />
            ))}
          </div>
        </div>
      </section>

      <section className="ff-section">
        <div className="ff-container">
          <div className="ff-section-head">
            <div className="ff-section-head__copy">
              <span className="ff-eyebrow">In season</span>
              <h2 className="ff-section-title">
                Fresh on the stalls this month
              </h2>
              <p className="ff-lead">
                {arriving.length
                  ? `Also arriving soon: ${arriving.map((p) => p.name).join(", ")}.`
                  : "Seasonal produce changes month by month, so check back often."}
              </p>
            </div>
            <Link to="/seasonal" className="ff-link-arrow">
              Seasonal picks →
            </Link>
          </div>
          <div className="ff-grid ff-grid--4 ff-scroll-row">
            {highlights.map((p) => (
              <ProduceCard key={p.id} item={p} />
            ))}
          </div>
        </div>
      </section>

      {pick && (
        <section className="ff-section">
          <div className="ff-container">
            <article className="ff-card">
              <div className="ff-detail ff-card-pad">
                <div>
                  <span className="ff-eyebrow">Pick of the month</span>
                  <h2 className="ff-section-title" style={{ marginTop: 8 }}>
                    {pick.name}
                  </h2>
                  <p className="ff-lead" style={{ marginTop: 12 }}>
                    {pick.pick || pick.description}
                  </p>
                  <div className="ff-stack" style={{ marginTop: 20 }}>
                    <SeasonStrip
                      season={pick.season}
                      currentMonth={now.month}
                    />
                    <div className="ff-row-split">
                      <span className="ff-month-badge">
                        <Icon name="sun" size={15} />
                        In season now
                      </span>
                      <Link
                        to={`/produce/${pick.id}`}
                        className="ff-btn ff-btn--outline"
                      >
                        Read the guide
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="ff-hero-media">
                  <img
                    src={asset(pick.photo || pick.image)}
                    alt=""
                    width="640"
                    height="360"
                  />
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      <section className="ff-section">
        <div className="ff-container">
          <div className="ff-section-head__copy" style={{ marginBottom: 28 }}>
            <span className="ff-eyebrow">Why FreshFind</span>
            <h2 className="ff-section-title">
              Built around the Lagos market week
            </h2>
          </div>
          <div className="ff-feature-list">
            {FEATURES.map((f) => (
              <div key={f.title} className="ff-feature">
                <span className="ff-feature__ic" aria-hidden="true">
                  <Icon name={f.icon} size={20} />
                </span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ff-section">
        <div className="ff-container">
          <div className="ff-cta">
            <div>
              <h2>Know a market we have missed?</h2>
              <p>
                Send us the details and we will add it to the directory for the
                whole neighbourhood.
              </p>
            </div>
            <div className="ff-cta__actions">
              <Link
                to="/contact?topic=add"
                className="ff-btn ff-btn--yellow ff-btn--lg"
              >
                List your market
              </Link>
              <Link
                to="/find"
                className="ff-btn ff-btn--outline-light ff-btn--lg"
              >
                Find a market
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
