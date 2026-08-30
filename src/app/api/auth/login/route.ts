import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/accounts";
import { createSession, SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 }); }
  if (!body.email || !body.password) return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
  const user = await verifyUser(body.email, body.password);
  if (!user) return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
  const response = NextResponse.json({ user });
  response.cookies.set(SESSION_COOKIE, createSession(user.email), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 8 * 60 * 60 });
  return response;
}
