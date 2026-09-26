const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const CLOSING_SOON_MINS = 60; // orange badge when this close to closing

// "07:30" -> 450 (minutes since midnight)
function toMinutes(clock) {
  const [hours, mins] = clock.split(":").map(Number);
  return hours * 60 + mins;
}

// "14:00" -> "2:00 PM"
function formatClock(clock) {
  const [hours, mins] = clock.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(mins).padStart(2, "0")} ${period}`;
}

// 198 -> "3h 18m", 45 -> "45m", 120 -> "2h"
function formatDuration(totalMins) {
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// name of the next day this market runs, starting from tomorrow
function getNextOpenDay(market, today) {
  for (let i = 1; i <= 7; i++) {
    const day = (today + i) % 7; // % 7 wraps Saturday back to Sunday
    if (market.days.includes(day)) return DAY_NAMES[day];
  }
  return null; // market has no days listed
}

// status: "open" | "closing-soon" | "opens-later" | "closed"
export function getMarketStatus(market, now = new Date()) {
  const today = now.getDay(); // 0 = Sunday
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const openMins = toMinutes(market.open);
  const closeMins = toMinutes(market.close);

  const nextDay = getNextOpenDay(market, today);
  const closed = {
    status: "closed",
    label: nextDay ? `Next: ${nextDay}` : "Closed",
  };

  // 1. not a market day
  if (!market.days.includes(today)) return closed;

  // 2. market day, but not open yet
  if (nowMins < openMins) {
    return { status: "opens-later", label: `Opens ${formatClock(market.open)}` };
  }

  // 3. market day, already closed
  if (nowMins >= closeMins) return closed;

  // 4. open right now
  const minsLeft = closeMins - nowMins;
  const label = `Closes in ${formatDuration(minsLeft)}`;

  if (minsLeft <= CLOSING_SOON_MINS) {
    return { status: "closing-soon", label };
  }
  return { status: "open", label };
}

// for the "Open now (6)" pill
export function countOpenMarkets(markets, now = new Date()) {
  return markets.filter((market) => {
    const { status } = getMarketStatus(market, now);
    return status === "open" || status === "closing-soon";
  }).length;
}