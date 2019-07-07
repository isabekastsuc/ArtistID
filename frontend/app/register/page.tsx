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

  const handleSubmit = async () => {
    await register(name, bio, portfolioURI, category);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
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
