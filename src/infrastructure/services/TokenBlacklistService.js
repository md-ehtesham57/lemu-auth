import Redis from "ioredis";
import { env } from "../../config.js";

const redis = new Redis({
  host: env.REDIS_HOST || "127.0.0.1",
  port: Number(env.REDIS_PORT) || 6379,
  password: env.REDIS_PASSWORD || undefined,
  tls: env.REDIS_TLS === "true" ? {} : undefined,
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

redis.on("error", (err) => {
  console.error("TokenBlacklist Redis error:", err.message);
});

export class TokenBlacklistService {
  async add(jti, ttlSeconds) {
    try {
      await redis.set(`bl:${jti}`, "1", "EX", ttlSeconds);
    } catch {
      // Redis unavailable — blacklisting degraded; token remains valid until cookie cleared
    }
  }

  async isBlacklisted(jti) {
    try {
      const result = await redis.get(`bl:${jti}`);
      return result !== null;
    } catch {
      return false;
    }
  }

  async close() {
    try {
      await redis.quit();
    } catch {
      // Already closed
    }
  }
}

export const tokenBlacklist = new TokenBlacklistService();
