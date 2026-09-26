import { DAY_KEYS, DAY_LONG, TIME_WINDOWS, WEEK_ORDER, matchesTimeWindow } from './time.js';
import { SORTS } from './filters.js';

const same = (a, b) => a.length === b.length && a.every((v) => b.includes(v));

export function areaDropdown(filters, { areas, regions, markets }) {
  const options = [{ value: '', label: 'All areas', count: markets.length, strong: true }];
  for (const r of regions) {
    const names = areas.filter((a) => a.region === r).map((a) => a.name);
    options.push({ header: r });
    options.push({ value: `region:${r}`, label: `All of ${r}`, count: markets.filter((m) => m.region === r).length, strong: true });
    for (const n of names) options.push({ value: n, label: n, count: markets.filter((m) => m.area === n).length });
  }
  let value = '';
  if (filters.areas.length === 1) value = filters.areas[0];
  else if (filters.areas.length > 1) {
    const region = regions.find((r) => same(areas.filter((a) => a.region === r).map((a) => a.name), filters.areas));
    if (region) value = `region:${region}`;
    else {
      value = '__multi';
      options.splice(1, 0, { value: '__multi', label: `${filters.areas.length} areas` });
    }
  }
  const apply = (v) => {
    if (v === '__multi') return filters.areas;
    if (!v) return [];
    if (v.startsWith('region:')) return areas.filter((a) => a.region === v.slice(7)).map((a) => a.name);
    return [v];
  };
  return { value, options, apply };
}

export function dayDropdown(filters, now) {
  const tomorrow = DAY_KEYS[(now.dayIndex + 1) % 7];
  const options = [
    { value: '', label: 'Any day', strong: true },
    { value: 'weekend', label: 'This weekend' },
    ...WEEK_ORDER.map((d) => ({
      value: d,
      label: d === now.dayKey ? `${DAY_LONG[d]} (today)` : d === tomorrow ? `${DAY_LONG[d]} (tomorrow)` : DAY_LONG[d],
    })),
  ];
  let value = '';
  if (filters.days.length === 1) value = filters.days[0];
  else if (same(filters.days, ['sat', 'sun'])) value = 'weekend';
  else if (filters.days.length > 1) {
    value = '__multi';
    options.splice(1, 0, { value: '__multi', label: `${filters.days.length} days` });
  }
  const apply = (v) => {
    if (v === '__multi') return filters.days;
    if (!v) return [];
    if (v === 'weekend') return ['sat', 'sun'];
    return [v];
  };
  return { value, options, apply };
}

export function timeDropdown(filters, markets) {
  return {
    value: filters.time === 'any' ? '' : filters.time,
    options: [
      { value: '', label: 'Any time', strong: true },
      ...Object.entries(TIME_WINDOWS).map(([k, w]) => ({
        value: k,
        label: `${w.label} (${w.range})`,
        count: markets.filter((m) => matchesTimeWindow(m, k)).length,
      })),
    ],
    apply: (v) => v || 'any',
  };
}

export function produceDropdown(filters, { categories, markets }) {
  const options = [
    { value: '', label: 'All produce', strong: true },
    ...categories.map((c) => ({ value: c.name, label: c.name, count: markets.filter((m) => m.categories.includes(c.name)).length })),
  ];
  let value = '';
  if (filters.cats.length === 1) value = filters.cats[0];
  else if (filters.cats.length > 1) {
    value = '__multi';
    options.splice(1, 0, { value: '__multi', label: `${filters.cats.length} categories` });
  }
  return { value, options, apply: (v) => (v === '__multi' ? filters.cats : v ? [v] : []) };
}

export function sortDropdown(filters) {
  return {
    value: filters.sort,
    options: Object.entries(SORTS).map(([k, label]) => ({ value: k, label })),
  };
}
