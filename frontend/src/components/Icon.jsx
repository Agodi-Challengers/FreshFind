import { ICONS } from "../assets/icons.js";

/** Renders an icon exported from the Figma file. Icons are decorative unless a label is given. */
export default function Icon({ name, size = 16, className = "", label }) {
  const icon = ICONS[name];
  if (!icon) return null;
  return (
    <svg
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox={icon.viewBox}
      fill="none"
      focusable="false"
      aria-hidden={label ? undefined : "true"}
      role={label ? "img" : undefined}
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}
