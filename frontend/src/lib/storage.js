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
    // Storage can be full or blocked (for example in private mode), so ignore.
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
