"use client";

import React, { useState } from 'react';
import Link from 'next/link';

// 🚀 接收从父组件传来的分类数据
interface LeftSidebarProps {
  categories: string[];
}

export default function LeftSidebar({ categories }: LeftSidebarProps) {
  // 🚀 将折叠状态封装在组件内部，这样 PC 和手机的展开状态就不会互相干扰了
  const [showAllCats, setShowAllCats] = useState(false);

  return (
    <aside id="sidebar-left" className="fixed left-0 top-0 h-screen w-64 2xl:w-80 sc-border border-r z-30 flex-col justify-between pt-28 pb-10 px-8 hidden xl:flex pointer-events-none animate-sidebar-left">
      
      {/* 1. 个人信息区 */}
      <div className="pointer-events-auto">
        <div className="w-16 h-16 2xl:w-20 2xl:h-20 rounded-full overflow-hidden mb-5 sc-border border-2">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Zhihui&backgroundColor=e2e8f0" alt="Zhihui" className="w-full h-full object-cover grayscale" />
        </div>
        <h3 className="font-black uppercase text-[clamp(1.25rem,1.5vw,1.75rem)] leading-none tracking-tight">Zhihui</h3>
        <p className="text-[10px] 2xl:text-xs font-bold mt-2 uppercase tracking-widest opacity-50">Creative Developer</p>
      </div>

      {/* 2. 动态分类标签渲染区 */}
      <div className="pointer-events-auto">
        <div className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest mb-4 sc-border border-b pb-2 opacity-50">
          Index / Categories
        </div>
        <div className="flex flex-col gap-3 font-mono text-xs 2xl:text-sm font-bold uppercase">
          {categories.length > 0 ? (
            <>
              {(showAllCats ? categories : categories.slice(0, 5)).map((tag, index) => (
                <Link 
                  key={tag} 
                  href={`/blog/category/${encodeURIComponent(tag)}`}
                  className="group flex items-center gap-3 cursor-pointer opacity-70 hover:opacity-100 transition-all hover:translate-x-2"
                >
                  <span className="text-[9px] opacity-40 group-hover:opacity-100 transition-opacity">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="group-hover:bg-[var(--sc-text)] group-hover:text-[var(--sc-inverse-text)] px-1 -ml-1 transition-colors">
                    {tag}
                  </span>
                </Link>
              ))}

              {categories.length > 5 && (
                <button 
                  onClick={() => setShowAllCats(!showAllCats)}
                  className="text-left mt-2 text-[10px] 2xl:text-xs font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
                >
                  {showAllCats ? '[- COLLAPSE]' : '[+ VIEW ALL]'}
                </button>
              )}
            </>
          ) : (
            <span className="text-[10px] opacity-30 animate-pulse">Loading Data...</span>
          )}
        </div>
      </div>
      
    </aside>
  );
}