import { useMemo } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";
import Icon from "../components/Icon.jsx";
import ProduceCard from "../components/ProduceCard.jsx";
import SeasonStrip from "../components/SeasonStrip.jsx";
import { useData } from "../context/DataContext.jsx";
import { useNow } from "../context/ClockContext.jsx";
import { MONTH_SHORT } from "../lib/time.js";
import {
  arrivingItems,
  endingItems,
  pickOfTheMonth,
  seasonalHighlights,
} from "../lib/seasonal.js";
import { asset } from "../lib/assets.js";

const MONTH_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function SeasonalPage() {
  const { produce } = useData();
  const now = useNow();

  const highlights = useMemo(
    () => seasonalHighlights(produce, now.month),
    [produce, now.month],
  );
  const arriving = useMemo(
    () => arrivingItems(produce, now.month),
    [produce, now.month],
  );
  const ending = useMemo(
    () => endingItems(produce, now.month),
    [produce, now.month],
  );
  const pick = useMemo(
    () => pickOfTheMonth(produce, now.month),
    [produce, now.month],
  );

  const inSeasonCount = highlights.filter(
    (p) => p.season !== "111111111111",
  ).length;
  const nextMonth = MONTH_SHORT[(now.month + 1) % 12];

  return (
    <div className="ff-container ff-page">
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Seasonal" }]} />

      <div className="ff-page-header" style={{ paddingBottom: 0 }}>
        <div className="ff-page-header__copy">
          <span className="ff-eyebrow">Seasonal picks</span>
          <h1 className="ff-page-title">
            In season in {MONTH_LONG[now.month]}
          </h1>
          <p className="ff-lead">
            {highlights.length} items are available this month, {inSeasonCount}{" "}
            of them on a short season. {arriving.length} more arrive in{" "}
            {nextMonth}.
          </p>
        </div>
      </div>

      {pick && (
        <section className="ff-section--tight" style={{ marginTop: 28 }}>
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
                  <SeasonStrip season={pick.season} currentMonth={now.month} />
                  <div className="ff-row-split">
                    <span className="ff-month-badge">
                      <Icon name="sun" size={15} />
                      Peak season
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
        </section>
      )}

      <section className="ff-section">
        <div className="ff-section-head">
          <div className="ff-section-head__copy">
            <span className="ff-eyebrow">Now</span>
            <h2 className="ff-section-title">In season this month</h2>
            <p className="ff-lead">
              Short-season items are listed first, all-year staples last.
            </p>
          </div>
          <Link to="/produce" className="ff-link-arrow">
            Full produce guide →
          </Link>
        </div>
        <div className="ff-grid ff-grid--3">
          {highlights.map((p) => (
            <ProduceCard key={p.id} item={p} />
          ))}
        </div>
      </section>

      <section className="ff-section">
        <div className="ff-grid--2">
          <div className="ff-card ff-card-pad ff-stack">
            <div>
              <span className="ff-eyebrow">Arriving</span>
              <h2
                className="ff-section-title"
                style={{ fontSize: 26, marginTop: 6 }}
              >
                Coming into season
              </h2>
            </div>
            {arriving.length === 0 ? (
              <p className="ff-lead">
                Nothing new is starting next month; the current season is
                holding steady.
              </p>
            ) : (
              <ul
                className="ff-chip-row"
                style={{ listStyle: "none", padding: 0, margin: 0 }}
              >
                {arriving.map((p) => (
                  <li key={p.id}>
                    <Link to={`/produce/${p.id}`} className="ff-chip">
                      <Icon name="sparkles" size={14} />
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="ff-card ff-card-pad ff-stack">
            <div>
              <span className="ff-eyebrow">Ending</span>
              <h2
                className="ff-section-title"
                style={{ fontSize: 26, marginTop: 6 }}
              >
                Going out of season
              </h2>
            </div>
            {ending.length === 0 ? (
              <p className="ff-lead">
                Nothing is finishing this month. The stalls stay full.
              </p>
            ) : (
              <ul
                className="ff-chip-row"
                style={{ listStyle: "none", padding: 0, margin: 0 }}
              >
                {ending.map((p) => (
                  <li key={p.id}>
                    <Link to={`/produce/${p.id}`} className="ff-chip">
                      <Icon name="hourglass" size={14} />
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
