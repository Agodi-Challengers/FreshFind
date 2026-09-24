import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import StatusPill, { statusTextClass } from "./StatusPill.jsx";
import BookmarkButton from "./BookmarkButton.jsx";
import { useData } from "../context/DataContext.jsx";
import { scheduleLabel } from "../lib/time.js";
import { formatKm } from "../lib/geo.js";
import { asset } from "../lib/assets.js";

/**
 * Market card used on Home, Directory, Seasonal and Market detail pages.
 * `market` must be decorated with `status` and `km` (see lib/filters.js decorate()).
 * variant "local": shows "Locality · 1.2 km" instead of the distance pill (Seasonal / mobile design).
 */
export default function MarketCard({
  market,
  variant = "default",
  headingLevel = 3,
}) {
  const { produceById } = useData();
  const Heading = `h${headingLevel}`;
  const shown = market.produce.slice(0, 3);
  const more = market.produce.length - shown.length;
  const place =
    variant === "local"
      ? `${market.locality} · ${formatKm(market.km)}`
      : `${market.area} · ${market.region}`;

  return (
    <article className="market-card card hover-card">
      <div className="market-card__media">
        <img
          src={asset(market.images.card)}
          alt=""
          loading="lazy"
          width="304"
          height="160"
        />
        <StatusPill status={market.status} className="market-card__status" />
        <BookmarkButton
          type="market"
          id={market.id}
          name={market.name}
          className="market-card__save"
        />
        {variant !== "local" && market.km != null && (
          <span className="pill market-card__km">{formatKm(market.km)}</span>
        )}
      </div>
      <div className="market-card__body">
        <div className="market-card__title">
          <Heading className="market-card__name">
            <Link to={`/markets/${market.id}`} className="stretched">
              {market.name}
            </Link>
          </Heading>
          <p className="icon-text muted">
            <Icon name="map-pin" size={14} />
            {place}
          </p>
        </div>
        <p className="icon-text market-card__hours">
          <Icon name="calendar-days" size={14} />
          {scheduleLabel(market.schedule)}
        </p>
        <ul className="market-card__produce" aria-label="Typical produce">
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
        <div className="market-card__footer">
          <span className={`status-text ${statusTextClass(market.status)}`}>
            {market.status.label}
          </span>
          <span className="market-card__more" aria-hidden="true">
            Details →
          </span>
        </div>
      </div>
    </article>
  );
}
