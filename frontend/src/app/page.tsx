"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import StudioLayout from '@/components/StudioLayout';
import { getHomePageConfigAction } from '@/app/actions';
import Footer from '@/components/Footer';
import SplitText from '@/components/SplitText';
import type { PageData, PageSection, ContentBlock } from '@/types/page';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// =========================================================================
// 🚀 默认兜底数据 (当数据库为空或请求失败时使用，保证页面绝不崩溃)
// =========================================================================
const DEFAULT_PAGE_DATA: PageData = {
  hero: {
    titles: ["ZHIHUI", "CREATIVE", "STUDIO"],
    subtitle: "Breaking grids. Defying templates. Pure uncompromising digital architecture.",
    btnText: "Access Logs",
    btnLink: "/blog"
  },
  vision: {
    title: "VISION",
    image: "/uploads/1773747290074-dbc2a046d7e894928498b6c95ad29482.jpg"
  },
  sections: [
    {
      id: "philosophy",
      title: "PHILOSOPHY",
      className: "overlap-section",
      isDarkTheme: true,
      hideSidebars: true,
      blocks: [
        {
          layout: "left-img",
          subtitle: "01 / Mindset",
          title: "Boundless",
          desc: "The world tries to put you in a box. It gives you templates, rules, and boundaries. But true creativity begins the moment you step off the edge. Embrace the vastness. Your potential is only limited by your perception.",
          tag: "Seek the edge",
          imgSrc: "/uploads/1773764885354-b53ef7f6ef4665411f4282b6ced7fe32.jpg",
          imgAlt: "Boundless",
          imgWrapperClass: "w-full md:w-7/12",
          textWrapperClass: "w-full md:w-5/12",
          imgContainerClass: "w-full h-[60vh] md:h-[80vh] max-h-[750px] bg-[var(--sc-border)]",
          imgClass: "-top-[15%] left-0 w-full h-[130%] object-cover object-center opacity-90"
        },
        {
          layout: "right-img",
          subtitle: "02 / Execution",
          title: "Laser Focus",
          desc: "In an era of endless distractions, focus is the ultimate superpower. Cut the noise. Direct your energy inward. The path to mastery requires shutting out the applause and the criticism, and narrowing your vision to the single task at hand.",
          tag: "Eliminate noise",
          imgSrc: "/uploads/1773764877338-5424f054c587adc8c024d07f9f7282b9.jpg",
          imgAlt: "Laser Focus",
          imgWrapperClass: "w-full md:w-7/12",
          textWrapperClass: "w-full md:w-5/12",
          imgContainerClass: "w-full h-[60vh] md:h-[80vh] max-h-[750px] bg-[var(--sc-border)]",
          imgClass: "-top-[12%] left-0 w-full h-[125%] object-cover object-center"
        },
        {
          layout: "left-img",
          subtitle: "03 / Action",
          title: "Green Light",
          desc: "Stop waiting for permission. The perfect moment is an illusion constructed by fear. The light is already green. The only thing standing between your current reality and your ambitious vision is the courage to press the pedal.",
          tag: "Start now",
          imgSrc: "/uploads/1773764865685-a2d455fc052fe6d9ca142f9acbab7a93.jpg",
          imgAlt: "Green Light",
          imgWrapperClass: "w-full md:w-6/12",
          textWrapperClass: "w-full md:w-6/12",
          imgContainerClass: "w-full h-[55vh] md:h-[60vh] bg-[var(--sc-border)]",
          imgClass: "-top-[15%] left-0 w-full h-[130%] object-cover object-center"
        },
        {
          layout: "right-img",
          subtitle: "04 / Mastery",
          title: "Relentless",
          desc: "Endurance isn't just about surviving the pressure; it's about letting the pressure forge you into greatness. When everyone expects you to fold, that is exactly when you must rise. If you quit, they were right about you. Don't give them that satisfaction.",
          tag: "Never fold",
          imgSrc: "/uploads/1773764633034-68a739ee9fe997396263e982567d9e33.jpg",
          imgAlt: "Relentless",
          imgWrapperClass: "w-full md:w-7/12",
          textWrapperClass: "w-full md:w-5/12",
          imgContainerClass: "w-full h-[60vh] md:h-[90vh] bg-[var(--sc-border)]",
          imgClass: "-top-[12%] left-0 w-full h-[125%] object-cover object-top"
        }
      ]
    },
    {
      id: "basketball",
      title: "BASKETBALL",
      className: "basketball-section",
      isDarkTheme: false,
      hideSidebars: false,
      blocks: [
        {
          layout: "left-img",
          subtitle: "01 / Origins",
          title: "Streetball Roots",
          desc: "Before the bright lights of the arena, there is the concrete. The chain nets. The raw, unfiltered competition where reputation is earned, not given. It is above the rim where culture is born and authenticated.",
          tag: "Concrete canvas",
          imgSrc: "/uploads/1773764699908-bed7b0c02faf6ce82f0e0b3d4e8a923a.jpg",
          imgAlt: "Streetball Roots",
          imgWrapperClass: "w-full md:w-6/12",
          textWrapperClass: "w-full md:w-6/12",
          imgContainerClass: "w-full h-[50vh] md:h-[60vh] bg-[var(--sc-border)]",
          imgClass: "-top-[15%] left-0 w-full h-[130%] object-cover object-center"
        },
        {
          layout: "right-img",
          subtitle: "02 / Prime",
          title: "Brooklyn Era",
          desc: "Kyrie Irving in Brooklyn was pure isolation artistry. Every possession was a clinic in handles, misdirection, and impossible finishes. It wasn't just about scoring; it was about breaking down the opponent physically and mentally. A true maestro on the hardwood.",
          tag: "Isolation art",
          imgSrc: "/uploads/1773764640138-8130ed5c124fb5f4d3da0e281ae2e027.jpg",
          imgAlt: "Brooklyn Era",
          imgWrapperClass: "w-full md:w-6/12",
          textWrapperClass: "w-full md:w-6/12",
          imgContainerClass: "w-full h-[60vh] md:h-[75vh] bg-[var(--sc-border)]",
          imgClass: "-top-[12%] left-0 w-full h-[125%] object-cover object-top"
        },
        {
          layout: "center-img",
          subtitle: "03 / Fluidity",
          title: "The Maestro",
          desc: "Unpredictable motion. Fluidity that defies defensive schemes. When you master the fundamentals so deeply that you no longer have to think, you transcend the game. You stop playing basketball and start performing jazz.",
          tag: "",
          imgSrc: "/uploads/1773764872552-0263f90d470e22a95a53c422d30d955a.jpg",
          imgAlt: "Fluidity",
          imgWrapperClass: "w-full lg:w-10/12",
          textWrapperClass: "w-full max-w-2xl",
          imgContainerClass: "w-full h-[60vh] md:h-[85vh] bg-[var(--sc-border)]",
          imgClass: "-top-[15%] left-0 w-full h-[130%] object-cover object-center"
        }
      ]
    },
    {
      id: "knowledge",
      title: "KNOWLEDGE",
      className: "learning-section",
      isDarkTheme: true,
      hideSidebars: false,
      blocks: [
        {
          layout: "left-img",
          subtitle: "01 / Immersion",
          title: "Deep Work",
          desc: "Real progress happens in the dark. It happens in the silent hours surrounded by code, equations, and textbooks. Absolute immersion is required to tackle hard problems. No shortcuts, just relentless dedication to the craft.",
          tag: "Embrace the grind",
          imgSrc: "/uploads/1773764657157-3b1a2b0e7e6e42fc2ef7aedbe633e824.jpg",
          imgAlt: "Deep Work",
          imgWrapperClass: "w-full md:w-7/12",
          textWrapperClass: "w-full md:w-5/12",
          imgContainerClass: "w-full h-[60vh] md:h-[80vh] bg-[#1a1a1a]",
          imgClass: "-top-[15%] left-0 w-full h-[130%] object-cover object-center opacity-90"
        },
        {
          layout: "right-img",
          subtitle: "02 / Iteration",
          title: "The Loop",
          desc: "Knowledge without execution is merely potential. True understanding is forged in the crucible of application. Learn, apply, fail, refine. This continuous loop is the only mechanism that turns raw information into tangible wisdom and skill.",
          tag: "Apply relentlessly",
          imgSrc: "/uploads/1773764682199-3a4375bc2ae641df781711e1c0cc019d.jpg",
          imgAlt: "Iteration",
          imgWrapperClass: "w-full md:w-6/12",
          textWrapperClass: "w-full md:w-6/12",
          imgContainerClass: "w-full h-[50vh] md:h-[65vh] bg-white p-4 md:p-12",
          imgClass: "-top-[10%] left-0 w-full h-[120%] object-contain object-center mix-blend-multiply"
        }
      ]
    },
    {
      id: "lifestyle",
      title: "LIFESTYLE",
      className: "hobby-section",
      isDarkTheme: false,
      hideSidebars: false,
      blocks: [
        {
          layout: "left-img",
          subtitle: "01 / Rhythm",
          title: "Acoustic Soul",
          desc: "Beyond the rigid logic of code lies the fluid language of music. The strings offer a different kind of syntax—one where emotion dictates the output. Finding rhythm in the analog world is essential to maintaining balance in the digital one.",
          tag: "Find your tempo",
          imgSrc: "/uploads/1773769782699-The_Guitar_Player_Greeting_Card_by_Jose_Manuel_Abraham.jpg",
          imgAlt: "Acoustic Soul",
          imgWrapperClass: "w-full md:w-6/12",
          textWrapperClass: "w-full md:w-6/12",
          imgContainerClass: "w-full h-[60vh] md:h-[75vh] bg-[#2a2a2a]",
          imgClass: "-top-[15%] left-0 w-full h-[130%] object-cover object-center opacity-90"
        },
        {
          layout: "right-img",
          subtitle: "02 / Gravity",
          title: "Free Fall",
          desc: "Carving through powder is the purest form of moving meditation. When you're suspended in the crisp alpine air, negotiating gravity and terrain, there is no past or future. Only the visceral, immediate reality of the present moment.",
          tag: "Defy gravity",
          imgSrc: "/uploads/1773764693448-47feac9727767b63ea3c985c2ed8a949.jpg",
          imgAlt: "Free Fall",
          imgWrapperClass: "w-full md:w-6/12",
          textWrapperClass: "w-full md:w-6/12",
          imgContainerClass: "w-full h-[70vh] md:h-[90vh] max-h-[850px] bg-[#87CEEB]",
          imgClass: "-top-[12%] left-0 w-full h-[125%] object-cover object-center"
        }
      ]
    }
  ]
};

