import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon.jsx";
import { useData } from "../context/DataContext.jsx";
import { formatKm } from "../lib/geo.js";
import { asset } from "../lib/assets.js";

const clean = (s) =>
  s
    .toLowerCase()
    .replace(/[“”"']/g, "")
    .trim();

/**
 * Search input with a suggestion panel (Figma "Search / … State=Typing"):
 * produce, categories and markets. Choosing a market opens its page;
 * choosing produce or a category calls onPick so the page can filter.
 *
 * markets: decorated markets (with km) used for distances in suggestions.
 */
export default function SearchBox({
  value,
  onChange,
  onSubmit,
  onPick,
  markets,
  placeholder = "Search markets or produce",
  label,
  icon = "search",
  className = "",
}) {
  const uid = useId();
  const navigate = useNavigate();
  const { produce, categories, marketsByProduce } = useData();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const q = clean(value || "");

  const groups = useMemo(() => {
    if (q.length < 2) return [];
    const items = produce
      .filter(
        (p) =>
          clean(p.name).includes(q) || clean(p.shortName || "").includes(q),
      )
      .slice(0, 3);
    const cats = categories
      .filter((c) => clean(c.name).includes(q))
      .slice(0, 2);
    const matchedProduceIds = new Set(items.map((p) => p.id));
    const mk = markets
      .filter(
        (m) =>
          clean(m.name).includes(q) ||
          clean(m.street).includes(q) ||
          clean(m.area).includes(q) ||
          m.produce.some((id) => matchedProduceIds.has(id)),
      )
      .sort((a, b) => (a.km ?? 0) - (b.km ?? 0))
      .slice(0, 3);
    const out = [];
    if (items.length) {
      out.push({
        title: "Produce",
        options: items.map((p) => ({
          key: `p-${p.id}`,
          type: "produce",
          value: p.shortName || p.name,
          title: p.name,
          sub: `Sold at ${marketsByProduce[p.id]?.length || 0} markets`,
          img: p.icon || p.image,
        })),
      });
    }
    if (cats.length) {
      out.push({
        title: "Category",
        options: cats.map((c) => ({
          key: `c-${c.name}`,
          type: "category",
          value: c.name,
          title: c.name,
          sub: `Category · ${markets.filter((m) => m.categories.includes(c.name)).length} markets`,
          icon: c.icon,
        })),
      });
    }
    if (mk.length) {
      const first = items[0];
      out.push({
        title: "Markets",
        options: mk.map((m) => ({
          key: `m-${m.id}`,
          type: "market",
          value: m.id,
          title: m.name,
          sub:
            first && m.produce.includes(first.id)
              ? `Sells ${(first.shortName || first.name).toLowerCase()} · ${formatKm(m.km)}`
              : `${m.locality} · ${formatKm(m.km)}`,
          img: m.images.row,
        })),
      });
    }
    return out;
  }, [q, produce, categories, markets, marketsByProduce]);

  const flat = useMemo(() => groups.flatMap((g) => g.options), [groups]);
  const showPanel = open && flat.length > 0;

  useEffect(() => setActive(-1), [q]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const pick = (opt) => {
    setOpen(false);
    if (opt.type === "market") {
      navigate(`/markets/${opt.value}`);
      return;
    }
    onPick?.(opt);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown" && flat.length) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === "ArrowUp" && flat.length) {
      e.preventDefault();
      setActive((i) => Math.max(-1, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showPanel && active >= 0) pick(flat[active]);
      else {
        setOpen(false);
        onSubmit?.(value);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  let index = -1;

  return (
    <div
      className={`search${showPanel ? " is-open" : ""}${label ? " search--labelled" : ""} ${className}`.trim()}
      ref={rootRef}
    >
      <div className="search__field">
        <Icon name={icon} size={17} className="search__icon" />
        <span className="search__lab">
          {label && (
            <label className="field-label" htmlFor={`${uid}-input`}>
              {label}
            </label>
          )}
          <input
            ref={inputRef}
            id={`${uid}-input`}
            type="search"
            className="search__input"
            placeholder={placeholder}
            value={value}
            autoComplete="off"
            role="combobox"
            aria-label={label ? undefined : placeholder}
            aria-expanded={showPanel}
            aria-controls={`${uid}-list`}
            aria-autocomplete="list"
            aria-activedescendant={
              showPanel && active >= 0 ? `${uid}-opt-${active}` : undefined
            }
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
          />
        </span>
        {value && (
          <button
            type="button"
            className="search__clear"
            aria-label="Clear search"
            onClick={() => {
              onChange("");
              onSubmit?.("");
              inputRef.current?.focus();
            }}
          >
            <Icon name="x" size={16} />
          </button>
        )}
      </div>
      {showPanel && (
        <div
          className="panel search__panel"
          id={`${uid}-list`}
          role="listbox"
          aria-label="Suggestions"
        >
          {groups.map((g) => (
            <div key={g.title} role="group" aria-label={g.title}>
              <div className="panel__group" aria-hidden="true">
                {g.title}
              </div>
              {g.options.map((opt) => {
                index += 1;
                const i = index;
                return (
                  <div
                    key={opt.key}
                    id={`${uid}-opt-${i}`}
                    role="option"
                    aria-selected={i === active}
                    className={`suggest${i === active ? " is-active" : ""}`}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(opt)}
                  >
                    {opt.img ? (
                      <img
                        src={asset(opt.img)}
                        alt=""
                        className="suggest__img"
                        loading="lazy"
                      />
                    ) : (
                      <span className="suggest__ic" aria-hidden="true">
                        <Icon name={opt.icon || "leaf"} size={16} />
                      </span>
                    )}
                    <span className="suggest__t">
                      <span className="suggest__title">{opt.title}</span>
                      <span className="suggest__sub">{opt.sub}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
