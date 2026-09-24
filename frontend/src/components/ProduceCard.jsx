import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import BookmarkButton from './BookmarkButton.jsx';
import SeasonStrip from './SeasonStrip.jsx';
import { useData } from '../context/DataContext.jsx';
import { useNow } from '../context/ClockContext.jsx';
import { inSeason } from '../lib/time.js';
import { asset } from '../lib/assets.js';

/** Produce Guide card: photo, category, description, season strip and where to buy. */
export default function ProduceCard({ item }) {
  const { marketsByProduce, categories } = useData();
  const now = useNow();
  const count = marketsByProduce[item.id]?.length || 0;
  const catLabel = categories.find((c) => c.name === item.category)?.label || item.category;
  const seasonal = inSeason(item.season, now.month);

  return (
    <article className="ff-produce-card ff-card ff-hover-card">
      <div className="ff-produce-card__media">
        <img src={asset(item.photo || item.image)} alt="" loading="lazy" width="300" height="180" />
        {seasonal && (
          <span className="ff-pill ff-pill--green-dot ff-produce-card__pill">
            <span className="ff-dot ff-dot--open" aria-hidden="true" />
            In season
          </span>
        )}
        <BookmarkButton type="produce" id={item.id} name={item.name} variant="solid" className="ff-produce-card__save" />
      </div>
      <div className="ff-produce-card__body">
        <div>
          <span className="ff-produce-card__cat">{catLabel}</span>
          <h3 className="ff-produce-card__name">
            <Link to={`/produce/${item.id}`} className="ff-stretched">
              {item.name}
            </Link>
          </h3>
        </div>
        <p className="ff-produce-card__desc">{item.description}</p>
        <SeasonStrip season={item.season} currentMonth={now.month} />
        <div className="ff-produce-card__foot">
          <span className="ff-icon-text ff-produce-card__count">
            <Icon name="store" size={14} />
            At {count} {count === 1 ? 'market' : 'markets'}
          </span>
          <Link
            to={`/directory?q=${encodeURIComponent(item.shortName || item.name)}`}
            className="ff-produce-card__buy"
          >
            Where to buy →
          </Link>
        </div>
      </div>
    </article>
  );
}
