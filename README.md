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

A public Cloudflare quick tunnel can expose the local build for review without buying a domain. The tunnel URL is temporary and is not a production deployment.

The current product uses deterministic fixture data so the review workflow is reproducible. 0G Storage and 0G Chain are intentionally described as planned adapters, not live integrations. No on-chain transaction, explorer URL, or deployment claim should be inferred from the local receipt.

## Demo

See [`DEMO_STEPS.md`](./DEMO_STEPS.md) for the judge path and [`SUBMISSION.md`](./SUBMISSION.md) for paste-ready submission copy and the explicit live-evidence boundary.
