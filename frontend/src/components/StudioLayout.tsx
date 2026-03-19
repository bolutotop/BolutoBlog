"use client";

import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { getCategoriesAction } from '@/app/actions';
import { ReactLenis } from '@studio-freight/react-lenis';
import { usePathname, useSearchParams } from 'next/navigation';

import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import Header from './Header';
import MobileMenu from './MobileMenu';
import './studio-layout.css';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const [dateInfo, setDateInfo] = useState({ day: '--', month: '--- 202X' });
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

        {bootStage >= 1 && (
          <>
            <Header 
              isMobileMenuOpen={isMobileMenuOpen} 
              setIsMobileMenuOpen={setIsMobileMenuOpen} 
            />

            <MobileMenu 
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
          </>
        )}
      </div>
    </ReactLenis>
  );
}