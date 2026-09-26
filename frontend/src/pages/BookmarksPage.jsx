import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";
import Icon from "../components/Icon.jsx";
import StatusPill from "../components/StatusPill.jsx";
import { useData } from "../context/DataContext.jsx";
import { useNow } from "../context/ClockContext.jsx";
import { useBookmarks } from "../context/BookmarksContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useDecoratedMarkets } from "../lib/useMarkets.js";
import { buildList, downloadText, shareUrls } from "../lib/exportList.js";
import { shareLink } from "../lib/share.js";
import { scheduleLabel, seasonRange } from "../lib/time.js";
import { asset } from "../lib/assets.js";
import "./BookmarksPage.css";

function SavedItem({ item, market, produce, count }) {
  const { remove, setNote } = useBookmarks();
  const toast = useToast();
  const isMarket = item.type === "market";
  const name = isMarket ? market.name : produce.name;
  const to = isMarket ? `/markets/${market.id}` : `/produce/${produce.id}`;
  const img = isMarket ? market.images.row : produce.icon || produce.image;
  const url = `${window.location.origin}${import.meta.env.BASE_URL}${to.slice(1)}`;

  return (
    <li className="saved card">
      <img src={asset(img)} alt="" width="120" height="120" loading="lazy" />
      <div className="saved__body">
        <div className="saved__top">
          <div className="saved__title">
            <div className="saved__tags">
              <span
                className={`pill ${isMarket ? "pill--green" : "pill--yellow"} saved__type`}
              >
                {isMarket ? "Market" : "Produce"}
              </span>
              {isMarket && <StatusPill status={market.status} />}
            </div>
            <h2>
              <Link to={to}>{name}</Link>
            </h2>
            <p>
              {isMarket
                ? `${scheduleLabel(market.schedule)} · ${market.area}`
                : `In season ${seasonRange(produce.season)} · at ${count} markets`}
            </p>
          </div>
          <div className="saved__icons">
            <button
              type="button"
              className="icon-btn"
              aria-label={`Share ${name}`}
              onClick={() => shareLink({ title: name, text: name, url }, toast)}
            >
              <Icon name="share-2" size={15} />
            </button>
            <button
              type="button"
              className="icon-btn" id="remove-btn"
              aria-label={`Remove ${name}`}
              onClick={() => {
                remove(item.type, item.id);
                toast(`Removed ${name}`);
              }}
            >
              <Icon name="trash-2" size={15} />
            </button>
          </div>
        </div>
        <label className={`saved__note${item.note ? " has-note" : ""}`}>
          <Icon name="sticky-note" size={15} />
          <span className="visually-hidden">Personal note for {name}</span>
          <textarea
            rows={1}
            placeholder="Add a personal note…"
            value={item.note}
            maxLength={280}
            onChange={(e) => setNote(item.type, item.id, e.target.value)}
          />
        </label>
      </div>
    </li>
  );
}

export default function BookmarksPage() {
  const data = useData();
  const { items } = useBookmarks();
  const toast = useToast();
  useNow();
  const markets = useDecoratedMarkets();
  const [tab, setTab] = useState("all");

  const decoratedById = useMemo(
    () => Object.fromEntries(markets.map((m) => [m.id, m])),
    [markets],
  );
  const valid = items.filter((i) =>
    i.type === "market" ? decoratedById[i.id] : data.produceById[i.id],
  );
  const shown = valid.filter(
    (i) =>
      tab === "all" ||
      (tab === "markets" ? i.type === "market" : i.type === "produce"),
  );
  const nMarkets = valid.filter((i) => i.type === "market").length;
  const nProduce = valid.length - nMarkets;

  const text = buildList(valid, data);
  const siteUrl = `${window.location.origin}${import.meta.env.BASE_URL}`;
  const share = shareUrls(text, siteUrl);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast("List copied");
    } catch {
      toast("Could not copy. Select the preview text and copy it.");
    }
  };

  return (
    <div className="bookmarks">
      <header className="container_page-header">
        <Breadcrumb className="path" items={[{ label: "Home", to: "/" }, { label: "Saved" }]} />
      </header>


      <div className="container bookmarks__body">
        <section aria-label="Saved items" className="bookmarks__list">
          <div className="bookmarks__tabs" role="group" aria-label="Show">
            <button
              type="button"
              className="chip chip--lg"
              aria-pressed={tab === "all"}
              onClick={() => setTab("all")}
            >
              All · {valid.length}
            </button>
            <button
              type="button"
              className="chip chip--lg"
              aria-pressed={tab === "markets"}
              onClick={() => setTab("markets")}
            >
              Markets · {nMarkets}
            </button>
            <button
              type="button"
              className="chip chip--lg"
              aria-pressed={tab === "produce"}
              onClick={() => setTab("produce")}
            >
              Produce · {nProduce}
            </button>
          </div>

          {shown.length ? (
            <ul className="bookmarks__items">
              {shown.map((i) => (
                <SavedItem
                  key={`${i.type}-${i.id}`}
                  item={i}
                  market={decoratedById[i.id]}
                  produce={data.produceById[i.id]}
                  count={data.marketsByProduce[i.id]?.length || 0}
                />
              ))}
            </ul>
          ) : (
            <div className="empty">
              <strong>Nothing saved yet</strong>
              <span>
                Tap the bookmark on any market or produce card to add it here.
              </span>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <Link to="/directory" className="btn btn--primary">
                  Browse markets
                </Link>
                <Link to="/produce" className="btn btn--outline">
                  Open the produce guide
                </Link>
              </div>
            </div>
          )}
        </section>

        <aside
          className="bookmarks__export card"
          aria-labelledby="export-title"
        >
          <h2 id="export-title">Export &amp; share</h2>
          <p className="muted">Preview of your formatted list</p>
          <pre
            className="bookmarks__preview"
            tabIndex={0}
            aria-label="List preview"
          >
            {text}
          </pre>
          <div className="bookmarks__export-btns">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => downloadText(text, "freshfind-market-list.txt")}
              disabled={!valid.length}
            >
              <Icon name="download" size={16} />
              Download .txt
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={copy}
              disabled={!valid.length}
            >
              <Icon name="copy" size={16} />
              Copy list
            </button>
          </div>
          <hr />
          <h3>Share recommendations</h3>
          <ul className="bookmarks__social">
            <li>
              <a
                href={share.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span style={{ background: "#25d366" }}>
                  <Icon name="message-circle" size={20} />
                </span>
                WhatsApp
              </a>
            </li>
            <li>
              <a href={share.x} target="_blank" rel="noopener noreferrer">
                <span style={{ background: "#111111" }}>
                  <Icon name="twitter" size={20} />
                </span>
                X
              </a>
            </li>
            <li>
              <a
                href={share.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span style={{ background: "#1877f2" }}>
                  <Icon name="facebook" size={20} />
                </span>
                Facebook
              </a>
            </li>
            <li>
              <a href={share.email}>
                <span style={{ background: "var(--orange)" }}>
                  <Icon name="mail" size={20} />
                </span>
                Email
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
