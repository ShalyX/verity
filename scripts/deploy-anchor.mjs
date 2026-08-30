import fs from "node:fs";
import solc from "solc";
import { ContractFactory, JsonRpcProvider, Wallet } from "ethers";

const source = fs.readFileSync("contracts/VerityReceiptAnchor.sol", "utf8");
const input = { language: "Solidity", sources: { "VerityReceiptAnchor.sol": { content: source } }, settings: { optimizer: { enabled: true, runs: 200 }, outputSelection: { "*": { "*": ["abi", "evm.bytecode", "evm.deployedBytecode"] } } } };
const output = JSON.parse(solc.compile(JSON.stringify(input)));
const contract = output.contracts["VerityReceiptAnchor.sol"].VerityReceiptAnchor;
if (!contract?.evm.bytecode.object) throw new Error("COMPILE_FAILED");
const provider = new JsonRpcProvider(process.env.ZG_CHAIN_RPC_URL);
const wallet = new Wallet(process.env.ZG_DEPLOYER_PRIVATE_KEY, provider);
const factory = new ContractFactory(contract.abi, contract.evm.bytecode.object, wallet);
const deployed = await factory.deploy();
const receipt = await deployed.deploymentTransaction().wait();
const address = await deployed.getAddress();
console.log(JSON.stringify({ address, deployTx: receipt.hash, block: receipt.blockNumber, gasUsed: receipt.gasUsed.toString(), bytecodeLength: contract.evm.deployedBytecode.object.length / 2 }));
