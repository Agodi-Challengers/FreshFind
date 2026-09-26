import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { filtersFromParams, filtersToParams } from './filters.js';


export function useUrlFilters() {
  const [params, setParams] = useSearchParams();
  const key = params.toString();

  const filters = useMemo(() => filtersFromParams(params), [key]);
  const setFilters = useCallback(
    (next) => {
      setParams(filtersToParams(next), { replace: true });
    },
    [setParams],
  );
  return [filters, setFilters];
}
