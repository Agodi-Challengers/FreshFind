import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import StatusPill, { statusTextClass } from "./StatusPill.jsx";
import BookmarkButton from "./BookmarkButton.jsx";
import { scheduleLabel } from "../lib/time.js";
import { formatKm } from "../lib/geo.js";
import { asset } from "../lib/assets.js";

/** Result row on the Find a Market page. Selecting a row highlights its pin on the map. */
export default function MarketRow({
  market,
  selected = false,
  onSelect,
  onHover,
}) {
  const handleClick = (e) => {
    if (e.target.closest("a, button")) return;
    onSelect?.(market.id);
  };

  return (
    <article
      className={`market-row card hover-card${selected ? " is-selected" : ""}`}
      onClick={handleClick}
      onMouseEnter={() => onHover?.(market.id)}
      onMouseLeave={() => onHover?.(null)}
      aria-current={selected ? "true" : undefined}
    >
      <img
        className="market-row__thumb"
        src={asset(market.images.row)}
        alt=""
        loading="lazy"
        width="104"
        height="92"
      />
      <div className="market-row__info">
        <div className="market-row__head">
          <h3 className="market-row__name">
            <Link to={`/markets/${market.id}`}>{market.name}</Link>
          </h3>
          <StatusPill status={market.status} />
        </div>
        <p className="icon-text muted">
          <Icon name="map-pin" size={14} />
          {market.street} · {formatKm(market.km)}
        </p>
        <p className="icon-text market-row__hours">
          <Icon name="clock" size={14} />
          {scheduleLabel(market.schedule)}
        </p>
        <p className={`status-text ${statusTextClass(market.status)}`}>
          {market.status.label}
        </p>
      </div>
      <div className="market-row__side">
        <BookmarkButton
          type="market"
          id={market.id}
          name={market.name}
          variant="outline"
        />
        <button
          type="button"
          className="market-row__locate"
          onClick={() => onSelect?.(market.id)}
        >
          <Icon name="map-pin" size={14} />
          <span className="visually-hidden">Show {market.name} on the map</span>
        </button>
      </div>
    </article>
  );
}
