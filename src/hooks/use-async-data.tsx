
import { useState, useEffect, useCallback } from 'react';

interface AsyncDataState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  retry: () => void;
  refresh: () => void; // Added refresh method
}

export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  initialData: T | null = null,
  deps: any[] = []
): AsyncDataState<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [refreshTimestamp, setRefreshTimestamp] = useState<number>(Date.now());

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn();
      
      // Only update state if component is still mounted
      setData(result);
      console.log('Fetched data successfully:', result);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn]);

  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  const refresh = useCallback(() => {
    console.log('Manual refresh triggered');
    setRefreshTimestamp(Date.now());
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await fetchFn();
        
        // Only update state if component is still mounted
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, retryCount, refreshTimestamp]);

  return {
    data,
    isLoading,
    error,
    isError: error !== null,
    retry,
    refresh
  };
}
