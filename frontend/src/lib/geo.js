
const EARTH_RADIUS_KM = 6371;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}


export function distanceKm(a, b) {
  if (!a || !b) return null;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}


export function formatKm(km) {
  if (km == null || Number.isNaN(km)) return '';
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function nearestArea(point, areas) {
  let best = null;
  let bestKm = Infinity;
  for (const area of areas) {
    const km = distanceKm(point, area);
    if (km < bestKm) {
      bestKm = km;
      best = area;
    }
  }
  return best;
}


export function fitMapProjection(markets) {
  const pts = markets.filter((m) => m.map && m.lat && m.lng);
  const fit = (xs, ys) => {
    const n = xs.length;
    const mx = xs.reduce((s, v) => s + v, 0) / n;
    const my = ys.reduce((s, v) => s + v, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i += 1) {
      num += (xs[i] - mx) * (ys[i] - my);
      den += (xs[i] - mx) ** 2;
    }
    const slope = den ? num / den : 0;
    return { slope, intercept: my - slope * mx };
  };
  const fx = fit(
    pts.map((p) => p.lng),
    pts.map((p) => p.map.x),
  );
  const fy = fit(
    pts.map((p) => p.lat),
    pts.map((p) => p.map.y),
  );
  return (point) => ({
    x: fx.slope * point.lng + fx.intercept,
    y: fy.slope * point.lat + fy.intercept,
  });
}
