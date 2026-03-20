"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import StudioLayout from '@/components/StudioLayout'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// 专门用于 Hero 区域巨型标题的文字切割组件
const SplitText = ({ text, className = "" }: { text: string, className?: string }) => (
  <div className={`flex overflow-hidden pb-4 -mb-4 ${className}`}>
    {text.split('').map((char, i) => (
      <span 
        key={i} 
        className="hero-char inline-block translate-y-[150%] rotate-12 opacity-0" 
        style={{ whiteSpace: 'pre' }}
      >
        {char}
      </span>
    ))}
  </div>
);

export default function ShowcasePage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // 🚀 核心修复 1：新增状态，用来感知 Layout 的开机动画是否已经放行了此页面的渲染
  const [isReadyToAnimate, setIsReadyToAnimate] = useState(false);

  // 🚀 核心修复 2：使用 useCallback 充当雷达。一旦 DOM 真正挂载，立刻通知 GSAP 启动
  const setRef = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      containerRef.current = node;
      setIsReadyToAnimate(true);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--x', `${x}px`);
    e.currentTarget.style.setProperty('--y', `${y}px`);
  };

  useEffect(() => {
    // 🚀 核心修复 3：如果 DOM 还没出来（开机动画没播完），直接拦截 GSAP，不让它瞎跑
    if (!isReadyToAnimate || !containerRef.current) return;

    gsap.ticker.lagSmoothing(0);

    // 2. 集中管理所有 GSAP 动画
    const ctx = gsap.context(() => {
      
      // Hero 区域入场动画
      gsap.to('.hero-char', { y: 0, rotation: 0, opacity: 1, stagger: 0.04, duration: 1.5, ease: 'elastic.out(1, 0.6)', delay: 0.2 });
      gsap.fromTo('.hero-bottom-content', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', delay: 1.2 });

      // Vision 遮罩背景视差 & 跑马灯动画
      gsap.to('.text-mask-bg', { backgroundPosition: '50% 100%', ease: 'none', scrollTrigger: { trigger: '.text-mask-section', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.to('.marquee-track', { xPercent: -50, repeat: -1, duration: 15, ease: 'none' });
      
      // 动态黑白交替触发器 (Zebra-striping Theme Toggle)
      const darkSections = ['.overlap-section', '.learning-section'];
      darkSections.forEach(section => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top 50%', 
          end: 'bottom 50%', 
          onEnter: () => document.getElementById('showcase-root')?.classList.add('showcase-inverted'),
          onLeave: () => document.getElementById('showcase-root')?.classList.remove('showcase-inverted'),
          onEnterBack: () => document.getElementById('showcase-root')?.classList.add('showcase-inverted'),
          onLeaveBack: () => document.getElementById('showcase-root')?.classList.remove('showcase-inverted'),
        });
      });

      // 画廊模式：隐藏侧边栏触发器
      ScrollTrigger.create({
        trigger: '.overlap-section',
        start: 'top 75%',
        onEnter: () => document.getElementById('showcase-root')?.classList.add('hide-sidebars'),
        onLeaveBack: () => document.getElementById('showcase-root')?.classList.remove('hide-sidebars'),
      });

      // 背景巨大英文单词视差漂浮
      gsap.to('.stroke-overlap-text', { y: -300, ease: 'none', scrollTrigger: { trigger: '.overlap-section', start: 'top bottom', end: 'bottom top', scrub: true } });
      
      // 所有图片的遮罩拉开 & 内部视差位移
      const imageContainers = gsap.utils.toArray('.img-mask-container');
      imageContainers.forEach((container: any) => {
        const img = container.querySelector('.parallax-img');
        gsap.fromTo(container, 
          { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' },
          { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', ease: 'expo.out', duration: 1.5, scrollTrigger: { trigger: container, start: 'top 85%' } }
        );
        if (img) gsap.to(img, { yPercent: 15, ease: 'none', scrollTrigger: { trigger: container, start: 'top bottom', end: 'bottom top', scrub: true } });
      });

      // 所有文字块的上浮淡入效果
      const textBlocks = gsap.utils.toArray('.content-block');
      textBlocks.forEach((block: any) => {
        gsap.fromTo(block, 
          { y: 50, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: block, start: 'top 85%' } }
        );
      });

    }, containerRef);

    // 给页面一点时间加载完高清大图，然后强制重新计算高度，防止触发器错位
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    return () => { 
      clearTimeout(timer);
      ctx.revert(); 
    };
  }, [isReadyToAnimate]); // 依赖项加上 isReadyToAnimate，确保重跑一次

  return (
    // 🚀 将原本的 ref={containerRef} 改为 ref={setRef}，激活雷达
    <StudioLayout>
    <main ref={setRef} className="overflow-x-hidden pb-32">
      <style jsx global>{`
        .stroke-text { -webkit-text-stroke: 2px var(--sc-text); color: transparent; }
      `}</style>
      
      {/* ==================== 1. Hero 区域 ==================== */}
{/* ==================== 1. Hero 区域 ==================== */}
      {/* 🚀 核心修改：将 justify-center 改为 justify-start，让大字向上吸顶 */}
      {/* 💡 吸顶距离：通过 pt-28 (移动端) 和 md:pt-40 (PC端) 精准控制与 Header 的间距 */}
      {/* 💡 缓冲高度：保留 min-h-[70vh] 撑开底部空间，防止下方的 VISION 动画在加载时提前触发 */}
      <section className="relative min-h-[70vh] lg:min-h-[85vh] flex flex-col justify-start px-6 lg:px-12 pt-28 md:pt-40 pb-20">
        <div className="relative z-10">
          <div className="uppercase font-black text-[clamp(4rem,11vw,16rem)] leading-[0.85] tracking-tighter text-[var(--sc-text)]">
            <SplitText text="ZHIHUI" />
          </div>
          <div className="uppercase font-black text-[clamp(4rem,11vw,16rem)] leading-[0.85] tracking-tighter text-[var(--sc-text)]">
            <SplitText text="CREATIVE" />
          </div>
          <div className="uppercase font-black text-[clamp(4rem,11vw,16rem)] leading-[0.85] tracking-tighter text-[var(--sc-text)]">
            <SplitText text="STUDIO" />
          </div>
        </div>

        <div className="hero-bottom-content mt-12 md:mt-16 flex flex-col md:flex-row md:items-center gap-8 md:gap-12 opacity-0">
          <div className="text-xs md:text-sm font-bold tracking-widest leading-tight max-w-[280px] md:max-w-[400px] uppercase sc-border border-l-4 pl-4">
            Breaking grids. Defying templates. Pure uncompromising digital architecture.
          </div>
          <Link 
            href="/blog" 
            onMouseMove={handleMouseMove}
            className="group relative overflow-hidden bg-[var(--sc-inverse-bg)] border border-[var(--sc-inverse-bg)] px-10 py-5 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 duration-500 ease-[cubic-bezier(0.8,0,0.2,1)] isolate w-fit"
          >
            <span className="relative z-10 font-black text-xs md:text-sm uppercase tracking-[0.2em] text-[var(--sc-inverse-text)] transition-colors duration-300 group-hover:text-transparent">Access Logs</span>
            <span className="relative z-10 font-black text-xs md:text-sm text-[var(--sc-inverse-text)] group-hover:translate-x-3 transition-transform duration-500 ease-[cubic-bezier(0.8,0,0.2,1)] ml-4">→</span>
            <div 
              className="absolute inset-0 bg-[var(--sc-bg)] pointer-events-none z-20 flex items-center justify-center px-10 group-hover:animate-[rippleSpread_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards]"
              style={{ clipPath: 'circle(0% at var(--x, 50%) var(--y, 50%))' }}
            >
              <span className="font-black text-xs md:text-sm uppercase tracking-[0.2em] text-[var(--sc-text)]">Access Logs</span>
              <span className="font-black text-xs md:text-sm text-[var(--sc-text)] group-hover:translate-x-3 transition-transform duration-500 ease-[cubic-bezier(0.8,0,0.2,1)] ml-4">→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ==================== 2. VISION & 跑马灯 ==================== */}
      <section className="text-mask-section h-[40vh] md:h-[60vh] flex flex-col items-center justify-center sc-border border-y relative z-10 bg-[var(--sc-bg)]">
         <h2 className="text-mask-bg text-[20vw] xl:text-[15rem] font-black uppercase tracking-tighter leading-none m-0 p-0 w-full text-center" style={{ backgroundImage: "url('/uploads/1773747290074-dbc2a046d7e894928498b6c95ad29482.jpg')", backgroundSize: '120%', backgroundPosition: '50% 0%', WebkitBackgroundClip: 'text', color: 'transparent' }}>
           VISION
         </h2>
      </section>

      <section className="py-8 md:py-12 overflow-hidden sc-bg-inverse flex whitespace-nowrap transform -rotate-2 scale-110 relative z-20 shadow-2xl mt-12 md:mt-20">
        <div className="marquee-track flex gap-12 text-5xl md:text-7xl font-black uppercase tracking-tighter">
           <span>ZHIHUI STUDIO · PURE CODE · ZERO COMPROMISES · BESPOKE ARCHITECTURE ·</span>
           <span>ZHIHUI STUDIO · PURE CODE · ZERO COMPROMISES · BESPOKE ARCHITECTURE ·</span>
        </div>
      </section>

      {/* ==================== 3. 图像矩阵区 (PHILOSOPHY) ==================== */}
      <section className="overlap-section relative pt-8 pb-16 md:py-32 px-6 lg:px-12 mt-0 md:mt-20">
        <div className="stroke-overlap-text absolute top-[2%] md:top-[5%] left-[5%] text-[15vw] font-black uppercase tracking-tighter stroke-text z-0 pointer-events-none opacity-20 whitespace-nowrap">
          PHILOSOPHY
        </div>

        <div className="relative z-10 flex flex-col gap-12 md:gap-48 mt-6 md:mt-20 max-w-[1600px] mx-auto w-full">
          {/* Item 1：左图右文 */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <div className="w-full md:w-7/12 order-1">
              <div className="img-mask-container w-full h-[60vh] md:h-[80vh] max-h-[750px] bg-[var(--sc-border)] relative overflow-hidden">
                <img src="/uploads/1773764885354-b53ef7f6ef4665411f4282b6ced7fe32.jpg" alt="Boundless" className="parallax-img absolute -top-[15%] left-0 w-full h-[130%] object-cover object-center opacity-90" />
              </div>
            </div>
            <div className="w-full md:w-5/12 content-block order-2">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-60">01 / Mindset</div>
              <h3 className="text-[clamp(2rem,3.5vw,4.5rem)] font-black tracking-tight uppercase mb-6">Boundless</h3>
              <p className="text-[clamp(0.875rem,1.2vw,1.25rem)] font-medium leading-relaxed opacity-80 mb-6">
                The world tries to put you in a box. It gives you templates, rules, and boundaries. But true creativity begins the moment you step off the edge. Embrace the vastness. Your potential is only limited by your perception.
              </p>
              <div className="sc-border border-l-2 pl-4 text-[10px] uppercase tracking-widest font-bold opacity-60">Seek the edge</div>
            </div>
          </div>

          {/* Item 2：右图左文 */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <div className="w-full md:w-5/12 content-block order-2 md:order-1 text-left md:text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-60">02 / Execution</div>
              <h3 className="text-[clamp(2rem,3.5vw,4.5rem)] font-black tracking-tight uppercase mb-6">Laser Focus</h3>
              <p className="text-[clamp(0.875rem,1.2vw,1.25rem)] font-medium leading-relaxed opacity-80 mb-6 md:ml-auto">
                In an era of endless distractions, focus is the ultimate superpower. Cut the noise. Direct your energy inward. The path to mastery requires shutting out the applause and the criticism, and narrowing your vision to the single task at hand.
              </p>
              <div className="sc-border border-l-2 md:border-l-0 md:border-r-2 pl-4 md:pl-0 md:pr-4 text-[10px] uppercase tracking-widest font-bold opacity-60">Eliminate noise</div>
            </div>
            <div className="w-full md:w-7/12 order-1 md:order-2">
              <div className="img-mask-container w-full h-[60vh] md:h-[80vh] max-h-[750px] bg-[var(--sc-border)] relative overflow-hidden">
                <img src="/uploads/1773764877338-5424f054c587adc8c024d07f9f7282b9.jpg" alt="Laser Focus" className="parallax-img absolute -top-[12%] left-0 w-full h-[125%] object-cover object-center" />
              </div>
            </div>
          </div>

          {/* Item 3：左图右文 */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <div className="w-full md:w-6/12 order-1">
              <div className="img-mask-container w-full h-[55vh] md:h-[60vh] bg-[var(--sc-border)] relative overflow-hidden">
                <img src="/uploads/1773764865685-a2d455fc052fe6d9ca142f9acbab7a93.jpg" alt="Green Light" className="parallax-img absolute -top-[15%] left-0 w-full h-[130%] object-cover object-center" />
              </div>
            </div>
            <div className="w-full md:w-6/12 content-block order-2">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-60">03 / Action</div>
              <h3 className="text-[clamp(2rem,3.5vw,4.5rem)] font-black tracking-tight uppercase mb-6">Green Light</h3>
              <p className="text-[clamp(0.875rem,1.2vw,1.25rem)] font-medium leading-relaxed opacity-80 mb-6">
                Stop waiting for permission. The perfect moment is an illusion constructed by fear. The light is already green. The only thing standing between your current reality and your ambitious vision is the courage to press the pedal.
              </p>
              <div className="sc-border border-l-2 pl-4 text-[10px] uppercase tracking-widest font-bold opacity-60">Start now</div>
            </div>
          </div>

          {/* Item 4：右图左文 */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <div className="w-full md:w-5/12 content-block order-2 md:order-1 text-left md:text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-60">04 / Mastery</div>
              <h3 className="text-[clamp(2rem,3.5vw,4.5rem)] font-black tracking-tight uppercase mb-6">Relentless</h3>
              <p className="text-[clamp(0.875rem,1.2vw,1.25rem)] font-medium leading-relaxed opacity-80 mb-6 md:ml-auto">
                Endurance isn't just about surviving the pressure; it's about letting the pressure forge you into greatness. When everyone expects you to fold, that is exactly when you must rise. If you quit, they were right about you. Don't give them that satisfaction.
              </p>
              <div className="sc-border border-l-2 md:border-l-0 md:border-r-2 pl-4 md:pl-0 md:pr-4 text-[10px] uppercase tracking-widest font-bold opacity-60">Never fold</div>
            </div>
            <div className="w-full md:w-7/12 order-1 md:order-2">
              <div className="img-mask-container w-full h-[60vh] md:h-[90vh] bg-[var(--sc-border)] relative overflow-hidden">
                <img src="/uploads/1773764633034-68a739ee9fe997396263e982567d9e33.jpg" alt="Relentless" className="parallax-img absolute -top-[12%] left-0 w-full h-[125%] object-cover object-top" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 4. 篮球文化 / 欧文模块 ==================== */}
      <section className="basketball-section relative py-32 px-6 lg:px-12 mt-12">
        <div className="stroke-overlap-text absolute top-[10%] right-[5%] text-[15vw] font-black uppercase tracking-tighter stroke-text z-0 pointer-events-none opacity-20 whitespace-nowrap">
          BASKETBALL
        </div>

        <div className="relative z-10 flex flex-col gap-32 md:gap-48 mt-20 max-w-[1600px] mx-auto w-full">
          {/* Item 1：左图右文 */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <div className="w-full md:w-6/12 order-1">
              <div className="img-mask-container w-full h-[50vh] md:h-[60vh] bg-[var(--sc-border)] relative overflow-hidden">
                <img src="/uploads/1773764699908-bed7b0c02faf6ce82f0e0b3d4e8a923a.jpg" alt="Streetball Roots" className="parallax-img absolute -top-[15%] left-0 w-full h-[130%] object-cover object-center" />
              </div>
            </div>
            <div className="w-full md:w-6/12 content-block order-2">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-60">01 / Origins</div>
              <h3 className="text-[clamp(2rem,3.5vw,4.5rem)] font-black tracking-tight uppercase mb-6">Streetball Roots</h3>
              <p className="text-[clamp(0.875rem,1.2vw,1.25rem)] font-medium leading-relaxed opacity-80 mb-6">
                Before the bright lights of the arena, there is the concrete. The chain nets. The raw, unfiltered competition where reputation is earned, not given. It is above the rim where culture is born and authenticated.
              </p>
              <div className="sc-border border-l-2 pl-4 text-[10px] uppercase tracking-widest font-bold opacity-60">Concrete canvas</div>
            </div>
          </div>

          {/* Item 2：右图左文 */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <div className="w-full md:w-6/12 content-block order-2 md:order-1 text-left md:text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-60">02 / Prime</div>
              <h3 className="text-[clamp(2rem,3.5vw,4.5rem)] font-black tracking-tight uppercase mb-6">Brooklyn Era</h3>
              <p className="text-[clamp(0.875rem,1.2vw,1.25rem)] font-medium leading-relaxed opacity-80 mb-6 md:ml-auto">
                Kyrie Irving in Brooklyn was pure isolation artistry. Every possession was a clinic in handles, misdirection, and impossible finishes. It wasn't just about scoring; it was about breaking down the opponent physically and mentally. A true maestro on the hardwood.
              </p>
              <div className="sc-border border-l-2 md:border-l-0 md:border-r-2 pl-4 md:pl-0 md:pr-4 text-[10px] uppercase tracking-widest font-bold opacity-60">Isolation art</div>
            </div>
            <div className="w-full md:w-6/12 order-1 md:order-2">
              <div className="img-mask-container w-full h-[60vh] md:h-[75vh] bg-[var(--sc-border)] relative overflow-hidden">
                <img src="/uploads/1773764640138-8130ed5c124fb5f4d3da0e281ae2e027.jpg" alt="Brooklyn Era" className="parallax-img absolute -top-[12%] left-0 w-full h-[125%] object-cover object-top" />
              </div>
            </div>
          </div>

          {/* Item 3：居中大图收尾 */}
          <div className="flex flex-col items-center text-center gap-12 w-full mt-12">
            <div className="w-full max-w-2xl content-block">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-60">03 / Fluidity</div>
              <h3 className="text-[clamp(2rem,3.5vw,4.5rem)] font-black tracking-tight uppercase mb-6">The Maestro</h3>
              <p className="text-[clamp(0.875rem,1.2vw,1.25rem)] font-medium leading-relaxed opacity-80">
                Unpredictable motion. Fluidity that defies defensive schemes. When you master the fundamentals so deeply that you no longer have to think, you transcend the game. You stop playing basketball and start performing jazz.
              </p>
            </div>
            <div className="w-full lg:w-10/12">
              <div className="img-mask-container w-full h-[60vh] md:h-[85vh] bg-[var(--sc-border)] relative overflow-hidden">
                <img src="/uploads/1773764872552-0263f90d470e22a95a53c422d30d955a.jpg" alt="Fluidity" className="parallax-img absolute -top-[15%] left-0 w-full h-[130%] object-cover object-center" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 5. 学习与沉淀模块 ==================== */}
      <section className="learning-section relative py-32 px-6 lg:px-12 mt-12">
        <div className="stroke-overlap-text absolute top-[10%] left-[-5%] text-[15vw] font-black uppercase tracking-tighter stroke-text z-0 pointer-events-none opacity-20 whitespace-nowrap">
          KNOWLEDGE
        </div>

        <div className="relative z-10 flex flex-col gap-32 md:gap-48 mt-20 max-w-[1600px] mx-auto w-full">
          {/* Item 1：左图右文 */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <div className="w-full md:w-7/12 order-1">
              <div className="img-mask-container w-full h-[60vh] md:h-[80vh] bg-[#1a1a1a] relative overflow-hidden">
                <img src="/uploads/1773764657157-3b1a2b0e7e6e42fc2ef7aedbe633e824.jpg" alt="Deep Work" className="parallax-img absolute -top-[15%] left-0 w-full h-[130%] object-cover object-center opacity-90" />
              </div>
            </div>
            <div className="w-full md:w-5/12 content-block order-2">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-60">01 / Immersion</div>
              <h3 className="text-[clamp(2rem,3.5vw,4.5rem)] font-black tracking-tight uppercase mb-6">Deep Work</h3>
              <p className="text-[clamp(0.875rem,1.2vw,1.25rem)] font-medium leading-relaxed opacity-80 mb-6">
                Real progress happens in the dark. It happens in the silent hours surrounded by code, equations, and textbooks. Absolute immersion is required to tackle hard problems. No shortcuts, just relentless dedication to the craft.
              </p>
              <div className="sc-border border-l-2 pl-4 text-[10px] uppercase tracking-widest font-bold opacity-60">Embrace the grind</div>
            </div>
          </div>

          {/* Item 2：右图左文 */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <div className="w-full md:w-6/12 content-block order-2 md:order-1 text-left md:text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-60">02 / Iteration</div>
              <h3 className="text-[clamp(2rem,3.5vw,4.5rem)] font-black tracking-tight uppercase mb-6">The Loop</h3>
              <p className="text-[clamp(0.875rem,1.2vw,1.25rem)] font-medium leading-relaxed opacity-80 mb-6 md:ml-auto">
                Knowledge without execution is merely potential. True understanding is forged in the crucible of application. Learn, apply, fail, refine. This continuous loop is the only mechanism that turns raw information into tangible wisdom and skill.
              </p>
              <div className="sc-border border-l-2 md:border-l-0 md:border-r-2 pl-4 md:pl-0 md:pr-4 text-[10px] uppercase tracking-widest font-bold opacity-60">Apply relentlessly</div>
            </div>
            <div className="w-full md:w-6/12 order-1 md:order-2">
              <div className="img-mask-container w-full h-[50vh] md:h-[65vh] bg-white relative overflow-hidden p-4 md:p-12">
                <img src="/uploads/1773764682199-3a4375bc2ae641df781711e1c0cc019d.jpg" alt="Iteration" className="parallax-img absolute -top-[10%] left-0 w-full h-[120%] object-contain object-center mix-blend-multiply" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 6. 兴趣与生活模块 ==================== */}
      <section className="hobby-section relative py-32 px-6 lg:px-12 mt-12">
        <div className="stroke-overlap-text absolute top-[10%] right-[5%] text-[15vw] font-black uppercase tracking-tighter stroke-text z-0 pointer-events-none opacity-20 whitespace-nowrap">
          LIFESTYLE
        </div>

        <div className="relative z-10 flex flex-col gap-32 md:gap-48 mt-20 max-w-[1600px] mx-auto w-full">
          {/* Item 1：左图右文 (吉他手) */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <div className="w-full md:w-6/12 order-1">
              <div className="img-mask-container w-full h-[60vh] md:h-[75vh] bg-[#2a2a2a] relative overflow-hidden">
                <img src="/uploads/1773769782699-The_Guitar_Player_Greeting_Card_by_Jose_Manuel_Abraham.jpg" alt="Acoustic Soul" className="parallax-img absolute -top-[15%] left-0 w-full h-[130%] object-cover object-center opacity-90" />
              </div>
            </div>
            <div className="w-full md:w-6/12 content-block order-2">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-60">01 / Rhythm</div>
              <h3 className="text-[clamp(2rem,3.5vw,4.5rem)] font-black tracking-tight uppercase mb-6">Acoustic Soul</h3>
              <p className="text-[clamp(0.875rem,1.2vw,1.25rem)] font-medium leading-relaxed opacity-80 mb-6">
                Beyond the rigid logic of code lies the fluid language of music. The strings offer a different kind of syntax—one where emotion dictates the output. Finding rhythm in the analog world is essential to maintaining balance in the digital one.
              </p>
              <div className="sc-border border-l-2 pl-4 text-[10px] uppercase tracking-widest font-bold opacity-60">Find your tempo</div>
            </div>
          </div>

          {/* Item 2：右图左文 (滑雪) */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <div className="w-full md:w-6/12 content-block order-2 md:order-1 text-left md:text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-60">02 / Gravity</div>
              <h3 className="text-[clamp(2rem,3.5vw,4.5rem)] font-black tracking-tight uppercase mb-6">Free Fall</h3>
              <p className="text-[clamp(0.875rem,1.2vw,1.25rem)] font-medium leading-relaxed opacity-80 mb-6 md:ml-auto">
                Carving through powder is the purest form of moving meditation. When you're suspended in the crisp alpine air, negotiating gravity and terrain, there is no past or future. Only the visceral, immediate reality of the present moment.
              </p>
              <div className="sc-border border-l-2 md:border-l-0 md:border-r-2 pl-4 md:pl-0 md:pr-4 text-[10px] uppercase tracking-widest font-bold opacity-60">Defy gravity</div>
            </div>
            <div className="w-full md:w-6/12 order-1 md:order-2">
              <div className="img-mask-container w-full h-[70vh] md:h-[90vh] max-h-[850px] bg-[#87CEEB] relative overflow-hidden">
                <img src="/uploads/1773764693448-47feac9727767b63ea3c985c2ed8a949.jpg" alt="Free Fall" className="parallax-img absolute -top-[12%] left-0 w-full h-[125%] object-cover object-center" />
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
    </StudioLayout>
  );
}