import { Link, useParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";
import Icon from "../components/Icon.jsx";
import MarketCard from "../components/MarketCard.jsx";
import StatusPill, { statusTextClass } from "../components/StatusPill.jsx";
import BookmarkButton from "../components/BookmarkButton.jsx";
import NoteField from "../components/NoteField.jsx";
import { useData } from "../context/DataContext.jsx";
import { useNow } from "../context/ClockContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useUserLocation } from "../context/LocationContext.jsx";
import { useDecoratedMarkets } from "../lib/useMarkets.js";
import { DAY_LONG, WEEK_ORDER, formatRange } from "../lib/time.js";
import { formatKm } from "../lib/geo.js";
import {
  asset,
  googleDirections,
  googleMapsEmbed,
  googleMapsLink,
} from "../lib/assets.js";

export default function MarketDetailPage() {
  const { id } = useParams();
  const { produceById } = useData();
  const decorated = useDecoratedMarkets();
  const now = useNow();
  const { origin } = useUserLocation();
  const toast = useToast();

  const market = decorated.find((m) => m.id === id);

  if (!market) {
    return (
      <div className="ff-container ff-page">
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: "Directory", to: "/directory" },
            { label: "Not found" },
          ]}
        />
        <div className="ff-empty" style={{ marginTop: 24 }}>
          <strong>We could not find that market</strong>
          <p>It may have been renamed or removed. Try the directory instead.</p>
          <Link to="/directory" className="ff-btn ff-btn--primary">
            Browse the directory
          </Link>
        </div>
      </div>
    );
  }

  const hero = asset(market.images.hero || market.images.card);

  const related = decorated
    .filter(
      (m) =>
        m.id !== market.id &&
        m.produce.some((pid) => market.produce.includes(pid)),
    )
    .slice(0, 3);

  const facts = [
    { icon: "clock", k: "Status", v: market.status.label },
    {
      icon: "map-pin",
      k: "Distance",
      v: `${formatKm(market.km)} from ${origin.label}`,
    },
    { icon: "wallet", k: "Prices", v: market.prices },
    { icon: "tag", k: "Payment", v: market.payment },
    { icon: "car", k: "Parking", v: market.parking },
    { icon: "sprout", k: "Growers", v: market.growers },
  ];

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast("Link copied to the clipboard");
    } catch {
      toast("Copy the address bar to share this market");
    }
  };

  return (
    <div className="ff-container ff-page">
      <Breadcrumb
        items={[
          { label: "Home", to: "/" },
          { label: "Directory", to: "/directory" },
          { label: market.name },
        ]}
      />

      <div className="ff-detail" style={{ marginTop: 20 }}>
        <div className="ff-stack">
          <div className="ff-hero-media">
            <img src={hero} alt="" width="960" height="540" />
            <StatusPill
              status={market.status}
              className="ff-hero-media__pill"
            />
            <BookmarkButton
              type="market"
              id={market.id}
              name={market.name}
              className="ff-hero-media__save"
            />
          </div>

          <div>
            <span className="ff-eyebrow">
              {market.area} · {market.region}
            </span>
            <h1 className="ff-page-title" style={{ marginTop: 6 }}>
              {market.name}
            </h1>
            <p className="ff-lead" style={{ marginTop: 10 }}>
              {market.address}
            </p>
            <p
              className={`ff-status-text ${statusTextClass(market.status)}`}
              style={{ marginTop: 8 }}
            >
              {market.status.label}
            </p>
          </div>

          {market.about && <p className="ff-lead">{market.about}</p>}

          <div className="ff-facts">
            {facts.map((f) => (
              <div key={f.k} className="ff-fact">
                <span className="ff-fact__ic" aria-hidden="true">
                  <Icon name={f.icon} size={17} />
                </span>
                <span>
                  <span className="ff-fact__k">{f.k}</span>
                  <span className="ff-fact__v">{f.v}</span>
                </span>
              </div>
            ))}
          </div>

          <section className="ff-section--tight">
            <h2 className="ff-section-title" style={{ fontSize: 26 }}>
              Opening hours
            </h2>
            <div className="ff-hours" style={{ marginTop: 12 }}>
              {WEEK_ORDER.map((day) => {
                const hours = market.schedule[day];
                return (
                  <div
                    key={day}
                    className={`ff-hours__row${day === now.dayKey ? " is-today" : ""}`}
                  >
                    <span className="ff-hours__day">
                      {DAY_LONG[day]}
                      {day === now.dayKey ? " · today" : ""}
                    </span>
                    <span className="ff-hours__time">
                      {hours ? formatRange(hours) : "Closed"}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="ff-fineprint">
              All hours are Lagos time (Africa/Lagos). Always confirm with the
              market before travelling.
            </p>
          </section>

          <section className="ff-section--tight">
            <h2 className="ff-section-title" style={{ fontSize: 26 }}>
              Typical produce
            </h2>
            <ul
              className="ff-chip-row"
              style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}
            >
              {market.produce.map((pid) => (
                <li key={pid}>
                  <Link to={`/produce/${pid}`} className="ff-chip">
                    <Icon name="leaf" size={14} />
                    {produceById[pid]?.name || pid}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {market.tips && (
            <div className="ff-notice">
              <Icon name="lightbulb" size={17} />
              <span>{market.tips}</span>
            </div>
          )}

          {related.length > 0 && (
            <section className="ff-section--tight">
              <h2 className="ff-section-title" style={{ fontSize: 26 }}>
                Markets with similar produce
              </h2>
              <div className="ff-grid ff-grid--3" style={{ marginTop: 16 }}>
                {related.map((m) => (
                  <MarketCard key={m.id} market={m} headingLevel={3} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="ff-sidebar">
          <div className="ff-card ff-card-pad ff-stack">
            <div>
              <span className="ff-field-label">Getting there</span>
              <p className="ff-fact__v" style={{ marginTop: 4 }}>
                {market.street} · {formatKm(market.km)} away
              </p>
            </div>
            <a
              className="ff-btn ff-btn--primary ff-btn--block"
              href={googleDirections(market)}
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="navigation" size={16} />
              Directions
            </a>
            <a
              className="ff-btn ff-btn--outline ff-btn--block"
              href={googleMapsLink(market)}
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="map" size={16} />
              Open in Google Maps
            </a>
            {market.phone && (
              <a
                className="ff-btn ff-btn--ghost ff-btn--block"
                href={`tel:${market.phone.replace(/\s+/g, "")}`}
              >
                <Icon name="phone" size={16} />
                {market.phone}
              </a>
            )}
            <button
              type="button"
              className="ff-btn ff-btn--ghost ff-btn--block"
              onClick={share}
            >
              <Icon name="share-2" size={16} />
              Copy link
            </button>
          </div>

          <div className="ff-card ff-card-pad ff-stack">
            <span className="ff-field-label">Your note</span>
            <NoteField
              type="market"
              id={market.id}
              placeholder="What did you buy? What should you bring next time?"
            />
          </div>

          <div className="ff-card" style={{ overflow: "hidden" }}>
            <iframe
              title={`Map of ${market.name}`}
              src={googleMapsEmbed(market)}
              loading="lazy"
              width="100%"
              height="260"
              style={{ border: 0, display: "block" }}
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
