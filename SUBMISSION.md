# AKINDO submission pack: Verity

## One-line description

Verity is an evidence-first review workspace that lets people inspect AI-generated claims against source evidence before those claims become published facts.

## Problem

AI-generated reports compress uncertainty into confident prose. Reviewers need to see the exact evidence behind each claim, make an explicit classification, and preserve the decision record.

## What is built

Verity includes a landing page, a dedicated review workspace, deterministic claim extraction fixtures, source excerpts, supported/needs-evidence/contradicted classification, receipt generation, and a guarded approval state. A case with unresolved evidence cannot be represented as approved.

## Why the workflow matters

The product separates three actions that are often blurred together: extract the claim, ground it in evidence, and decide what can ship. The receipt records the input and output hashes so the reviewer decision is inspectable after the review.

## Current proof boundary

- Working: public browser-accessible landing page and review workflow.
- Working: local hash-backed receipt presentation and approval guard.
- Not yet live: 0G Storage upload, 0G Chain receipt anchoring, public explorer transaction proof, Vercel deployment, and demo video.
- No fabricated contract address, transaction hash, explorer link, or deployment URL is included.

## Demo URL

Temporary public review URL: https://parameters-pat-quiz-establish.trycloudflare.com

This URL is a quick tunnel to the local process, not a durable deployment. It may expire when the tunnel process stops.

## Repository

The source repository is local at the time of this pack. Add the final public GitHub URL only after the intended repository has been pushed and independently checked.

## Integration path

The next implementation slice is a 0G adapter with two independently verified operations: store the evidence bundle and anchor the canonical receipt hash. The UI must label local, submitted, and confirmed states separately and only display explorer proof after transaction readback.
