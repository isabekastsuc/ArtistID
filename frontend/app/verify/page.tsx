"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useArtistID } from "@/hooks/useArtistID";
import { motion, AnimatePresence } from "framer-motion";

export default function VerifyPage() {
  const [provider, setProvider] = useState<ethers.Eip1193Provider | undefined>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [addr, setAddr] = useState<string>("");
  const [result, setResult] = useState<{ verified: boolean; profile?: any } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const eth = (window as any).ethereum as ethers.Eip1193Provider | undefined;
    if (!eth) return;
    setProvider(eth);
    eth.request?.({ method: "eth_chainId" }).then((hex) => setChainId(parseInt(hex as string, 16)));
    (async () => {
      try {
        const signer = await new ethers.BrowserProvider(eth).getSigner();
        setViewer(await signer.getAddress());
      } catch {}
    })();
  }, []);

  const { isArtist, getProfile, decryptReputationByTokenId, getTokenIdOf } = useArtistID({ provider, chainId });
  const [revealed, setRevealed] = useState(false);
  const [op, setOp] = useState<"idle"|"decrypt"|"done"|"error">("idle");
  const [viewer, setViewer] = useState<string | undefined>(undefined);
  const [hint, setHint] = useState<string | undefined>(undefined);

  const run = async () => {
    if (!addr) return;
    setLoading(true);
    setResult(null);
    
    try {
      const ok = await isArtist(addr);
      if (!ok) {
        setResult({ verified: false });
      } else {
        const p = await getProfile(addr);
        setResult({ verified: true, profile: p });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-display font-bold mb-4 text-center bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
            验证艺术家身份
          </h1>
          <p className="text-slate-400 text-center mb-12 text-lg">
            输入钱包地址或 ENS 查询认证状态
          </p>

          <div className="card-artistic mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="输入钱包地址 (0x...) 或 ENS"
                value={addr}
                onChange={(e) => setAddr(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && run()}
                className="input-artistic flex-1 font-mono text-sm"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={run}
                disabled={!addr || loading}
                className="btn-primary px-8"
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    查询中...
                  </span>
                ) : (
                  '🔍 查询'
                )}
              </motion.button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={result.verified ? 'verified' : 'not-verified'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {result.verified && result.profile ? (
                  <div className="card-artistic relative overflow-hidden card-clickable" onClick={async () => {
                    if (revealed || !provider) return;
                    try {
                      if (!viewer || !addr || viewer.toLowerCase() !== addr.toLowerCase()) {
                        setHint(`需要 ${addr.slice(0,6)}...${addr.slice(-4)} 的钱包签名，请切换后重试`);
                        setOp("error");
                        setTimeout(() => setOp("idle"), 1500);
                        return;
                      }
                      setOp("decrypt");
                      const id = await getTokenIdOf(addr);
                      await decryptReputationByTokenId(id, addr);
                      setOp("done");
                      setTimeout(() => { setOp("idle"); setRevealed(true); }, 600);
                    } catch (e) {
                      setOp("error");
                      setTimeout(() => setOp("idle"), 1200);
                    }
                  }}>
                    {/* Success Badge */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-bl-full"></div>
                    <div className="absolute top-4 right-4">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", duration: 0.6 }}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50"
                      >
                        <span className="text-white text-3xl">✓</span>
                      </motion.div>
                    </div>

                    <div className={`relative z-10 ${revealed ? '' : 'blurred'}`}>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="inline-block px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg mb-6">
                          <span className="text-green-300 font-semibold">✓ 已认证艺术家</span>
                        </div>
