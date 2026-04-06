"use client";

import Link from "next/link";

/**
 * 全局 404 页面 — 与 Showcase 主题视觉风格一致的极简设计。
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white text-black font-sans selection:bg-black selection:text-white">
      
      {/* 巨型 404 数字 */}
      <h1 className="text-[clamp(8rem,25vw,20rem)] font-black leading-none tracking-tighter opacity-10 select-none">
        404
      </h1>

      {/* 主信息 */}
      <div className="text-center -mt-8 md:-mt-12">
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight mb-4">
          Page Not Found
        </h2>
        <p className="text-sm md:text-base font-medium opacity-60 max-w-md leading-relaxed mb-10">
          The page you are looking for does not exist, has been moved, or is temporarily unavailable.
        </p>
        
        <Link
          href="/"
          className="group relative overflow-hidden bg-black text-white px-8 py-4 inline-flex items-center gap-3 font-black text-xs uppercase tracking-widest transition-transform active:scale-95"
        >
          <span>Return Home</span>
          <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
        </Link>
      </div>

      {/* 底部状态 */}
      <div className="absolute bottom-8 font-mono text-[10px] uppercase tracking-widest opacity-30">
        SYS_ERR: RESOURCE_NOT_FOUND
      </div>
    </div>
  );
}
