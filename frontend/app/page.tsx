"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-display font-bold mb-6 bg-gradient-to-r from-primary-400 via-purple-400 to-primary-600 bg-clip-text text-transparent">
              艺术家身份认证
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              去中心化的链上身份凭证 · 让创作者不依赖平台确权自己的作品身份
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <button className="btn-primary text-lg px-8 py-4 group">
                  <span className="flex items-center space-x-2">
                    <span>成为认证艺术家</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </button>
              </Link>
              
              <Link href="/verify">
                <button className="btn-secondary text-lg px-8 py-4">
                  验证艺术家身份
                </button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Art Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </section>

      {/* Features Section */}
