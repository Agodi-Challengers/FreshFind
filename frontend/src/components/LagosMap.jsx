import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import StatusPill from "./StatusPill.jsx";
import { useData } from "../context/DataContext.jsx";
import { useUserLocation } from "../context/LocationContext.jsx";
import { fitMapProjection } from "../lib/geo.js";
import { scheduleLabel } from "../lib/time.js";
import { asset, googleDirections } from "../lib/assets.js";
import "./LagosMap.css";

// The illustrated map exported from Figma is 820 × 900 units; pin positions in markets.json use the same units.
const W = 820;
const H = 900;
const ZOOMS = [1, 1.35, 1.8];

/**
 * Illustrated Lagos map (Figma "Map") with a pin for every market in `markets`.
 * Pin colours: open (green), closing soon (amber), closed (grey), selected (orange).
 */
export default function LagosMap({ markets, selectedId, hoverId, onSelect }) {
  const { markets: all } = useData();
  const { origin, requestDeviceLocation, status } = useUserLocation();
  const [zoom, setZoom] = useState(0);
  const viewportRef = useRef(null);
  const project = useMemo(() => fitMapProjection(all), [all]);
  const you = project(origin);
  const youVisible = you.x > 0 && you.x < W && you.y > 0 && you.y < H;
  const selected = markets.find((m) => m.id === selectedId);

  // keep the selected pin in view when zoomed in
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || !selected) return;
    const scale = vp.scrollWidth / W;
    vp.scrollTo({
      left: selected.map.x * scale - vp.clientWidth / 2,
      top: selected.map.y * scale - vp.clientHeight / 2,
      behavior: "smooth",
    });
  }, [selected, zoom]);

  const pct = (x, y) => ({
    left: `${(x / W) * 100}%`,
    top: `${(y / H) * 100}%`,
  });

  return (
    <div className="map">
      <div className="map__viewport" ref={viewportRef}>
        <div className="map__stage" style={{ width: `${ZOOMS[zoom] * 100}%` }}>
          <img
            className="map__base"
            src={asset("/images/lagos-map.svg")}
            alt=""
            draggable="false"
          />

          {youVisible && (
            <div className="map__you" style={pct(you.x, you.y)}>
              <span className="map__you-halo" aria-hidden="true" />
              <span className="map__you-dot" aria-hidden="true" />
              <span className="map__you-label">
                <span className="dot dot--you" aria-hidden="true" />
                You · {origin.label}
              </span>
            </div>
          )}

          {markets.map((m) => {
            const isSel = m.id === selectedId;
            return (
              <button
                key={m.id}
                type="button"
                className={`pin pin--${m.status.state}${isSel ? " is-selected" : ""}${hoverId === m.id ? " is-hover" : ""}`}
                style={pct(m.map.x, m.map.y)}
                aria-label={`${m.name}, ${m.status.pill}`}
                aria-pressed={isSel}
                onClick={() => onSelect(isSel ? null : m.id)}
              >
                <Icon name="shopping-basket" size={16} />
              </button>
            );
          })}

          {selected && (
            <div
              className={`pin-popup${selected.map.y < 300 ? " is-below" : ""}`}
              style={pct(
                Math.min(W - 140, Math.max(140, selected.map.x)),
                selected.map.y,
              )}
              role="dialog"
              aria-label={selected.name}
            >
              <img
                src={asset(selected.images.popup)}
                alt=""
                width="236"
                height="100"
              />
              <button
                type="button"
                className="pin-popup__close"
                aria-label="Close"
                onClick={() => onSelect(null)}
              >
                <Icon name="x" size={14} />
              </button>
              <h3>{selected.name}</h3>
              <div className="pin-popup__status">
                <StatusPill status={selected.status} />
                <span>{selected.status.label}</span>
              </div>
              <p className="icon-text">
                <Icon name="calendar-days" size={13} />
                {scheduleLabel(selected.schedule)}
              </p>
              <div className="pin-popup__btns">
                <Link
                  to={`/markets/${selected.id}`}
                  className="btn btn--primary"
                >
                  View details
                </Link>
                <a
                  href={googleDirections(selected)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--outline"
                >
                  <Icon name="navigation" size={14} />
                  Directions
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <span className="map__hint">Tap a pin for directions</span>

      <div className="map__zoom" role="group" aria-label="Map controls">
        <button
          type="button"
          aria-label="Zoom in"
          disabled={zoom === ZOOMS.length - 1}
          onClick={() => setZoom((z) => Math.min(ZOOMS.length - 1, z + 1))}
        >
          <Icon name="plus" size={18} />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          disabled={zoom === 0}
          onClick={() => setZoom((z) => Math.max(0, z - 1))}
        >
          <Icon name="minus" size={18} />
        </button>
        <button
          type="button"
          aria-label="Use my location"
          onClick={requestDeviceLocation}
          aria-busy={status === "locating"}
        >
          <Icon name="locate-fixed" size={18} />
        </button>
      </div>

      <ul className="map__legend" aria-label="Map key">
        <li>
          <span className="map__key" style={{ background: "var(--blue)" }} />
          You
        </li>
        <li>
          <span className="map__key" style={{ background: "var(--green)" }} />
          Open
        </li>
        <li>
          <span className="map__key" style={{ background: "var(--amber)" }} />
          Closing soon
        </li>
        <li>
          <span
            className="map__key"
            style={{ background: "var(--pin-closed)" }}
          />
          Closed
        </li>
        <li>
          <span className="map__key" style={{ background: "var(--orange)" }} />
          Selected
        </li>
      </ul>
    </div>
  );
}
