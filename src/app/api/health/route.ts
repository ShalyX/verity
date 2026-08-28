import { json, requestId } from "@/lib/api-guard";
import { storageMode } from "@/lib/server-store";

export const dynamic = "force-dynamic";
export function GET(request: Request) { const id = requestId(request); return json({ ok: true, service: "verity", storage: storageMode(), timestamp: new Date().toISOString() }, 200, id); }
