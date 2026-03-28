import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative z-10 bg-[var(--sc-bg)] border-t sc-border pt-8 pb-6 px-5 lg:px-12 mt-12 w-full">
      <div className="max-w-[1600px] mx-auto w-full">
        
        {/* =======================================================
            🚀 顶栏：ZHIHUI (左) 与 Credits (右) 绝对横向排版 
            ======================================================= */}
        <div className="flex flex-row justify-between items-center md:items-end mb-6 w-full">
          
          {/* 左侧：品牌标识 */}
          <div className="flex flex-col">
            <h2 className="text-[clamp(2.5rem,8vw,5rem)] font-black uppercase tracking-tighter leading-none m-0 text-[var(--sc-text)]">
              ZHIHUI.
            </h2>
            {/* 仅在 PC 端显示的描述 */}
            <p className="hidden md:block text-[10px] font-bold uppercase tracking-widest opacity-60 leading-relaxed border-l-2 sc-border pl-3 mt-2">
              Breaking grids. Defying templates. <br/>
              Pure digital architecture.
            </p>
          </div>

          {/* 右侧：导航与致谢区域 */}
          <div className="flex flex-row gap-12 lg:gap-24 font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest">
            
            {/* Directory (仅 PC 端显示) */}
            <div className="hidden md:flex flex-col gap-3">
              <span className="opacity-30 mb-1 select-none">/ Directory</span>
              <Link href="/" className="hover:translate-x-1 hover:opacity-100 opacity-70 transition-all flex items-center gap-1.5">
                <span className="opacity-0 -ml-3 -mr-1 transition-all">→</span> Home
              </Link>
              <Link href="/blog" className="hover:translate-x-1 hover:opacity-100 opacity-70 transition-all flex items-center gap-1.5">
                <span className="opacity-0 -ml-3 -mr-1 transition-all">→</span> Logs
              </Link>
              <Link href="/archive" className="hover:translate-x-1 hover:opacity-100 opacity-70 transition-all flex items-center gap-1.5">
                <span className="opacity-0 -ml-3 -mr-1 transition-all">→</span> Archive
              </Link>
            </div>
            
            {/* Credits (PC端文字，移动端横排图标) */}
            <div className="flex flex-col items-end md:items-start gap-2 md:gap-3">
              <span className="opacity-30 mb-1 select-none">/ Credits</span>
              
              {/* PC 端：文字链接排列 */}
              <div className="hidden md:flex flex-col gap-3">
                <a href="https://github.com/bolutotop/BolutoBlog" target="_blank" rel="noopener noreferrer" className="hover:translate-x-1 hover:opacity-100 opacity-70 transition-all flex items-center gap-1.5">
                  <span className="opacity-0 -ml-3 -mr-1 transition-all">→</span> GitHub
                </a>
                <a href="https://www.pinterest.com/" target="_blank" rel="noopener noreferrer" className="hover:translate-x-1 hover:opacity-100 opacity-70 transition-all flex items-center gap-1.5">
                  <span className="opacity-0 -ml-3 -mr-1 transition-all">→</span> Pinterest
                </a>
                <a href="https://www.awwwards.com/" target="_blank" rel="noopener noreferrer" className="hover:translate-x-1 hover:opacity-100 opacity-70 transition-all flex items-center gap-1.5">
                  <span className="opacity-0 -ml-3 -mr-1 transition-all">→</span> Awwwards
                </a>
              </div>

              {/* 🚀 移动端：放大的精美横向图标 */}
              <div className="flex md:hidden items-center gap-5 mt-1">
                {/* GitHub */}
                <a href="https://github.com/bolutotop/BolutoBlog" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-all hover:-translate-y-1" aria-label="GitHub">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                
                {/* Pinterest */}
                <a href="https://www.pinterest.com/" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-all hover:-translate-y-1" aria-label="Pinterest">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.182 0 7.436 2.983 7.436 6.966 0 4.156-2.618 7.502-6.255 7.502-1.221 0-2.372-.635-2.766-1.386l-.75 2.862c-.272 1.042-1.011 2.345-1.507 3.141 1.191.368 2.454.568 3.753.568 6.621 0 11.988-5.368 11.988-11.988C24 5.367 18.638 0 12.017 0z"/>
                  </svg>
                </a>
                
                {/* Awwwards */}
                <a href="https://www.awwwards.com/" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-all hover:-translate-y-1" aria-label="Awwwards">
                  <span className="font-serif italic font-bold text-2xl leading-none tracking-tighter">W.</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* =======================================================
            🚀 底栏：2026 (左) 与 SYS_STATUS (右) 绝对横向排版 
            ======================================================= */}
        <div className="flex flex-row justify-between items-center pt-5 border-t sc-border font-mono text-[10px] md:text-xs uppercase tracking-widest opacity-60">
          
          {/* 左侧：精简版权 */}
          <span className="md:hidden">© {new Date().getFullYear()} ZHIHUI.</span>
          <span className="hidden md:inline">© {new Date().getFullYear()} ZHIHUI STUDIO. ALL RIGHTS RESERVED.</span>
          
          {/* 右侧：状态指示灯 */}
          <div className="flex items-center gap-3 md:gap-4">
            <span className="hidden md:inline">Based in Earth</span>
            <span className="hidden md:block w-1 h-1 rounded-full bg-[var(--sc-text)] opacity-30"></span>
            
            <div className="flex items-center gap-2">
              <span className="md:hidden">SYS: ONLINE</span>
              <span className="hidden md:inline">SYS_STATUS: ONLINE</span>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
}