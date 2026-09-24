import { Link } from 'react-router-dom';

/** items: [{ label, to? }] — the last item is the current page. */
export default function Breadcrumb({ items, light = false, className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={`ff-breadcrumb${light ? ' ff-breadcrumb--light' : ''} ${className}`.trim()}>
      <ol>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`}>
              {last || !item.to ? (
                <span aria-current={last ? 'page' : undefined}>{item.label}</span>
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
