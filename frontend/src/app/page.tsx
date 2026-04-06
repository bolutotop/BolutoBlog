"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import StudioLayout from '@/components/StudioLayout';
import { getHomePageConfigAction } from '@/app/actions';
import Footer from '@/components/Footer';
import SplitText from '@/components/SplitText';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// =========================================================================
// 🔑 TypeScript 类型定义
// =========================================================================
interface ContentBlock {
  layout: 'left-img' | 'right-img' | 'center-img';
  subtitle: string;
  title: string;
  desc: string;
  tag: string;
  imgSrc: string;
  imgAlt: string;
  imgWrapperClass: string;
  textWrapperClass: string;
  imgContainerClass: string;
  imgClass: string;
}

interface PageSection {
  id: string;
  title: string;
  className: string;
  isDarkTheme: boolean;
  hideSidebars: boolean;
  blocks: ContentBlock[];
}

interface PageData {
  hero: {
    titles: string[];
    subtitle: string;
    btnText: string;
    btnLink: string;
  };
  vision: {
    title: string;
    image: string;
  };
  sections: PageSection[];
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

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--x', `${x}px`);
    e.currentTarget.style.setProperty('--y', `${y}px`);
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
      
      {/* ==================== 1. Hero 区域 ==================== */}
      <section className="relative min-h-[70vh] lg:min-h-[85vh] flex flex-col justify-start px-6 lg:px-12 pt-28 md:pt-40 pb-20">
        <div className="relative z-10">
          {pageData.hero.titles.map((title: string, idx: number) => (
            <div key={idx} className="uppercase font-black text-[clamp(4rem,11vw,16rem)] leading-[0.85] tracking-tighter text-[var(--sc-text)]">
              <SplitText text={title} />
            </div>
          ))}
        </div>

        <div className="hero-bottom-content mt-12 md:mt-16 flex flex-col md:flex-row md:items-center gap-8 md:gap-12 opacity-0">
          <div className="text-xs md:text-sm font-bold tracking-widest leading-tight max-w-[280px] md:max-w-[400px] uppercase sc-border border-l-4 pl-4">
            {pageData.hero.subtitle}
          </div>
          <Link 
            href={pageData.hero.btnLink} 
            onMouseMove={handleMouseMove}
            className="group relative overflow-hidden bg-[var(--sc-inverse-bg)] border border-[var(--sc-inverse-bg)] px-10 py-5 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 duration-500 ease-[cubic-bezier(0.8,0,0.2,1)] isolate w-fit"
          >
            <span className="relative z-10 font-black text-xs md:text-sm uppercase tracking-[0.2em] text-[var(--sc-inverse-text)] transition-colors duration-300 group-hover:text-transparent">{pageData.hero.btnText}</span>
            <span className="relative z-10 font-black text-xs md:text-sm text-[var(--sc-inverse-text)] group-hover:translate-x-3 transition-transform duration-500 ease-[cubic-bezier(0.8,0,0.2,1)] ml-4">→</span>
            <div 
              className="absolute inset-0 bg-[var(--sc-bg)] pointer-events-none z-20 flex items-center justify-center px-10 group-hover:animate-[rippleSpread_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards]"
              style={{ clipPath: 'circle(0% at var(--x, 50%) var(--y, 50%))' }}
            >
              <span className="font-black text-xs md:text-sm uppercase tracking-[0.2em] text-[var(--sc-text)]">{pageData.hero.btnText}</span>
              <span className="font-black text-xs md:text-sm text-[var(--sc-text)] group-hover:translate-x-3 transition-transform duration-500 ease-[cubic-bezier(0.8,0,0.2,1)] ml-4">→</span>
            </div>
          </Link>
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