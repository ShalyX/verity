import fs from "node:fs";
import { JsonRpcProvider, Wallet, Contract, keccak256, toUtf8Bytes } from "ethers";
const e={}; for(const l of fs.readFileSync('.env.local','utf8').split(/\r?\n/)){const m=l.match(/^([^=]+)=(.*)$/);if(m)e[m[1]]=m[2]}
const payload=fs.readFileSync('artifacts/verity-receipt.json');
const root=keccak256(payload);
const p=new JsonRpcProvider(e.ZG_CHAIN_RPC_URL), s=new Wallet(e.ZG_DEPLOYER_PRIVATE_KEY,p);
const c=new Contract(e.ZG_RECEIPT_CONTRACT_ADDRESS,['function anchor(bytes32,string)','function anchoredAt(bytes32) view returns(uint64)','function storageUri(bytes32) view returns(string)'],s);
const tx=await c.anchor(root,'pending://0g-storage-upload'); const r=await tx.wait();
console.log(JSON.stringify({receiptHash:root,anchorTx:r.hash,block:r.blockNumber,anchoredAt:(await c.anchoredAt(root)).toString(),uri:await c.storageUri(root)}));
