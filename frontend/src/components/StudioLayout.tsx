"use client";

import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { getCategoriesAction } from '@/app/actions';
import { ReactLenis } from '@studio-freight/react-lenis';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import Header from './Header';
import './studio-layout.css';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const [dateInfo, setDateInfo] = useState({ day: '--', month: '--- 202X' });
  const [bootStage, setBootStage] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const preloaderRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [showAllCats, setShowAllCats] = useState(false);

  const lenisRef = useRef<any>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [showTopBtn, setShowTopBtn] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);

  // =========================================================================
  // 🚀 核心新增：精准判断当前是否处于具体的文章页面 (/blog/[slug])
  // - 以 /blog/ 开头
  // - 通过 split('/') 切割后长度为 3 (例如 ['', 'blog', 'my-post'])
  // - 这样就不会误杀 /blog (长度2) 和 /blog/category/xxx (长度4)
  // =========================================================================
  const isBlogPostPage = pathname.startsWith('/blog/') && pathname.split('/').length === 3;

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      // 距离页面底部 < 300px 时隐藏，避免遮挡 Footer
      const nearBottom = (docHeight - scrollY - windowHeight) < 300;
      setShowTopBtn(scrollY > 1000 && !nearBottom);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    if (lenisRef.current?.lenis) {
      lenisRef.current.lenis.scrollTo(0, { duration: 1.5, ease: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const rootEl = document.getElementById('showcase-root');
    if (rootEl) {
      rootEl.classList.remove('showcase-inverted', 'hide-sidebars');
    }
    const timer = setTimeout(() => {
      if (lenisRef.current?.lenis) {
        lenisRef.current.lenis.scrollTo(0, { immediate: true });
      }
    }, 50);
    return () => clearTimeout(timer);
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

  useIsomorphicLayoutEffect(() => {
    const d = new Date();
    setDateInfo({
      day: d.getDate().toString().padStart(2, '0'),
      month: d.toLocaleString('en-US', { month: 'short' }) + ' ' + d.getFullYear()
    });

    const hasBooted = sessionStorage.getItem('system_booted_v1');

    if (hasBooted) {
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
      let isLoaded = false;

      const updateCounter = () => {
        if (counterRef.current) {
          counterRef.current.innerText = Math.floor(counter.val).toString().padStart(3, '0') + "%";
        }
      };

      const initAnim = gsap.to(counter, {
        val: 85,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: updateCounter
      });
      const initBar = gsap.to(".boot-progress-bar", {
        width: "85%",
        duration: 1.5,
        ease: "power2.out"
      });

      const finishLoading = () => {
        if (isLoaded) return;
        isLoaded = true;

        initAnim.kill();
        initBar.kill();

        const finishTl = gsap.timeline();
        finishTl.to(counter, {
          val: 100,
          duration: 0.5,
          ease: "power2.inOut",
          onUpdate: updateCounter
        }, 0)
          .to(".boot-progress-bar", { width: "100%", duration: 0.5, ease: "power2.inOut" }, 0)
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
      };

      if (document.readyState === 'complete') {
        setTimeout(finishLoading, 100);
      } else {
        window.addEventListener('load', finishLoading);
        setTimeout(finishLoading, 2000);
      }

      return () => window.removeEventListener('load', finishLoading);
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

  return (
    <ReactLenis ref={lenisRef} root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>

      <div
        ref={constraintsRef}
        id="showcase-root"
        className="showcase-theme min-h-screen font-sans selection:bg-black selection:text-white transition-colors duration-700 overflow-x-hidden relative"
      >

        {bootStage < 2 && (
          <div ref={preloaderRef} className="fixed inset-0 z-[99999] bg-[#050505] text-white flex flex-col justify-between p-8 md:p-12 font-mono">
            <div className="text-xs font-bold uppercase tracking-widest opacity-50 flex justify-between">
              <span>loading...</span>
              <span className="animate-pulse">_</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div ref={counterRef} className="text-[clamp(6rem,15vw,16rem)] font-black leading-[0.8] tracking-tighter">000%</div>
              <div className="h-1 bg-white w-0 boot-progress-bar mt-8"></div>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-right opacity-50">Initializing Protocols...</div>
          </div>
        )}

        <div
          className="transition-opacity duration-700 ease-in-out"
          style={{
            opacity: bootStage >= 1 ? 1 : 0,
            pointerEvents: bootStage >= 1 ? 'auto' : 'none'
          }}
        >
          <Header
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            dateInfo={dateInfo}
            categories={categories}
            showAllCats={showAllCats}
            setShowAllCats={setShowAllCats}
          />

          <LeftSidebar categories={categories} />
          <RightSidebar dateInfo={dateInfo} />

          <div id="main-wrapper" className="relative z-10">
            {children}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 🚀 核心修改：增加 !isBlogPostPage 拦截渲染条件 */}
        {/* ======================================================== */}
        <AnimatePresence>
          {showTopBtn && !isBlogPostPage && (
            <motion.button
              // 1. 优化入场动画：把原来的旋转 (-90度) 改为平滑的从下往上升起，视觉上更稳重
              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}

              drag
              // 2. 🚀 核心修复：移除 constraintsRef，改为固定的像素活动范围
              // 这允许按钮在原地附近被拖拽把玩，但绝对不会因为页面排版变化而乱飞
              dragConstraints={{ top: -100, bottom: 100, left: -100, right: 100 }}
              dragElastic={0.1}
              dragMomentum={false}

              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToTop}
              className="fixed bottom-8 right-6 md:bottom-23 md:right-12 z-[9990] w-12 h-12 bg-[var(--sc-inverse-bg)] border-2 border-[var(--sc-inverse-bg)] text-[var(--sc-inverse-text)] flex items-center justify-center cursor-pointer shadow-2xl group overflow-hidden touch-none"
              aria-label="Scroll to top"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="w-6 h-6 relative z-10 group-hover:-translate-y-1 transition-transform duration-300"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
              </svg>

              <div className="absolute inset-0 bg-[var(--sc-bg)] origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300 pointer-events-none" />

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="w-6 h-6 absolute z-10 text-[var(--sc-text)] opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

      </div>
    </ReactLenis>
  );
}