import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { readJSON, sessionStore, writeJSON } from "../lib/storage.js";

const BookmarksContext = createContext(null);
const KEY = "ff:bookmarks";

/**
 * Saved markets and produce with personal notes.
 * SRS: notes are session-only, so they are kept in sessionStorage and disappear when the tab closes.
 * item = { type: 'market' | 'produce', id, note, savedAt }
 */
export function BookmarksProvider({ children }) {
  // Ignore anything saved without a type (older builds saved some that way);
  // the Saved page could not show those, but the header badge still counted them.
  const [items, setItems] = useState(() => {
    const saved = readJSON(sessionStore, KEY, []);
    return Array.isArray(saved)
      ? saved.filter((i) => i && (i.type === "market" || i.type === "produce"))
      : [];
  });

  const update = useCallback((fn) => {
    setItems((prev) => {
      const next = fn(prev);
      writeJSON(sessionStore, KEY, next);
      return next;
    });
  }, []);

  const isSaved = useCallback(
    (type, id) => items.some((i) => i.type === type && i.id === id),
    [items],
  );

  const toggle = useCallback(
    (type, id) => {
      const willSave = !items.some((i) => i.type === type && i.id === id);
      update((prev) => {
        const exists = prev.some((i) => i.type === type && i.id === id);
        if (exists)
          return prev.filter((i) => !(i.type === type && i.id === id));
        return [...prev, { type, id, note: "", savedAt: Date.now() }];
      });
      return willSave;
    },
    [items, update],
  );

  const remove = useCallback(
    (type, id) =>
      update((prev) => prev.filter((i) => !(i.type === type && i.id === id))),
    [update],
  );

  const setNote = useCallback(
    (type, id, note) =>
      update((prev) =>
        prev.map((i) => (i.type === type && i.id === id ? { ...i, note } : i)),
      ),
    [update],
  );

  const value = useMemo(
    () => ({ items, isSaved, toggle, remove, setNote }),
    [items, isSaved, toggle, remove, setNote],
  );

  return (
    <BookmarksContext.Provider value={value}>
      {children}
    </BookmarksContext.Provider>
  );
}

/* eslint-disable-next-line react-refresh/only-export-components */
export function useBookmarks() {
  const ctx = useContext(BookmarksContext);
  if (!ctx)
    throw new Error("useBookmarks must be used inside <BookmarksProvider>");
  return ctx;
}
