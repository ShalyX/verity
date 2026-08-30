import { getCase } from "@/lib/server-store";
import ReviewClient from "./review-client";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const caseId = process.env["VERITY_DEFAULT_CASE_ID"];
  if (!caseId) throw new Error("MISSING_VERITY_DEFAULT_CASE_ID");
  const record = await getCase(caseId);
  return record ? <ReviewClient initialCase={record} /> : <main className="app-shell"><section className="panel"><h1>Case unavailable</h1><p>The review case could not be loaded from the configured store.</p></section></main>;
}
