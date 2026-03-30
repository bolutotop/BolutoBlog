import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center font-sans">
      
      {/* 极简 Logo */}
      <div className="flex flex-col items-center gap-2 mb-16">
        <span className="text-4xl font-black text-white tracking-tighter">ZHIHUI.</span>
        <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest border border-zinc-700 px-3 py-1 rounded-full bg-zinc-950">
          Core System
        </span>
      </div>

      {/* 登录卡片 */}
      <div className="w-full max-w-sm p-10 bg-zinc-950 rounded-3xl border border-zinc-800 shadow-[0_20px_60px_-15px_rgba(255,255,255,0.03)]">
        <h2 className="text-xl font-bold text-white tracking-tight mb-2">管理员鉴权</h2>
        <p className="text-sm text-zinc-500 mb-10 leading-relaxed">
          正在尝试访问核心控制中心，<br/>
          请使用唯一的授权 GitHub 账户进行验证。
        </p>
        
        <form
          action={async () => {
            "use server"; // 🚀 核心修复：这里必须是 use server，声明这是一个服务端执行的 Action
            await signIn("github", { redirectTo: "/admin" });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-black rounded-2xl font-black text-sm tracking-wide transition-all hover:scale-105 hover:bg-zinc-200 active:scale-95 shadow-md hover:shadow-lg duration-300"
          >
            {/* GitHub 小图标 (SVG) */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            <span className="relative top-[1px]">认证站长特权 (GitHub)</span>
          </button>
        </form>
      </div>
      
      {/* 底部版权 */}
      <span className="fixed bottom-6 text-[10px] text-zinc-700 font-mono uppercase tracking-widest">
        SYSTEM VER. 2026.01 // ZHIHUI STUDIO ALL RIGHTS RESERVED.
      </span>

    </div>
  );
}