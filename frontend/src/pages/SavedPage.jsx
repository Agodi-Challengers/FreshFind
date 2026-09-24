import { Link } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";
import Icon from "../components/Icon.jsx";
import MarketCard from "../components/MarketCard.jsx";
import ProduceCard from "../components/ProduceCard.jsx";
import NoteField from "../components/NoteField.jsx";
import { useData } from "../context/DataContext.jsx";
import { useBookmarks } from "../context/BookmarksContext.jsx";
import { useDecoratedMarkets } from "../lib/useMarkets.js";

export default function SavedPage() {
  const { produceById } = useData();
  const { items, remove } = useBookmarks();
  const decorated = useDecoratedMarkets();

  const marketItems = items.filter((i) => i.type === "market");
  const produceItems = items.filter((i) => i.type === "produce");

  const savedMarkets = marketItems
    .map((i) => decorated.find((m) => m.id === i.id))
    .filter(Boolean);
  const savedProduce = produceItems
    .map((i) => produceById[i.id])
    .filter(Boolean);

  const nameFor = (item) =>
    item.type === "market"
      ? decorated.find((m) => m.id === item.id)?.name
      : produceById[item.id]?.name;

  const namedItems = items.filter((i) => nameFor(i));

  return (
    <div className="ff-container ff-page">
      <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Saved" }]} />

      <div className="ff-page-header" style={{ paddingBottom: 0 }}>
        <div className="ff-page-header__copy">
          <span className="ff-eyebrow">Saved & notes</span>
          <h1 className="ff-page-title">Your shortlist</h1>
          <p className="ff-lead">
            {items.length === 0
              ? "Nothing saved yet. Bookmark markets and produce as you browse, then plan the trip here."
              : `${savedMarkets.length} market${savedMarkets.length === 1 ? "" : "s"} and ${savedProduce.length} produce item${savedProduce.length === 1 ? "" : "s"} saved for this browser session.`}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="ff-empty" style={{ marginTop: 28 }}>
          <strong>Your shortlist is empty</strong>
          <p>Use the bookmark button on any market or produce card.</p>
          <div className="ff-row-split" style={{ justifyContent: "center" }}>
            <Link to="/directory" className="ff-btn ff-btn--primary">
              Browse markets
            </Link>
            <Link to="/produce" className="ff-btn ff-btn--outline">
              Browse produce
            </Link>
          </div>
        </div>
      ) : (
        <>
          {savedMarkets.length > 0 && (
            <section className="ff-section--tight" style={{ marginTop: 28 }}>
              <div className="ff-section-head">
                <div className="ff-section-head__copy">
                  <h2 className="ff-section-title" style={{ fontSize: 26 }}>
                    Saved markets
                  </h2>
                </div>
              </div>
              <div className="ff-grid ff-grid--3">
                {savedMarkets.map((m) => (
                  <MarketCard key={m.id} market={m} />
                ))}
              </div>
            </section>
          )}

          {savedProduce.length > 0 && (
            <section className="ff-section--tight" style={{ marginTop: 40 }}>
              <div className="ff-section-head">
                <div className="ff-section-head__copy">
                  <h2 className="ff-section-title" style={{ fontSize: 26 }}>
                    Saved produce
                  </h2>
                </div>
              </div>
              <div className="ff-grid ff-grid--3">
                {savedProduce.map((p) => (
                  <ProduceCard key={p.id} item={p} />
                ))}
              </div>
            </section>
          )}

          <section className="ff-section--tight" style={{ marginTop: 40 }}>
            <div className="ff-card ff-card-pad">
              <div className="ff-row-split" style={{ marginBottom: 16 }}>
                <h2 className="ff-section-title" style={{ fontSize: 22 }}>
                  Notes
                </h2>
                <span className="ff-fineprint" style={{ marginTop: 0 }}>
                  Notes last for this browser session only.
                </span>
              </div>
              <div className="ff-stack">
                {namedItems.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="ff-stack">
                    <div className="ff-row-split">
                      <Link
                        to={
                          item.type === "market"
                            ? `/markets/${item.id}`
                            : `/produce/${item.id}`
                        }
                        className="ff-inline-link"
                      >
                        {nameFor(item)}
                      </Link>
                      <button
                        type="button"
                        className="ff-icon-btn"
                        aria-label={`Remove ${nameFor(item)} from saved`}
                        onClick={() => remove(item.type, item.id)}
                      >
                        <Icon name="trash-2" size={15} />
                      </button>
                    </div>
                    <NoteField
                      type={item.type}
                      id={item.id}
                      label="Note"
                      placeholder="Add a short note"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
