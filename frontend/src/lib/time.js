// Time helpers. All market hours are Lagos local time (Africa/Lagos, UTC+1),
// so "now" is always converted to Lagos time, whatever the visitor's own time zone is.

export const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
export const WEEK_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
export const DAY_SHORT = { sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat' };
export const DAY_LONG = {
  sun: 'Sunday',
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
};
export const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const TIME_WINDOWS = {
  early: { label: 'Early morning', range: 'Before 9 AM', from: 0, to: 9 * 60 },
  morning: { label: 'Morning', range: '9 AM – 12 PM', from: 9 * 60, to: 12 * 60 },
  afternoon: { label: 'Afternoon', range: '12 – 4 PM', from: 12 * 60, to: 16 * 60 },
  evening: { label: 'Evening', range: 'After 4 PM', from: 16 * 60, to: 24 * 60 },
};

const CLOSING_SOON_MINUTES = 60;

const lagosFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Lagos',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  weekday: 'short',
  hour: 'numeric',
  minute: 'numeric',
  hourCycle: 'h23',
});

/** Returns the Lagos wall-clock parts for a Date. */
export function lagosParts(date = new Date()) {
  const parts = {};
  for (const p of lagosFormatter.formatToParts(date)) parts[p.type] = p.value;
  const dayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
  const hour = Number(parts.hour) % 24;
  const minute = Number(parts.minute);
  return {
    dayIndex,
    dayKey: DAY_KEYS[dayIndex],
    minutes: hour * 60 + minute,
    hour,
    minute,
    day: Number(parts.day),
    month: Number(parts.month) - 1,
    year: Number(parts.year),
  };
}

export function parseHM(value) {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
}

/** 450 -> "7:30 AM" */
export function formatMinutes(total) {
  const minutes = ((total % 1440) + 1440) % 1440;
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function formatRange([open, close]) {
  return `${formatMinutes(parseHM(open))} – ${formatMinutes(parseHM(close))}`;
}

/** "Sat, 14 Mar · 10:42 AM" */
export function formatClock(p) {
  const day = DAY_SHORT[p.dayKey];
  return `${day}, ${p.day} ${MONTH_SHORT[p.month]} · ${formatMinutes(p.minutes)}`;
}

function formatDuration(mins) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Works out whether a market is open for the given Lagos time.
 * state: "open" | "soon" (closes within the hour) | "closed"
 */
export function getMarketStatus(market, now) {
  const today = market.schedule[now.dayKey];
  if (today) {
    const open = parseHM(today[0]);
    const close = parseHM(today[1]);
    if (now.minutes >= open && now.minutes < close) {
      const left = close - now.minutes;
      if (left <= CLOSING_SOON_MINUTES) {
        return {
          state: 'soon',
          pill: 'Closing soon',
          label: `Closes in ${formatDuration(left)}`,
          minutesToOpen: 0,
          closesIn: left,
        };
      }
      return {
        state: 'open',
        pill: 'Open now',
        label: `Open until ${formatMinutes(close)}`,
        minutesToOpen: 0,
        closesIn: left,
      };
    }
  }

  for (let offset = 0; offset <= 7; offset += 1) {
    const key = DAY_KEYS[(now.dayIndex + offset) % 7];
    const hours = market.schedule[key];
    if (!hours) continue;
    const open = parseHM(hours[0]);
    if (offset === 0 && now.minutes >= open) continue;
    const time = formatMinutes(open);
    let label;
    if (offset === 0) label = `Opens ${time}`;
    else if (offset === 1) label = `Opens Tomorrow ${time}`;
    else label = `Opens ${DAY_SHORT[key]} ${time}`;
    return {
      state: 'closed',
      pill: 'Closed',
      label,
      minutesToOpen: offset * 1440 + open - now.minutes,
      closesIn: 0,
    };
  }

  return { state: 'closed', pill: 'Closed', label: 'No upcoming days', minutesToOpen: Infinity, closesIn: 0 };
}

export function isOpenNow(market, now) {
  return getMarketStatus(market, now).state !== 'closed';
}

function describeDays(days) {
  if (days.length === 7) return 'Daily';
  const idx = days.map((d) => WEEK_ORDER.indexOf(d));
  const consecutive = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  if (consecutive && days.length >= 3) return `${DAY_SHORT[days[0]]}–${DAY_SHORT[days[days.length - 1]]}`;
  return days.map((d) => DAY_SHORT[d]).join(' & ');
}

/** Groups days with the same hours: [{ days: "Mon–Fri", hours: "7:00 AM – 6:00 PM" }] */
export function scheduleGroups(schedule) {
  const groups = [];
  for (const day of WEEK_ORDER) {
    const hours = schedule[day];
    if (!hours) continue;
    const key = hours.join('-');
    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = { key, days: [], hours };
      groups.push(group);
    }
    group.days.push(day);
  }
  return groups.map((g) => ({ days: describeDays(g.days), hours: formatRange(g.hours), dayKeys: g.days }));
}

/** "Sat & Sun · 10:00 AM – 3:00 PM" (several groups are joined with " | ") */
export function scheduleLabel(schedule) {
  return scheduleGroups(schedule)
    .map((g) => `${g.days} · ${g.hours}`)
    .join(' | ');
}

export function openDays(schedule) {
  return WEEK_ORDER.filter((d) => schedule[d]);
}

/** True if the market is open at some point inside the window on any trading day. */
export function matchesTimeWindow(market, windowKey) {
  const win = TIME_WINDOWS[windowKey];
  if (!win) return true;
  return Object.values(market.schedule).some(([o, c]) => parseHM(o) < win.to && parseHM(c) > win.from);
}

/** 12-character season string ("111100000011") -> is month (0-11) in season */
export function inSeason(season, month) {
  return season?.[month] === '1';
}

/** "Mar – May" style label for a season string. Returns "All year" when every month is set. */
export function seasonRange(season) {
  if (!season) return '';
  if (season === '111111111111') return 'All year';
  // find the start of a run that wraps around the year end
  let start = season.split('').findIndex((c, i) => c === '1' && season[(i + 11) % 12] === '0');
  if (start < 0) start = season.indexOf('1');
  let end = start;
  while (season[(end + 1) % 12] === '1' && (end + 1) % 12 !== start) end = (end + 1) % 12;
  return start === end ? MONTH_SHORT[start] : `${MONTH_SHORT[start]} – ${MONTH_SHORT[end]}`;
}
