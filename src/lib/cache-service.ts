interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class CacheService {
  private cache = new Map<string, CacheEntry<unknown>>()
  
  // Default TTL: 5 minutes for regular data, 10 minutes for charts
  private readonly DEFAULT_TTL = 5 * 60 * 1000
  private readonly CHART_TTL = 10 * 60 * 1000

  set<T>(key: string, data: T, customTTL?: number): void {
    const ttl = customTTL ?? this.DEFAULT_TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    const now = Date.now()
    const isExpired = now - entry.timestamp > entry.ttl

    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }

    const now = Date.now()
    const isExpired = now - entry.timestamp > entry.ttl

    if (isExpired) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  // Helper method for chart data caching
  getChartTTL(): number {
    return this.CHART_TTL
  }

  // Method to create a cached async function
  async cached<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    customTTL?: number
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await fetchFn()
    this.set(key, data, customTTL)
    return data
  }
}

export const cacheService = new CacheService()