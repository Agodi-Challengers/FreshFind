import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";

/**
 * items: [{ label, to? }] — the last item is the current page.
 * Like the Figma breadcrumb, a first "Home" link is shown as a house icon.
 */
export default function Breadcrumb({ items, light = false, className = "" }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`breadcrumb${light ? " breadcrumb--light" : ""} ${className}`.trim()}
    >
      <ol>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          const isHome = i === 0 && item.to === "/";
          return (
            <li key={`${item.label}-${i}`}>
              {last || !item.to ? (
                <span aria-current={last ? "page" : undefined}>
                  {item.label}
                </span>
              ) : isHome ? (
                <Link to={item.to} className="breadcrumb__home">
                  <Icon name="house" size={20} />
                  <span className="visually-hidden">{item.label}</span>
                </Link>
              ) : (
                <Link to={item.to}>{item.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
