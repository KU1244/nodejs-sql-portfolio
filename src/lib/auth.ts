export type Role = "ADMIN" | "USER";
export type AuthUser = { id: number; role: Role } | null;

export function getAuthUserFromRequest(req: { headers?: Record<string, unknown> }): AuthUser {
    const idRaw = req.headers?.["x-user-id"];
    const roleRaw = req.headers?.["x-user-role"];
    if (idRaw == null || roleRaw == null) return null;
    const id = Number(idRaw);
    const up = String(roleRaw).toUpperCase();
    const role: Role = up === "ADMIN" ? "ADMIN" : up === "USER" ? "USER" : "USER";
    if (!Number.isFinite(id) || id <= 0) return null;
    return { id, role };
}
