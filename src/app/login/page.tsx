"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter(); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setBusy(true); setError(""); const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) }); setBusy(false); if (!response.ok) { setError(response.status === 503 ? "Login is not configured yet." : "Invalid email or password."); return; } router.push("/review"); router.refresh(); }
  return <main className="app-shell"><section className="panel" style={{ maxWidth: 480, margin: "10vh auto" }}><p className="eyebrow">Verity account</p><h1>Sign in to review cases.</h1><form onSubmit={submit} style={{ display: "grid", gap: 16 }}><label>Email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p role="alert">{error}</p>}<button className="primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}<span>→</span></button></form></section></main>;
}
