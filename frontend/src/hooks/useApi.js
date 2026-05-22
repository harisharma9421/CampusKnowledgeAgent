/**
 * useApi — Generic data fetching hook
 * Manages loading, error, and data state for API calls.
 *
 * @param {Function} apiFn - Async function that returns data
 * The caller should memoize apiFn with useCallback when it depends on props or state.
 * @returns {{ data, loading, error, refetch }}
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const useApi = (apiFn) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn();
      if (isMounted.current) {
        setData(result);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err.message || 'An error occurred');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [apiFn]);

  useEffect(() => {
    isMounted.current = true;
    queueMicrotask(() => {
      if (isMounted.current) {
        void execute();
      }
    });
    return () => {
      isMounted.current = false;
    };
  }, [execute]);

  return { data, loading, error, refetch: execute };
};

export default useApi;
