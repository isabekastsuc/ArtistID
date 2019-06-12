import { JsonRpcProvider, type Eip1193Provider } from "ethers";
import { RelayerSDKLoader } from "./RelayerSDKLoader";

export type FhevmInstance = any;

const isSepolia = async (providerOrUrl: Eip1193Provider | string) => {
  if (typeof providerOrUrl === "string") {
    const p = new JsonRpcProvider(providerOrUrl);
    const id = Number((await p.getNetwork()).chainId);
    p.destroy();
    return id === 11155111;
  }
  const hex = (await providerOrUrl.request({ method: "eth_chainId" })) as string;
  return parseInt(hex, 16) === 11155111;
};
