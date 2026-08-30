import { scryptSync, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createSession, SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 }); }
  const configuredEmail = process.env["VERITY_LOGIN_EMAIL"];
  const configuredHash = process.env["VERITY_LOGIN_PASSWORD_HASH"];
  if (!configuredEmail || !configuredHash) return NextResponse.json({ error: "LOGIN_NOT_CONFIGURED" }, { status: 503 });
  const [salt, digest] = configuredHash.split(":");
  if (!salt || !digest || !body.email || !body.password) return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
  const candidate = scryptSync(body.password, salt, 64).toString("hex");
  const valid = body.email.trim().toLowerCase() === configuredEmail.trim().toLowerCase() && candidate.length === digest.length && timingSafeEqual(Buffer.from(candidate), Buffer.from(digest));
  if (!valid) return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
  const response = NextResponse.json({ email: configuredEmail.trim().toLowerCase() });
  response.cookies.set(SESSION_COOKIE, createSession(configuredEmail.trim().toLowerCase()), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 8 * 60 * 60 });
  return response;
}
