"use client";

import { useMemo, useState } from "react";

type ClaimState = "supported" | "uncertain" | "contradicted";
type Claim = { id: string; text: string; state: ClaimState; source: string; note: string };
type CaseRecord = { id: string; title: string; status: "review" | "approved" | "needs-evidence"; claims: Claim[]; inputHash: string; outputHash: string; updatedAt: string };

function Mark({ state }: { state: ClaimState }) {
  return <span className={`mark ${state}`} aria-hidden="true">{state === "supported" ? "✓" : state === "contradicted" ? "×" : "?"}</span>;
}

export default function ReviewClient({ initialCase }: { initialCase: CaseRecord }) {
  const [claims, setClaims] = useState(initialCase.claims);
  const [selected, setSelected] = useState(initialCase.claims[0]?.id ?? "");
  const [caseStatus, setCaseStatus] = useState(initialCase.status);
  const [receipt, setReceipt] = useState(false);

  const active = claims.find((claim) => claim.id === selected) ?? claims[0];
  const counts = useMemo(() => ({
    supported: claims.filter((c) => c.state === "supported").length,
    uncertain: claims.filter((c) => c.state === "uncertain").length,
    contradicted: claims.filter((c) => c.state === "contradicted").length,
  }), [claims]);
  if (!active) return <main className="app-shell"><section className="panel"><h1>No claims</h1><p>This case has no claims to review.</p></section></main>;

  function markClaim(state: ClaimState) {
    setClaims((current) => current.map((claim) => claim.id === selected ? { ...claim, state } : claim));
    setReceipt(false);
  }

  function approveCase() {
    setCaseStatus(counts.contradicted ? "needs-evidence" : "approved");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Verity home">
          <span className="brand-mark"><svg viewBox="0 0 32 32" role="img" aria-label="Verity mark"><path d="M6 8.5 16 24 26 8.5"/><path d="M10.5 8.5h11"/><circle cx="16" cy="24" r="2.5"/></svg></span>
          <span>verity</span>
        </a>
        <div className="top-context"><span className="live-dot" /> Local review workspace <span className="slash">/</span> Case VC-1048</div>
        <button className="text-button" onClick={() => setReceipt(true)}>View receipt</button>
      </header>

      <section className="intro" id="top">
        <div>
          <p className="eyebrow">Verification case <span>VC-1048</span></p>
          <h1>Review what the model said<br />before anyone ships it.</h1>
          <p className="lede">Trace every AI-generated claim to its source, resolve the gaps, and leave an evidence record a reviewer can stand behind.</p>
        </div>
        <div className="case-meta">
          <span className={`status status-${caseStatus}`}>{caseStatus === "review" ? "In review" : caseStatus === "approved" ? "Approved" : "Needs evidence"}</span>
          <span className="meta-line">Quarterly pilot report</span>
          <span className="meta-line">3 claims · 3 sources</span>
        </div>
      </section>

      <section className="summary-strip" aria-label="Case summary">
        <div><span className="summary-label">Evidence coverage</span><strong>{Math.round((counts.supported / claims.length) * 100)}%</strong><span className="summary-note">{counts.supported} of {claims.length} supported</span></div>
        <div><span className="summary-label">Review state</span><strong>{caseStatus === "review" ? "Open" : caseStatus === "approved" ? "Cleared" : "Blocked"}</strong><span className="summary-note">Human decision required</span></div>
        <div><span className="summary-label">Receipt</span><strong>{receipt ? "Created" : "Pending"}</strong><span className="summary-note">Hash-backed case record</span></div>
        <div className="summary-action"><button className="primary" onClick={approveCase}>{caseStatus === "approved" ? "Case approved" : "Approve review"}<span>→</span></button></div>
      </section>

      <section className="review-grid" aria-label="Claim review">
        <div className="claims-panel panel">
          <div className="panel-head"><div><p className="eyebrow">Claim register</p><h2>What needs your attention</h2></div><span className="count">{claims.length} claims</span></div>
          <div className="claim-list">
            {claims.map((claim) => <button key={claim.id} className={`claim-row ${claim.id === selected ? "selected" : ""}`} onClick={() => setSelected(claim.id)}><Mark state={claim.state} /><span className="claim-copy"><span className="claim-id">{claim.id}</span><span className="claim-text">{claim.text}</span><span className="claim-source">{claim.source}</span></span><span className="row-arrow">↗</span></button>)}
          </div>
          <div className="legend"><span><i className="legend-dot supported" />Supported {counts.supported}</span><span><i className="legend-dot uncertain" />Uncertain {counts.uncertain}</span><span><i className="legend-dot contradicted" />Contradicted {counts.contradicted}</span></div>
        </div>

        <div className="evidence-panel panel">
          <div className="panel-head"><div><p className="eyebrow">Evidence view</p><h2>{active.id}</h2></div><Mark state={active.state} /></div>
          <div className="claim-focus"><p className="focus-label">Extracted claim</p><p className="focus-claim">{active.text}</p></div>
          <div className="source-card"><div className="source-head"><span className="source-icon">⌁</span><div><strong>{active.source}</strong><span>Imported source excerpt</span></div><span className="source-ref">p. {active.id === "CLM-001" ? "2" : active.id === "CLM-002" ? "1" : "4"}</span></div><blockquote>{active.id === "CLM-001" ? "Across the six-week pilot, average review time fell from 38 minutes to 22 minutes, a 42% reduction." : active.id === "CLM-002" ? "The evaluation covered PDF and DOCX submissions from the pilot cohort." : "A reviewer must approve the evidence record before the report can be published."}</blockquote><div className="source-foot"><span>Source hash</span><code>sha256: 9bf2...a81c</code><span className="verified-text">Locally verified</span></div></div>
          <div className="review-note"><span className="note-label">Reviewer note</span><p>{active.note}</p></div>
          <div className="decision-bar"><span>Change classification</span><div className="decision-buttons"><button className={active.state === "supported" ? "active supported-btn" : ""} onClick={() => markClaim("supported")}>Supported</button><button className={active.state === "uncertain" ? "active uncertain-btn" : ""} onClick={() => markClaim("uncertain")}>Needs evidence</button><button className={active.state === "contradicted" ? "active contradicted-btn" : ""} onClick={() => markClaim("contradicted")}>Contradicted</button></div></div>
        </div>
      </section>

      {receipt && <section className="receipt panel" aria-live="polite"><div><p className="eyebrow">Verification receipt</p><h2>Case record created</h2><p>VC-1048 is ready for an evidence-backed reviewer handoff.</p></div><div className="receipt-data"><span>Input hash <code>sha256: 1a4c...f09e</code></span><span>Output hash <code>sha256: 9bf2...a81c</code></span><span>Proof state <b>Fixture-backed</b></span></div><button className="text-button" onClick={() => setReceipt(false)}>Dismiss</button></section>}

      <footer><span>Verity / evidence before confidence</span><span>Fixture-backed review · 28 Aug 2026</span></footer>
    </main>
  );
}
