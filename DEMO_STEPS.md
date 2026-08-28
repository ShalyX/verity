# Verity demo path

Target length: 90 seconds.

1. Open `/` and show the positioning: AI drafts, a human decides if the claim holds.
2. Select **Open workspace**.
3. In `/review`, point out the three claim states: supported, uncertain, and contradicted.
4. Open `CLM-001`. Show the claim beside its source excerpt, page reference, and source hash.
5. Change the classification to **Needs evidence**. The reviewer action is explicit and visible.
6. Click **View receipt**. Show the input hash, output hash, and local verification marker.
7. Click **Approve review**. The case must not be falsely approved while unresolved claims remain. The status changes to **NEEDS EVIDENCE**.
8. Close on the product boundary: Verity preserves the decision record. 0G anchoring is a separate integration step and is not claimed until a real transaction is read back.

## Verification commands

```bash
npm run lint
npm run build
npm run submission:check
```
