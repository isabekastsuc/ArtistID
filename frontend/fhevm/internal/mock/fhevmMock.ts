import { JsonRpcProvider } from "ethers";
import { MockFhevmInstance } from "@fhevm/mock-utils";

export async function fhevmMockCreateInstance({ rpcUrl }: { rpcUrl: string }) {
  const provider = new JsonRpcProvider(rpcUrl);
  // 尝试读取 FHEVM relayer metadata，如果不可用，使用默认本地预设
  try {
    const meta = await provider.send("fhevm_relayer_metadata", []);
    const instance = await MockFhevmInstance.create(provider, provider, {
      aclContractAddress: meta.ACLAddress,
      inputVerifierContractAddress: meta.InputVerifierAddress,
      kmsContractAddress: meta.KMSVerifierAddress,
      chainId: Number((await provider.getNetwork()).chainId),
      gatewayChainId: 55815,
      verifyingContractAddressDecryption: meta.VerifyingContractDecryption ?? "0x5ffdaAB0373E62E2ea2944776209aEf29E631A64",
      verifyingContractAddressInputVerification: meta.VerifyingContractInput ?? "0x812b06e1CDCE800494b79fFE4f925A504a9A9810",
    });
    return instance;
  } catch {
    const instance = await MockFhevmInstance.create(provider, provider, {
      aclContractAddress: "0x50157CFfD6bBFA2DECe204a89ec419c23ef5755D",
      inputVerifierContractAddress: "0x901F8942346f7AB3a01F6D7613119Bca447Bb030",
      kmsContractAddress: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
      chainId: 31337,
      gatewayChainId: 55815,
