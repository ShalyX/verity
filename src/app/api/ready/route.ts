import { json, requestId } from "@/lib/api-guard";
import { isPersistentConfigured } from "@/lib/server-store";

export const dynamic = "force-dynamic";
export function GET(request: Request) { const id = requestId(request); const configured = isPersistentConfigured(); return json({ ready: configured, checks: { persistence: configured, auth: Boolean(process.env["VERITY_ADMIN_TOKEN"]), zeroGStorage: Boolean(process.env["ZG_STORAGE_ENDPOINT"]), zeroGChain: Boolean(process.env["ZG_CHAIN_RPC_URL"]) } }, configured ? 200 : 503, id); }
