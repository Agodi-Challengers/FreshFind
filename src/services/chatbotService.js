/**
 * FreshFind Assistant: a small rule-based chatbot (SRS 1.5).
 *
 * All wording lives in public/data/chatbot.json. This file only decides which
 * answer fits a question, and fills in live facts (open now, areas, days,
 * produce) using the SAME filter and sort functions as the Market Directory,
 * so the chatbot and the directory always agree.
 *
 * answer(question, context) returns a reply object:
 *   { text, markets, links, suggestions, action }
 *   - markets: decorated market objects to show as result cards
 *   - links: [{ label, to }] buttons to FreshFind pages
 *   - action: "locate" when the chatbot needs the user's location first
 */
import { applyFilters, sortMarkets, EMPTY_FILTERS, filtersToParams } from "../lib/filters.js";
import { DAY_KEYS, DAY_LONG, TIME_WINDOWS, MONTH_SHORT, scheduleGroups, inSeason, seasonRange } from "../lib/time.js";
import { formatKm } from "../lib/geo.js";

const MONTH_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Words people use for days and times, mapped to the keys the filters understand.
const DAY_WORDS = {
  sunday: "sun", sun: "sun",
  monday: "mon", mon: "mon",
  tuesday: "tue", tue: "tue", tues: "tue",
  wednesday: "wed", wed: "wed",
  thursday: "thu", thu: "thu", thurs: "thu",
  friday: "fri", fri: "fri",
  saturday: "sat", sat: "sat",
};

const TIME_WORDS = {
  "early morning": "early",
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening",
  "after work": "evening",
  night: "evening",
};

/** Lower-case text with curly quotes and punctuation turned into spaces. */
function clean(text) {
  return ` ${text.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim()} `;
}

/** True if the phrase appears as whole words in the cleaned text. */
function has(text, phrase) {
  return text.includes(` ${clean(phrase).trim()} `);
}

/** Replace {name} placeholders in a template. */
function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => (values[key] ?? ""));
}

/** "Sat & Sun · 6.8 km" line used on market result cards. */
export function marketMeta(market) {
  const days = scheduleGroups(market.schedule).map((g) => g.days).join(", ");
  const km = formatKm(market.km);
  return km ? `${days} · ${km}` : days;
}

/** Works out which area, day, time, produce and "open now" words the question contains. */
function readQuestion(text, data, now) {
  const found = { areas: [], days: [], time: "any", produce: null, open: false, organic: false };

  // Areas (and their localities such as "Lekki Phase 1").
  for (const area of data.areas) {
    if (has(text, area.name)) found.areas.push(area.name);
  }
  for (const market of data.markets) {
    if (market.locality && has(text, market.locality) && !found.areas.includes(market.area)) {
      found.areas.push(market.area);
    }
  }
  if (has(text, "vi")) found.areas.push("Victoria Island");

  // Days.
  for (const [word, key] of Object.entries(DAY_WORDS)) {
    if (has(text, word) && !found.days.includes(key)) found.days.push(key);
  }
  if (has(text, "weekend")) found.days.push("sat", "sun");
  if (has(text, "today")) found.days.push(now.dayKey);
  if (has(text, "tomorrow")) found.days.push(DAY_KEYS[(now.dayIndex + 1) % 7]);

  // Time of day.
  for (const [word, key] of Object.entries(TIME_WORDS)) {
    if (has(text, word)) found.time = key;
  }

  // "Open now" / "right now".
  if (has(text, "open now") || has(text, "right now") || has(text, "currently open") || has(text, "open at the moment")) {
    found.open = true;
    found.days = found.days.filter((d) => d !== now.dayKey);
  }

  if (has(text, "organic")) found.organic = true;

  // Produce: full name, short name, id ("scotch-bonnet"), or a simple singular/plural.
  for (const item of data.produce) {
    const names = [item.name, item.shortName, item.id.replace(/-/g, " ")].filter(Boolean);
    const words = names.flatMap((n) => {
      const base = n.toLowerCase().replace(/\(.*?\)/g, "").trim();
      return [base, base.replace(/es$/, ""), base.replace(/s$/, ""), `${base}s`];
    });
    if (words.some((w) => w.length > 2 && has(text, w))) {
      found.produce = item;
      break;
    }
  }

  return found;
}

/** Human description of the filters, e.g. " open on Sunday in Lekki". */
function describe(found, now) {
  const parts = [];
  if (found.open) parts.push(" open right now");
  if (found.days.length) {
    const days = [...new Set(found.days)].map((d) => (d === now.dayKey ? "today" : DAY_LONG[d]));
    parts.push(` open on ${days.join(" or ")}`);
  }
  if (found.time !== "any") parts.push(` in the ${TIME_WINDOWS[found.time].label.toLowerCase()}`);
  if (found.areas.length) parts.push(` in ${found.areas.join(" or ")}`);
  if (found.organic) parts.push(" with organic growers");
  return parts.join("");
}

