import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { Pool } from "pg";

export type ClaimState = "supported" | "uncertain" | "contradicted";
export type Claim = { id: string; text: string; state: ClaimState; source: string; note: string };
export type CaseRecord = { id: string; title: string; status: "review" | "approved" | "needs-evidence"; claims: Claim[]; inputHash: string; outputHash: string; updatedAt: string };
type Store = { cases: Record<string, CaseRecord> };

const databaseUrl = process.env["DATABASE_URL"] || process.env["VERITY_DATABASE_URL"];
const pool = databaseUrl ? new Pool({ connectionString: databaseUrl, max: 3, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 5_000, ssl: databaseUrl.includes("neon.tech") ? { rejectUnauthorized: false } : undefined }) : null;
let schemaPromise: Promise<void> | null = null;
const dataDir = process.env["VERITY_DATA_DIR"] || path.join(process.cwd(), ".data");
const storePath = path.join(dataDir, "verity.json");

const initialClaims: Claim[] = [
  { id: "CLM-001", text: "The pilot reduced review time by 42%.", state: "supported", source: "Pilot results, page 2", note: "Matches the reported sample and period." },
  { id: "CLM-002", text: "The system works across every document type.", state: "uncertain", source: "Product brief, page 1", note: "The source only describes PDF and DOCX tests." },
  { id: "CLM-003", text: "No reviewer intervention is required.", state: "contradicted", source: "Operations note, page 4", note: "The source requires a reviewer before publication." },
];

function seedCase(): CaseRecord { const inputHash = `sha256:${createHash("sha256").update("VC-1048:quarterly-pilot-report").digest("hex")}`; const outputHash = `sha256:${createHash("sha256").update(JSON.stringify(initialClaims)).digest("hex")}`; return { id: "VC-1048", title: "Quarterly pilot report", status: "review", claims: initialClaims, inputHash, outputHash, updatedAt: new Date().toISOString() }; }
async function ensureSchema() { if (!pool) return; schemaPromise ??= pool.query("CREATE TABLE IF NOT EXISTS verity_cases (id text PRIMARY KEY, record jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())").then(() => undefined); await schemaPromise; }
async function readFileStore(): Promise<Store> { try { return JSON.parse(await readFile(storePath, "utf8")) as Store; } catch { return { cases: { "VC-1048": seedCase() } }; } }
async function writeFileStore(store: Store) { await mkdir(dataDir, { recursive: true }); const tmp = `${storePath}.tmp`; await writeFile(tmp, JSON.stringify(store, null, 2), { mode: 0o600 }); await rename(tmp, storePath); }

export async function getCase(id: string) { if (pool) { await ensureSchema(); const result = await pool.query<{ record: CaseRecord }>("SELECT record FROM verity_cases WHERE id = $1", [id]); if (result.rows[0]) return result.rows[0].record; if (id === "VC-1048") { const record = seedCase(); await pool.query("INSERT INTO verity_cases (id, record) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO NOTHING", [id, JSON.stringify(record)]); return record; } return null; } return (await readFileStore()).cases[id] ?? null; }

export async function updateCase(id: string, update: (record: CaseRecord) => CaseRecord) { if (pool) { await ensureSchema(); const client = await pool.connect(); try { await client.query("BEGIN"); const result = await client.query<{ record: CaseRecord }>("SELECT record FROM verity_cases WHERE id = $1 FOR UPDATE", [id]); const current = result.rows[0]?.record ?? seedCase(); const next = { ...update(current), updatedAt: new Date().toISOString() }; await client.query("INSERT INTO verity_cases (id, record, updated_at) VALUES ($1, $2::jsonb, now()) ON CONFLICT (id) DO UPDATE SET record = EXCLUDED.record, updated_at = now()", [id, JSON.stringify(next)]); await client.query("COMMIT"); return next; } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } } const store = await readFileStore(); const current = store.cases[id] ?? seedCase(); const next = { ...update(current), updatedAt: new Date().toISOString() }; store.cases[id] = next; await writeFileStore(store); return next; }

export function isPersistentConfigured() { return Boolean(pool); }
export function storageMode() { return pool ? "managed-postgres" : "local-filesystem"; }
export async function closeStore() { await pool?.end(); }
