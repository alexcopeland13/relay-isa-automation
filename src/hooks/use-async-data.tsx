
import { useState, useEffect, useCallback } from 'react';

interface AsyncDataState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  retry: () => void;
  refresh: () => void;
  timestamp: number; // Add timestamp to track when data was last fetched
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
  const [fetchTimestamp, setFetchTimestamp] = useState<number>(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const startTime = Date.now();
    
    try {
      console.log('🔄 Fetching data...', { 
        functionName: fetchFn.name || 'anonymous function',
        startTime: new Date(startTime).toISOString()
      });
      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 10s')), 10000);
      });
      
      // Race between actual fetch and timeout
      const result = await Promise.race([fetchFn(), timeoutPromise]) as T;
      const endTime = Date.now();
      
      console.log('✅ Data fetched successfully in ' + (endTime - startTime) + 'ms:', result);
      setData(result);
      setFetchTimestamp(endTime);
      return result;
    } catch (err) {
      const endTime = Date.now();
      console.error('❌ Error fetching data after ' + (endTime - startTime) + 'ms:', err);
      
      // Extract more useful error information
      let errorMessage = 'Unknown error';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = JSON.stringify(err);
      } else {
        errorMessage = String(err);
      }
      
      // Create error with better details
      const enhancedError = new Error(`Fetch failed: ${errorMessage}`);
      setError(enhancedError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn]);

  const retry = useCallback(() => {
    console.log('🔄 Retrying data fetch...');
    setRetryCount(prev => prev + 1);
  }, []);

  const refresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    setRefreshTimestamp(Date.now());
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('📊 Loading data with dependencies:', deps, 'retry:', retryCount, 'refresh:', refreshTimestamp);
        const result = await fetchFn();
        
        // Only update state if component is still mounted
        if (isMounted) {
          console.log('📊 Data loaded, updating state with:', result);
          setData(result);
          setFetchTimestamp(Date.now());
        }
      } catch (err) {
        console.error('❌ Error loading data:', err);
        if (isMounted) {
          // Enhanced error handling with better logging
          let errorObj: Error;
          if (err instanceof Error) {
            errorObj = err;
          } else {
            errorObj = new Error(typeof err === 'string' ? err : 'Unknown error occurred');
            if (typeof err === 'object' && err !== null) {
              // Attach original error data for debugging
              (errorObj as any).originalError = err;
            }
          }
          
          setError(errorObj);
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
    refresh,
    timestamp: fetchTimestamp
  };
}
