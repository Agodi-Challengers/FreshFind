import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { asset } from '../lib/assets.js';

/**
 * FreshFind logo.
 * On light surfaces it uses the brand logo from the Figma file ("Fresh Find Produce Logo 1 [Vectorized]"),
 * as introduced in the feat-Aishat navbar. Its wordmark is dark green, so on dark surfaces
 * (footer, auth photo) the light leaf + wordmark version is used instead.
 */
export default function Logo({ variant = 'dark', tagline = true, compact = false, size, to = '/', onClick }) {
  if (variant !== 'light') {
    const cls = ['ff-logo', 'ff-logo--brand', compact && 'ff-logo--compact', size && `ff-logo--${size}`]
      .filter(Boolean)
      .join(' ');
    return (
      <Link to={to} className={cls} aria-label="FreshFind home" onClick={onClick}>
        <img className="ff-logo__img" src={asset('/images/freshfind-logo.svg')} alt="FreshFind" width="194" height="100" />
      </Link>
    );
  }

  return (
    <Link to={to} className={`ff-logo ff-logo--${variant}${compact ? ' ff-logo--compact' : ''}`} aria-label="FreshFind home" onClick={onClick}>
      <span className="ff-logo__mark" aria-hidden="true">
        <Icon name="leaf" size={compact ? 17 : 20} />
      </span>
      <span className="ff-logo__text">
        <span className="ff-logo__name">FreshFind</span>
        {tagline && <span className="ff-logo__tag">Fresh all along</span>}
      </span>
    </Link>
  );
}
