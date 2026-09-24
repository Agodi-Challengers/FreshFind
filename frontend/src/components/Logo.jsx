import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import { asset } from "../lib/assets.js";

/**
 * FreshFind logo.
 * On light surfaces it uses the brand logo from the Figma file, introduced in the
 * feat-Aishat navbar. Its wordmark is dark green, so on dark surfaces (footer, auth
 * screens) the light leaf + wordmark version is used instead.
 */
export default function Logo({
  variant = "dark",
  tagline = true,
  compact = false,
  size,
  to = "/",
  onClick,
}) {
  if (variant !== "light") {
    const cls = [
      "logo",
      "logo--brand",
      compact && "logo--compact",
      size && `logo--${size}`,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <Link
        to={to}
        className={cls}
        aria-label="FreshFind home"
        onClick={onClick}
      >
        <img
          className="logo__img"
          src={asset("/images/freshfind-logo.svg")}
          alt="FreshFind"
          width="194"
          height="100"
        />
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className={`logo logo--${variant}${compact ? " logo--compact" : ""}`}
      aria-label="FreshFind home"
      onClick={onClick}
    >
      <span className="logo__mark" aria-hidden="true">
        <Icon name="leaf" size={compact ? 17 : 20} />
      </span>
      <span className="logo__text">
        <span className="logo__name">FreshFind</span>
        {tagline && <span className="logo__tag">Fresh all along</span>}
      </span>
    </Link>
  );
}
