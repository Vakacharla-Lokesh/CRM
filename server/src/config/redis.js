import { Redis } from "@upstash/redis";
import envConfig from "./envConfig.js";

const redis = new Redis({
  url: envConfig.redis.url,
  token: envConfig.redis.token,
});

export default redis;
