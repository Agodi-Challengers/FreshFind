import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb.jsx';
import Icon from '../components/Icon.jsx';
import Dropdown from '../components/Dropdown.jsx';
import ProduceCard from '../components/ProduceCard.jsx';
import { useData } from '../context/DataContext.jsx';
import { useNow } from '../context/ClockContext.jsx';
import { inSeason } from '../lib/time.js';
import './ProduceGuidePage.css';

const SEASONS = [
  { value: 'all', label: 'All seasons' },
  { value: 'now', label: 'In season now' },
  { value: 'out', label: 'Out of season' },
];

const clean = (s) => s.toLowerCase().replace(/[“”"']/g, '').trim();

export default function ProduceGuidePage() {
  const { produce, categories } = useData();
  const now = useNow();
  const [params, setParams] = useSearchParams();
  const cat = params.get('cat') || 'All';
  const q = params.get('q') || '';
  const season = SEASONS.some((s) => s.value === params.get('season')) ? params.get('season') : 'now';

  const update = (patch) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (!v || (k === 'cat' && v === 'All') || (k === 'season' && v === 'now')) next.delete(k);
      else next.set(k, v);
    }
    setParams(next, { replace: true });
  };

  const bySeason = (p) =>
    season === 'all' ? true : season === 'now' ? inSeason(p.season, now.month) : !inSeason(p.season, now.month);

  const items = useMemo(
    () =>
      produce.filter(
        (p) =>
          (cat === 'All' || p.category === cat) &&
          bySeason(p) &&
          (!q || clean(p.name).includes(clean(q)) || clean(p.description).includes(clean(q))),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [produce, cat, q, season, now.month],
  );

  const count = (c) => produce.filter((p) => (c === 'All' || p.category === c) && bySeason(p)).length;

  return (
    <div className="ff-guide">
      <header className="ff-container ff-page-header">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Produce Guide' }]} />
        <div className="ff-page-header__copy">
          <span className="ff-eyebrow">What to buy, and when</span>
          <h1 className="ff-page-title">Produce Guide</h1>
          <p className="ff-lead">
            Learn when fruit, vegetables, herbs and dairy are at their best, and which markets usually have them.
          </p>
        </div>
      </header>

      <div className="ff-container ff-guide__toolbar">
        <div className="ff-guide__tabs" role="group" aria-label="Category">
          <button type="button" className="ff-guide__tab" aria-pressed={cat === 'All'} onClick={() => update({ cat: 'All' })}>
            <Icon name="sparkles" size={15} />
            All <span className="ff-guide__tab-count">{count('All')}</span>
          </button>
          {categories.map((c) => (
            <button key={c.name} type="button" className="ff-guide__tab" aria-pressed={cat === c.name} onClick={() => update({ cat: c.name })}>
              <Icon name={c.icon} size={15} />
              {c.name} <span className="ff-guide__tab-count">{count(c.name)}</span>
            </button>
          ))}
        </div>
        <div className="ff-guide__controls">
          <label className="ff-guide__search">
            <Icon name="search" size={16} />
            <span className="visually-hidden">Search produce</span>
            <input type="search" placeholder="Search produce" value={q} onChange={(e) => update({ q: e.target.value })} />
          </label>
          <Dropdown icon="sun" label="Season" value={season} options={SEASONS} onChange={(v) => update({ season: v })} align="right" panelWidth={220} className="ff-guide__season" />
        </div>
      </div>

      <section className="ff-container ff-guide__grid-wrap" aria-live="polite" aria-label="Produce">
        {items.length ? (
          <div className="ff-grid ff-grid--4">
            {items.map((p) => (
              <ProduceCard key={p.id} item={p} />
            ))}
          </div>
        ) : (
          <div className="ff-empty">
            <strong>Nothing matches</strong>
            <span>Try another category, or show all seasons.</span>
            <button type="button" className="ff-btn ff-btn--primary" onClick={() => setParams(new URLSearchParams('season=all'), { replace: true })}>
              Show everything
            </button>
          </div>
        )}
      </section>

      <div className="ff-container ff-guide__tip-wrap">
        <div className="ff-guide__tip">
          <span className="ff-guide__tip-ic" aria-hidden="true">
            <Icon name="lightbulb" size={24} />
          </span>
          <div>
            <h2>How to read the season bar</h2>
            <p>
              Green months are when the item is most plentiful and cheapest at Lagos markets. Tap any item to see which
              markets stocked it recently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
