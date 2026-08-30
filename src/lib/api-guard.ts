import { NextResponse } from "next/server";
import { sessionFromRequest } from "@/lib/session";

const hits = new Map<string, { count: number; resetAt: number }>();

export function requestId(request: Request) {
  const incoming = request.headers.get("x-request-id") || "";
  return /^[A-Za-z0-9._-]{1,64}$/.test(incoming) ? incoming : crypto.randomUUID();
}

export function rateLimit(request: Request, id: string) {
  const now = Date.now();
  const key = `${id}:${request.headers.get("x-forwarded-for") || "direct"}`;
  const current = hits.get(key);
  if (!current || current.resetAt <= now) { hits.set(key, { count: 1, resetAt: now + 60_000 }); return null; }
  current.count += 1;
  if (current.count > 60) return NextResponse.json({ error: "RATE_LIMITED", requestId: id }, { status: 429, headers: { "Retry-After": "60", "Cache-Control": "no-store" } });
  return null;
}

export function requireAuth(request: Request, id: string) {
  const expected = process.env["VERITY_ADMIN_TOKEN"];
  if (!expected && process.env.NODE_ENV !== "production") return null;
  if (sessionFromRequest(request)) return null;
  const actual = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected || actual !== expected) return NextResponse.json({ error: "UNAUTHORIZED", requestId: id }, { status: 401, headers: { "Cache-Control": "no-store" } });
  return null;
}

export function json(data: unknown, status = 200, id?: string) {
  const response = NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
  if (id) response.headers.set("X-Request-Id", id);
  return response;
}
