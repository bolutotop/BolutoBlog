"use client";

import { useEffect } from "react";

/**
 * 全局错误兜底页面 — 捕获运行时异常，提供重试与返回入口。
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("🔴 Uncaught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white text-black font-sans selection:bg-black selection:text-white">
      
      {/* 图标 */}
      <div className="w-16 h-16 border-2 border-black flex items-center justify-center mb-8 text-2xl font-black">
        !
      </div>

      <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight mb-4 text-center">
        Something Went Wrong
      </h2>
      <p className="text-sm md:text-base font-medium opacity-60 max-w-md text-center leading-relaxed mb-10">
        An unexpected error occurred. This has been logged. You can try again or return to the homepage.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={reset}
          className="bg-black text-white px-8 py-4 font-black text-xs uppercase tracking-widest hover:opacity-80 transition-opacity active:scale-95"
        >
          Try Again
        </button>
        <a
          href="/"
          className="border-2 border-black px-8 py-4 font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors active:scale-95"
        >
          Go Home
        </a>
      </div>

      {/* 底部状态 */}
      <div className="absolute bottom-8 font-mono text-[10px] uppercase tracking-widest opacity-30">
        SYS_ERR: RUNTIME_EXCEPTION {error.digest ? `[${error.digest}]` : ""}
      </div>
    </div>
  );
}
