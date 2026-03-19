"use client";

import React from 'react';
import Link from 'next/link';
import CalendarWidget from './CalendarWidget';

interface MobileMenuProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dateInfo: { day: string; month: string };
  categories: string[];
  showAllCats: boolean;
  setShowAllCats: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function MobileMenu({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  dateInfo,
  categories,
  showAllCats,
  setShowAllCats
}: MobileMenuProps) {
  return (
    <div 
      className={`
        fixed inset-0 bg-[var(--sc-bg)] z-40 flex flex-col justify-center px-8 xl:hidden
        transition-transform duration-700 ease-[cubic-bezier(0.8,0,0.2,1)]
        ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}
      `}
    >
      <div className="w-full max-w-sm mx-auto flex flex-col gap-8 mt-16">
        
        {/* 个人信息 */}
        <div className="flex items-center gap-5 sc-border border-b pb-6">
          <div className="w-14 h-14 rounded-full overflow-hidden sc-border border-2 shrink-0">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Zhihui&backgroundColor=e2e8f0" alt="Zhihui" className="w-full h-full object-cover grayscale" />
          </div>
          <div>
            <h3 className="font-black uppercase text-xl leading-none tracking-tight">Zhihui</h3>
            <p className="text-[10px] font-bold mt-1 uppercase tracking-widest opacity-50">Creative Developer</p>
          </div>
        </div>

        {/* 日期与状态 */}
        <div className="flex justify-between items-end">
          <div>
            <div className="text-4xl font-black tabular-nums tracking-tighter leading-none">{dateInfo.day}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-50">{dateInfo.month}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">System Status</div>
            <div className="text-[10px] font-bold uppercase tracking-tight flex items-center justify-end gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Operational
            </div>
          </div>
        </div>

        {/* 分类导航 */}
        <div className="mt-2 sc-border border-t pt-6">
          <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-4">
            Index / Categories
          </div>
          <div className="flex flex-wrap gap-2 font-mono text-[10px] font-bold uppercase">
            {categories.length > 0 ? (
              <>
                {(showAllCats ? categories : categories.slice(0, 6)).map((tag) => (
                  <Link 
                    key={tag} 
                    href={`/blog/category/${encodeURIComponent(tag)}`}
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="sc-border border px-3 py-1.5 active:bg-[var(--sc-text)] active:text-[var(--sc-inverse-text)] transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
                
                {categories.length > 6 && (
                  <button 
                    onClick={() => setShowAllCats(!showAllCats)}
                    className="sc-border border border-dashed px-3 py-1.5 opacity-50 active:opacity-100 transition-opacity"
                  >
                    {showAllCats ? '[-]' : '[+]'}
                  </button>
                )}
              </>
            ) : (
              <span className="opacity-30 animate-pulse">Loading...</span>
            )}
          </div>
        </div>

        {/* 日历组件 */}
        <div className="mt-2 sc-border border-t pt-6 relative">
           <CalendarWidget variant="mobile" />
        </div>

      </div>
    </div>
  );
}