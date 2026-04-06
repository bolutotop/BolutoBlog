/**
 * 全局加载状态 — 极简骨架屏，与 Showcase 主题视觉一致。
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        {/* 脉冲动画方块 */}
        <div className="w-10 h-10 bg-black animate-pulse" />
        <span className="font-mono text-[10px] uppercase tracking-widest opacity-40 animate-pulse">
          Loading...
        </span>
      </div>
    </div>
  );
}
