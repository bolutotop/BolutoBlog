"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { getCalendarPostsAction } from '@/app/actions';

import { ReactLenis } from '@studio-freight/react-lenis';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const [dateInfo, setDateInfo] = useState({ day: '--', month: '--- 202X' });
  const [activeModal, setActiveModal] = useState<any | null>(null);
  const [calendarData, setCalendarData] = useState<Record<number, any>>({});
  const [isClosing, setIsClosing] = useState(false);

  const [bootStage, setBootStage] = useState(0); 
  const [isFirstVisit, setIsFirstVisit] = useState(true); 
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const preloaderRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);

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

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setActiveModal(null);
      setIsClosing(false);
    }, 400); 
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--x', `${x}px`);
    e.currentTarget.style.setProperty('--y', `${y}px`);
  };

const currentD = new Date();
  const year = currentD.getFullYear();
  const month = currentD.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate(); 
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 

  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const allCalendarCells = [...blanks, ...days];
  const weekDays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
useEffect(() => {
    const fetchCalendarPosts = async () => {
      const res = await getCalendarPostsAction();
      if (res.success && res.posts) {
        const dataMap: Record<number, any> = {};
        res.posts.forEach((post: any) => {
          const postDate = new Date(post.createdAt);
          // 如果文章是当前这个月发布的，提取它的日期 (几号)
          if (postDate.getFullYear() === year && postDate.getMonth() === month) {
            const day = postDate.getDate();
            // 存入 Map
            dataMap[day] = {
              title: post.title,
              slug: post.slug,
              date: postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              excerpt: post.content.substring(0, 100) + '...', // 截取简介
            };
          }
        });
        setCalendarData(dataMap);
      }
    };
    fetchCalendarPosts();
  }, [year, month]);
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
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

              <div className="mt-2 sc-border border-t pt-6 relative">
                <div className="max-w-[260px] mx-auto">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Publication Log</span>
                    <span className="text-[10px] font-mono font-bold">2026.03</span>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] font-bold uppercase mb-2 opacity-40">
                    {weekDays.map((d, i) => <div key={i}>{d}</div>)}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-y-2 gap-x-2 font-mono text-[10px]">
                    {allCalendarCells.slice(0, 28).map((day, idx) => {
                      if (day === null) return <div key={`blank-${idx}`} className="aspect-square" />;
                      const hasPost = calendarData[day];
                      const isToday = day === currentD.getDate(); // 顺便把高亮的 isToday 改成真实的“今天”
                      
                      return (
                        <button 
                          key={day}
                          onClick={() => hasPost && setActiveModal(hasPost)}
                          onMouseMove={hasPost ? handleMouseMove : undefined}
                          disabled={!hasPost}
                          className={`
                            relative aspect-square flex items-center justify-center transition-transform duration-300
                            ${hasPost ? 'group overflow-hidden isolate bg-[var(--sc-inverse-bg)] shadow-md active:scale-90 z-10 cursor-pointer' : 'border-transparent opacity-40'}
                            ${isToday && !hasPost ? 'sc-border border font-bold opacity-100' : ''}
                          `}
                        >
                          {hasPost ? (
                            <>
                              <span className="relative z-10 font-black text-[var(--sc-inverse-text)] transition-colors duration-300 group-hover:text-transparent">{day}</span>
                              <div 
                                className="absolute inset-0 bg-[var(--sc-bg)] pointer-events-none z-20 flex items-center justify-center group-hover:animate-[rippleSpread_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                                style={{ clipPath: 'circle(0% at var(--x, 50%) var(--y, 50%))' }}
                              >
                                 <span className="font-black text-[var(--sc-text)]">{day}</span>
                              </div>
                            </>
                          ) : (
                            <span>{day}</span>
                          )}
                          {isToday && !hasPost && <div className="absolute w-1 h-1 bg-green-500 rounded-full bottom-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 移动端专属 Modal 弹窗 */}
                {activeModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
                    <div 
                      className={`absolute inset-0 bg-[var(--sc-bg)]/90 backdrop-blur-md transition-opacity duration-400 ${isClosing ? 'opacity-0' : 'opacity-100'}`} 
                      onClick={handleCloseModal} 
                    />
                    
                    <div className={`relative w-full max-w-sm bg-[var(--sc-bg)] sc-border border p-6 shadow-2xl ${isClosing ? 'animate-panel-exit' : 'animate-panel-enter'}`}>
                      <div className="flex justify-between items-start mb-5 sc-border border-b pb-3">
                         <div className="font-mono text-[10px] font-bold opacity-50 uppercase tracking-widest">{activeModal.date}</div>
                         <button onClick={handleCloseModal} className="text-[10px] font-black uppercase active:opacity-50 transition-opacity p-2 -mr-2 -mt-2">
                           [ Close ]
                         </button>
                      </div>
                      
                      <h2 className="text-xl font-black uppercase tracking-tighter leading-tight mb-3">{activeModal.title}</h2>
                      <p className="text-xs font-bold leading-relaxed opacity-80 mb-6">{activeModal.excerpt}</p>
                      
                      <Link 
                        href={`/blog/${activeModal.slug}`}
                        onMouseMove={handleMouseMove}
                        className="group relative overflow-hidden flex items-center justify-between bg-[var(--sc-inverse-bg)] px-5 py-4 active:scale-95 transition-transform isolate w-full"
                      >
                        <span className="relative z-10 font-black text-[10px] uppercase tracking-widest text-[var(--sc-inverse-text)] transition-colors duration-300 group-hover:text-transparent">Read Log</span>
                        <span className="relative z-10 font-black text-[10px] text-[var(--sc-inverse-text)] group-hover:translate-x-1 transition-transform">→</span>
                        
                        <div 
                          className="absolute inset-0 bg-[var(--sc-bg)] pointer-events-none z-20 flex items-center justify-between px-5 group-hover:animate-[rippleSpread_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                          style={{ clipPath: 'circle(0% at var(--x, 50%) var(--y, 50%))' }}
                        >
                          <span className="font-black text-[10px] uppercase tracking-widest text-[var(--sc-text)]">Read Log</span>
                          <span className="font-black text-[10px] text-[var(--sc-text)] group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
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
              <div className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest mb-4 sc-border border-b pb-2 opacity-50">Core Stack</div>
              <div className="flex flex-col gap-2 font-mono text-xs 2xl:text-sm font-bold uppercase">
                {['01. React / Next.js', '02. WebGL / GSAP', '03. Prisma / SQL', '04. Brutalism UI'].map(tag => (
                  <div key={tag} className="hover:translate-x-2 transition-transform cursor-pointer opacity-80 hover:opacity-100">
                    {tag}
                  </div>
                ))}
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

            <div className="pointer-events-auto mt-8 relative z-20">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest opacity-50">Publication Log</span>
                <span className="text-[10px] 2xl:text-xs font-mono font-bold">2026.03</span>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] 2xl:text-[10px] font-bold uppercase mb-4 opacity-40">
                {weekDays.map((d, i) => <div key={i}>{d}</div>)}
              </div>
              
              <div className="grid grid-cols-7 gap-y-2 gap-x-1 font-mono text-xs 2xl:text-sm">
                {allCalendarCells.map((day, idx) => {
                  if (day === null) return <div key={`blank-${idx}`} className="aspect-square" />;
                  const hasPost = calendarData[day];
                 const isToday = day === currentD.getDate();

                  return (
                    <button 
                      key={day}
                      onClick={() => hasPost && setActiveModal(hasPost)}
                      onMouseMove={hasPost ? handleMouseMove : undefined}
                      disabled={!hasPost}
                      className={`
                        relative aspect-square flex items-center justify-center transition-transform duration-300
                        ${hasPost ? 'group overflow-hidden isolate bg-[var(--sc-inverse-bg)] shadow-md hover:scale-110 hover:shadow-xl z-10 cursor-pointer' : 'border-transparent opacity-40 cursor-default hover:opacity-100'}
                        ${isToday && !hasPost ? 'sc-border border font-bold opacity-100' : ''}
                      `}
                    >
                      {hasPost ? (
                        <>
                          <span className="relative z-10 font-black text-[var(--sc-inverse-text)] transition-colors duration-300 group-hover:text-transparent">{day}</span>
                          <div 
                            className="absolute inset-0 bg-[var(--sc-bg)] pointer-events-none z-20 flex items-center justify-center group-hover:animate-[rippleSpread_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                            style={{ clipPath: 'circle(0% at var(--x, 50%) var(--y, 50%))' }}
                          >
                             <span className="font-black text-[var(--sc-text)]">{day}</span>
                          </div>
                        </>
                      ) : (
                        <span className="font-mono text-xs 2xl:text-sm">{day}</span>
                      )}
                      {isToday && !hasPost && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />}
                    </button>
                  );
                })}
              </div>
              
              {activeModal && (
                <>
                  <div 
                    className={`fixed inset-0 bg-[var(--sc-bg)]/80 backdrop-blur-sm z-40 transition-opacity duration-400 ${isClosing ? 'opacity-0' : 'opacity-100'}`} 
                    onClick={handleCloseModal} 
                  />
                  
                  <div className={`absolute top-0 right-[110%] w-80 2xl:w-96 bg-[var(--sc-bg)] sc-border border p-6 2xl:p-8 shadow-2xl z-50 pointer-events-auto ${isClosing ? 'animate-panel-exit' : 'animate-panel-enter'}`}>
                    
                    <div className="flex justify-between items-start mb-5 sc-border border-b pb-3">
                       <div className="font-mono text-[10px] 2xl:text-xs font-bold opacity-50 uppercase tracking-widest">{activeModal.date}</div>
                       <button onClick={handleCloseModal} className="text-[10px] 2xl:text-xs font-black uppercase hover:opacity-50 transition-opacity">
                         [ Close ]
                       </button>
                    </div>
                    
                    <h2 className="text-xl 2xl:text-2xl font-black uppercase tracking-tighter leading-tight mb-3">{activeModal.title}</h2>
                    <p className="text-xs 2xl:text-sm font-bold leading-relaxed opacity-80 mb-6">{activeModal.excerpt}</p>
                    
                    <Link 
                      href={`/blog/${activeModal.slug}`}
                      onMouseMove={handleMouseMove}
                      className="group relative overflow-hidden flex items-center justify-between bg-[var(--sc-inverse-bg)] px-5 py-3 transition-transform hover:scale-105 active:scale-95 duration-500 isolate w-full"
                    >
                      <span className="relative z-10 font-black text-[10px] 2xl:text-xs uppercase tracking-widest text-[var(--sc-inverse-text)] transition-colors duration-300 group-hover:text-transparent">Read Log</span>
                      <span className="relative z-10 font-black text-[10px] 2xl:text-xs text-[var(--sc-inverse-text)] group-hover:translate-x-1 transition-transform">→</span>

                      <div 
                        className="absolute inset-0 bg-[var(--sc-bg)] pointer-events-none z-20 flex items-center justify-between px-5 group-hover:animate-[rippleSpread_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                        style={{ clipPath: 'circle(0% at var(--x, 50%) var(--y, 50%))' }}
                      >
                        <span className="font-black text-[10px] 2xl:text-xs uppercase tracking-widest text-[var(--sc-text)]">Read Log</span>
                        <span className="font-black text-[10px] 2xl:text-xs text-[var(--sc-text)] group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </Link>
                  </div>
                </>
              )}
            </div>

            <div className="pointer-events-auto mt-auto pt-6 sc-border border-t">
               <div className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest opacity-50 mb-1">System Status</div>
               <div className="text-xs 2xl:text-sm font-bold uppercase tracking-tight">All systems operational.</div>
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