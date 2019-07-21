import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import "@typechain/hardhat";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import type { HardhatUserConfig } from "hardhat/config";
import { vars } from "hardhat/config";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();

const MNEMONIC: string = vars.get(
  "MNEMONIC",
  "test test test test test test test test test test test junk"
);
const SEPOLIA_RPC_URL: string = process.env.SEPOLIA_RPC_URL || vars.get("SEPOLIA_RPC_URL", "https://ethereum-sepolia-rpc.publicnode.com");
const PRIVATE_KEY: string | undefined = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY: string = process.env.ETHERSCAN_API_KEY || vars.get("ETHERSCAN_API_KEY", "");

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  namedAccounts: { deployer: 0 },
  etherscan: { apiKey: { sepolia: ETHERSCAN_API_KEY } },
  gasReporter: { currency: "USD", enabled: !!process.env.REPORT_GAS },
  networks: {
    hardhat: {
      chainId: 31337,
      accounts: { mnemonic: MNEMONIC },
    },
    localhost: {
      chainId: 31337,
      url: "http://127.0.0.1:8545",
      accounts: { mnemonic: MNEMONIC },
    },
    sepolia: {
      chainId: 11155111,
      url: SEPOLIA_RPC_URL,
