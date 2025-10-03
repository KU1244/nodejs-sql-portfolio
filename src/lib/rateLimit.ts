// src/lib/rateLimit.ts
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * In-memory IP-based rate limiter.
 * NOTE: For production, replace this with Redis or another shared store.
 */

// Keep store across hot-reloads (Next.js dev)
type HitStore = Map<string, number[]>;
declare global {
    // eslint-disable-next-line no-var
    var __rateLimitStore: HitStore | undefined;
}
const store: HitStore = global.__rateLimitStore ?? new Map();
if (!global.__rateLimitStore) global.__rateLimitStore = store;

export type RateLimitOptions = {
    /** Max requests allowed within the window */
    limit: number;
    /** Window size in milliseconds */
    windowMs: number;
    /** Optional logical key to separate different endpoints */
    key?: string;
};

export type RateLimitResult = {
    ok: boolean;
    remaining: number;
    retryAfter?: number; // seconds
};

/** Extract a best-effort client IP from headers/socket */
export function getClientIp(req: NextApiRequest): string {
    const xf = (req.headers["x-forwarded-for"] as string) || "";
    const ip = xf.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
    return ip;
}

/**
 * Check and record a hit for the given IP/key.
 * Returns whether the request is allowed.
 */
export function rateLimitOk(
    req: NextApiRequest,
    { limit, windowMs, key }: RateLimitOptions
): RateLimitResult {
    const ip = getClientIp(req);
    const bucketKey = `${ip}:${key ?? req.url ?? ""}`;
    const now = Date.now();

    const hits = store.get(bucketKey)?.filter((ts) => now - ts < windowMs) ?? [];
    const allowed = hits.length < limit;

    if (allowed) {
        hits.push(now);
        store.set(bucketKey, hits);
        return { ok: true, remaining: Math.max(0, limit - hits.length) };
    } else {
        const oldest = hits[0];
        const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
        return { ok: false, remaining: 0, retryAfter: retryAfterSec };
    }
}

/** Optional: set helpful headers for clients/tools */
export function setRateLimitHeaders(
    res: NextApiResponse,
    info: RateLimitResult,
    limit: number
): void {
    res.setHeader("X-RateLimit-Limit", String(limit));
    res.setHeader("X-RateLimit-Remaining", String(info.remaining));
    if (!info.ok && info.retryAfter) {
        res.setHeader("Retry-After", String(info.retryAfter));
    }
}
