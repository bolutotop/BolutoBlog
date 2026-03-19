"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { getCategoriesAction } from '@/app/actions';
import { ReactLenis } from '@studio-freight/react-lenis';
import { usePathname, useSearchParams } from 'next/navigation';

// ① 顶部引入新组件
import CalendarWidget from './CalendarWidget';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const [dateInfo, setDateInfo] = useState({ day: '--', month: '--- 202X' });
  
  // ② 删除了 activeModal, calendarData, isClosing
  
  const [bootStage, setBootStage] = useState(0); 
  const [isFirstVisit, setIsFirstVisit] = useState(true); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const preloaderRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [showAllCats, setShowAllCats] = useState(false);
  const lenisRef = useRef<any>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (lenisRef.current?.lenis) {
      // immediate: true 是核心魔法，它会瞬间清除滚动惯性并回到 y: 0
      lenisRef.current.lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await getCategoriesAction();
      if (res.success && res.categories) {
        setCategories(res.categories);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const d = new Date();
    setDateInfo({
      day: d.getDate().toString().padStart(2, '0'),
      month: d.toLocaleString('en-US', { month: 'short' }) + ' ' + d.getFullYear()
    });

    const hasBooted = sessionStorage.getItem('system_booted_v1');

    if (hasBooted) {
      setIsFirstVisit(false);
      setBootStage(2);
      return; 
    }

    console.log(
      `%c
███████╗██╗  ██╗██╗██╗  ██╗██╗   ██╗██╗
╚══███╔╝██║  ██║██║██║  ██║██║   ██║██║
  ███╔╝ ███████║██║███████║██║   ██║██║
 ███╔╝  ██╔══██║██║██╔══██║██║   ██║██║
███████╗██║  ██║██║██║  ██║╚██████╔╝██║
╚══════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝
> ZHIHUI CREATIVE STUDIO _ 
> SYSTEM INITIALIZED _ 
      `,
      "font-family: monospace; color: #00ff00; font-weight: bold; font-size: 12px;"
    );

    const ctx = gsap.context(() => {
      const counter = { val: 0 };
      const tl = gsap.timeline();

      tl.to(counter, {
        val: 100,
        duration: 1.5, 
        ease: "power4.inOut",
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.innerText = Math.floor(counter.val).toString().padStart(3, '0') + "%";
          }
        }
      }, 0)
      .to(".boot-progress-bar", { width: "100%", duration: 1.5, ease: "power4.inOut" }, 0)
      .call(() => {
        setBootStage(1);
        sessionStorage.setItem('system_booted_v1', 'true');
      })
      .to(preloaderRef.current, {
        yPercent: -100,
        duration: 1.2,
        ease: "expo.inOut"
      }, "+=0.1")
      .call(() => setBootStage(2));
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  // ② 删除了 handleCloseModal

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--x', `${x}px`);
    e.currentTarget.style.setProperty('--y', `${y}px`);
  };

  // ② 删除了所有的日期计算变量 (currentD, year, month 等)
  // ② 删除了 fetchCalendarPosts 的 useEffect

  return (
    <ReactLenis ref={lenisRef} root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
    <div id="showcase-root" className="showcase-theme min-h-screen font-sans selection:bg-black selection:text-white transition-colors duration-700 overflow-x-hidden relative">
      
      {isFirstVisit && bootStage < 2 && (
        <div ref={preloaderRef} className="fixed inset-0 z-[99999] bg-[#050505] text-white flex flex-col justify-between p-8 md:p-12 font-mono">
          <div className="text-xs font-bold uppercase tracking-widest opacity-50 flex justify-between">
            <span>System Boot</span>
            <span className="animate-pulse">_</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div ref={counterRef} className="text-[clamp(6rem,15vw,16rem)] font-black leading-[0.8] tracking-tighter">000%</div>
            <div className="h-1 bg-white w-0 boot-progress-bar mt-8"></div>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-right opacity-50">Initializing Protocols...</div>
        </div>
      )}

      <style jsx global>{`
      .hide-right-sidebar #sidebar-right {
          translate: 100% 0 !important;
          opacity: 0 !important;
        }
        .showcase-theme {
          --sc-bg: #ffffff; --sc-text: #000000; --sc-border: rgba(0, 0, 0, 0.15);
          --sc-inverse-bg: #000000; --sc-inverse-text: #ffffff;
          background-color: var(--sc-bg); color: var(--sc-text);
        }
        .showcase-theme.showcase-inverted {
          --sc-bg: #0a0a0a; --sc-text: #ffffff; --sc-border: rgba(255, 255, 255, 0.2);
          --sc-inverse-bg: #ffffff; --sc-inverse-text: #000000;
        }
        .sc-border { border-color: var(--sc-border); transition: border-color 0.7s ease; }
        .sc-bg-inverse { background-color: var(--sc-inverse-bg); color: var(--sc-inverse-text); transition: background-color 0.7s ease, color 0.7s ease; }
        
        @keyframes rippleSpread {
          from { clip-path: circle(0% at var(--x, 50%) var(--y, 50%)); }
          to { clip-path: circle(150% at var(--x, 50%) var(--y, 50%)); }
        }

        @keyframes headerEnter {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes sidebarLeftEnter {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes sidebarRightEnter {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .animate-header-layout { animation: headerEnter 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-sidebar-left { animation: sidebarLeftEnter 1s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.2s; opacity: 0; }
        .animate-sidebar-right { animation: sidebarRightEnter 1s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.4s; opacity: 0; }

        @keyframes panelEnter {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes panelExit {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(100%); }
        }
        .animate-panel-enter { animation: panelEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-panel-exit { animation: panelExit 0.4s cubic-bezier(0.8, 0, 0.2, 1) forwards; }

        #sidebar-left, #sidebar-right {
          transition: translate 0.8s cubic-bezier(0.8, 0, 0.2, 1), opacity 0.6s ease;
          translate: 0 0;
        }
        
        .hide-sidebars #sidebar-left {
          translate: -100% 0 !important;
          opacity: 0 !important;
        }
        
        .hide-sidebars #sidebar-right {
          translate: 100% 0 !important;
          opacity: 0 !important;
        }

        #main-wrapper {
          transition: margin 0.8s cubic-bezier(0.8, 0, 0.2, 1);
        }
        @media (min-width: 1280px) { /* xl */
          #main-wrapper {
            margin-left: 16rem; /* w-64 */
            margin-right: 18rem; /* w-72 */
          }
        }
        @media (min-width: 1536px) { /* 2xl */
          #main-wrapper {
            margin-left: 20rem; /* w-80 */
            margin-right: 24rem; /* w-96 */
          }
        }
        .hide-sidebars #main-wrapper {
          margin-left: 0 !important;
          margin-right: 0 !important;
        }
      `}</style>

      {bootStage >= 1 && (
        <>
          {/* 1. 顶部 Header */}
          <header className="fixed top-0 left-0 w-full px-5 py-5 md:px-8 z-50 flex justify-between items-center sc-border border-b backdrop-blur-md bg-[var(--sc-bg)]/80 transition-colors duration-700 pointer-events-none animate-header-layout">
            <div className="font-black text-lg md:text-[clamp(1.25rem,1.5vw,1.75rem)] tracking-tighter uppercase pointer-events-auto relative z-50">ZHIHUI.</div>
            
            <div className="flex items-center gap-6 md:gap-8 pointer-events-auto relative z-50">
              <nav className="flex gap-4 md:gap-8 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                <Link href="#" className="hover:line-through">Index</Link>
                <Link href="#" className="hover:line-through">Work</Link>
                <Link href="#" className="hover:line-through">About</Link>
              </nav>

              <button 
                className="xl:hidden w-6 h-6 flex flex-col justify-center items-center group"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Menu"
              >
                <span className={`block absolute w-5 h-[1.5px] bg-current transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`}></span>
                <span className={`block absolute w-5 h-[1.5px] bg-current transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block absolute w-5 h-[1.5px] bg-current transition-all duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`}></span>
              </button>
            </div>
          </header>

          {/* 2. 移动端专属下拉菜单 */}
          <div 
            className={`
              fixed inset-0 bg-[var(--sc-bg)] z-40 flex flex-col justify-center px-8 xl:hidden
              transition-transform duration-700 ease-[cubic-bezier(0.8,0,0.2,1)]
              ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}
            `}
          >
            <div className="w-full max-w-sm mx-auto flex flex-col gap-8 mt-16">
              
              <div className="flex items-center gap-5 sc-border border-b pb-6">
                <div className="w-14 h-14 rounded-full overflow-hidden sc-border border-2 shrink-0">
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Zhihui&backgroundColor=e2e8f0" alt="Zhihui" className="w-full h-full object-cover grayscale" />
                </div>
                <div>
                  <h3 className="font-black uppercase text-xl leading-none tracking-tight">Zhihui</h3>
                  <p className="text-[10px] font-bold mt-1 uppercase tracking-widest opacity-50">Creative Developer</p>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <div className="text-4xl font-black tabular-nums tracking-tighter leading-none">{dateInfo.day}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-50">{dateInfo.month}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">System Status</div>
                  <div className="text-[10px] font-bold uppercase tracking-tight flex items-center justify-end gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Operational
                  </div>
                </div>
              </div>

              {/* 移动端专属的分类导航 */}
              <div className="mt-2 sc-border border-t pt-6">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-4">
                  Index / Categories
                </div>
                <div className="flex flex-wrap gap-2 font-mono text-[10px] font-bold uppercase">
                  {categories.length > 0 ? (
                    <>
                      {(showAllCats ? categories : categories.slice(0, 6)).map((tag) => (
                        <Link 
                          key={tag} 
                          href={`/blog/category/${encodeURIComponent(tag)}`}
                          onClick={() => setIsMobileMenuOpen(false)} 
                          className="sc-border border px-3 py-1.5 active:bg-[var(--sc-text)] active:text-[var(--sc-inverse-text)] transition-colors"
                        >
                          {tag}
                        </Link>
                      ))}
                      
                      {categories.length > 6 && (
                        <button 
                          onClick={() => setShowAllCats(!showAllCats)}
                          className="sc-border border border-dashed px-3 py-1.5 opacity-50 active:opacity-100 transition-opacity"
                        >
                          {showAllCats ? '[-]' : '[+]'}
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="opacity-30 animate-pulse">Loading...</span>
                  )}
                </div>
              </div>

              {/* ③ 日历组件 (Mobile 版) */}
              <div className="mt-2 sc-border border-t pt-6 relative">
                 <CalendarWidget variant="mobile" />
              </div>

            </div>
          </div>

          {/* 3. 左侧边栏 (PC端) */}
          <aside id="sidebar-left" className="fixed left-0 top-0 h-screen w-64 2xl:w-80 sc-border border-r z-30 flex-col justify-between pt-28 pb-10 px-8 hidden xl:flex pointer-events-none animate-sidebar-left">
            <div className="pointer-events-auto">
              <div className="w-16 h-16 2xl:w-20 2xl:h-20 rounded-full overflow-hidden mb-5 sc-border border-2">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Zhihui&backgroundColor=e2e8f0" alt="Zhihui" className="w-full h-full object-cover grayscale" />
              </div>
              <h3 className="font-black uppercase text-[clamp(1.25rem,1.5vw,1.75rem)] leading-none tracking-tight">Zhihui</h3>
              <p className="text-[10px] 2xl:text-xs font-bold mt-2 uppercase tracking-widest opacity-50">Creative Developer</p>
            </div>

            <div className="pointer-events-auto">
              <div className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest mb-4 sc-border border-b pb-2 opacity-50">
                Index / Categories
              </div>
              <div className="flex flex-col gap-3 font-mono text-xs 2xl:text-sm font-bold uppercase">
                {categories.length > 0 ? (
                  <>
                    {(showAllCats ? categories : categories.slice(0, 5)).map((tag, index) => (
                      <Link 
                        key={tag} 
                       href={`/blog/category/${encodeURIComponent(tag)}`}
                        className="group flex items-center gap-3 cursor-pointer opacity-70 hover:opacity-100 transition-all hover:translate-x-2"
                      >
                        <span className="text-[9px] opacity-40 group-hover:opacity-100 transition-opacity">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                        <span className="group-hover:bg-[var(--sc-text)] group-hover:text-[var(--sc-inverse-text)] px-1 -ml-1 transition-colors">
                          {tag}
                        </span>
                      </Link>
                    ))}

                    {categories.length > 5 && (
                      <button 
                        onClick={() => setShowAllCats(!showAllCats)}
                        className="text-left mt-2 text-[10px] 2xl:text-xs font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
                      >
                        {showAllCats ? '[- COLLAPSE]' : '[+ VIEW ALL]'}
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-[10px] opacity-30 animate-pulse">Loading Data...</span>
                )}
              </div>
            </div>
          </aside>

          {/* 4. 右侧边栏 (PC端) */}
          <aside id="sidebar-right" className="fixed right-0 top-0 h-screen w-72 2xl:w-96 sc-border border-l z-30 flex-col pt-28 pb-10 px-6 2xl:px-8 hidden xl:flex pointer-events-none animate-sidebar-right">
            <div className="pointer-events-auto flex items-end justify-between sc-border border-b pb-4">
              <div>
                <div className="text-[clamp(2.5rem,3vw,3.5rem)] font-black tabular-nums tracking-tighter leading-none">{dateInfo.day}</div>
                <div className="text-[10px] 2xl:text-xs font-bold uppercase tracking-widest mt-1 opacity-50">{dateInfo.month}</div>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[8px] 2xl:text-[10px] font-black uppercase tracking-widest opacity-50">SG</span>
              </div>
            </div>

            {/* ④ 日历组件 (Desktop 版) */}
            <div className="pointer-events-auto mt-8 relative z-20">
               <CalendarWidget variant="desktop" />
            </div>

            <div className="pointer-events-auto mt-auto pt-6 sc-border border-t flex items-center justify-between">
               <div className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest opacity-50">
                 Connect
               </div>
               
               <div className="flex items-center gap-5">
                 {/* Pinterest */}
                 <a href="https://www.pinterest.com/" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-all hover:-translate-y-1" aria-label="Pinterest">
                   <svg className="w-4 h-4 2xl:w-5 2xl:h-5" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.182 0 7.436 2.983 7.436 6.966 0 4.156-2.618 7.502-6.255 7.502-1.221 0-2.372-.635-2.766-1.386l-.75 2.862c-.272 1.042-1.011 2.345-1.507 3.141 1.191.368 2.454.568 3.753.568 6.621 0 11.988-5.368 11.988-11.988C24 5.367 18.638 0 12.017 0z"/>
                   </svg>
                 </a>
                 
                 {/* Awwwards */}
                 <a href="https://www.awwwards.com/" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-all hover:-translate-y-1" aria-label="Awwwards">
                   <span className="font-serif italic font-bold text-lg 2xl:text-xl leading-none tracking-tighter">W.</span>
                 </a>
                 
                 {/* GitHub */}
                 <a href="https://github.com/bolutotop/BolutoBlog" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-all hover:-translate-y-1" aria-label="GitHub">
                   <svg className="w-4 h-4 2xl:w-5 2xl:h-5" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                   </svg>
                 </a>
               </div>
            </div>
          </aside>

          {/* 5. 主体内容盒子 */}
          <div id="main-wrapper" className="relative z-10">
            {children}
          </div>
        </>
      )}
    </div>
    </ReactLenis>
  );
}