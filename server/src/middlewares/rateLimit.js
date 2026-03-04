import { Ratelimit } from "@upstash/ratelimit";
import redis from "../config/redis.js";

export const globalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1000, "15 m"),
  analytics: true,
});

export const rateLimitMiddleware = async (req, res, next) => {
  try {
    const identifier = req.ip;

    const { success, limit, remaining, reset } =
      await globalLimiter.limit(identifier);

    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", reset);

    if (!success) {
      return res.status(429).json({
        error: "Too many requests",
      });
    }

    next();
  } catch (err) {
    console.error("Rate limiter error:", err);
    next();
  }
};
