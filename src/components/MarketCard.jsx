import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import StatusPill, { statusTextClass } from "./StatusPill.jsx";
import BookmarkButton from "./BookmarkButton.jsx";
import { useData } from "../context/DataContext.jsx";
import { scheduleLabel } from "../lib/time.js";
import { formatKm } from "../lib/geo.js";
import { asset } from "../lib/assets.js";
import { FaArrowRight } from "react-icons/fa6";
/**
 * Market card used on Home, Directory, Seasonal and Market detail pages.
 * `market` must be decorated with `status` and `km` (see lib/filters.js decorate()).
 *
 * variant "home": produce is shown as small round photos (Figma landing page)
 * showDescription: adds the short description (Figma directory cards)
 */
export default function MarketCard({
  market,
  variant = "default",
  headingLevel = 3,
  showDescription = false,
}) {
  const { produceById } = useData();
  const Heading = `h${headingLevel}`;
  const shown = market.produce.slice(0, 3);
  const more = market.produce.length - shown.length;
  const place =
    market.km != null
      ? `${market.locality} · ${formatKm(market.km)}`
      : market.locality;

  // first sentence of the description is enough for a card
  const shortDescription = market.description.split(". ")[0] + ".";

  return (
    <article className={`market-card market-card--${variant} card hover-card`}>
      <div className="market-card__media">
        <img
          src={asset(market.images.card)}
          alt=""
          loading="lazy"
          width="309"
          height="170"
        />
        <StatusPill status={market.status} className="market-card__status" />
        <BookmarkButton
          type="market"
          id={market.id}
          name={market.name}
          className="market-card__save"
        />
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

        {showDescription && (
          <p className="market-card__desc">{shortDescription}</p>
        )}

        <p className="icon-text market-card__hours">
          <Icon name="calendar-days" size={14} />
          {scheduleLabel(market.schedule)}
        </p>

        {variant === "home" ? (
          <ul className="market-card__photos" aria-label="Typical produce">
            {market.produce.slice(0, 4).map((id) => (
              <li key={id}>
                <img
                  src={asset(produceById[id]?.icon || produceById[id]?.image)}
                  alt={produceById[id]?.name || id}
                  width="30"
                  height="30"
                  loading="lazy"
                />
              </li>
            ))}
          </ul>
        ) : (
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
        )}

        <div className="market-card__footer">
          <span className={`status-text ${statusTextClass(market.status)}`}>
            {market.status.label}
          </span>
          <span className="market-card__more" aria-hidden="true">
            Details
            <FaArrowRight/>
          </span>
        </div>
      </div>
    </article>
  );
}
