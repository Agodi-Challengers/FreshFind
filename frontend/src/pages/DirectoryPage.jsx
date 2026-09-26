import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageBanner from "../components/PageBanner.jsx";
import Icon from "../components/Icon.jsx";
import Dropdown from "../components/Dropdown.jsx";
import SearchBox from "../components/SearchBox.jsx";
import MarketCard from "../components/MarketCard.jsx";
import Pagination from "../components/Pagination.jsx";
import FilterSidebar from "../components/FilterSidebar.jsx";
import { useData } from "../context/DataContext.jsx";
import { useNow } from "../context/ClockContext.jsx";
import { useUserLocation } from "../context/LocationContext.jsx";
import { useDecoratedMarkets } from "../lib/useMarkets.js";
import { useUrlFilters } from "../lib/useFilters.js";
import {
  applyFilters,
  sortMarkets,
  activeFilterChips,
  hasActiveFilters,
  filtersToParams,
  EMPTY_FILTERS,
  SORTS,
} from "../lib/filters.js";
import { sortDropdown } from "../lib/quickFilters.js";
import "./DirectoryPage.css";

const PAGE_SIZE = 9; // 3 columns x 3 rows, as in the design

export default function DirectoryPage() {
  const data = useData();
  const now = useNow();
  const { origin } = useUserLocation();
  const markets = useDecoratedMarkets();
  const [filters, setFilters] = useUrlFilters();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [params, setParams] = useSearchParams();

  const page = Math.max(1, Number(params.get("page")) || 1);

  const results = useMemo(
    () =>
      sortMarkets(
        applyFilters(markets, filters, data.produceById),
        filters.sort,
      ),
    [markets, filters, data.produceById],
  );
  const openCount = markets.filter((m) => m.status.state !== "closed").length;
  const chips = activeFilterChips(filters, now);
  const query = filtersToParams({ ...filters, sort: "nearest" }).toString();

  const sort = sortDropdown(filters);

  // Pagination: 9 cards per page. Any filter change drops "page" and goes back to 1.
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = results.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const goToPage = (n) => {
    const next = filtersToParams(filters);
    if (n > 1) next.set("page", String(n));
    setParams(next, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!sheetOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setSheetOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  const activeCount =
    (filters.open ? 1 : 0) +
    filters.areas.length +
    filters.days.length +
    (filters.time !== "any" ? 1 : 0) +
    filters.cats.length +
    filters.feats.length;

  return (
    <div className="directory">
      <PageBanner
        crumbs={[{ label: "Home", to: "/" }, { label: "Market Directory" }]}
      />

      <div className="container directory__body">
        <aside className="directory__sidebar card" aria-label="Filters">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            markets={markets}
            openCount={openCount}
            idPrefix="side"
          />
        </aside>

        <section className="directory__main" aria-labelledby="dir-results">
          <div className="directory__toolbar">
            <SearchBox
              value={filters.q}
              onChange={(q) => setFilters({ ...filters, q })}
              onSubmit={(q) => setFilters({ ...filters, q })}
              onPick={(opt) =>
                opt.type === "category"
                  ? setFilters({ ...filters, q: "", cats: [opt.value] })
                  : setFilters({ ...filters, q: opt.value })
              }
              markets={markets}
              placeholder="Search markets by name or street"
              className="directory__search"
            />
            <Dropdown
              icon="arrow-up-down"
              label="Sort by"
              value={sort.value}
              options={sort.options}
              onChange={(v) => setFilters({ ...filters, sort: v })}
              className="directory__sort"
              align="right"
            />
            <div className="view-toggle" role="group" aria-label="View">
              <span
                className="view-toggle__btn is-active"
                aria-current="true"
                title="Grid view"
              >
                <Icon name="layout-grid" size={16} />
                <span className="visually-hidden">Grid view</span>
              </span>
              <Link
                to={`/find${query ? `?${query}` : ""}`}
                className="view-toggle__btn"
                title="Map view"
              >
                <Icon name="map" size={16} />
                <span className="visually-hidden">Map view</span>
              </Link>
            </div>
          </div>

          {/* Mobile only: opens the filters as a bottom sheet */}
          <button
            type="button"
            className="btn btn--primary directory__filters-btn"
            onClick={() => setSheetOpen(true)}
          >
            <Icon name="sliders-horizontal" size={16} />
            Filters{activeCount ? ` · ${activeCount}` : ""}
          </button>

          <div className="result-meta" aria-live="polite">
            <h2 id="dir-results" className="result-meta__count">
              Showing {results.length} of {markets.length} markets
            </h2>
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                className="filter-chip"
                onClick={() => setFilters(c.remove(filters))}
                aria-label={`Remove filter ${c.label}`}
              >
                {c.label} ×
              </button>
            ))}
            {hasActiveFilters(filters) && (
              <button
                type="button"
                className="text-btn text-btn--accent"
                onClick={() =>
                  setFilters({ ...EMPTY_FILTERS, sort: filters.sort })
                }
              >
                Clear all
              </button>
            )}
            <span className="result-meta__sort">
              · Sorted by {SORTS[filters.sort].toLowerCase()}
              {filters.sort === "nearest" ? ` from ${origin.label}` : ""}
            </span>
          </div>

          {results.length ? (
            <>
              <div className="directory__grid">
                {pageItems.map((m) => (
                  <MarketCard key={m.id} market={m} showDescription />
                ))}
              </div>
              <Pagination
                page={currentPage}
                pageCount={pageCount}
                onChange={goToPage}
                label="Directory pages"
              />
            </>
          ) : (
            <div className="empty">
              <strong>No markets match these filters</strong>
              <span>
                Try another day or area, or clear the filters to see all{" "}
                {markets.length} markets.
              </span>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() =>
                  setFilters({ ...EMPTY_FILTERS, sort: filters.sort })
                }
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Mobile bottom sheet (M2b) */}
      <div
        className={`sheet-backdrop${sheetOpen ? " is-open" : ""}`}
        onClick={() => setSheetOpen(false)}
        aria-hidden="true"
      />
      <div
        className={`sheet${sheetOpen ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        aria-hidden={!sheetOpen}
        inert={sheetOpen ? undefined : true}
      >
        <span className="sheet__handle" aria-hidden="true" />
        <div className="sheet__body">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            markets={markets}
            openCount={openCount}
            idPrefix="sheet"
          />
        </div>
        <div className="sheet__foot">
          <button
            type="button"
            className="btn btn--primary btn--lg btn--block"
            onClick={() => setSheetOpen(false)}
          >
            Show {results.length} {results.length === 1 ? "market" : "markets"}
          </button>
        </div>
      </div>
    </div>
  );
}
