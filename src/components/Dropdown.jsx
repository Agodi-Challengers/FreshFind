import { useEffect, useId, useMemo, useRef, useState } from "react";
import Icon from "./Icon.jsx";

/**
 * Accessible single-select dropdown styled like the Figma "Dropdown / …" components:
 * a labelled button (icon, small caps label, value, chevron) and a floating option panel.
 *
 * options: [{ value, label, count?, strong? } | { header: 'Island' }]
 */
export default function Dropdown({
  icon,
  label,
  value,
  options,
  onChange,
  className = "",
  align = "left",
  panelWidth = 260,
}) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);

  const selectable = useMemo(() => options.filter((o) => !o.header), [options]);
  const current = selectable.find((o) => o.value === value) || selectable[0];

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      listRef.current?.focus();
      const el = listRef.current?.querySelector(`[data-index="${active}"]`);
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [open, active]);

  const openList = () => {
    setActive(
      Math.max(
        0,
        selectable.findIndex((o) => o.value === current?.value),
      ),
    );
    setOpen(true);
  };

  const choose = (opt) => {
    onChange(opt.value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onButtonKey = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openList();
    }
  };

  const onListKey = (e) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => Math.min(selectable.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(selectable.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(selectable[active]);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
    }
  };

  return (
    <div
      className={`dropdown${open ? " is-open" : ""} ${className}`.trim()}
      ref={rootRef}
    >
      <button
        ref={buttonRef}
        type="button"
        className="dropdown__button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${uid}-list`}
        aria-label={`${label}: ${current?.label}`}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onButtonKey}
      >
        {icon && <Icon name={icon} size={17} className="dropdown__icon" />}
        <span className="dropdown__lab">
          <span className="field-label">{label}</span>
          <span className="dropdown__value">{current?.label}</span>
        </span>
        <Icon name="chevron-down" size={16} className="dropdown__chev" />
      </button>
      {open && (
        <ul
          ref={listRef}
          id={`${uid}-list`}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`${uid}-opt-${active}`}
          className={`panel dropdown__panel dropdown__panel--${align}`}
          style={{ width: panelWidth }}
          onKeyDown={onListKey}
        >
          {options.map((opt) => {
            if (opt.header) {
              return (
                <li
                  key={`h-${opt.header}`}
                  role="presentation"
                  className="panel__group"
                >
                  {opt.header}
                </li>
              );
            }
            const i = selectable.indexOf(opt);
            const selected = opt.value === current?.value;
            return (
              <li
                key={opt.value}
                id={`${uid}-opt-${i}`}
                data-index={i}
                role="option"
                aria-selected={selected}
                className={`panel__opt${i === active ? " is-active" : ""}${selected ? " is-selected" : ""}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(opt)}
              >
                <span className="radio" aria-hidden="true" />
                <span
                  className={`panel__label${opt.strong ? " is-strong" : ""}`}
                >
                  {opt.label}
                </span>
                {opt.count != null && (
                  <span className="panel__count">{opt.count}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
