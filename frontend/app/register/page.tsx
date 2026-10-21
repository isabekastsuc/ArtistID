"use client";

import { useEffect, useState } from "react";
import { useArtistID } from "@/hooks/useArtistID";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { uploadFileToPinata } from "@/utils/pinata";

export default function Register() {
  const [provider, setProvider] = useState<ethers.Eip1193Provider | undefined>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [category, setCategory] = useState("Painter");
  const [portfolioURI, setPortfolioURI] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const eth = (window as any).ethereum as ethers.Eip1193Provider | undefined;
    if (!eth) return;
    setProvider(eth);
    eth.request?.({ method: "eth_chainId" }).then((hex) => setChainId(parseInt(hex as string, 16)));
  }, []);

  const { message, register } = useArtistID({ provider, chainId });

  const [error, setError] = useState<string | undefined>(undefined);

  const handleSubmit = async () => {
    setError(undefined);
    try {
      await register(name, bio, portfolioURI, category);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "registration failed");
    }
  };

  const onFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const f = event.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    try {
      setUploading(true);
      setProgress(0);
      const jwt = process.env.NEXT_PUBLIC_PINATA_JWT || "";
      if (!jwt) {
        alert("缺少 Pinata JWT，请在 NEXT_PUBLIC_PINATA_JWT 中配置。");
        setUploading(false);
        return;
      }
      const res = await uploadFileToPinata({ file: f, jwt, onProgress: (p) => setProgress(p) });
      setPortfolioURI(res.uri);
    } catch (e: any) {
      alert(`上传失败: ${e?.message || e}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-display font-bold mb-4 text-center bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
            成为认证艺术家
          </h1>
          <p className="text-slate-400 text-center mb-12 text-lg">
            填写资料并铸造你的专属艺术家身份 NFT
          </p>

          <div className="card-artistic relative">
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  className="nft-stamp"
                >
                  ✓<br/>认证
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  艺术家名称 *
                </label>
                <input
                  type="text"
                  placeholder="输入你的艺术家名称"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-artistic"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  个人简介 *
                </label>
                <textarea
                  placeholder="介绍你的艺术风格和创作理念..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input-artistic min-h-[120px] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  艺术类别 *
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="select-artistic"
                  >
                    <option value="Painter">画家 Painter</option>
                    <option value="Musician">音乐家 Musician</option>
                    <option value="Writer">作家 Writer</option>
                    <option value="Photographer">摄影师 Photographer</option>
                    <option value="Digital Artist">数字艺术家 Digital Artist</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  上传代表作（图片/音频/视频）*
                </label>
                <div className="glass rounded-xl p-4">
                  <input type="file" accept="image/*,video/*,audio/*" onChange={onFileSelected} />
                  <div className="text-xs text-slate-400 mt-2">
                    {uploading ? `上传中... ${progress}%` : fileName ? `已选择：${fileName}` : "支持图片、音频、视频，最大受 Pinata 账号限制"}
                  </div>
                  {portfolioURI && (
                    <div className="text-xs text-primary-300 mt-2 break-all font-mono">{portfolioURI}</div>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!provider || !name || !bio || !portfolioURI || uploading}
                className="btn-primary w-full text-lg py-4 mt-4"
              >
                {provider ? "🎨 提交注册并铸造 NFT" : "请连接钱包"}
              </motion.button>

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-4 rounded-xl text-center text-sm"
                >
                  <p className="text-slate-300">{message}</p>
                </motion.div>
              )}
            </div>
          </div>

          <div className="mt-8 text-center text-slate-500 text-sm">
            <p>注册后将铸造一枚唯一的艺术家身份认证 NFT</p>
            <p>每个钱包地址仅能注册一次</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
