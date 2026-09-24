import { NavLink } from 'react-router-dom';
import Icon from './Icon.jsx';

const TABS = [
  { to: '/', label: 'Home', icon: 'house', end: true },
  { to: '/find', label: 'Find', icon: 'map-pin' },
  { to: '/directory', label: 'Markets', icon: 'store' },
  { to: '/produce', label: 'Produce', icon: 'carrot' },
  { to: '/saved', label: 'Saved', icon: 'bookmark' },
];

/** Mobile bottom navigation (design: M1–M5). */
export default function BottomTabBar() {
  return (
    <nav className="ff-tabbar" aria-label="Quick navigation">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className="ff-tabbar__tab">
          <Icon name={t.icon} size={22} />
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
