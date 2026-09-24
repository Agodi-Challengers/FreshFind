import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import Icon from './Icon.jsx';
import { useBookmarks } from '../context/BookmarksContext.jsx';
import { useNow } from '../context/ClockContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { isOpenNow, formatMinutes, DAY_SHORT } from '../lib/time.js';

export const NAV_LINKS = [
  { to: '/find', label: 'Find a Market' },
  { to: '/directory', label: 'Directory' },
  { to: '/produce', label: 'Produce Guide' },
  { to: '/seasonal', label: 'Seasonal' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

function SavedButton({ compact = false }) {
  const { items } = useBookmarks();
  const count = items.length;
  if (compact) {
    return (
      <Link to="/saved" className="ff-round-btn" aria-label={`Saved (${count})`}>
        <Icon name="bookmark" size={18} />
        {count > 0 && <span className="ff-round-btn__badge">{count}</span>}
      </Link>
    );
  }
  return (
    <Link to="/saved" className="ff-saved-btn">
      <Icon name="bookmark" size={15} />
      <span>Saved</span>
      {count > 0 && (
        <span className="ff-saved-btn__badge" aria-label={`${count} saved`}>
          {count}
        </span>
      )}
    </Link>
  );
}

/** Desktop navbar and mobile header with slide-in menu. */
export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const now = useNow();
  const { markets } = useData();
  const openCount = useMemo(() => markets.filter((m) => isOpenNow(m, now)).length, [markets, now]);

  // close the mobile menu when the route changes
  useEffect(() => setMenuOpen(false), [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      {/* Desktop */}
      <header className="ff-navbar">
        <div className="ff-container ff-navbar__inner">
          <Logo />
          <nav aria-label="Main">
            <ul className="ff-navbar__links">
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <NavLink to={l.to} className="ff-navlink">
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ff-navbar__actions">
            <SavedButton />
            <Link to="/login" className="ff-btn ff-btn--ghost ff-navbar__login">
              Log in
            </Link>
            <Link to="/signup" className="ff-btn ff-btn--primary">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile */}
      <div className="ff-mobile-top">
        <div className="ff-mobile-live">
          <span className="ff-mobile-live__l">
            <span className="ff-live-dot" aria-hidden="true" />
            {openCount} {openCount === 1 ? 'market' : 'markets'} open near you
          </span>
          <span>
            {DAY_SHORT[now.dayKey]} {formatMinutes(now.minutes)}
          </span>
        </div>
        <header className="ff-mobile-header">
          <Logo tagline={false} compact />
          <div className="ff-mobile-header__icons">
            <SavedButton compact />
            <button
              type="button"
              className="ff-round-btn"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="ff-mobile-menu"
              onClick={() => setMenuOpen(true)}
            >
              <Icon name="menu" size={18} />
            </button>
          </div>
        </header>
      </div>

      <div
        className={`ff-drawer-backdrop${menuOpen ? ' is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <nav
        id="ff-mobile-menu"
        className={`ff-drawer${menuOpen ? ' is-open' : ''}`}
        aria-label="Mobile"
        aria-hidden={!menuOpen}
        inert={menuOpen ? undefined : true}
      >
        <div className="ff-drawer__head">
          <Logo compact />
          <button type="button" className="ff-round-btn" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <Icon name="x" size={18} />
          </button>
        </div>
        <ul className="ff-drawer__links">
          <li>
            <NavLink to="/" end className="ff-drawer__link">
              Home
            </NavLink>
          </li>
          {NAV_LINKS.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} className="ff-drawer__link">
                {l.label}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink to="/saved" className="ff-drawer__link">
              Saved & notes
            </NavLink>
          </li>
        </ul>
        <div className="ff-drawer__actions">
          <Link to="/login" className="ff-btn ff-btn--outline ff-btn--block">
            Log in
          </Link>
          <Link to="/signup" className="ff-btn ff-btn--primary ff-btn--block">
            Sign up
          </Link>
        </div>
      </nav>
    </>
  );
}
