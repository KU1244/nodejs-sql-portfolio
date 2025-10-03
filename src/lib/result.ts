export type Ok<T> = { ok: true; data: T };
export type Fail<C extends string = string> = {
    ok: false;
    error: { code: C; message: string; details?: unknown };
};
export const ok = <T>(data: T): Ok<T> => ({ ok: true, data });
export const fail = <C extends string>(
    code: C,
    message: string,
    details?: unknown
): Fail<C> => ({ ok: false, error: { code, message, details } });
