"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import Link from 'next/link';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const SplitText = ({ text, className = "" }: { text: string, className?: string }) => (
  <div className={`flex overflow-hidden pb-4 -mb-4 ${className}`}>
    {text.split('').map((char, i) => (
      <span key={i} className="hero-char inline-block translate-y-[150%] rotate-12 opacity-0" style={{ whiteSpace: 'pre' }}>
        {char}
      </span>
    ))}
  </div>
);

export default function ShowcasePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), orientation: 'vertical', smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // Hero 动画
      gsap.to('.hero-char', { y: 0, rotation: 0, opacity: 1, stagger: 0.04, duration: 1.5, ease: 'elastic.out(1, 0.6)', delay: 0.2 });
      gsap.fromTo('.hero-bottom-content', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', delay: 1.2 });

      gsap.to('.text-mask-bg', { backgroundPosition: '50% 100%', ease: 'none', scrollTrigger: { trigger: '.text-mask-section', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.to('.marquee-track', { xPercent: -50, repeat: -1, duration: 15, ease: 'none' });
      
      // ==========================================
      // 🚀 核心修改：动态黑白交替触发器 (Zebra-striping Theme Toggle)
      // 在这个数组里的 class，滚动到时背景变黑；离开时自动变白
      // ==========================================
      const darkSections = ['.overlap-section', '.learning-section'];
      
      darkSections.forEach(section => {
        ScrollTrigger.create({
          trigger: section,
          // 当模块顶部到达屏幕中间(50%)时触发变黑
          start: 'top 50%', 
          // 当模块底部离开屏幕中间(50%)时触发变白
          end: 'bottom 50%', 
          onEnter: () => document.getElementById('showcase-root')?.classList.add('showcase-inverted'),
          onLeave: () => document.getElementById('showcase-root')?.classList.remove('showcase-inverted'),
          onEnterBack: () => document.getElementById('showcase-root')?.classList.add('showcase-inverted'),
          onLeaveBack: () => document.getElementById('showcase-root')?.classList.remove('showcase-inverted'),
        });
      });

      // 画廊模式开门触发器 (保持不变，只要进了画廊区，侧边栏就一直藏着)
      ScrollTrigger.create({
        trigger: '.overlap-section',
        start: 'top 75%',
        onEnter: () => document.getElementById('showcase-root')?.classList.add('hide-sidebars'),
        onLeaveBack: () => document.getElementById('showcase-root')?.classList.remove('hide-sidebars'),
      });

      gsap.to('.stroke-overlap-text', { y: -300, ease: 'none', scrollTrigger: { trigger: '.overlap-section', start: 'top bottom', end: 'bottom top', scrub: true } });
      
      const imageContainers = gsap.utils.toArray('.img-mask-container');
      imageContainers.forEach((container: any) => {
        const img = container.querySelector('.parallax-img');
        gsap.fromTo(container, 
          { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' },
          { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', ease: 'expo.out', duration: 1.5, scrollTrigger: { trigger: container, start: 'top 85%' } }
        );
        gsap.to(img, { yPercent: 15, ease: 'none', scrollTrigger: { trigger: container, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }, containerRef);

    return () => { ctx.revert(); lenis.destroy(); gsap.ticker.remove((time) => lenis.raf(time * 1000)); };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement | HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--x', `${x}px`);
    e.currentTarget.style.setProperty('--y', `${y}px`);
  };

  return (
    <main ref={containerRef} className="overflow-x-hidden pb-32">
      <style jsx global>{`
        .stroke-text { -webkit-text-stroke: 2px var(--sc-text); color: transparent; }
      `}</style>

      {/* Hero 区域 */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-6 lg:px-12 pt-32 pb-20">
        <div className="relative z-10">
          <div className="uppercase font-black text-[12vw] xl:text-[9rem] leading-[0.85] tracking-tighter text-[var(--sc-text)]"><SplitText text="ZHIHUI" /></div>
          <div className="uppercase font-black text-[12vw] xl:text-[9rem] leading-[0.85] tracking-tighter text-[var(--sc-text)]"><SplitText text="CREATIVE" /></div>
          <div className="uppercase font-black text-[12vw] xl:text-[9rem] leading-[0.85] tracking-tighter text-[var(--sc-text)]"><SplitText text="STUDIO" /></div>
        </div>

        <div className="hero-bottom-content mt-12 md:mt-16 flex flex-col md:flex-row md:items-center gap-8 md:gap-12 opacity-0">
          <div className="text-xs md:text-sm font-bold tracking-widest leading-tight max-w-[280px] md:max-w-[400px] uppercase sc-border border-l-4 pl-4">
            Breaking grids. Defying templates. Pure uncompromising digital architecture.
          </div>
          
          <Link 
            href="/" 
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

      {/* VISION */}
      <section className="text-mask-section h-[60vh] flex flex-col items-center justify-center sc-border border-y relative z-10 bg-[var(--sc-bg)]">
         <h2 className="text-mask-bg text-[20vw] xl:text-[15rem] font-black uppercase tracking-tighter leading-none m-0 p-0 w-full text-center" style={{ backgroundImage: "url('/uploads/1773747290074-dbc2a046d7e894928498b6c95ad29482.jpg')", backgroundSize: '120%', backgroundPosition: '50% 0%', WebkitBackgroundClip: 'text', color: 'transparent' }}>
           VISION
         </h2>
      </section>

      <section className="py-12 overflow-hidden sc-bg-inverse flex whitespace-nowrap transform -rotate-2 scale-110 relative z-20 shadow-2xl mt-20">
        <div className="marquee-track flex gap-12 text-5xl md:text-7xl font-black uppercase tracking-tighter">
           <span>ZHIHUI STUDIO · PURE CODE · ZERO COMPROMISES · BESPOKE ARCHITECTURE ·</span>
           <span>ZHIHUI STUDIO · PURE CODE · ZERO COMPROMISES · BESPOKE ARCHITECTURE ·</span>
        </div>
      </section>

      {/* 图像矩阵区 */}
      <section className="overlap-section relative py-32 px-6 lg:px-12 mt-20">
        
        <div className="stroke-overlap-text absolute top-[5%] left-[5%] text-[15vw] font-black uppercase tracking-tighter stroke-text z-0 pointer-events-none opacity-20 whitespace-nowrap">
          PHILOSOPHY
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-y-24 md:gap-x-12 mt-20">
          
          {/* 图1：1000*1500 (悬崖自由) */}
          <div className="md:col-span-7 relative">
            <div className="img-mask-container w-full h-[60vh] md:h-[80vh] bg-[var(--sc-border)] relative overflow-hidden">
              <img src="/uploads/1773764885354-b53ef7f6ef4665411f4282b6ced7fe32.jpg" alt="Boundless" className="parallax-img absolute -top-[15%] left-0 w-full h-[130%] object-cover object-center opacity-90" />
            </div>
            <div className="absolute -bottom-10 -left-4 md:-left-8 sc-bg-inverse p-6 shadow-2xl z-20 transition-transform hover:scale-105 duration-300">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-60">01 / Mindset</div>
              <div className="text-2xl md:text-4xl font-black tracking-tight uppercase">Boundless</div>
              <p className="text-xs font-bold mt-2 opacity-80 uppercase tracking-widest max-w-[200px]">Embrace the vastness.<br/>Your potential is only limited by your perception.</p>
            </div>
          </div>

          {/* 图2：736*1011 (Focus on yourself) */}
          <div className="md:col-span-5 relative mt-12 md:mt-[35vh]">
            <div className="img-mask-container w-full h-[60vh] md:h-[80vh] bg-[var(--sc-border)] relative overflow-hidden">
              <img src="/uploads/1773764877338-5424f054c587adc8c024d07f9f7282b9.jpg" alt="Laser Focus" className="parallax-img absolute -top-[12%] left-0 w-full h-[125%] object-cover object-center" />
            </div>
            <div className="absolute top-12 -right-4 md:-right-8 sc-bg-inverse p-5 rotate-2 shadow-2xl z-20 transition-transform hover:rotate-0 hover:scale-105 duration-300">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">02 / Execution</div>
              <div className="text-xl md:text-2xl font-black tracking-tight uppercase">Laser Focus</div>
              <p className="text-[10px] font-bold mt-2 opacity-80 uppercase tracking-widest">Cut the noise.<br/>Direct your energy inward.</p>
            </div>
          </div>

          {/* 图3：735*792 (绿灯 What are you waiting for) */}
          <div className="md:col-span-5 relative mt-12 md:mt-20">
            <div className="img-mask-container w-full h-[55vh] md:h-[50vh] bg-[var(--sc-border)] relative overflow-hidden">
              {/* 改为了 object-cover，不留白边 */}
              <img src="/uploads/1773764865685-a2d455fc052fe6d9ca142f9acbab7a93.jpg" alt="Green Light" className="parallax-img absolute -top-[15%] left-0 w-full h-[130%] object-cover object-center" />
            </div>
            <div className="absolute -top-6 -left-4 md:-left-12 sc-bg-inverse p-5 shadow-xl z-20 transition-transform hover:scale-105 duration-300">
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">03 / Action</div>
              <div className="text-xl md:text-3xl font-black tracking-tight uppercase">Green Light</div>
              <p className="text-[10px] font-bold mt-2 opacity-80 uppercase tracking-widest max-w-[180px]">The perfect moment is an illusion. Start now.</p>
            </div>
          </div>

          {/* 图4：563*708 (梅西 If you quit...) */}
          <div className="md:col-span-7 relative mt-12 md:mt-[-10vh]">
            {/* 移除了原本的 p-8 内边距，改为高度贴合比例的 65vh */}
            <div className="img-mask-container w-full h-[60vh] md:h-[100vh] bg-[var(--sc-border)] relative overflow-hidden">
              <img src="/uploads/1773764633034-68a739ee9fe997396263e982567d9e33.jpg" alt="Relentless" className="parallax-img absolute -top-[12%] left-0 w-full h-[125%] object-cover object-top" />
            </div>
            <div className="absolute bottom-12 -right-4 md:-right-8 sc-bg-inverse p-6 shadow-2xl z-20 flex items-center gap-6 transition-transform hover:scale-105 duration-300">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-60">04 / Mastery</div>
                <div className="text-2xl md:text-4xl font-black tracking-tight uppercase">Relentless</div>
              </div>
              <div className="sc-border border-l-2 pl-6 text-[10px] md:text-xs font-bold leading-relaxed opacity-80 uppercase tracking-widest max-w-[160px]">
                Endure the pressure. <br/> Let it forge you <br/> into greatness.
              </div>
            </div>
          </div>

        </div>
      </section>
      {/* ===== 新增：篮球文化 / 欧文模块 ===== */}
      <section className="basketball-section relative py-32 px-6 lg:px-12 mt-12">
        
        {/* 背景漂浮大字，制造空间纵深感 */}
        <div className="stroke-overlap-text absolute top-[-5%] right-[10%] text-[15vw] font-black uppercase tracking-tighter stroke-text z-0 pointer-events-none opacity-20 whitespace-nowrap">
          BASKETBALL
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-y-24 md:gap-x-12 mt-20">
          
          {/* 图1：街球框 (坐框黑夜) 
              布局说明：占据左侧 6 列 (一半宽度)。因为图片偏正方形/横向，高度设定为 60vh。
          */}
          <div className="md:col-span-6 relative">
            <div className="img-mask-container w-full h-[60vh] bg-[var(--sc-border)] relative overflow-hidden">
              <img src="/uploads/1773764699908-bed7b0c02faf6ce82f0e0b3d4e8a923a.jpg" alt="Streetball Roots" className="parallax-img absolute -top-[15%] left-0 w-full h-[130%] object-cover object-center" />
            </div>
            {/* 文案框定位在右下角，打破网格边缘 */}
            <div className="absolute -bottom-8 -right-4 md:-right-8 sc-bg-inverse p-5 shadow-2xl z-20 transition-transform hover:scale-105 duration-300">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">01 / Origins</div>
              <div className="text-xl md:text-3xl font-black tracking-tight uppercase">Streetball</div>
              <p className="text-[10px] font-bold mt-2 opacity-80 uppercase tracking-widest max-w-[180px]">Above the rim. <br/> Where culture is born.</p>
            </div>
          </div>

          {/* 图2：欧文篮网黑色海报
              布局说明：占据 5 列。使用 md:col-start-8 强制将它推到右侧（留出中间 1 列的空白呼吸感）。
              参数调整：md:mt-[20vh] 让它比左边的图低很多，形成强烈的阶梯错位视差。
          */}
          <div className="md:col-span-5 md:col-start-8 relative mt-12 md:mt-[20vh]">
            <div className="img-mask-container w-full h-[60vh] md:h-[75vh] bg-[var(--sc-border)] relative overflow-hidden">
              {/* object-top 保证头图人物脸部不被裁掉 */}
              <img src="/uploads/1773764640138-8130ed5c124fb5f4d3da0e281ae2e027.jpg" alt="Brooklyn Era" className="parallax-img absolute -top-[12%] left-0 w-full h-[125%] object-cover object-top" />
            </div>
            {/* 文案框定位在左上角，与图片1形成对角线呼应 */}
            <div className="absolute top-12 -left-4 md:-left-12 sc-bg-inverse p-6 shadow-2xl z-20 transition-transform hover:scale-105 duration-300">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-60">02 / Prime</div>
              <div className="text-2xl md:text-4xl font-black tracking-tight uppercase">Brooklyn Era</div>
              <p className="text-xs font-bold mt-2 opacity-80 uppercase tracking-widest">Kyrie Irving. <br/> Pure isolation artistry.</p>
            </div>
          </div>

          {/* 图3：欧文蓝色流体拼贴海报
              布局说明：压轴大图，占据中间 8 列 (md:col-span-8 md:col-start-3)，像一幅巨大的壁画。
              参数调整：md:mt-[15vh] 延续向下的节奏感。高度拉满到 85vh，极具视觉冲击力。
          */}
          <div className="md:col-span-8 md:col-start-3 relative mt-12 md:mt-[15vh]">
            <div className="img-mask-container w-full h-[60vh] md:h-[85vh] bg-[var(--sc-border)] relative overflow-hidden">
              <img src="/uploads/1773764872552-0263f90d470e22a95a53c422d30d955a.jpg" alt="Fluidity" className="parallax-img absolute -top-[15%] left-0 w-full h-[130%] object-cover object-center" />
            </div>
            {/* 底部文案框，使用双栏结构 */}
            <div className="absolute bottom-12 -right-4 md:-right-8 sc-bg-inverse p-6 shadow-2xl z-20 flex items-center gap-6 transition-transform hover:scale-105 duration-300">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-60">03 / Fluidity</div>
                <div className="text-2xl md:text-4xl font-black tracking-tight uppercase">The Maestro</div>
              </div>
              <div className="sc-border border-l-2 pl-6 text-[10px] md:text-xs font-bold leading-relaxed opacity-80 uppercase tracking-widest max-w-[200px]">
                Unpredictable motion. <br/> Breaking defenses <br/> like breaking rules.
              </div>
            </div>
          </div>

        </div>
      </section>
{/* ===== 新增：学习与沉淀模块 ===== */}
      <section className="learning-section relative py-32 px-6 lg:px-12 mt-12">
        
        {/* 背景漂浮大字 */}
        <div className="stroke-overlap-text absolute top-[10%] left-[-5%] text-[15vw] font-black uppercase tracking-tighter stroke-text z-0 pointer-events-none opacity-20 whitespace-nowrap">
          KNOWLEDGE
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-y-24 md:gap-x-12 mt-20">
          
          {/* 图1：暗黑书桌 (Deep Work)
              布局说明：占据左侧 7 列。因为是竖图且氛围感极强，高度设为 80vh，作为该模块的视觉锚点。
          */}
          <div className="md:col-span-7 relative">
            <div className="img-mask-container w-full h-[60vh] md:h-[80vh] bg-[#1a1a1a] relative overflow-hidden">
              <img src="/uploads/1773764657157-3b1a2b0e7e6e42fc2ef7aedbe633e824.jpg" alt="Deep Work" className="parallax-img absolute -top-[15%] left-0 w-full h-[130%] object-cover object-center opacity-90" />
            </div>
            {/* 文案框定位在左下角，突破网格对齐 */}
            <div className="absolute -bottom-10 -left-4 md:-left-8 sc-bg-inverse p-6 shadow-2xl z-20 transition-transform hover:scale-105 duration-300">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-60">01 / Immersion</div>
              <div className="text-2xl md:text-4xl font-black tracking-tight uppercase">Deep Work</div>
              <p className="text-xs font-bold mt-2 opacity-80 uppercase tracking-widest max-w-[220px]">Code, equations, and the silent hours of absolute focus.</p>
            </div>
          </div>

          {/* 图2：Learn & Apply 插图 (The Loop)
              布局说明：占据右侧 5 列。配合大幅度的 margin-top (md:mt-[35vh])，让它与左图形成夸张的高低错位。
              参数调整：因为这张图是带有文字和白底的插画，我将其背景设为纯白(bg-white)，并且在视差处理上让它居中呈现。
          */}
          <div className="md:col-span-5 relative mt-12 md:mt-[35vh]">
            <div className="img-mask-container w-full h-[50vh] md:h-[55vh] bg-white relative overflow-hidden p-4 md:p-8">
              {/* 这里使用了 object-contain 配合居中，确保楼梯和文字不会被裁切掉 */}
              <img src="/uploads/1773764682199-3a4375bc2ae641df781711e1c0cc019d.jpg" alt="Iteration" className="parallax-img absolute -top-[10%] left-0 w-full h-[120%] object-contain object-center mix-blend-multiply" />
            </div>
            {/* 文案框定位在右上角 */}
            <div className="absolute top-12 -right-4 md:-right-8 sc-bg-inverse p-5 rotate-2 shadow-2xl z-20 transition-transform hover:rotate-0 hover:scale-105 duration-300">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">02 / Iteration</div>
              <div className="text-xl md:text-2xl font-black tracking-tight uppercase">The Loop</div>
              <p className="text-[10px] font-bold mt-2 opacity-80 uppercase tracking-widest max-w-[180px]">Knowledge is potential. <br/> Application is power.</p>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}