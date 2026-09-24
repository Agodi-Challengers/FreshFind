import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { filtersFromParams, filtersToParams } from './filters.js';

/** Filter state stored in the URL query string, so results can be bookmarked and shared. */
export function useUrlFilters() {
  const [params, setParams] = useSearchParams();
  const key = params.toString();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filters = useMemo(() => filtersFromParams(params), [key]);
  const setFilters = useCallback(
    (next) => {
      setParams(filtersToParams(next), { replace: true });
    },
    [setParams],
  );
  return [filters, setFilters];
}
