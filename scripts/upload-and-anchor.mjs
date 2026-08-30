import fs from "node:fs";
import { Indexer, ZgFile } from "@0glabs/0g-ts-sdk";
import { JsonRpcProvider, Wallet, Contract } from "ethers";

function loadEnv() {
  for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2];
  }
}
loadEnv();
const required = ["ZG_CHAIN_RPC_URL", "ZG_STORAGE_ENDPOINT", "ZG_DEPLOYER_PRIVATE_KEY", "ZG_RECEIPT_CONTRACT_ADDRESS"];
for (const name of required) if (!process.env[name]) throw new Error(`MISSING_${name}`);
fs.mkdirSync("artifacts", { recursive: true });
const receipt = {
  schema: "verity.receipt.v1",
  claimId: "claim-001",
  claim: "Verity evidence receipt",
  decision: "approved",
  generatedAt: new Date().toISOString(),
  contract: process.env.ZG_RECEIPT_CONTRACT_ADDRESS
};
fs.writeFileSync("artifacts/verity-receipt.json", JSON.stringify(receipt, null, 2));
const provider = new JsonRpcProvider(process.env.ZG_CHAIN_RPC_URL);
const signer = new Wallet(process.env.ZG_DEPLOYER_PRIVATE_KEY, provider);
const indexer = new Indexer(process.env.ZG_STORAGE_ENDPOINT);
const file = await ZgFile.fromFilePath("artifacts/verity-receipt.json");
const [tree, treeErr] = await file.merkleTree();
if (treeErr) throw treeErr;
const root = tree.rootHash();
const [uploadTx, uploadErr] = await indexer.upload(file, process.env.ZG_CHAIN_RPC_URL, signer);
await file.close();
if (uploadErr) throw uploadErr;
const abi = ["function anchor(bytes32 receiptHash, string uri)", "function anchoredAt(bytes32) view returns (uint64)", "function storageUri(bytes32) view returns (string)"];
const anchor = new Contract(process.env.ZG_RECEIPT_CONTRACT_ADDRESS, abi, signer);
const tx = await anchor.anchor(root, `${process.env.ZG_STORAGE_ENDPOINT}/file/${root}`);
const mined = await tx.wait();
const anchoredAt = await anchor.anchoredAt(root);
const storedUri = await anchor.storageUri(root);
console.log(JSON.stringify({ rootHash: root, storageTx: uploadTx, anchorTx: mined.hash, anchorBlock: mined.blockNumber, anchoredAt: anchoredAt.toString(), storedUri }));
