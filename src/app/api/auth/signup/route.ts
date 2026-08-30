import { NextResponse } from "next/server";
import { createUser } from "@/lib/accounts";
import { createSession, SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 }); }
  if (!body.email || !body.password || body.password.length < 12) return NextResponse.json({ error: "EMAIL_AND_12_CHAR_PASSWORD_REQUIRED" }, { status: 400 });
  try {
    const user = await createUser(body.email, body.password); const response = NextResponse.json({ user });
    response.cookies.set(SESSION_COOKIE, createSession(user.email), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 8 * 60 * 60 });
    return response;
  } catch (error) { if (error instanceof Error && /unique/i.test(error.message)) return NextResponse.json({ error: "ACCOUNT_EXISTS" }, { status: 409 }); return NextResponse.json({ error: "SIGNUP_FAILED" }, { status: 500 }); }
}
