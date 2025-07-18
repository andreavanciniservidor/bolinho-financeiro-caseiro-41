
// Memory cache implementation for client-side caching
const memoryCache = new Map<string, { data: any; expiry: number }>();

/**
 * Get data from memory cache
 */
export const getMemoryCache = <T>(key: string): T | null => {
  const cached = memoryCache.get(key);
  if (!cached) return null;
  
  if (Date.now() > cached.expiry) {
    memoryCache.delete(key);
    return null;
  }
  
  return cached.data as T;
};

/**
 * Set data in memory cache
 */
export const setMemoryCache = <T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void => {
  memoryCache.set(key, {
    data,
    expiry: Date.now() + ttl
  });
};

/**
 * Clear specific cache entry
 */
export const clearMemoryCache = (key: string): void => {
  memoryCache.delete(key);
};

/**
 * Clear all cache entries
 */
export const clearAllMemoryCache = (): void => {
  memoryCache.clear();
};

/**
 * Preload images for better UX
 */
export const preloadImages = (urls: string[]): Promise<void[]> => {
  const promises = urls.map(url => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  });
  
  return Promise.all(promises);
};
