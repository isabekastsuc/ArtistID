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
    const signer = typeof provider === "string" ? new ethers.Wallet(ethers.Wallet.createRandom().privateKey, new ethers.JsonRpcProvider(provider)) : await new ethers.BrowserProvider(provider).getSigner();
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
