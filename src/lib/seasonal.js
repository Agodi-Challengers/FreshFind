
import { inSeason } from './time.js';

const prev = (m) => (m + 11) % 12;
const next = (m) => (m + 1) % 12;

export function inSeasonItems(produce, month) {
  return produce.filter((p) => inSeason(p.season, month));
}


export function seasonalHighlights(produce, month) {
  const items = inSeasonItems(produce, month);
  const partial = items.filter((p) => p.season !== '111111111111');
  const allYear = items.filter((p) => p.season === '111111111111');
  return [...partial, ...allYear];
}


export function arrivingItems(produce, month) {
  return produce.filter(
    (p) =>
      (inSeason(p.season, month) && !inSeason(p.season, prev(month))) ||
      (!inSeason(p.season, month) && inSeason(p.season, next(month))),
  );
}


export function endingItems(produce, month) {
  return produce.filter((p) => inSeason(p.season, month) && !inSeason(p.season, next(month)));
}


export function pickOfTheMonth(produce, month) {
  const seasonal = seasonalHighlights(produce, month);
  return seasonal.find((p) => p.pick) || seasonal.find((p) => p.photo) || seasonal[0] || null;
}
