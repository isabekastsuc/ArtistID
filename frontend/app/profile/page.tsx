"use client";

import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { useArtistID } from "@/hooks/useArtistID";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [provider, setProvider] = useState<ethers.Eip1193Provider | undefined>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [addr, setAddr] = useState<string>("");
  const [profile, setProfile] = useState<any>(undefined);
  const [repClear, setRepClear] = useState<any>(undefined);
  const [loading, setLoading] = useState(false);
  const [op, setOp] = useState<"idle" | "inc" | "dec" | "decrypt" | "done" | "error">("idle");

  useEffect(() => {
    const eth = (window as any).ethereum as ethers.Eip1193Provider | undefined;
    if (!eth) return;
    setProvider(eth);
    eth.request?.({ method: "eth_chainId" }).then((hex) => setChainId(parseInt(hex as string, 16)));
    eth.request?.({ method: "eth_requestAccounts" }).then((accs) => setAddr((accs as string[])[0] ?? ""));
  }, []);

  const { getProfile, getTokenIdOf, fetchEncryptedReputation, addOrSubRep, decryptReputation } = useArtistID({ provider, chainId });

  const load = async () => {
    if (!addr) return;
    setLoading(true);
    const p = await getProfile(addr);
    setProfile(p);
    const id = await getTokenIdOf(addr);
    if (id && id > 0n) {
      await fetchEncryptedReputation(id);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [addr]);

  const inc = async () => {
    try {
      setOp("inc");
      const id = await getTokenIdOf(addr);
      await addOrSubRep(id, 1, "add");
      setOp("done");
      setTimeout(() => setOp("idle"), 1200);
    } catch {
      setOp("error");
      setTimeout(() => setOp("idle"), 1500);
    }
  };
  const dec = async () => {
    try {
      setOp("dec");
      const id = await getTokenIdOf(addr);
      await addOrSubRep(id, 1, "sub");
      setOp("done");
      setTimeout(() => setOp("idle"), 1200);
    } catch {
      setOp("error");
      setTimeout(() => setOp("idle"), 1500);
    }
  };
  const decp = async () => {
    try {
      setOp("decrypt");
      const v = await decryptReputation(addr);
      setRepClear(v);
      setOp("done");
      setTimeout(() => setOp("idle"), 1200);
    } catch {
      setOp("error");
      setTimeout(() => setOp("idle"), 1500);
    }
  };

  return (
