import { rateLimit } from 'express-rate-limit'

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: true, 
  legacyHeaders: false, 
  ipv6Subnet: 56,
});
