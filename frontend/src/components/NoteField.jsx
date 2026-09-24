import { useBookmarks } from "../context/BookmarksContext.jsx";

/**
 * Personal note attached to a saved market or produce item.
 * Typing saves the item first, so a note is never orphaned. SRS: notes are session-only.
 */
export default function NoteField({
  type,
  id,
  label = "Your note",
  placeholder = "What do you want to remember?",
}) {
  const { items, isSaved, toggle, setNote } = useBookmarks();
  const entry = items.find((i) => i.type === type && i.id === id);
  const value = entry?.note || "";

  const onChange = (next) => {
    if (!isSaved(type, id)) toggle(type, id);
    setNote(type, id, next);
  };

  return (
    <label className="ff-field">
      <span className="ff-field-label">{label}</span>
      <textarea
        className="ff-textarea"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
