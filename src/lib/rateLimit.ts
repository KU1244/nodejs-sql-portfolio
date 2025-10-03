// src/lib/rateLimit.ts
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * In-memory IP-based rate limiter.
 * NOTE: For production, replace this with Redis or another shared store.
 */

type HitStore = Map<string, number[]>;

// Typed global store without `any`/`var`
const g = globalThis as typeof globalThis & { __rateLimitStore?: HitStore };
const store: HitStore = g.__rateLimitStore ?? new Map<string, number[]>();
if (!g.__rateLimitStore) g.__rateLimitStore = store;

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
// src/lib/rateLimit.ts

/** Extract a best-effort client IP from headers/socket */
export function getClientIp(req: NextApiRequest): string {
    const xf = req.headers["x-forwarded-for"];                 // string | string[] | undefined
    const forwarded = (Array.isArray(xf) ? xf[0] : xf) ?? "";  // ← ここで必ず string にする
    const first = forwarded.split(",")[0]?.trim() ?? "";       // ← typeof チェック不要
    return first || req.socket?.remoteAddress || "unknown";
}


/**
 * Check and record a hit for the given IP/key.
 * Returns whether the request is allowed.
 */
export function rateLimitOk(
    req: NextApiRequest,
    { limit, windowMs, key }: RateLimitOptions
): RateLimitResult {
    const bucketKey = `${getClientIp(req)}:${key ?? req.url ?? ""}`;
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
