"use client";

import { useCallback, useMemo, useState } from "react";
import { ethers } from "ethers";
import { ArtistIDABI } from "@/abi/ArtistIDABI";
import { ArtistIDAddresses } from "@/abi/ArtistIDAddresses";
import { createFhevmInstance } from "@/fhevm/internal/fhevm";

export function useArtistID(params: { provider?: ethers.Eip1193Provider | string; chainId?: number; address?: string }) {
  const { provider, address } = params;
  const [message, setMessage] = useState("");
  const [handleTotal, setHandleTotal] = useState<string | undefined>(undefined);
  const [repHandle, setRepHandle] = useState<string | undefined>(undefined);

  const net = useMemo(() => {
    if (!params.chainId) return undefined;
    return params.chainId === 31337 ? "localhost" : params.chainId === 11155111 ? "sepolia" : undefined;
  }, [params.chainId]);

  const artistID = useMemo(() => {
    if (!net) return undefined as any;
    const meta = (ArtistIDAddresses as any)[net];
    if (!meta?.address) return undefined as any;
    const runner = typeof provider === "string" ? new ethers.JsonRpcProvider(provider) : new ethers.BrowserProvider(provider!);
    return new ethers.Contract(meta.address, ArtistIDABI.abi, runner);
  }, [provider, net]);

  const register = useCallback(async (name: string, bio: string, portfolioURI: string, category: string) => {
    if (!artistID || !provider) return;
    if (typeof provider === "string") {
      throw new Error("a wallet signer is required for this operation - an RPC URL cannot sign");
    }
    const signer = await new ethers.BrowserProvider(provider).getSigner();
    const contract = artistID.connect(signer);
    const tx = await contract.registerArtist(name, bio, portfolioURI, category);
    setMessage(`tx=${tx.hash}`);
    await tx.wait();
  }, [artistID, provider]);

  const fetchEncryptedTotal = useCallback(async () => {
    if (!artistID || !provider) return;
    const handle = await artistID.getEncryptedTotalArtists();
    setHandleTotal(handle);
    return handle as string;
  }, [artistID, provider]);

  const decryptTotal = useCallback(async () => {
    if (!provider) return;
    const instance = await createFhevmInstance(provider);
    // 公共解密
    if (!artistID) return;
    const addr = (ArtistIDAddresses as any)[net!]?.address as `0x${string}`;
    if (!addr || !handleTotal) return;
    // 若走 relayer-sdk：instance.decryptPublic(contract, handle)
    if ((window as any).relayerSDK) {
      const clear = await instance.decryptPublic(addr, handleTotal);
      return clear;
    }
    // 本地 mock：userDecrypt 略。此处直接返回 undefined（页面演示为主）。
    return undefined;
  }, [provider, artistID, net, handleTotal]);

  const isArtist = useCallback(async (user: string) => {
    if (!artistID) return false;
    const res = await artistID.isArtist(user);
    return !!res;
  }, [artistID]);

  const getProfile = useCallback(async (user: string) => {
    if (!artistID) return undefined as any;
    try {
      const p = await artistID.getArtistProfile(user);
      return p as { name: string; bio: string; portfolioURI: string; category: string; createdAt: bigint; wallet: string };
    } catch {
      return undefined as any;
    }
  }, [artistID]);

  const getTokenIdOf = useCallback(async (user: string) => {
    if (!artistID) return 0n;
    try {
      const id = await artistID.tokenIdOf(user);
      return id as bigint;
    } catch { return 0n; }
  }, [artistID]);

  const fetchEncryptedReputation = useCallback(async (tokenId: bigint) => {
    if (!artistID) return;
    const h = await artistID.getEncryptedReputation(tokenId);
    setRepHandle(h);
    return h as string;
  }, [artistID]);

  const addOrSubRep = useCallback(async (tokenId: bigint, value: number, op: "add" | "sub") => {
    if (!provider || !artistID) return;
    const addr = (ArtistIDAddresses as any)[net!]?.address as `0x${string}`;
    if (!addr) return;
    const instance = await createFhevmInstance(provider);

    if (typeof provider === "string") {
      throw new Error("a wallet signer is required for this operation - an RPC URL cannot sign");
    }
    const signer = await new ethers.BrowserProvider(provider).getSigner();

    const contract = artistID.connect(signer);
    const userAddress = await signer.getAddress();

    const input = instance.createEncryptedInput(addr, userAddress);
    input.add32(BigInt(Math.abs(value)));
    const enc = await input.encrypt();

    if (op === "add") {
      const tx = await contract.addReputation(tokenId, enc.handles[0], enc.inputProof);
      setMessage(`add tx=${tx.hash}`);
      await tx.wait();
    } else {
      const tx = await contract.subReputation(tokenId, enc.handles[0], enc.inputProof);
      setMessage(`sub tx=${tx.hash}`);
      await tx.wait();
    }
    const fresh = await contract.getEncryptedReputation(tokenId);
    setRepHandle(fresh as string);
  }, [artistID, provider, net]);

  const decryptReputation = useCallback(async (user: string) => {
    if (!provider || !artistID) return undefined;
    const addr = (ArtistIDAddresses as any)[net!]?.address as `0x${string}`;
    if (!addr || !repHandle) return undefined;
    const instance = await createFhevmInstance(provider);
    if (typeof provider === "string") {
      throw new Error("a wallet signer is required for this operation - an RPC URL cannot sign");
    }
    const signer = await new ethers.BrowserProvider(provider).getSigner();
    const userAddress = await signer.getAddress();

    const { publicKey, privateKey } = instance.generateKeypair();
    const start = Math.floor(Date.now() / 1000);
    const durationDays = 365;
    const eip712 = instance.createEIP712(publicKey, [addr], start, durationDays);
    const signature = await signer.signTypedData(eip712.domain, { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification }, eip712.message);

    const res = await instance.userDecrypt(
      [{ handle: repHandle, contractAddress: addr }],
      privateKey,
      publicKey,
      signature,
      [addr],
      userAddress,
      start,
      durationDays
    );
    return res[repHandle];
  }, [artistID, provider, repHandle, net]);

  const decryptReputationByTokenId = useCallback(async (tokenId: bigint, user: string) => {
    if (!provider || !artistID) return undefined;
    const addr = (ArtistIDAddresses as any)[net!]?.address as `0x${string}`;
    if (!addr) return undefined;
    const instance = await createFhevmInstance(provider);
    if (typeof provider === "string") {
      throw new Error("a wallet signer is required for this operation - an RPC URL cannot sign");
    }
    const signer = await new ethers.BrowserProvider(provider).getSigner();
    const userAddress = await signer.getAddress();

    // 直接读取最新的加密句柄，避免异步 setState 延迟
    const handle = await artistID.getEncryptedReputation(tokenId) as string;

    const { publicKey, privateKey } = instance.generateKeypair();
    const start = Math.floor(Date.now() / 1000);
    const durationDays = 365;
    const eip712 = instance.createEIP712(publicKey, [addr], start, durationDays);
    const signature = await signer.signTypedData(
      eip712.domain,
      { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
      eip712.message
    );

    const res = await instance.userDecrypt(
      [{ handle, contractAddress: addr }],
      privateKey,
      publicKey,
      signature,
      [addr],
      userAddress,
      start,
      durationDays
    );
    return res[handle];
  }, [artistID, provider, net]);

  return {
    message,
    register,
    fetchEncryptedTotal,
    decryptTotal,
    isArtist,
    getProfile,
    getTokenIdOf,
    fetchEncryptedReputation,
    addOrSubRep,
    decryptReputation,
    decryptReputationByTokenId
  };
}


