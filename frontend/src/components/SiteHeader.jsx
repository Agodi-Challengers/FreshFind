import { useEffect, useMemo, useRef, useState } from 'react';
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

/** Desktop navbar and mobile header with a full-screen menu. */
export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeRef = useRef(null);
  const openRef = useRef(null);
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
    // focus the close button once the menu is visible
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 60);
    const opener = openRef.current;
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      opener?.focus();
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
          <Logo compact />
          <div className="ff-mobile-header__icons">
            <SavedButton compact />
            <button
              ref={openRef}
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

      {/* Full-screen mobile menu (design by Aishat, feat-Aishat branch) */}
      <div
        id="ff-mobile-menu"
        className={`ff-mmenu${menuOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!menuOpen}
        inert={menuOpen ? undefined : true}
      >
        <div className="ff-mmenu__head">
          <Logo size="menu" onClick={() => setMenuOpen(false)} />
          <button
            ref={closeRef}
            type="button"
            className="ff-mmenu__close"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <Icon name="x" size={26} />
          </button>
        </div>
        <nav aria-label="Mobile">
          <ul className="ff-mmenu__links">
            {NAV_LINKS.map((l, i) => (
              <li key={l.to} style={{ '--i': i }}>
                <NavLink to={l.to} className="ff-mmenu__link">
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ff-mmenu__actions">
          <Link to="/signup" className="ff-mmenu__btn ff-mmenu__btn--primary">
            Sign up
          </Link>
          <Link to="/login" className="ff-mmenu__btn ff-mmenu__btn--outline">
            Log in
          </Link>
        </div>
      </div>
    </>
  );
}
