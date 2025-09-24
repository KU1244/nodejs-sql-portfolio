import type { NextApiRequest, NextApiResponse } from "next";
import { fail } from "@/lib/result";

export type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

export function withJson(fn: Handler, allow: readonly string[]) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        // 405 + Allow
        if (!allow.includes(req.method || "")) {
            res.setHeader("Allow", allow.join(","));
            return res.status(405).json(fail("method_not_allowed", "Method Not Allowed"));
        }
        // 415 (GET以外は application/json 想定)
        if (req.method !== "GET") {
            const ct = String(req.headers["content-type"] || "");
            if (!/application\/json/i.test(ct))
                return res.status(415).json(fail("unsupported_media_type", "Use application/json"));
        }
        const requestId = (req.headers["x-request-id"] as string) || crypto.randomUUID();
        try {
            res.setHeader("x-request-id", requestId);
            await fn(req, res);
        } catch (err) {
            console.error("API error", { requestId, err });
            return res.status(500).json(fail("internal_error", "Internal server error"));
        }
    };
}
