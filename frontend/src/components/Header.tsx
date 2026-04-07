"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
// 🚀 引入搜索组件
import SearchWidget from './SearchWidget';
import MobileMenu from './MobileMenu';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dateInfo: { day: string; month: string };
  categories: string[];
  showAllCats: boolean;
  setShowAllCats: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Header({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen,
  dateInfo,
  categories,
  showAllCats,
  setShowAllCats
}: HeaderProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  const navItems = [
    { name: '主页', href: '/' },
    { name: '日志', href: '/blog' },
    { name: '归档', href: '/archive' }
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full px-5 py-3 md:px-10 z-50 flex justify-between items-center sc-border border-b backdrop-blur-md bg-[var(--sc-bg)]/80 transition-colors duration-700 pointer-events-none animate-header-layout">
        
        {/* ================================================= */}
        {/* 🚀 1. 切换至 Option C: 硬核档案感 (Space Mono) */}
        {/* ================================================= */}
        <Link 
          href="/" 
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
          className="group flex flex-col pointer-events-auto relative z-50 shrink-0"
        >
          <div className={`
             flex items-center transition-all duration-500 font-[var(--font-space-mono)] font-bold
             ${isLogoHovered ? 'tracking-[0.1em]' : 'tracking-tighter'}
          `}>
            {/* 使用 Space Mono 字体，带来纯正的开发者/档案感 */}
            <span className="text-xl md:text-2xl uppercase">
              ZHIHUI
            </span>
            
            {/* 状态指示：改为绿色的 Diagnostic 诊断块 */}
            <motion.div 
              animate={{ 
                opacity: [0.4, 1, 0.4],
                scale: isLogoHovered ? [1.1, 1, 1.1] : 1
              }}
              transition={{ 
                duration: isLogoHovered ? 0.8 : 2.5, 
                repeat: Infinity,
                ease: "linear"
              }}
              className="ml-2 w-2 h-2.5 bg-green-500/80 rounded-sm inline-block shadow-[0_0_8px_rgba(34,197,94,0.3)]"
            />

            {/* 悬停时的绿色光标闪烁效果 */}
            <AnimatePresence>
              {isLogoHovered && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="ml-1 text-green-500 font-bold"
                >
                  _
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </Link>
        
        <div className="flex items-center gap-6 md:gap-14 pointer-events-auto relative z-50">
          
          {/* ================================================= */}
          {/* 🚀 中间：搜索框组件 - 保持原样不改动逻辑 */}
          {/* ================================================= */}
          <SearchWidget 
            inputRadius="rounded-full" 
            dropdownRadius="rounded-2xl" 
            animationSpeed="duration-500" 
          />

          {/* ================================================= */}
          {/* 🚀 2. 右侧导航：滑动胶囊交互 */}
          {/* ================================================= */}
          <nav 
            onMouseLeave={() => setHoveredIdx(null)}
            className="relative flex items-center gap-1 md:gap-3"
          >
            {navItems.map((item, idx) => (
              <Link 
                key={item.href} 
                href={item.href}
                onMouseEnter={() => setHoveredIdx(idx)}
                className="group relative px-3 py-1.5 flex items-center justify-center font-[var(--font-inter)]"
              >
                <span className={`
                  relative z-10 text-[10px] md:text-xs font-bold uppercase 
                  transition-all duration-500 ease-out
                  ${hoveredIdx === idx ? 'tracking-[0.2em] opacity-100' : 'tracking-widest opacity-60'}
                `}>
                  {item.name}
                </span>

                <AnimatePresence>
                  {hoveredIdx === idx && (
                    <motion.div
                      layoutId="nav-capsule"
                      className="absolute inset-0 bg-on-surface/5 rounded-full z-0"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
              </Link>
            ))}
          </nav>

          {/* 3. 移动端汉堡菜单 */}
          <button 
            className="xl:hidden w-6 h-6 flex flex-col justify-center items-center group ml-1 shrink-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <span className={`block absolute w-5 h-[1.5px] bg-current transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`}></span>
            <span className={`block absolute w-5 h-[1.5px] bg-current transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`block absolute w-5 h-[1.5px] bg-current transition-all duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`}></span>
          </button>
        </div>
      </header>

      <MobileMenu 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        dateInfo={dateInfo}
        categories={categories}
        showAllCats={showAllCats}
        setShowAllCats={setShowAllCats}
      />
    </>
  );
}