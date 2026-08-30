import { NextResponse } from "next/server";
import { sessionFromRequest } from "@/lib/session";

export const dynamic = "force-dynamic";
export function GET(request: Request) { const email = sessionFromRequest(request); return NextResponse.json(email ? { authenticated: true, email } : { authenticated: false }, { headers: { "Cache-Control": "no-store" } }); }
