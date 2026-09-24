// Derives seasonal content (what is in season, arriving, ending) from produce.json.
import { inSeason } from './time.js';

const prev = (m) => (m + 11) % 12;
const next = (m) => (m + 1) % 12;

export function inSeasonItems(produce, month) {
  return produce.filter((p) => inSeason(p.season, month));
}

/** Seasonal items first (partial seasons), all-year staples last. */
export function seasonalHighlights(produce, month) {
  const items = inSeasonItems(produce, month);
  const partial = items.filter((p) => p.season !== '111111111111');
  const allYear = items.filter((p) => p.season === '111111111111');
  return [...partial, ...allYear];
}

/** Items whose season starts this month or next month. */
export function arrivingItems(produce, month) {
  return produce.filter(
    (p) =>
      (inSeason(p.season, month) && !inSeason(p.season, prev(month))) ||
      (!inSeason(p.season, month) && inSeason(p.season, next(month))),
  );
}

/** Items in season now whose season ends this month. */
export function endingItems(produce, month) {
  return produce.filter((p) => inSeason(p.season, month) && !inSeason(p.season, next(month)));
}

/** The "pick of the week": an item with a feature write-up if one is in season, else the first seasonal item. */
export function pickOfTheMonth(produce, month) {
  const seasonal = seasonalHighlights(produce, month);
  return seasonal.find((p) => p.pick) || seasonal.find((p) => p.photo) || seasonal[0] || null;
}
