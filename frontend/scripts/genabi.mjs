#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const root = resolve(process.cwd(), "..");
const hhDeployments = resolve(root, "fhevm-hardhat-template/deployments");

function readJson(p) {
  return JSON.parse(readFileSync(p, "utf8"));
}

function gen() {
  const outAbi = resolve(process.cwd(), "abi/ArtistIDABI.ts");
  const outAddr = resolve(process.cwd(), "abi/ArtistIDAddresses.ts");

  const networks = ["localhost", "sepolia"]; // extend when needed
  let addressMap = {};
  let abi = null;

  for (const net of networks) {
    try {
      const f = resolve(hhDeployments, `${net}/ArtistID.json`);
      const j = readJson(f);
      addressMap[net] = {
        address: j.address,
        chainId: j.chainId,
        chainName: net,
      };
      abi = j.abi;
    } catch {}
  }

  mkdirSync(dirname(outAbi), { recursive: true });
  mkdirSync(dirname(outAddr), { recursive: true });

  writeFileSync(
    outAbi,
    `export const ArtistIDABI = ${JSON.stringify({ abi }, null, 2)} as const;\n`
  );
  writeFileSync(
    outAddr,
    `export const ArtistIDAddresses = ${JSON.stringify(addressMap, null, 2)} as const;\n`
  );
  console.log("ABI and addresses generated.");
}

gen();



