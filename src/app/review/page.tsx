import { getCase } from "@/lib/server-store";
import ReviewClient from "./review-client";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const record = await getCase("VC-1048");
  return record ? <ReviewClient initialCase={record} /> : <main className="app-shell"><section className="panel"><h1>Case unavailable</h1><p>The review case could not be loaded from the configured store.</p></section></main>;
}
