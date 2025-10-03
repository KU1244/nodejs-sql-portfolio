import type { NextApiRequest, NextApiResponse } from "next";

type Ok = { ok: true; data: { iso: string; jst: string } };
type Err = { ok: false; error: { message: string } };

export default function handler(req: NextApiRequest, res: NextApiResponse<Ok | Err>) {
    if (req.method !== "GET") {
        return res.status(405).json({ ok: false, error: { message: "GETだけ対応" } });
    }
    const now = new Date();
    const jst = new Intl.DateTimeFormat("ja-JP", {
        timeZone: "Asia/Tokyo",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false,
    }).format(now);

    return res.status(200).json({
        ok: true,
        data: { iso: now.toISOString(), jst }, // 国際標準の時刻 と 日本時間
    });
}
