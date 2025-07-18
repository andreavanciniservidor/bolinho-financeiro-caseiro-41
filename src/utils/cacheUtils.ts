/**
 * Utility functions for caching data for offline use
 */

// Cache keys
const CACHE_PREFIX = 'financas-plus-';
const CACHE_KEYS = {
  USER_DATA: `${CACHE_PREFIX}user-data`,
  TRANSACTIONS: `${CACHE_PREFIX}transactions`,
  CATEGORIES: `${CACHE_PREFIX}categories`,
  BUDGETS: `${CACHE_PREFIX}budgets`,
  SETTINGS: `${CACHE_PREFIX}settings`,
};

// Cache expiration times (in milliseconds)
const CACHE_EXPIRATION = {
  USER_DATA: 24 * 60 * 60 * 1000, // 24 hours
  TRANSACTIONS: 30 * 60 * 1000, // 30 minutes
  CATEGORIES: 60 * 60 * 1000, // 1 hour
  BUDGETS: 30 * 60 * 1000, // 30 minutes
  SETTINGS: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * Cache item interface
 */
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiration: number;
}

/**
 * Save data to cache
 * @param key Cache key
 * @param data Data to cache
 * @param expiration Cache expiration time in milliseconds
 */
export function saveToCache<T>(key: string, data: T, expiration?: number): void {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiration: expiration || 60 * 60 * 1000, // Default: 1 hour
    };
    
    localStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
}

/**
 * Get data from cache
 * @param key Cache key
 * @returns Cached data or null if not found or expired
 */
export function getFromCache<T>(key: string): T | null {
  try {
    const cachedData = localStorage.getItem(key);
    
    if (!cachedData) {
      return null;
    }
    
    const cacheItem: CacheItem<T> = JSON.parse(cachedData);
    const now = Date.now();
    
    // Check if cache is expired
    if (now - cacheItem.timestamp > cacheItem.expiration) {
      localStorage.removeItem(key);
      return null;
    }
    
    return cacheItem.data;
  } catch (error) {
    console.error('Error getting from cache:', error);
    return null;
  }
}

/**
 * Remove data from cache
 * @param key Cache key
 */
export function removeFromCache(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from cache:', error);
  }
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  try {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Preload images for better performance
 * @param imageUrls Array of image URLs to preload
 * @returns Promise that resolves when all images are loaded
 */
export function preloadImages(imageUrls: string[]): Promise<void[]> {
  const promises = imageUrls.map(url => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  });
  
  return Promise.all(promises);
}

/**
 * Save user data to cache
 * @param userData User data to cache
 */
export function saveUserDataToCache(userData: any): void {
  saveToCache(CACHE_KEYS.USER_DATA, userData, CACHE_EXPIRATION.USER_DATA);
}

/**
 * Get user data from cache
 * @returns Cached user data or null if not found or expired
 */
export function getUserDataFromCache(): any | null {
  return getFromCache(CACHE_KEYS.USER_DATA);
}

/**
 * Save transactions to cache
 * @param transactions Transactions to cache
 */
export function saveTransactionsToCache(transactions: any[]): void {
  saveToCache(CACHE_KEYS.TRANSACTIONS, transactions, CACHE_EXPIRATION.TRANSACTIONS);
}

/**
 * Get transactions from cache
 * @returns Cached transactions or null if not found or expired
 */
export function getTransactionsFromCache(): any[] | null {
  return getFromCache(CACHE_KEYS.TRANSACTIONS);
}

/**
 * Save categories to cache
 * @param categories Categories to cache
 */
export function saveCategoriesToCache(categories: any[]): void {
  saveToCache(CACHE_KEYS.CATEGORIES, categories, CACHE_EXPIRATION.CATEGORIES);
}

/**
 * Get categories from cache
 * @returns Cached categories or null if not found or expired
 */
export function getCategoriesFromCache(): any[] | null {
  return getFromCache(CACHE_KEYS.CATEGORIES);
}

/**
 * Save budgets to cache
 * @param budgets Budgets to cache
 */
export function saveBudgetsToCache(budgets: any[]): void {
  saveToCache(CACHE_KEYS.BUDGETS, budgets, CACHE_EXPIRATION.BUDGETS);
}

/**
 * Get budgets from cache
 * @returns Cached budgets or null if not found or expired
 */
export function getBudgetsFromCache(): any[] | null {
  return getFromCache(CACHE_KEYS.BUDGETS);
}

/**
 * Save settings to cache
 * @param settings Settings to cache
 */
export function saveSettingsToCache(settings: any): void {
  saveToCache(CACHE_KEYS.SETTINGS, settings, CACHE_EXPIRATION.SETTINGS);
}

/**
 * Get settings from cache
 * @returns Cached settings or null if not found or expired
 */
export function getSettingsFromCache(): any | null {
  return getFromCache(CACHE_KEYS.SETTINGS);
}
