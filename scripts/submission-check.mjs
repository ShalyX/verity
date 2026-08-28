import { existsSync, readFileSync } from "node:fs";

const required = ["README.md", "DEMO_STEPS.md", "SUBMISSION.md", "src/app/page.tsx", "src/app/review/page.tsx"];
const missing = required.filter((file) => !existsSync(file));
if (missing.length) {
  console.error(`Missing required submission files: ${missing.join(", ")}`);
  process.exit(1);
}
const forbidden = /DEMO_VIDEO_URL_HERE|FRESH_DEMO_TX_HASH_HERE|PRIVATE_KEY|API_KEY/;
const checked = ["README.md", "DEMO_STEPS.md", "SUBMISSION.md"].map((file) => [file, readFileSync(file, "utf8")]);
const hit = checked.find(([, text]) => forbidden.test(text));
if (hit) {
  console.error(`Forbidden placeholder or secret-like text in ${hit[0]}`);
  process.exit(1);
}
console.log("submission pack: PASS");
console.log(`required files: ${required.length}`);
console.log("live-evidence boundary: explicit");
