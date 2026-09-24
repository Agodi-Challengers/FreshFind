import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import StatusPill, { statusTextClass } from './StatusPill.jsx';
import BookmarkButton from './BookmarkButton.jsx';
import { useData } from '../context/DataContext.jsx';
import { scheduleLabel } from '../lib/time.js';
import { formatKm } from '../lib/geo.js';
import { asset } from '../lib/assets.js';

/**
 * Market card used on Home, Directory, Seasonal and Market detail pages.
 * `market` must be decorated with `status` and `km` (see lib/filters.js decorate()).
 * variant "local": shows "Locality · 1.2 km" instead of the distance pill (Seasonal / mobile design).
 */
export default function MarketCard({ market, variant = 'default', headingLevel = 3 }) {
  const { produceById } = useData();
  const Heading = `h${headingLevel}`;
  const shown = market.produce.slice(0, 3);
  const more = market.produce.length - shown.length;
  const place = variant === 'local' ? `${market.locality} · ${formatKm(market.km)}` : `${market.area} · ${market.region}`;

  return (
    <article className="ff-market-card ff-card ff-hover-card">
      <div className="ff-market-card__media">
        <img src={asset(market.images.card)} alt="" loading="lazy" width="304" height="160" />
        <StatusPill status={market.status} className="ff-market-card__status" />
        <BookmarkButton type="market" id={market.id} name={market.name} className="ff-market-card__save" />
        {variant !== 'local' && market.km != null && (
          <span className="ff-pill ff-market-card__km">{formatKm(market.km)}</span>
        )}
      </div>
      <div className="ff-market-card__body">
        <div className="ff-market-card__title">
          <Heading className="ff-market-card__name">
            <Link to={`/markets/${market.id}`} className="ff-stretched">
              {market.name}
            </Link>
          </Heading>
          <p className="ff-icon-text ff-muted">
            <Icon name="map-pin" size={14} />
            {place}
          </p>
        </div>
        <p className="ff-icon-text ff-market-card__hours">
          <Icon name="calendar-days" size={14} />
          {scheduleLabel(market.schedule)}
        </p>
        <ul className="ff-market-card__produce" aria-label="Typical produce">
          {shown.map((id) => (
            <li key={id} className="ff-pill ff-pill--soft">
              {produceById[id]?.shortName || produceById[id]?.name || id}
            </li>
          ))}
          {more > 0 && (
            <li className="ff-pill ff-pill--soft ff-pill--muted" aria-label={`and ${more} more`}>
              +{more}
            </li>
          )}
        </ul>
        <div className="ff-market-card__footer">
          <span className={`ff-status-text ${statusTextClass(market.status)}`}>{market.status.label}</span>
          <span className="ff-market-card__more" aria-hidden="true">
            Details →
          </span>
        </div>
      </div>
    </article>
  );
}
