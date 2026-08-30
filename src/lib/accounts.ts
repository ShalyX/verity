import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { Pool } from "pg";

const databaseUrl = process.env["DATABASE_URL"] || process.env["VERITY_DATABASE_URL"];
const pool = databaseUrl ? new Pool({ connectionString: databaseUrl, max: 3, ssl: databaseUrl.includes("neon.tech") ? { rejectUnauthorized: false } : undefined }) : null;
let schema: Promise<void> | null = null;
async function ensureSchema() { if (!pool) throw new Error("PERSISTENCE_NOT_CONFIGURED"); schema ??= pool.query("CREATE TABLE IF NOT EXISTS verity_users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text UNIQUE NOT NULL, password_salt text NOT NULL, password_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now())").then(() => undefined); await schema; }
export function normalizeEmail(email: string) { return email.trim().toLowerCase(); }
export async function createUser(email: string, password: string) { await ensureSchema(); const normalized = normalizeEmail(email); const salt = randomBytes(16).toString("hex"); const hash = scryptSync(password, salt, 64).toString("hex"); const result = await pool!.query<{ id: string; email: string }>("INSERT INTO verity_users (email, password_salt, password_hash) VALUES ($1, $2, $3) RETURNING id, email", [normalized, salt, hash]); return result.rows[0]; }
export async function verifyUser(email: string, password: string) { await ensureSchema(); const result = await pool!.query<{ id: string; email: string; password_salt: string; password_hash: string }>("SELECT id, email, password_salt, password_hash FROM verity_users WHERE email = $1", [normalizeEmail(email)]); const user = result.rows[0]; if (!user) return null; const candidate = scryptSync(password, user.password_salt, 64); const expected = Buffer.from(user.password_hash, "hex"); return candidate.length === expected.length && timingSafeEqual(candidate, expected) ? { id: user.id, email: user.email } : null; }
