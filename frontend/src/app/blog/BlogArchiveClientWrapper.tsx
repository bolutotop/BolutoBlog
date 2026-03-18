"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import StudioLayout from '@/components/StudioLayout';

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

  const setRef = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      containerRef.current = node;
      setIsReadyToAnimate(true);
    }
  }, []);

  // 全局鼠标事件监听，处理按钮的水波纹
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
window.scrollTo(0, 0);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      gsap.to('.hero-char', { y: 0, rotation: 0, opacity: 1, stagger: 0.04, duration: 1.5, ease: 'elastic.out(1, 0.6)', delay: 0.2 });
      gsap.fromTo('.hero-bottom-content', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', delay: 1.2 });

      const darkSections = ['.dark-section'];
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

      ScrollTrigger.create({
        trigger: '.hide-sidebar-trigger',
        start: 'top 50%',
        onEnter: () => document.getElementById('showcase-root')?.classList.add('hide-sidebars'),
        onLeaveBack: () => document.getElementById('showcase-root')?.classList.remove('hide-sidebars'),
      });

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

    const timer = setTimeout(() => ScrollTrigger.refresh(), 500);

    return () => { 
      clearTimeout(timer);
      ctx.revert(); 
    };
  }, [isReadyToAnimate]);

  return (
    <StudioLayout>
      <main ref={setRef} className="overflow-x-hidden pb-32 min-h-screen">
        {children}
      </main>
    </StudioLayout>
  );
}