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
