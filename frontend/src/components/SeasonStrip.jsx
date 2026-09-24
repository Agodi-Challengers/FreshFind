import { MONTH_SHORT, seasonRange } from "../lib/time.js";

/** Twelve-month bar showing when a produce item is in season (green months). */
export default function SeasonStrip({ season, currentMonth }) {
  return (
    <div
      className="season"
      role="img"
      aria-label={`In season: ${seasonRange(season)}`}
    >
      {MONTH_SHORT.map((m, i) => {
        const on = season[i] === "1";
        return (
          <span
            key={m}
            className={`season__m${on ? " is-on" : ""}${i === currentMonth ? " is-now" : ""}`}
            aria-hidden="true"
          >
            <span className="season__bar" />
            <span className="season__letter">{m[0]}</span>
          </span>
        );
      })}
    </div>
  );
}
