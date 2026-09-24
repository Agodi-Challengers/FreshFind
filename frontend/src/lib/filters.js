// Filtering and sorting for the Market Directory and Find a Market pages.
// Filters live in the URL (?area=Lekki&day=sat) so every result can be linked and shared.

import { getMarketStatus, matchesTimeWindow, TIME_WINDOWS, DAY_LONG, DAY_KEYS } from './time.js';
import { distanceKm } from './geo.js';

export const FEATURES = {
  organic: { label: 'Organic growers', test: (m) => /organic/i.test(m.growers) },
  wholesale: { label: 'Wholesale prices', test: (m) => /wholesale/i.test(m.prices) },
  card: { label: 'Accepts card', test: (m) => /card/i.test(m.payment) },
  parking: { label: 'Parking available', test: (m) => /dedicated/i.test(m.parking) },
};

export const SORTS = {
  nearest: 'Nearest first',
  open: 'Open now first',
  next: 'Next to open',
  az: 'Name A–Z',
  most: 'Most produce',
};

export const EMPTY_FILTERS = {
  q: '',
  open: false,
  areas: [],
  days: [],
  time: 'any',
  cats: [],
  feats: [],
  sort: 'nearest',
};

const list = (value) => (value ? value.split(',').filter(Boolean) : []);

export function filtersFromParams(params) {
  const sort = params.get('sort');
  const time = params.get('time');
  return {
    q: params.get('q') || '',
    open: params.get('open') === '1',
    areas: list(params.get('area')),
    days: list(params.get('day')).filter((d) => DAY_KEYS.includes(d)),
    time: TIME_WINDOWS[time] ? time : 'any',
    cats: list(params.get('cat')),
    feats: list(params.get('feat')).filter((f) => FEATURES[f]),
    sort: SORTS[sort] ? sort : 'nearest',
  };
}

export function filtersToParams(f) {
  const params = new URLSearchParams();
  if (f.q.trim()) params.set('q', f.q.trim());
  if (f.open) params.set('open', '1');
  if (f.areas.length) params.set('area', f.areas.join(','));
  if (f.days.length) params.set('day', f.days.join(','));
  if (f.time !== 'any') params.set('time', f.time);
  if (f.cats.length) params.set('cat', f.cats.join(','));
  if (f.feats.length) params.set('feat', f.feats.join(','));
  if (f.sort !== 'nearest') params.set('sort', f.sort);
  return params;
}

export function hasActiveFilters(f) {
  return Boolean(
    f.q.trim() || f.open || f.areas.length || f.days.length || f.time !== 'any' || f.cats.length || f.feats.length,
  );
}

const normalise = (s) =>
  s
    .toLowerCase()
    .replace(/[“”"']/g, '')
    .trim();

export function matchesQuery(market, query, produceById) {
  const q = normalise(query);
  if (!q) return true;
  const haystack = [
    market.name,
    market.street,
    market.address,
    market.area,
    market.locality,
    market.region,
    ...market.categories,
    ...market.produce.map((id) => produceById[id]?.name || id),
  ]
    .join(' ')
    .toLowerCase();
  return q.split(/\s+/).every((word) => haystack.includes(word));
}

/** Adds distance and live status to each market. */
export function decorate(markets, { now, origin }) {
  return markets.map((m) => ({
    ...m,
    km: distanceKm(origin, m),
    status: getMarketStatus(m, now),
  }));
}

export function applyFilters(markets, f, produceById) {
  return markets.filter((m) => {
    if (f.open && m.status.state === 'closed') return false;
    if (f.areas.length && !f.areas.includes(m.area)) return false;
    if (f.days.length && !f.days.some((d) => m.schedule[d])) return false;
    if (f.time !== 'any' && !matchesTimeWindow(m, f.time)) return false;
    if (f.cats.length && !f.cats.some((c) => m.categories.includes(c))) return false;
    if (f.feats.length && !f.feats.every((k) => FEATURES[k].test(m))) return false;
    if (!matchesQuery(m, f.q, produceById)) return false;
    return true;
  });
}

const byDistance = (a, b) => (a.km ?? 0) - (b.km ?? 0);
const STATE_RANK = { open: 0, soon: 1, closed: 2 };

export function sortMarkets(markets, sort) {
  const out = [...markets];
  switch (sort) {
    case 'open':
      return out.sort(
        (a, b) =>
          STATE_RANK[a.status.state] - STATE_RANK[b.status.state] ||
          a.status.minutesToOpen - b.status.minutesToOpen ||
          byDistance(a, b),
      );
    case 'next':
      return out.sort((a, b) => a.status.minutesToOpen - b.status.minutesToOpen || byDistance(a, b));
    case 'az':
      return out.sort((a, b) => a.name.localeCompare(b.name));
    case 'most':
      return out.sort((a, b) => b.produce.length - a.produce.length || a.name.localeCompare(b.name));
    default:
      return out.sort(byDistance);
  }
}

/** Chips describing the active filters, each with a function that removes it. */
export function activeFilterChips(f, now) {
  const chips = [];
  if (f.q.trim()) chips.push({ key: 'q', label: `“${f.q.trim()}”`, remove: (x) => ({ ...x, q: '' }) });
  if (f.open) chips.push({ key: 'open', label: 'Open now', remove: (x) => ({ ...x, open: false }) });
  for (const a of f.areas) chips.push({ key: `a-${a}`, label: a, remove: (x) => ({ ...x, areas: x.areas.filter((v) => v !== a) }) });
  for (const d of f.days) {
    let label = DAY_LONG[d];
    if (now && d === now.dayKey) label += ' (today)';
    else if (now && d === DAY_KEYS[(now.dayIndex + 1) % 7]) label += ' (tomorrow)';
    chips.push({ key: `d-${d}`, label, remove: (x) => ({ ...x, days: x.days.filter((v) => v !== d) }) });
  }
  if (f.time !== 'any') {
    const w = TIME_WINDOWS[f.time];
    chips.push({ key: 'time', label: `${w.label} (${w.range})`, remove: (x) => ({ ...x, time: 'any' }) });
  }
  for (const c of f.cats) chips.push({ key: `c-${c}`, label: c, remove: (x) => ({ ...x, cats: x.cats.filter((v) => v !== c) }) });
  for (const k of f.feats) chips.push({ key: `f-${k}`, label: FEATURES[k].label, remove: (x) => ({ ...x, feats: x.feats.filter((v) => v !== k) }) });
  return chips;
}
