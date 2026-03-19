"use client";

import React from 'react';
import Link from 'next/link';
// 🚀 引入我们刚刚封装的搜索组件
import SearchWidget from './SearchWidget';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Header({ isMobileMenuOpen, setIsMobileMenuOpen }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full px-5 py-5 md:px-8 z-50 flex justify-between items-center sc-border border-b backdrop-blur-md bg-[var(--sc-bg)]/80 transition-colors duration-700 pointer-events-none animate-header-layout">
      
      {/* 1. 左侧 Logo */}
      <Link href="/" className="font-black text-lg md:text-[clamp(1.25rem,1.5vw,1.75rem)] tracking-tighter uppercase pointer-events-auto relative z-50">
        ZHIHUI.
      </Link>
      
      <div className="flex items-center gap-6 md:gap-8 pointer-events-auto relative z-50">
        
        {/* ================================================= */}
        {/* 🚀 中间：独立出来的搜索组件 */}
        {/* 你可以像这样自由控制圆角和动画速度！ */}
        {/* ================================================= */}
        <SearchWidget 
          inputRadius="rounded-full" 
          dropdownRadius="rounded-2xl" 
          animationSpeed="duration-500" 
        />

        {/* 2. 右侧导航 */}
        <nav className="hidden md:flex gap-4 md:gap-8 text-[10px] md:text-xs font-bold uppercase tracking-widest">
          <Link href="#" className="hover:line-through">Index</Link>
          <Link href="#" className="hover:line-through">Work</Link>
          <Link href="#" className="hover:line-through">About</Link>
        </nav>

        {/* 3. 移动端汉堡菜单 */}
        <button 
          className="xl:hidden w-6 h-6 flex flex-col justify-center items-center group ml-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          <span className={`block absolute w-5 h-[1.5px] bg-current transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`}></span>
          <span className={`block absolute w-5 h-[1.5px] bg-current transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
          <span className={`block absolute w-5 h-[1.5px] bg-current transition-all duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`}></span>
        </button>
      </div>
    </header>
  );
}