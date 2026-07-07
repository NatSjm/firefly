import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { getErrorMessage } from '@/lib/errors';

export interface AsyncData<T> {
  data: T | null;
  setData: Dispatch<SetStateAction<T | null>>;
  loading: boolean;
  error: string;
  setError: Dispatch<SetStateAction<string>>;
}

/**
 * Loads data for a page: tracks loading/error state and ignores results that
 * land after the fetcher changed or the component unmounted.
 *
 * `fetcher` must be referentially stable (wrap it in `useCallback`); every
 * identity change triggers a refetch.
 */
export function useAsyncData<T>(fetcher: () => Promise<T>, fallbackError?: string): AsyncData<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

    fetcher()
      .then((result) => {
        if (active) {
          setData(result);
        }
      })
      .catch((fetchError: unknown) => {
        if (active) {
          setError(getErrorMessage(fetchError, fallbackError));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [fetcher, fallbackError]);

  return { data, setData, loading, error, setError };
}
