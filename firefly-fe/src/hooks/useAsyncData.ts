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
 * Loads data for a page: tracks loading/error state, aborts the in-flight
 * request when the fetcher changes or the component unmounts, and ignores
 * results that land after that.
 *
 * `fetcher` must be referentially stable (wrap it in `useCallback`); every
 * identity change triggers a refetch. Pass the provided signal through to the
 * API call so the request is actually cancelled, not just ignored.
 */
export function useAsyncData<T>(fetcher: (signal: AbortSignal) => Promise<T>, fallbackError?: string): AsyncData<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    setLoading(true);
    setError('');

    fetcher(controller.signal)
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
      controller.abort();
    };
  }, [fetcher, fallbackError]);

  return { data, setData, loading, error, setError };
}
