
// getMonth() is 0-indexed (Jan = 0), our data is 1-12, so add 1
export function getCurrentMonth(now = new Date()) {
  return now.getMonth() + 1;
}

// true if the produce is in season this month
export function isInSeason(item, now = new Date()) {
  if (!item.season || item.season.length === 0) return false; // no data = not in season, no crash
  return item.season.includes(getCurrentMonth(now));
}

// how many markets sell this produce (0 if it's out of season)
export function getMarketCount(item, markets, now = new Date()) {
  if (!isInSeason(item, now)) return 0;
  return markets.filter((market) => market.produce.includes(item.id)).length;
}