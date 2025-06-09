
export interface RetryOptions {
  retries: number;
  backoff: number;
  maxBackoff?: number;
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = { retries: 3, backoff: 2000, maxBackoff: 30000 }
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= options.retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === options.retries) {
        throw lastError;
      }
      
      const delay = Math.min(
        options.backoff * Math.pow(2, attempt),
        options.maxBackoff || 30000
      );
      
      console.log(`Retry attempt ${attempt + 1}/${options.retries + 1} failed, waiting ${delay}ms:`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}
