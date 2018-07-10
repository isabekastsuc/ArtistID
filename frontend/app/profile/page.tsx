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
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-display font-bold mb-4 text-center bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
            艺术家详情
          </h1>
          <p className="text-slate-400 text-center mb-12 text-lg">
            查看资料与加密积分演示
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              钱包地址
            </label>
            <input
              placeholder="0x..."
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              className="input-artistic font-mono text-sm"
            />
          </div>

          {loading && (
            <div className="text-center text-slate-400 py-12">
              <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4">加载中...</p>
            </div>
          )}

          {!loading && profile && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
