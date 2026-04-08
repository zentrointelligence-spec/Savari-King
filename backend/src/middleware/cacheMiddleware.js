/**
 * Cache Middleware - Phase 5
 * Implements Redis caching for API responses to reduce database load
 */

// Note: Redis is optional - falls back to memory cache if Redis is not available
let redis;
let redisAvailable = false;

try {
  // Try to use Redis if available (needs: npm install redis)
  // redis = require('redis');
  // const client = redis.createClient({
  //   host: process.env.REDIS_HOST || 'localhost',
  //   port: process.env.REDIS_PORT || 6379,
  //   password: process.env.REDIS_PASSWORD || undefined
  // });
  // redisAvailable = true;
} catch (error) {
  console.log('Redis not available, using memory cache fallback');
  redisAvailable = false;
}

// In-memory cache fallback
const memoryCache = new Map();
const cacheExpiry = new Map();

/**
 * Clean expired cache entries (runs every 5 minutes)
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, expiry] of cacheExpiry.entries()) {
    if (expiry < now) {
      memoryCache.delete(key);
      cacheExpiry.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Cache middleware for destinations
 * @param {number} duration - Cache duration in seconds (default: 3600 = 1 hour)
 * @returns {Function} Express middleware
 */
exports.cacheDestinations = (duration = 3600) => {
  return async (req, res, next) => {
    // Skip cache for authenticated requests that might have user-specific data
    if (req.user && req.path.includes('/user')) {
      return next();
    }

    // Create cache key from URL and query params
    const key = `destinations:${req.originalUrl}`;

    try {
      if (redisAvailable && redis) {
        // Redis implementation
        const cachedData = await redis.get(key);
        if (cachedData) {
          console.log(`[Cache HIT] ${key}`);
          return res.json(JSON.parse(cachedData));
        }
      } else {
        // Memory cache implementation
        const now = Date.now();
        const expiry = cacheExpiry.get(key);

        if (expiry && expiry > now) {
          const cachedData = memoryCache.get(key);
          if (cachedData) {
            console.log(`[Memory Cache HIT] ${key}`);
            return res.json(cachedData);
          }
        }
      }

      console.log(`[Cache MISS] ${key}`);

      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = function (data) {
        // Only cache successful responses
        if (res.statusCode === 200 && data) {
          if (redisAvailable && redis) {
            // Store in Redis
            redis.setex(key, duration, JSON.stringify(data));
          } else {
            // Store in memory cache
            memoryCache.set(key, data);
            cacheExpiry.set(key, Date.now() + (duration * 1000));
          }
        }

        // Call original json function
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('[Cache Error]', error);
      // On cache error, just continue without caching
      next();
    }
  };
};

/**
 * Cache middleware for popular destinations (longer cache)
 */
exports.cachePopularDestinations = exports.cacheDestinations(7200); // 2 hours

/**
 * Cache middleware for destination details (medium cache)
 */
exports.cacheDestinationDetails = exports.cacheDestinations(3600); // 1 hour

/**
 * Cache middleware for search results (short cache)
 */
exports.cacheSearchResults = exports.cacheDestinations(900); // 15 minutes

/**
 * Invalidate cache for a specific pattern
 * @param {string} pattern - Cache key pattern to invalidate
 */
exports.invalidateCache = async (pattern) => {
  try {
    if (redisAvailable && redis) {
      // Redis implementation - delete keys matching pattern
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`[Cache] Invalidated ${keys.length} keys matching: ${pattern}`);
      }
    } else {
      // Memory cache implementation
      let count = 0;
      for (const key of memoryCache.keys()) {
        if (key.includes(pattern)) {
          memoryCache.delete(key);
          cacheExpiry.delete(key);
          count++;
        }
      }
      console.log(`[Memory Cache] Invalidated ${count} keys matching: ${pattern}`);
    }
  } catch (error) {
    console.error('[Cache Invalidation Error]', error);
  }
};

/**
 * Clear all cache
 */
exports.clearAllCache = async () => {
  try {
    if (redisAvailable && redis) {
      await redis.flushdb();
      console.log('[Cache] All cache cleared (Redis)');
    } else {
      memoryCache.clear();
      cacheExpiry.clear();
      console.log('[Memory Cache] All cache cleared');
    }
  } catch (error) {
    console.error('[Cache Clear Error]', error);
  }
};

/**
 * Get cache statistics
 */
exports.getCacheStats = () => {
  if (redisAvailable && redis) {
    return {
      type: 'redis',
      available: true
    };
  } else {
    return {
      type: 'memory',
      available: true,
      size: memoryCache.size,
      keys: Array.from(memoryCache.keys())
    };
  }
};

// Export cache instance for testing
exports.cache = redisAvailable ? redis : memoryCache;
exports.isRedisAvailable = redisAvailable;
