#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const root = resolve(process.cwd(), "..");
const hhDeployments = resolve(root, "fhevm-hardhat-template/deployments");

function readJson(p) {
  return JSON.parse(readFileSync(p, "utf8"));
}
