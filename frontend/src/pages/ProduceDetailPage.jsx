import { Link, useParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";
import Icon from "../components/Icon.jsx";
import MarketCard from "../components/MarketCard.jsx";
import SeasonStrip from "../components/SeasonStrip.jsx";
import BookmarkButton from "../components/BookmarkButton.jsx";
import NoteField from "../components/NoteField.jsx";
import { useData } from "../context/DataContext.jsx";
import { useNow } from "../context/ClockContext.jsx";
import { useDecoratedMarkets } from "../lib/useMarkets.js";
import { inSeason, seasonRange } from "../lib/time.js";
import { asset } from "../lib/assets.js";

export default function ProduceDetailPage() {
  const { id } = useParams();
  const { produceById, categories } = useData();
  const decorated = useDecoratedMarkets();
  const now = useNow();

  const item = produceById?.[id];

  if (!item) {
    return (
      <div className="ff-container ff-page">
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: "Produce Guide", to: "/produce" },
            { label: "Not found" },
          ]}
        />
        <div className="ff-empty" style={{ marginTop: 24 }}>
          <strong>We do not have a guide for that item yet</strong>
          <p>Browse the produce guide to see everything we cover.</p>
          <Link to="/produce" className="ff-btn ff-btn--primary">
            Back to the produce guide
          </Link>
        </div>
      </div>
    );
  }

  const catLabel =
    categories.find((c) => c.name === item.category)?.label || item.category;
  const seasonal = inSeason(item.season, now.month);
  const sellers = decorated.filter((m) => m.produce.includes(id));

  return (
    <div className="ff-container ff-page">
      <Breadcrumb
        items={[
          { label: "Home", to: "/" },
          { label: "Produce Guide", to: "/produce" },
          { label: item.name },
        ]}
      />

      <div className="ff-page-header" style={{ paddingBottom: 0 }}>
        <div className="ff-page-header__copy">
          <span className="ff-eyebrow">{catLabel}</span>
          <h1 className="ff-page-title">{item.name}</h1>
          <p className="ff-lead">{item.description}</p>
          <div className="ff-row-split">
            <span
              className={`ff-pill ${seasonal ? "ff-pill--green" : "ff-pill--muted"}`}
            >
              <span
                className={`ff-dot ${seasonal ? "ff-dot--open" : ""}`}
                aria-hidden="true"
              />
              {seasonal
                ? "In season now"
                : `Out of season · ${seasonRange(item.season)}`}
            </span>
            <BookmarkButton
              type="produce"
              id={item.id}
              name={item.name}
              variant="button"
            />
          </div>
        </div>
      </div>

      <div className="ff-detail" style={{ marginTop: 28 }}>
        <div className="ff-stack">
          <div className="ff-hero-media">
            <img
              src={asset(item.photo || item.image)}
              alt=""
              width="960"
              height="540"
            />
          </div>

          <div className="ff-card ff-card-pad ff-stack">
            <div className="ff-row-split">
              <span className="ff-field-label">Season</span>
              <span className="ff-fact__v">{seasonRange(item.season)}</span>
            </div>
            <SeasonStrip season={item.season} currentMonth={now.month} />
          </div>

          <div className="ff-facts">
            <div className="ff-fact">
              <span className="ff-fact__ic" aria-hidden="true">
                <Icon name="leaf" size={17} />
              </span>
              <span>
                <span className="ff-fact__k">Category</span>
                <span className="ff-fact__v">{catLabel}</span>
              </span>
            </div>
            <div className="ff-fact">
              <span className="ff-fact__ic" aria-hidden="true">
                <Icon name="store" size={17} />
              </span>
              <span>
                <span className="ff-fact__k">Where to buy</span>
                <span className="ff-fact__v">
                  {sellers.length} {sellers.length === 1 ? "market" : "markets"}
                </span>
              </span>
            </div>
          </div>
        </div>

        <aside className="ff-sidebar">
          <div className="ff-card ff-card-pad ff-stack">
            <span className="ff-field-label">Shopping note</span>
            <NoteField
              type="produce"
              id={item.id}
              placeholder={`What to look for when buying ${item.name.toLowerCase()}?`}
            />
            <Link
              to={`/directory?q=${encodeURIComponent(item.shortName || item.name)}`}
              className="ff-btn ff-btn--primary ff-btn--block"
            >
              Find it in the directory
            </Link>
          </div>
        </aside>
      </div>

      <section className="ff-section">
        <div className="ff-section-head">
          <div className="ff-section-head__copy">
            <span className="ff-eyebrow">Where to buy</span>
            <h2 className="ff-section-title">Markets that sell {item.name}</h2>
          </div>
        </div>
        {sellers.length === 0 ? (
          <div className="ff-empty">
            <strong>No markets list this item yet</strong>
            <p>Try the directory to find markets nearby.</p>
          </div>
        ) : (
          <div className="ff-grid ff-grid--3">
            {sellers.map((m) => (
              <MarketCard key={m.id} market={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
