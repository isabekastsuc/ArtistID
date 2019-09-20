import { JsonRpcProvider } from "ethers";
import { MockFhevmInstance } from "@fhevm/mock-utils";

export async function fhevmMockCreateInstance({ rpcUrl }: { rpcUrl: string }) {
  const provider = new JsonRpcProvider(rpcUrl);
  // 尝试读取 FHEVM relayer metadata，如果不可用，使用默认本地预设
  try {
    const meta = await provider.send("fhevm_relayer_metadata", []);
