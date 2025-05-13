/**
 * Simple in-memory cache implementation with TTL support
 */
export class Cache<T> {
  private cache: Map<string, { data: T; timestamp: number }>;
  private ttl: number;

  /**
   * Create a new cache instance
   * @param ttl Time to live in milliseconds (default: 5 minutes)
   */
  constructor(ttl = 5 * 60 * 1000) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  /**
   * Get an item from the cache
   * @param key The cache key
   * @returns The cached value or undefined if not found or expired
   */
  get(key: string): T | undefined {
    const item = this.cache.get(key);
    
    if (!item) {
      return undefined;
    }
    
    const now = Date.now();
    if (now - item.timestamp > this.ttl) {
      // Item has expired
      this.cache.delete(key);
      return undefined;
    }
    
    return item.data;
  }

  /**
   * Set an item in the cache
   * @param key The cache key
   * @param data The data to cache
   */
  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Check if the cache has a valid entry for the key
   * @param key The cache key
   * @returns True if the cache has a valid entry for the key
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    return Date.now() - item.timestamp <= this.ttl;
  }

  /**
   * Delete an item from the cache
   * @param key The cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the number of items in the cache
   */
  get size(): number {
    return this.cache.size;
  }
}