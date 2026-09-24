// Prefixes public paths with Vite's base URL, so the site also works when it is
// deployed to a sub-folder (for example GitHub Pages).
export function asset(path) {
  if (!path) return '';
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

export function googleMapsEmbed({ lat, lng }, zoom = 15) {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
}

export function googleMapsLink({ lat, lng }) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function googleDirections({ lat, lng }) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