// =========================================================================

export default function ShowcasePage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isReadyToAnimate, setIsReadyToAnimate] = useState(false);

  // 🚀 核心状态：用于存储从数据库抓取的动态数据
  const [pageData, setPageData] = useState<PageData | null>(null);

  // 🚀 初始化抓取数据
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await getHomePageConfigAction();
        if (res.success && res.data) {
          setPageData(res.data);
        } else {
          setPageData(DEFAULT_PAGE_DATA);
        }
      } catch (error) {
        setPageData(DEFAULT_PAGE_DATA);
      }
    };
    fetchConfig();
  }, []);

  const setRef = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      containerRef.current = node;
      setIsReadyToAnimate(true);
    }
  }, []);

  const handleMagneticMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, {
      x: x * 0.4,
      y: y * 0.4,
      duration: 0.6,
      ease: "power3.out"
    });
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      x: 0,
      y: 0,
      duration: 1,
      ease: "elastic.out(1, 0.3)"
    });
  };

  useEffect(() => {
    if (!isReadyToAnimate || !containerRef.current || !pageData) return;

    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {

      gsap.to('.hero-char', { y: 0, rotation: 0, opacity: 1, stagger: 0.04, duration: 1.5, ease: 'elastic.out(1, 0.6)', delay: 0.2 });
      gsap.fromTo('.hero-bottom-content', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', delay: 1.2 });

      gsap.to('.text-mask-bg', { backgroundPosition: '50% 100%', ease: 'none', scrollTrigger: { trigger: '.text-mask-section', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.to('.marquee-track', { xPercent: -50, repeat: -1, duration: 15, ease: 'none' });

      const darkSections = pageData.sections.filter((s: PageSection) => s.isDarkTheme).map((s: PageSection) => `.${s.className}`);
      const hideSidebarSections = pageData.sections.filter((s: PageSection) => s.hideSidebars).map((s: PageSection) => `.${s.className}`);

      darkSections.forEach((section: string) => {
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

      hideSidebarSections.forEach((section: string) => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top 75%',
          onEnter: () => document.getElementById('showcase-root')?.classList.add('hide-sidebars'),
          onLeaveBack: () => document.getElementById('showcase-root')?.classList.remove('hide-sidebars'),
        });
      });

      gsap.to('.stroke-overlap-text', { y: -300, ease: 'none', scrollTrigger: { trigger: '.overlap-section', start: 'top bottom', end: 'bottom top', scrub: true } });

      const imageContainers = gsap.utils.toArray('.img-mask-container');
      imageContainers.forEach((container: any) => {
        const img = container.querySelector('.parallax-img');
        gsap.fromTo(container,
          { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' },
          { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', ease: 'expo.out', duration: 1.5, scrollTrigger: { trigger: container, start: 'top 85%' } }
        );
        if (img) gsap.to(img, { yPercent: 15, ease: 'none', scrollTrigger: { trigger: container, start: 'top bottom', end: 'bottom top', scrub: true } });
      });

      const textBlocks = gsap.utils.toArray('.content-block');
      textBlocks.forEach((block: any) => {
        gsap.fromTo(block,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: block, start: 'top 85%' } }
        );
      });

    }, containerRef);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [isReadyToAnimate, pageData]); // 🚀 依赖项加上 pageData

  // 🚀 核心拦截：如果数据还没拉取回来，显示一个与背景同色的空白屏等待，防止出现任何排版闪烁
  if (!pageData) {
    return <div className="min-h-screen bg-[var(--sc-bg)]"></div>;
  }

  const dynamicMarqueeString = `ZHIHUI · ${pageData.sections.map((s: PageSection) => s.title).join(' · ')} · `;

  return (
    <StudioLayout>
      <main ref={setRef} className="overflow-x-hidden">
        <style jsx global>{`
        .stroke-text { -webkit-text-stroke: 2px var(--sc-text); color: transparent; }
      `}</style>

        {/* ==================== 1. Hero 区域 (重构：高端抽象编辑美学) ==================== */}
        <section className="relative min-h-0 md:min-h-[90vh] flex flex-col justify-center px-4 md:px-12 xl:px-8 2xl:px-20 pt-24 pb-12 md:py-24 bg-surface-container-lowest overflow-hidden">

          {/* 背景层 (Artform Background) */}
          <div className="absolute inset-0 pointer-events-none">
            {/* 品牌色氛围光 */}
            <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full bg-secondary-container/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px]" />

            {/* 抽象水印字形 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[70vw] md:text-[45vw] font-headline font-black text-on-surface/[0.03] select-none leading-none -rotate-12">
              Z
            </div>

            {/* 裁切标记 (Crop Marks) - 移动端隐藏 */}
            <div className="hidden md:block absolute top-10 left-10 w-8 h-8 border-t border-l border-outline-variant/40" />
            <div className="hidden md:block absolute top-10 right-10 w-8 h-8 border-t border-r border-outline-variant/40" />
            <div className="hidden md:block absolute bottom-10 left-10 w-8 h-8 border-b border-l border-outline-variant/40" />
            <div className="hidden md:block absolute bottom-10 right-10 w-8 h-8 border-b border-r border-outline-variant/40" />
          </div>

          <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-start gap-6 md:gap-10">

            {/* 顶部技术标注 */}
            <div className="flex flex-col gap-2 font-mono text-[9px] font-bold tracking-[0.3em] uppercase text-on-surface-variant/40 animate-header-layout">
              <div className="flex items-center gap-4">
                <span className="text-primary/60">Ref. 00-26/04</span>
                <div className="h-px w-24 bg-outline-variant/20" />
              </div>
              <span>Electronic Archive // Thoughts & Craft</span>
            </div>

            {/* 核心标题设计 (Typography as Art Object) */}
            <div className="w-full flex flex-col gap-0">
              <div className="font-headline font-black text-on-surface text-[clamp(3rem,8vw,10.5rem)] leading-[0.8] tracking-tighter uppercase z-20">
                <SplitText text={pageData.hero.titles[0] || "ZHIHUI"} />
              </div>

              <div className="font-headline font-light italic text-on-surface-variant/80 md:text-on-surface-variant/60 text-[clamp(2.5rem,7vw,9.5rem)] leading-[0.85] tracking-tight lowercase z-10 pl-[5%] md:pl-[12%] py-1 md:py-2">
                <SplitText text={pageData.hero.titles[1] || "creative"} />
              </div>

              <div className="font-sans font-black text-on-surface text-[clamp(2.5rem,7vw,9.5rem)] leading-[0.8] tracking-tight uppercase z-30 flex items-center gap-6">
                <div className="h-[2px] w-[0.15em] bg-on-surface/20 hidden md:block" />
                <SplitText text={pageData.hero.titles[2] || "STUDIO"} />
                <span className="text-[12px] font-mono tracking-widest text-on-surface-variant/30 hidden lg:block">
                  [V3.0_ARTIFACT]
                </span>
              </div>
            </div>

            {/* 底部排版块 (Left-Right Layout) */}
            <div className="w-full flex flex-row items-end justify-between gap-4 md:gap-6 hero-bottom-content opacity-0">
              <div className="border-l-2 border-outline-variant/30 pl-4 md:pl-6 py-1 md:py-2 min-w-0 flex-1">
                <p className="font-headline text-sm md:text-lg xl:text-xl leading-relaxed text-on-surface-variant/80 font-light italic">
                  &ldquo;{pageData.hero.subtitle}&rdquo;
                </p>
                <div className="mt-2 md:mt-6 flex items-center gap-2 md:gap-3">
                  <div className="h-px w-6 md:w-12 bg-outline-variant/30" />
                  <span className="text-[7px] md:text-[9px] font-mono font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase text-on-surface-variant/30">EST. 2024</span>
                </div>
              </div>

              <div className="shrink-0">
                <Link
                  href={pageData.hero.btnLink}
                  onMouseMove={handleMagneticMove}
                  onMouseLeave={handleMagneticLeave}
                  className="group relative inline-flex items-center gap-3 md:gap-6 px-4 md:px-8 py-3 md:py-5 border border-on-surface/8 hover:border-on-surface/20 transition-colors duration-700 bg-surface/50 backdrop-blur-sm overflow-hidden"
                >
                  <div className="relative z-10 flex flex-col overflow-hidden h-[20px] md:h-[22px]">
                    <span className="font-body text-xs md:text-sm font-bold tracking-[0.1em] md:tracking-[0.15em] text-on-surface leading-[20px] md:leading-[22px] transition-transform duration-500 group-hover:-translate-y-full">
                      {pageData.hero.btnText || "阅读文章"}
                    </span>
                    <span className="font-body text-xs md:text-sm font-bold tracking-[0.1em] md:tracking-[0.15em] text-on-surface leading-[20px] md:leading-[22px] transition-transform duration-500 group-hover:-translate-y-full">
                      {pageData.hero.btnText || "阅读文章"}
                    </span>
                  </div>

                  {/* 箭头 */}
                  <svg className="w-4 h-4 text-on-surface/30 group-hover:text-on-surface group-hover:translate-x-1 transition-all duration-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>

                  {/* 扫描线效果 */}
                  <div className="absolute inset-0 w-full h-[1px] bg-gradient-to-r from-transparent via-on-surface/10 to-transparent -translate-y-full group-hover:animate-scan" />
                  <div className="absolute inset-0 bg-on-surface opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700" />
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* ==================== 2. VISION & 跑马灯 ==================== */}
        <section className="text-mask-section h-[40vh] md:h-[60vh] flex flex-col items-center justify-center sc-border border-y relative z-10 bg-[var(--sc-bg)]">
          <h2 className="text-mask-bg text-[20vw] xl:text-[15rem] font-black uppercase tracking-tighter leading-none m-0 p-0 w-full text-center" style={{ backgroundImage: `url('${pageData.vision.image}')`, backgroundSize: '120%', backgroundPosition: '50% 0%', WebkitBackgroundClip: 'text', color: 'transparent' }}>
            {pageData.vision.title}
          </h2>
        </section>

        <section className="py-8 md:py-12 overflow-hidden sc-bg-inverse flex whitespace-nowrap transform -rotate-2 scale-110 relative z-20 shadow-2xl mt-12 md:mt-20">
          <div className="marquee-track flex gap-12 text-5xl md:text-7xl font-black uppercase tracking-tighter">
            <span>{dynamicMarqueeString}</span>
            <span>{dynamicMarqueeString}</span>
          </div>
        </section>

        {/* ==================== 3. 动态渲染所有 Sections ==================== */}
        {pageData.sections.map((section: PageSection, secIdx: number) => (
          <section key={section.id || secIdx} className={`${section.className} relative ${secIdx === 0 ? 'pt-8 pb-16 md:py-32 mt-0 md:mt-20' : 'py-32'} px-6 lg:px-12 mt-12`}>

            <div className={`stroke-overlap-text absolute ${secIdx % 2 === 0 ? 'top-[2%] md:top-[5%] left-[5%]' : 'top-[10%] right-[5%]'} text-[15vw] font-black uppercase tracking-tighter stroke-text z-0 pointer-events-none opacity-20 whitespace-nowrap`}>
              {section.title}
            </div>

            <div className="relative z-10 flex flex-col gap-12 md:gap-48 mt-6 md:mt-20 max-w-[1600px] mx-auto w-full">
              {section.blocks.map((block: ContentBlock, bIdx: number) => {

                if (block.layout === 'left-img') {
                  return (
                    <div key={bIdx} className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
                      <div className={`order-1 ${block.imgWrapperClass}`}>
                        <div className={`img-mask-container relative overflow-hidden ${block.imgContainerClass}`}>
                          <img src={block.imgSrc} alt={block.imgAlt} className={`parallax-img absolute ${block.imgClass}`} />
                        </div>
                      </div>
                      <div className={`content-block order-2 ${block.textWrapperClass}`}>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-60">{block.subtitle}</div>
                        <h3 className="text-[clamp(2rem,3.5vw,4.5rem)] font-black tracking-tight uppercase mb-6">{block.title}</h3>
                        <p className="text-[clamp(0.875rem,1.2vw,1.25rem)] font-medium leading-relaxed opacity-80 mb-6">{block.desc}</p>
                        {block.tag && <div className="sc-border border-l-2 pl-4 text-[10px] uppercase tracking-widest font-bold opacity-60">{block.tag}</div>}
                      </div>
                    </div>
                  );
                }

                if (block.layout === 'right-img') {
                  return (
                    <div key={bIdx} className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
                      <div className={`content-block order-2 md:order-1 text-left md:text-right ${block.textWrapperClass}`}>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-60">{block.subtitle}</div>
                        <h3 className="text-[clamp(2rem,3.5vw,4.5rem)] font-black tracking-tight uppercase mb-6">{block.title}</h3>
                        <p className="text-[clamp(0.875rem,1.2vw,1.25rem)] font-medium leading-relaxed opacity-80 mb-6 md:ml-auto">{block.desc}</p>
                        {block.tag && <div className="sc-border border-l-2 md:border-l-0 md:border-r-2 pl-4 md:pl-0 md:pr-4 text-[10px] uppercase tracking-widest font-bold opacity-60">{block.tag}</div>}
                      </div>
                      <div className={`order-1 md:order-2 ${block.imgWrapperClass}`}>
                        <div className={`img-mask-container relative overflow-hidden ${block.imgContainerClass}`}>
                          <img src={block.imgSrc} alt={block.imgAlt} className={`parallax-img absolute ${block.imgClass}`} />
                        </div>
                      </div>
                    </div>
                  );
                }

                if (block.layout === 'center-img') {
                  return (
                    <div key={bIdx} className="flex flex-col items-center text-center gap-12 w-full mt-12">
                      <div className={`content-block ${block.textWrapperClass}`}>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-60">{block.subtitle}</div>
                        <h3 className="text-[clamp(2rem,3.5vw,4.5rem)] font-black tracking-tight uppercase mb-6">{block.title}</h3>
                        <p className="text-[clamp(0.875rem,1.2vw,1.25rem)] font-medium leading-relaxed opacity-80">{block.desc}</p>
                      </div>
                      <div className={block.imgWrapperClass}>
                        <div className={`img-mask-container relative overflow-hidden ${block.imgContainerClass}`}>
                          <img src={block.imgSrc} alt={block.imgAlt} className={`parallax-img absolute ${block.imgClass}`} />
                        </div>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </section>
        ))}
        <Footer />
      </main>
    </StudioLayout>
  );
}