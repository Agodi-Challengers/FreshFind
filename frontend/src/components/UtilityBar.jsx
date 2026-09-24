import { useMemo } from "react";
import Icon from "./Icon.jsx";
import { useNow } from "../context/ClockContext.jsx";
import { useData } from "../context/DataContext.jsx";
import { useUserLocation } from "../context/LocationContext.jsx";
import { formatClock, isOpenNow } from "../lib/time.js";
import { formatCount } from "../lib/visitors.js";

/** Dark top bar: live clock, markets open right now, visitor counter and current location. */
export default function UtilityBar({ visitors }) {
  const now = useNow();
  const { markets } = useData();
  const { origin, status, requestDeviceLocation } = useUserLocation();
  const openCount = useMemo(
    () => markets.filter((m) => isOpenNow(m, now)).length,
    [markets, now],
  );

  let locationText = `${origin.label}, Lagos`;
  if (status === "locating") locationText = "Finding you…";

  return (
    <div className="utility">
      <div className="container utility__inner">
        <div className="utility__group">
          <span className="utility__item utility__clock">
            <Icon name="clock" size={14} />
            <time aria-live="off">{formatClock(now)}</time>
          </span>
          <span className="utility__item utility__soft">
            <span className="live-dot" aria-hidden="true" />
            {openCount} {openCount === 1 ? "market" : "markets"} open right now
          </span>
        </div>
        <div className="utility__group">
          <span className="utility__item utility__soft">
            <Icon name="eye" size={14} />
            {formatCount(visitors)} visitors this month
          </span>
          <button
            type="button"
            className="utility__item utility__soft utility__loc"
            onClick={requestDeviceLocation}
            title="Use my current location"
          >
            <Icon name="map-pin" size={14} />
            {origin.source === "device"
              ? "Using your location: "
              : "Location: "}
            {locationText}
          </button>
        </div>
      </div>
    </div>
  );
}
