import { JsonRpcProvider, type Eip1193Provider } from "ethers";
import { RelayerSDKLoader } from "./RelayerSDKLoader";

export type FhevmInstance = any;

const isSepolia = async (providerOrUrl: Eip1193Provider | string) => {
  if (typeof providerOrUrl === "string") {
