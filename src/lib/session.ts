import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "verity_session";

function secret() { return process.env["VERITY_ADMIN_TOKEN"]; }
function sign(value: string) { return createHmac("sha256", secret() || "").update(value).digest("base64url"); }

export function createSession(email: string) {
  const value = `${Buffer.from(email).toString("base64url")}:${Date.now() + 8 * 60 * 60 * 1000}`;
  return `${value}.${sign(value)}`;
}

export function sessionEmail(cookie: string | undefined) {
  if (!cookie || !secret()) return null;
  const dot = cookie.lastIndexOf("."); if (dot < 1) return null;
  const value = cookie.slice(0, dot); const signature = cookie.slice(dot + 1); const expected = sign(value);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const separator = value.lastIndexOf(":"); const expires = Number(value.slice(separator + 1));
  return separator > 0 && Number.isFinite(expires) && expires > Date.now() ? Buffer.from(value.slice(0, separator), "base64url").toString("utf8") : null;
}

export function sessionFromRequest(request: Request) {
  const raw = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return sessionEmail(raw?.slice(SESSION_COOKIE.length + 1));
}
