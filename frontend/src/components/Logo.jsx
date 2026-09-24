import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";

/** FreshFind logo: leaf mark + wordmark. variant "light" is used on dark backgrounds. */
export default function Logo({
  variant = "dark",
  tagline = true,
  compact = false,
  to = "/",
}) {
  return (
    <Link
      to={to}
      className={`logo logo--${variant}${compact ? " logo--compact" : ""}`}
      aria-label="FreshFind home"
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
