"use client";

import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { getCategoriesAction } from '@/app/actions';
import { ReactLenis } from '@studio-freight/react-lenis';
import { usePathname, useSearchParams } from 'next/navigation';

import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import Header from './Header';
import './studio-layout.css';

// 🚀 核心修复 1：安全的同构钩子。防止在服务端渲染时使用 useLayoutEffect 抛出警告
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const [dateInfo, setDateInfo] = useState({ day: '--', month: '--- 202X' });
  
  // 🚀 核心修复 2：统一初始化为 0，保证服务端和客户端首次渲染一模一样，彻底消灭 Hydration Error
  const [bootStage, setBootStage] = useState(0); 
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const preloaderRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [showAllCats, setShowAllCats] = useState(false);
  
  const lenisRef = useRef<any>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 清除 GSAP 幽灵类名 & 修复路由跳转瞬间跳帧
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

  // 🚀 核心修复 3：使用 useIsomorphicLayoutEffect。
  // 它会在 Hydration 完成后、浏览器绘制屏幕前瞬间执行，所以如果你第二次进入，页面会直接亮起，绝不闪黑屏。
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
      <div id="showcase-root" className="showcase-theme min-h-screen font-sans selection:bg-black selection:text-white transition-colors duration-700 overflow-x-hidden relative">
        
        {/* ========================================================
            🚀 核心修复 4：组件渲染逻辑全面重构
            - 动画遮罩层和正文层同时渲染，完美匹配服务端渲染结构，绝不报错。
            - 当第一次进入时，正文层透明度为 0；动画跑完变成 1。
            - 这样不仅修了 Bug，搜索引擎的爬虫也能 100% 抓取到你的正文了！
            ======================================================== */}
            
        {/* 加载动画遮罩层 */}
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

        {/* 真正的页面主体内容层 */}
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

      </div>
    </ReactLenis>
  );
}