function firstHours(market) {
  const g = scheduleGroups(market.schedule)[0];
  return g ? `${g.days}, ${g.hours}` : "";
}

/** Market search using the same filters as the directory. */
function searchMarkets(found, data, markets, now, script) {
  const filters = {
    ...EMPTY_FILTERS,
    open: found.open,
    areas: found.areas,
    days: [...new Set(found.days)],
    time: found.time,
    feats: found.organic ? ["organic"] : [],
    q: found.produce ? found.produce.shortName || found.produce.name : "",
    sort: found.open ? "open" : "nearest",
  };
  const results = sortMarkets(applyFilters(markets, filters, data.produceById), filters.sort);
  const filtersText = describe(found, now) + (found.produce ? ` selling ${found.produce.name.toLowerCase()}` : "");
  const count = results.length;
  const search = script.search;
  const params = filtersToParams(filters).toString();

  if (!count) {
    return {
      text: fill(search.none, { filters: filtersText }),
      suggestions: search.noneSuggestions,
    };
  }
  const closest = results[0];
  const text = fill(count > 1 ? search.foundClosest : search.found, {
    count,
    markets: count === 1 ? "market" : "markets",
    filters: filtersText,
    name: closest.name,
    hours: firstHours(closest),
  });
  return {
    text,
    markets: results.slice(0, script.maxResults || 3),
    links: count > (script.maxResults || 3)
      ? [{ label: fill(search.seeAll, { count }), to: `/directory${params ? `?${params}` : ""}` }]
      : [],
  };
}

/** Answer for "where can I get mangoes?" style questions. */
function produceAnswer(item, data, markets, now, script) {
  const sellers = sortMarkets(markets.filter((m) => m.produce.includes(item.id)), "nearest");
  const range = seasonRange(item.season);
  let season;
  if (range === "All year") season = script.produce.allYear;
  else if (inSeason(item.season, now.month)) season = fill(script.produce.inSeasonNow, { range });
  else season = fill(script.produce.outOfSeason, { range });

  return {
    text: fill(script.produce.answer, {
      name: item.name,
      season,
      count: sellers.length,
      markets: sellers.length === 1 ? "market" : "markets",
      closest: sellers[0] ? `, the closest is ${sellers[0].name}` : "",
    }),
    markets: sellers.slice(0, script.maxResults || 3),
    links: [{ label: fill(script.produce.link, { name: item.shortName || item.name }), to: `/produce/${item.id}` }],
  };
}

function seasonAnswer(intent, data, now) {
  const items = data.produce.filter((p) => inSeason(p.season, now.month)).map((p) => p.shortName || p.name);
  return {
    text: fill(intent.answer, {
      month: MONTH_LONG[now.month],
      items: items.length ? items.slice(0, 8).join(", ") : `nothing listed for ${MONTH_SHORT[now.month]}`,
    }),
    links: intent.links || [],
  };
}

/** Markets sorted by distance from the user's (device) location. */
export function nearMeAnswer(intent, markets, script) {
  const closest = sortMarkets(markets, "nearest").slice(0, script.maxResults || 3);
  return { text: intent.answer, markets: closest, links: [{ label: "Open the map", to: "/find" }] };
}

/**
 * Main entry point.
 * context = { script, data, markets (decorated), now, hasDeviceLocation }
 */
export function answer(question, { script, data, markets, now, hasDeviceLocation }) {
  const text = clean(question);
  const intents = script.intents || [];
  // A keyword also matches its simple plural ("transfer" matches "transfers").
  const matches = (intent) => (intent.keywords || []).some((k) => has(text, k) || has(text, `${k}s`));

  // 1. "Markets near me" needs the user's location.
  const nearMe = intents.find((i) => i.type === "nearMe");
  if (nearMe && matches(nearMe)) {
    if (hasDeviceLocation) return nearMeAnswer(nearMe, markets, script);
    return { text: nearMe.locating, action: "locate" };
  }

  // 2. Questions about areas, days, times, produce or "open now" search the real data.
  const found = readQuestion(text, data, now);
  const hasFilters = found.areas.length || found.days.length || found.time !== "any" || found.open || found.organic;
  if (found.produce && !hasFilters) return produceAnswer(found.produce, data, markets, now, script);
  if (hasFilters || found.produce) return searchMarkets(found, data, markets, now, script);

  // 3. Fixed answers from the JSON (payment, parking, season, ...).
  for (const intent of intents) {
    if (intent.type === "nearMe" || !matches(intent)) continue;
    if (intent.type === "season") return seasonAnswer(intent, data, now);
    return { text: intent.answer, links: intent.links || [], suggestions: intent.suggestions };
  }

  // 4. Nothing matched.
  return { text: script.fallback.answer, suggestions: script.fallback.suggestions };
}
