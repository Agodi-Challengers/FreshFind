import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import StatusPill, { statusTextClass } from "./StatusPill.jsx";
import BookmarkButton from "./BookmarkButton.jsx";
import { useData } from "../context/DataContext.jsx";
import { scheduleLabel } from "../lib/time.js";
import { formatKm } from "../lib/geo.js";
import { asset, googleDirections } from "../lib/assets.js";

/** Result row on the Find a Market page. Selecting a row highlights its pin on the map. */
export default function MarketRow({
  market,
  selected = false,
  onSelect,
  onHover,
}) {
  const { produceById } = useData();
  const shown = market.produce.slice(0, 4);
  const more = market.produce.length - shown.length;

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
        <p className="icon-text market-row__hours">
          <Icon name="clock" size={14} />
          {scheduleLabel(market.schedule)}
        </p>
        <p className="icon-text muted">
          <Icon name="map-pin" size={14} />
          {market.locality} · {formatKm(market.km)}
        </p>
        {shown.length > 0 && (
          <ul className="market-row__produce" aria-label="Typical produce">
            {shown.map((id) => (
              <li key={id} className="pill pill--soft">
                {produceById[id]?.shortName || produceById[id]?.name || id}
              </li>
            ))}
            {more > 0 && (
              <li
                className="pill pill--soft pill--muted"
                aria-label={`and ${more} more`}
              >
                +{more}
              </li>
            )}
          </ul>
        )}
        <span className={`status-text ${statusTextClass(market.status)}`}>
          {market.status.label}
        </span>
      </div>
      <div className="market-row__side">
        <BookmarkButton
          type="market"
          id={market.id}
          name={market.name}
          variant="outline"
        />
        <a
          className="market-row__action"
          href={googleDirections(market)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="navigation" size={15} />
          Directions
        </a>
        <Link className="market-row__action" to={`/markets/${market.id}`}>
          Details
          <Icon name="arrow-right" size={15} />
        </Link>
      </div>
    </article>
  );
}
