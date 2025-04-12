
import { useState, useEffect } from 'react';

interface AsyncDataState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  retry: () => void;
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

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const retry = () => {
    setRetryCount(prev => prev + 1);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, retryCount]);

  return {
    data,
    isLoading,
    error,
    isError: error !== null,
    retry
  };
}
