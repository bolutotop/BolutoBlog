"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function Footer() {
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  return (
    <footer className="relative z-10 bg-[var(--sc-bg)] border-t sc-border mt-12 w-full overflow-hidden">

      {/* 🚀 上半部分：品牌与链接 - 回滚为经典深色模式下的白色/浅色系 */}
      <div className="max-w-[1600px] mx-auto w-full pt-12 pb-10 px-5 lg:px-12">
        <div className="flex flex-row justify-between items-center md:items-end mb-6 w-full">

          {/* 左侧：品牌标识 - 同步 Header 的 Space Mono 风格 */}
          <div
            className="flex flex-col cursor-default"
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
          >
            <div className={`
               flex items-baseline transition-all duration-700 font-[var(--font-space-mono)] font-bold
               ${isLogoHovered ? 'tracking-normal' : 'tracking-tighter'}
            `}>
              <h2 className="text-[clamp(1.5rem,6vw,3.5rem)] uppercase leading-none m-0 text-[var(--sc-text)]">
                ZHIHUI
              </h2>

              {/* 状态指示：绿色的 Diagnostic 诊断块 */}
              <motion.div
                animate={{
                  opacity: [0.4, 1, 0.4],
                  scale: isLogoHovered ? [1.1, 1, 1.1] : 1
                }}
                transition={{
                  duration: isLogoHovered ? 0.8 : 2.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="ml-2 w-2 h-3 md:w-3 md:h-5 bg-green-500/80 rounded-sm shadow-[0_0_10px_rgba(34,197,94,0.2)]"
              />

              {/* 悬停时的光标闪烁效果 */}
              <AnimatePresence>
                {isLogoHovered && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="ml-1 text-green-500 font-bold text-lg md:text-3xl"
                  >
                    _
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <p className="hidden md:block text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 leading-relaxed border-l sc-border pl-3 mt-4">
              Breaking grids. Defying templates. <br />
              Pure digital architecture.
            </p>
          </div>

          {/* 右侧：导航组 */}
          <div className="flex flex-row gap-12 lg:gap-24 font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest">
            <div className="hidden md:flex flex-col gap-3">
              <span className="opacity-30 mb-1 select-none text-[9px]">/ 01. Directory</span>
              <Link href="/" className="hover:translate-x-1 hover:opacity-100 opacity-70 transition-all">Home</Link>
              <Link href="/blog" className="hover:translate-x-1 hover:opacity-100 opacity-70 transition-all">Logs</Link>
              <Link href="/archive" className="hover:translate-x-1 hover:opacity-100 opacity-70 transition-all">Archive</Link>
            </div>

            <div className="flex flex-col items-end md:items-start gap-2 md:gap-3">
              <span className="opacity-30 mb-1 select-none text-[9px]">/ 02. Connect</span>
              <div className="hidden md:flex flex-col gap-3">
                <a href="#" className="hover:translate-x-1 hover:opacity-100 opacity-70 transition-all">GitHub</a>
                <a href="#" className="hover:translate-x-1 hover:opacity-100 opacity-70 transition-all">Pinterest</a>
                <a href="#" className="hover:translate-x-1 hover:opacity-100 opacity-70 transition-all">Awwwards</a>
              </div>

              {/* 🚀 移动端图标：恢复 Awwwards 和所有 SVG */}
              <div className="flex md:hidden items-center gap-5 mt-1 opacity-50">
                <a href="#" aria-label="GitHub"><svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg></a>
                <a href="#" aria-label="Pinterest"><svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.182 0 7.436 2.983 7.436 6.966 0 4.156-2.618 7.502-6.255 7.502-1.221 0-2.372-.635-2.766-1.386l-.75 2.862c-.272 1.042-1.011 2.345-1.507 3.141 1.191.368 2.454.568 3.753.568 6.621 0 11.988-5.368 11.988-11.988C24 5.367 18.638 0 12.017 0z" /></svg></a>
                <a href="#" className="font-serif italic font-bold text-2xl leading-none" aria-label="Awwwards">W.</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================
          🚀 最底栏：锁定实体色深岩灰背景 (#333) + 纤细高度
          ======================================================= */}
      <div className="w-full bg-[#333333] border-t sc-border py-4 px-5">
        <div className="max-w-[1600px] mx-auto text-center">
          <span className="font-mono text-[9px] md:text-xs uppercase tracking-[0.3em] text-white/40 select-none">
            © {new Date().getFullYear()} ZHIHUI. ALL RIGHTS RESERVED.
          </span>
        </div>
      </div>
    </footer>
  );
}