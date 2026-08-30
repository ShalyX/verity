# Verity

Verity is an evidence-first review workspace for AI-generated claims. It gives a reviewer a direct line from generated language to source evidence, then records an explicit decision boundary before publication.

## Working product

- Public landing page at `/`
- Review workspace at `/review`
- Three seeded claims with supported, uncertain, and contradicted states
- Source excerpt and page reference beside the selected claim
- Reviewer classification controls
- Hash-backed case receipt with input and output hashes
- Guarded approval: unresolved evidence prevents a false approval and moves the case to `NEEDS EVIDENCE`
- Reduced-motion support and responsive layout

## Run locally

```bash
npm install
npm run dev
```

For the production build:

```bash
npm run lint
npm run build
npm run start -- -p 3099
```

## Live verification boundary

Production uses managed Neon Postgres for durable case state and 0G mainnet for receipt storage and anchoring. The hosted readiness check remains fail-closed until those dependencies and a verified storage root are present.

The local scripts under `scripts/` require environment variables from `.env.local`; no wallet keys or provider credentials are committed. Proof artifacts are generated locally and are intentionally ignored by Git.

## Demo

See [`DEMO_STEPS.md`](./DEMO_STEPS.md) for the judge path and [`SUBMISSION.md`](./SUBMISSION.md) for paste-ready submission copy and the explicit live-evidence boundary.
