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
                className="card-artistic relative"
              >
                <div className="absolute top-4 right-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">✓</span>
                  </div>
                </div>

                <h2 className="text-3xl font-display font-bold mb-6 text-white">
                  {profile.name}
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">类别</p>
                    <div className="inline-block px-4 py-2 glass rounded-lg">
                      <span className="text-primary-300 font-medium">{profile.category}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-1">个人简介</p>
                    <p className="text-slate-200 leading-relaxed">{profile.bio}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-1">作品集</p>
                    <a
                      href={profile.portfolioURI}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 break-all text-sm font-mono transition-colors"
                    >
                      {profile.portfolioURI}
                    </a>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-1">钱包地址</p>
                    <p className="text-slate-300 font-mono text-xs break-all">{profile.wallet}</p>
                  </div>
                </div>
              </motion.div>

              {/* FHEVM Demo Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="card-artistic"
              >
                <h2 className="text-2xl font-display font-bold mb-6 text-white flex items-center">
                  <span className="mr-2">🔐</span>
                  加密积分演示
                </h2>

                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  使用 FHEVM 同态加密存储与计算艺术家积分，支持链上加密运算与用户解密。
                </p>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={inc}
                      className={`btn-primary flex-1 ${op === "done" ? "btn-success" : op === "error" ? "btn-error" : ""}`}
                      disabled={op !== "idle"}
                    >
                      {op === "inc" ? (<span className="flex items-center justify-center gap-2"><span className="spinner"></span> 执行中...</span>) : op === "done" ? "完成" : op === "error" ? "失败" : "➕ 加分"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={dec}
                      className={`btn-secondary flex-1 ${op === "done" ? "btn-success" : op === "error" ? "btn-error" : ""}`}
                      disabled={op !== "idle"}
                    >
                      {op === "dec" ? (<span className="flex items-center justify-center gap-2"><span className="spinner"></span> 执行中...</span>) : op === "done" ? "完成" : op === "error" ? "失败" : "➖ 减分"}
                    </motion.button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={decp}
                    className={`btn-secondary w-full ${op === "done" ? "btn-success" : op === "error" ? "btn-error" : ""}`}
                    disabled={op !== "idle"}
                  >
                    {op === "decrypt" ? (<span className="flex items-center justify-center gap-2"><span className="spinner"></span> 解密中...</span>) : op === "done" ? "完成" : op === "error" ? "失败" : "🔓 解密积分"}
                  </motion.button>

                  {repClear !== undefined && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass p-6 rounded-xl text-center"
                    >
                      <p className="text-sm text-slate-400 mb-2">解密后的积分值</p>
                      <p className="text-4xl font-bold text-primary-400">{String(repClear)}</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {!loading && !profile && addr && (
            <div className="card-artistic text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-slate-300 text-lg">该地址尚未注册</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
