import redis from "./redis.js";

class RedisCache {
  async get(key) {
    try {
      const data = await redis.get(key);
      console.log(`[Cache Get]: ${data}`);
      if (!data) return null;
      return data;
    } catch (err) {
      console.error("Cache GET error:", err);
      return null;
    }
  }

  async set(key, value, ttl = 300) {
    try {
      if (ttl) {
        await redis.set(key, value, { ex: ttl });
        console.log(`[Cache Set]: ${key}`);
      } else {
        await redis.set(key, value);
      }
    } catch (err) {
      console.error("Cache SET error:", err);
    }
  }

  async delete(key) {
    try {
      await redis.del(key);
      console.log(`[Cache Delete]: ${key}`);
    } catch (err) {
      console.error("Cache DELETE error:", err);
    }
  }

  async clear() {
    try {
      await redis.flushdb();
      console.log(`[Cache Clear]:`);
    } catch (err) {
      console.error("Cache CLEAR error:", err);
    }
  }

  async has(key) {
    try {
      const exists = await redis.exists(key);
      return exists === 1;
    } catch (err) {
      console.error("Cache HAS error:", err);
      return false;
    }
  }

  async size() {
    try {
      const keys = await redis.keys("*");
      return keys.length;
    } catch (err) {
      console.error("Cache SIZE error:", err);
      return 0;
    }
  }
}

export const otpCache = new RedisCache();

export const dashboardCache = new RedisCache();

