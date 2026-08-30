import fs from "node:fs";
import crypto from "node:crypto";
import { Indexer } from "@0gfoundation/0g-storage-ts-sdk";
const e={}; for(const l of fs.readFileSync('.env.local','utf8').split(/\r?\n/)){const m=l.match(/^([^=]+)=(.*)$/);if(m)e[m[1]]=m[2]}
const root=e.ZG_STORAGE_ROOT_HASH; const out='artifacts/verity-receipt-downloaded.json';
const indexer=new Indexer(e.ZG_STORAGE_ENDPOINT); const err=await indexer.download(root,out,true); if(err) throw err;
const a=fs.readFileSync('artifacts/verity-receipt.json'); const b=fs.readFileSync(out);
console.log(JSON.stringify({rootHash:root,downloadedBytes:b.length,localSha256:crypto.createHash('sha256').update(a).digest('hex'),downloadedSha256:crypto.createHash('sha256').update(b).digest('hex'),byteEqual:a.equals(b)}));
