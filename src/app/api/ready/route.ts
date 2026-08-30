import { json, requestId } from "@/lib/api-guard";
import { isPersistentConfigured } from "@/lib/server-store";

export const dynamic = "force-dynamic";
export function GET(request: Request) { const id = requestId(request); const checks = { persistence: isPersistentConfigured(), auth: Boolean(process.env["VERITY_ADMIN_TOKEN"]), zeroGStorage: Boolean(process.env["ZG_STORAGE_ENDPOINT"] && process.env["ZG_STORAGE_ROOT_HASH"]), zeroGChain: Boolean(process.env["ZG_CHAIN_RPC_URL"] && process.env["ZG_RECEIPT_CONTRACT_ADDRESS"]) }; return json({ ready: Object.values(checks).every(Boolean), checks }, Object.values(checks).every(Boolean) ? 200 : 503, id); }
