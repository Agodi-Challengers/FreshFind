import Icon from "./Icon.jsx";

/**
 * Page numbers under a grid (Figma: "< 1 2 3 4 … >").
 * page starts at 1. Shows at most 4 numbers, then "…" and the last page.
 */
export default function Pagination({ page, pageCount, onChange, label = "Pages" }) {
  if (pageCount <= 1) return null;

  // Work out which numbers to show
  const numbers = [];
  const start = Math.max(1, Math.min(page - 1, pageCount - 3));
  const end = Math.min(pageCount, start + 3);
  for (let n = start; n <= end; n += 1) numbers.push(n);

  return (
    <nav className="pagination" aria-label={label}>
      <button
        type="button"
        className="pagination__btn"
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        <Icon name="chevron-right" size={16} className="pagination__prev" />
      </button>

      {numbers.map((n) => (
        <button
          key={n}
          type="button"
          className="pagination__btn"
          aria-current={n === page ? "page" : undefined}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}

      {end < pageCount && (
        <>
          <span className="pagination__gap" aria-hidden="true">
            …
          </span>
          <button
            type="button"
            className="pagination__btn"
            onClick={() => onChange(pageCount)}
          >
            {pageCount}
          </button>
        </>
      )}

      <button
        type="button"
        className="pagination__btn"
        aria-label="Next page"
        disabled={page === pageCount}
        onClick={() => onChange(page + 1)}
      >
        <Icon name="chevron-right" size={16} />
      </button>
    </nav>
  );
}
