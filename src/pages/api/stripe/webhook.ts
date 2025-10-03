// src/pages/api/stripe/webhook.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.status(200).json({ ok: true, message: "not implemented yet" });
}
