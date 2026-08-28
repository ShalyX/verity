import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export type ClaimState = "supported" | "uncertain" | "contradicted";
export type Claim = { id: string; text: string; state: ClaimState; source: string; note: string };
export type CaseRecord = { id: string; title: string; status: "review" | "approved" | "needs-evidence"; claims: Claim[]; inputHash: string; outputHash: string; updatedAt: string };

type Store = { cases: Record<string, CaseRecord> };

const initialClaims: Claim[] = [
  { id: "CLM-001", text: "The pilot reduced review time by 42%.", state: "supported", source: "Pilot results, page 2", note: "Matches the reported sample and period." },
  { id: "CLM-002", text: "The system works across every document type.", state: "uncertain", source: "Product brief, page 1", note: "The source only describes PDF and DOCX tests." },
  { id: "CLM-003", text: "No reviewer intervention is required.", state: "contradicted", source: "Operations note, page 4", note: "The source requires a reviewer before publication." },
];

const dataDir = process.env["VERITY_DATA_DIR"] || path.join(process.cwd(), ".data");
const storePath = path.join(dataDir, "verity.json");

function seedCase(): CaseRecord {
  const inputHash = `sha256:${createHash("sha256").update("VC-1048:quarterly-pilot-report").digest("hex")}`;
  const outputHash = `sha256:${createHash("sha256").update(JSON.stringify(initialClaims)).digest("hex")}`;
  return { id: "VC-1048", title: "Quarterly pilot report", status: "review", claims: initialClaims, inputHash, outputHash, updatedAt: new Date().toISOString() };
}

async function readStore(): Promise<Store> {
  try { return JSON.parse(await readFile(storePath, "utf8")) as Store; }
  catch { return { cases: { "VC-1048": seedCase() } }; }
}

async function writeStore(store: Store) {
  await mkdir(dataDir, { recursive: true });
  const tmp = `${storePath}.tmp`;
  await writeFile(tmp, JSON.stringify(store, null, 2), { mode: 0o600 });
  await rename(tmp, storePath);
}

export async function getCase(id: string) { return (await readStore()).cases[id] ?? null; }

export async function updateCase(id: string, update: (record: CaseRecord) => CaseRecord) {
  const store = await readStore();
  const current = store.cases[id] ?? seedCase();
  const next = update(current);
  store.cases[id] = { ...next, updatedAt: new Date().toISOString() };
  await writeStore(store);
  return store.cases[id];
}

export function isPersistentConfigured() { return Boolean(process.env["VERITY_DATABASE_URL"]); }
export function storageMode() { return isPersistentConfigured() ? "managed-database-configured" : "local-filesystem"; }
