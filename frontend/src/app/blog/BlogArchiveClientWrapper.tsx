"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import StudioLayout from '@/components/StudioLayout';
import { usePathname, useSearchParams } from 'next/navigation';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface WrapperProps {
  children: React.ReactNode;
  postsCount: number;
  lastUpdated: string;
}

export default function BlogArchiveClientWrapper({ children }: WrapperProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isReadyToAnimate, setIsReadyToAnimate] = useState(false);
  
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setRef = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      containerRef.current = node;
      setIsReadyToAnimate(true);
    }
  }, []);

  // 全局鼠标事件监听
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const btns = document.querySelectorAll('.btn-ripple');
      btns.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const mask = btn.querySelector('.ripple-mask') as HTMLElement;
        if (mask) {
          mask.style.setProperty('--x', `${x}px`);
          mask.style.setProperty('--y', `${y}px`);
        }
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!isReadyToAnimate || !containerRef.current) return;
    
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // 每次翻页强制重置根节点类名，防止侧边栏或主题状态残留
    const rootEl = document.getElementById('showcase-root');
    if (rootEl) {
      rootEl.classList.remove('hide-sidebars', 'showcase-inverted');
    }

    window.scrollTo(0, 0);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      gsap.to('.hero-char', { y: 0, rotation: 0, opacity: 1, stagger: 0.04, duration: 1.5, ease: 'elastic.out(1, 0.6)', delay: 0.2 });
      gsap.fromTo('.hero-bottom-content', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', delay: 1.2 });

      // 🚀 1. 修复：Dark sections 反色逻辑
      const darkSections = gsap.utils.toArray('.dark-section');
      darkSections.forEach((section: any) => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top 50%', 
          end: 'bottom 50%', 
          // 必须在内部调用 document.getElementById 打破 React 闭包时差
          onEnter: () => document.getElementById('showcase-root')?.classList.add('showcase-inverted'),
          onLeave: () => document.getElementById('showcase-root')?.classList.remove('showcase-inverted'),
          onEnterBack: () => document.getElementById('showcase-root')?.classList.add('showcase-inverted'),
          onLeaveBack: () => document.getElementById('showcase-root')?.classList.remove('showcase-inverted'),
        });
      });

      // 🚀 2. 修复：侧边栏逻辑 (第一页用图片触发，第二页用向下滚动 200px 触发)
      const sidebarTriggers = gsap.utils.toArray('.hide-sidebar-trigger');
      if (sidebarTriggers.length > 0) {
        ScrollTrigger.create({
          trigger: sidebarTriggers[0] as Element,
          start: 'top 50%',
          onEnter: () => document.getElementById('showcase-root')?.classList.add('hide-sidebars'),
          onLeaveBack: () => document.getElementById('showcase-root')?.classList.remove('hide-sidebars'),
        });
      } else {
ScrollTrigger.create({
          trigger: containerRef.current, 
          start: 'top -200px', 
          onEnter: () => {
            const root = document.getElementById('showcase-root');
            root?.classList.add('hide-sidebars');
            root?.classList.add('showcase-inverted'); // 🚀 触发时同时加上变黑类名
          },
          onLeaveBack: () => {
            const root = document.getElementById('showcase-root');
            root?.classList.remove('hide-sidebars');
            root?.classList.remove('showcase-inverted'); // 🚀 滚回顶部时同时移除变黑类名
          },
        });
      }

      // Parallax 图片动画
      const imageContainers = gsap.utils.toArray('.img-mask-container');
      imageContainers.forEach((container: any) => {
        const img = container.querySelector('.parallax-img');
        gsap.fromTo(container, 
          { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' },
          { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', ease: 'expo.out', duration: 1.5, scrollTrigger: { trigger: container, start: 'top 85%' } }
        );
        if (img) gsap.to(img, { yPercent: 15, ease: 'none', scrollTrigger: { trigger: container, start: 'top bottom', end: 'bottom top', scrub: true } });
      });

      // 🚀 3. 修复：分页消失偶发 Bug
      const textBlocks = gsap.utils.toArray('.content-block');
      textBlocks.forEach((block: any) => {
        gsap.fromTo(block, 
          { y: 50, opacity: 0 }, 
          { 
            y: 0, 
            opacity: 1, 
            duration: 1, 
            ease: 'expo.out', 
            scrollTrigger: { 
              trigger: block, 
              // 将触发线放宽到 95%，防止短页面元素卡在透明度 0
              start: 'top 95%',
              // 强制播放并保留，不再随滚动反复重置
              toggleActions: 'play none none none' 
            } 
          }
        );
      });

    }, containerRef);

    const timer = setTimeout(() => ScrollTrigger.refresh(), 500);

    return () => { 
      clearTimeout(timer);
      ctx.revert(); 
    };
  }, [isReadyToAnimate, pathname, searchParams]);

  return (
    <StudioLayout>
      <main ref={setRef} className="overflow-x-hidden min-h-screen">
        {children}
      </main>
    </StudioLayout>
  );
}