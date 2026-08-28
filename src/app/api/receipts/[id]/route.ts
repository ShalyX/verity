import { json, rateLimit, requestId, requireAuth } from "@/lib/api-guard";
import { getCase } from "@/lib/server-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) { const id = requestId(request); const blocked = requireAuth(request, id) || rateLimit(request, id); if (blocked) return blocked; const record = await getCase((await context.params).id); return record ? json({ caseId: record.id, inputHash: record.inputHash, outputHash: record.outputHash, status: record.status, updatedAt: record.updatedAt, anchoring: "not-configured" }, 200, id) : json({ error: "RECEIPT_NOT_FOUND", requestId: id }, 404, id); }
