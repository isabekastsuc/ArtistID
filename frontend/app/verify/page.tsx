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

                        <h2 className="text-4xl font-display font-bold mb-2 text-white">
                          {result.profile.name}
                        </h2>
                        <div className="inline-block px-3 py-1 glass rounded-lg mb-6">
                          <span className="text-primary-300 text-sm font-medium">{result.profile.category}</span>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-slate-400 mb-2">个人简介</p>
                            <p className="text-slate-200 leading-relaxed text-lg">{result.profile.bio}</p>
                          </div>

                          <div>
                            <p className="text-sm text-slate-400 mb-2">作品集</p>
                            <a
                              href={result.profile.portfolioURI}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-400 hover:text-primary-300 break-all font-mono text-sm transition-colors inline-flex items-center"
                            >
                              {result.profile.portfolioURI}
                              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>

                          <div>
                            <p className="text-sm text-slate-400 mb-2">钱包地址</p>
                            <p className="text-slate-300 font-mono text-xs break-all">{result.profile.wallet}</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                    {!revealed && (
                      <div className="reveal-overlay">
                        <div className="lock">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M7 11V7a5 5 0 1 1 10 0v4"/><rect x="5" y="11" width="14" height="10" rx="2"/></svg>
                        </div>
                        <span className="hint">{hint ?? '点击解密以查看完整资料（需艺术家钱包签名）'}</span>
                        {op === 'decrypt' && <span className="spinner" style={{marginLeft:8}}></span>}
                        {op === 'done' && <span style={{marginLeft:8}}>完成</span>}
                        {op === 'error' && <span style={{marginLeft:8}}>失败</span>}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="card-artistic text-center py-16">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.6 }}
                      className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg"
                    >
                      <span className="text-white text-4xl">✗</span>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-3">该地址尚未认证为艺术家</h3>
                    <p className="text-slate-400 mb-6">此钱包地址未在链上注册艺术家身份</p>
                    <a href="/register">
                      <button className="btn-primary">
                        前往注册
                      </button>
                    </a>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
