import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export async function rateLimit(identifier) {
    const rateLimit = new Ratelimit({
        redis: Redis.fromEnv(), // Redis instance should be created from env variables
        limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds window
        analytics: true,
        prefix: "@upstash/ratelimit"
    })
    //will apply the rate-limiting rules specified earlier to the provided identifier
    return await rateLimit.limit(identifier)
}