// Safe wrappers around Web Storage. Private windows and blocked storage throw,
// so every call falls back quietly instead of breaking the page.

export function readJSON(storage, key, fallback) {
  try {
    const raw = storage?.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(storage, key, value) {
  try {
    storage?.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: keep working in memory */
  }
}

function safeStorage(getter) {
  try {
    return getter();
  } catch {
    return undefined;
  }
}

export const sessionStore = safeStorage(() => window.sessionStorage);
export const localStore = safeStorage(() => window.localStorage);
