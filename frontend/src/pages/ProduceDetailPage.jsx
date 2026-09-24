import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb.jsx';
import BookmarkButton from '../components/BookmarkButton.jsx';
import SeasonStrip from '../components/SeasonStrip.jsx';
import MarketRow from '../components/MarketRow.jsx';
import NotFoundPage from './NotFoundPage.jsx';
import { useData } from '../context/DataContext.jsx';
import { useNow } from '../context/ClockContext.jsx';
import { useDecoratedMarkets } from '../lib/useMarkets.js';
import { sortMarkets } from '../lib/filters.js';
import { inSeason, seasonRange } from '../lib/time.js';
import { asset } from '../lib/assets.js';
import './ProduceGuidePage.css';

/** One produce item: description, season and the markets where it is usually sold. */
export default function ProduceDetailPage() {
  const { id } = useParams();
  const { produceById, categories } = useData();
  const now = useNow();
  const markets = useDecoratedMarkets();
  const item = produceById[id];

  const sellers = useMemo(
    () => (item ? sortMarkets(markets.filter((m) => m.produce.includes(item.id)), 'open') : []),
    [item, markets],
  );

  if (!item) return <NotFoundPage />;
  const catLabel = categories.find((c) => c.name === item.category)?.label || item.category;
  const seasonal = inSeason(item.season, now.month);

  return (
    <article className="ff-container ff-produce-detail">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Produce Guide', to: '/produce' }, { label: item.name }]} />
      <div className="ff-produce-detail__top">
        <img src={asset(item.photo || item.image)} alt={item.name} width="560" height="360" />
        <div className="ff-produce-detail__copy">
          <span className="ff-eyebrow">{catLabel}</span>
          <h1 className="ff-page-title">{item.name}</h1>
          <p className="ff-lead">{item.description}</p>
          <p className="ff-produce-detail__season">
            <strong>{seasonal ? 'In season now' : 'Out of season now'}</strong> · Best {seasonRange(item.season)}
            {item.price ? ` · ${item.price}` : ''}
          </p>
          <SeasonStrip season={item.season} currentMonth={now.month} />
          <div className="d-flex flex-wrap gap-2 mt-2">
            <BookmarkButton type="produce" id={item.id} name={item.name} variant="button" />
            <Link to={`/directory?q=${encodeURIComponent(item.shortName || item.name)}`} className="ff-btn ff-btn--primary">
              See all markets that sell it
            </Link>
          </div>
        </div>
      </div>

      <section aria-labelledby="sellers" className="ff-produce-detail__sellers">
        <h2 id="sellers" className="ff-detail__h2">
          Where to buy {item.shortName || item.name} ({sellers.length})
        </h2>
        {sellers.length ? (
          <div className="ff-produce-detail__rows">
            {sellers.map((m) => (
              <MarketRow key={m.id} market={m} />
            ))}
          </div>
        ) : (
          <div className="ff-empty">
            <strong>No market lists this item yet</strong>
          </div>
        )}
      </section>
    </article>
  );
}
