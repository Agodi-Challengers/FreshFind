import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import logoLight from "../assets/ChatGPT Image Sep 23, 2026, 11_31_21 PM 1.png";

/**
 * FreshFind logo.
 * On light surfaces it uses the brand logo from the Figma file, introduced in the
 * feat-Aishat navbar. Its wordmark is dark green, so on dark surfaces (footer, auth
 * screens) the light leaf + wordmark version is used instead.
 */
export default function Logo({
  variant = "dark",
  compact = false,
  to = "/",
  onClick,
}) {
  if (variant !== "light") {
    const cls = [
      "logo",
      // "logo--brand",
      // compact && "logo--compact",
      // size && `logo--${size}`,
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
          src={logo}
          alt="FreshFind"
          // width="100"
          // height="100"
        />
      </Link>
    );
  }

  // White wordmark from the Figma footer, used on dark surfaces
  return (
    <Link
      to={to}
      className={`logo logo--${variant}${compact ? " logo--compact" : ""}`}
      aria-label="FreshFind home"
      onClick={onClick}
    >
      <img
        className="logo__img logo__img--light"
        src={logoLight}
        alt="FreshFind"
        width="152"
        height="41"
      />
    </Link>
  );
}
