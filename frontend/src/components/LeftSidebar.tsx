"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '@/config/site';

interface LeftSidebarProps {
  categories: string[];
}

export default function LeftSidebar({ categories }: LeftSidebarProps) {
  const [showAllCats, setShowAllCats] = useState(false);

  // 🚀 提取渲染单个标签的逻辑，保持代码整洁 (DRY)
  const renderTag = (tag: string, index: number) => (
    <Link 
      key={tag} 
      href={`/blog/category/${encodeURIComponent(tag)}`}
      className="group flex items-center gap-3 cursor-pointer opacity-70 hover:opacity-100 transition-all hover:translate-x-2"
    >
      <span className="text-[9px] opacity-40 group-hover:opacity-100 transition-opacity w-3 shrink-0">
        {(index + 1).toString().padStart(2, '0')}
      </span>
      <span className="group-hover:bg-[var(--sc-text)] group-hover:text-[var(--sc-inverse-text)] px-1 -ml-1 transition-colors truncate">
        {tag}
      </span>
    </Link>
  );

  return (
    <aside id="sidebar-left" className="fixed left-0 top-0 h-screen w-64 2xl:w-80 sc-border border-r z-30 flex-col justify-between pt-28 pb-10 px-8 hidden xl:flex pointer-events-none animate-sidebar-left">
      
      {/* 1. 个人信息区 */}
      <div className="pointer-events-auto">
        <div className="w-16 h-16 2xl:w-20 2xl:h-20 rounded-full overflow-hidden mb-5 sc-border border-2">
          <Image src={siteConfig.avatar} alt={siteConfig.name} width={80} height={80} className="w-full h-full object-cover" />
        </div>
        <h3 className="font-black uppercase text-[clamp(1.25rem,1.5vw,1.75rem)] leading-none tracking-tight">{siteConfig.name}</h3>
        <p className="text-[10px] 2xl:text-xs font-bold mt-2 uppercase tracking-widest opacity-50">{siteConfig.tagline}</p>
      </div>

      {/* 2. 动态分类标签渲染区 */}
      <div className="pointer-events-auto flex-1 flex flex-col justify-end">
        <div className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest mb-4 sc-border border-b pb-2 opacity-50">
          目录 / 标签
        </div>
        
        {/* 🚀 核心结构修改：去掉外层的 gap，分别处理常驻和折叠区域，避免高度塌陷跳帧 */}
        <div className="flex flex-col font-mono text-xs 2xl:text-sm font-bold uppercase">
          {categories.length > 0 ? (
            <>
              {/* 常驻的前 5 个标签 */}
              <div className="flex flex-col gap-3">
                {categories.slice(0, 5).map((tag, index) => renderTag(tag, index))}
              </div>

              {/* 隐藏的折叠标签动画区 */}
              <AnimatePresence initial={false}>
                {showAllCats && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    // 使用与 Showcase 页面一致的高级曲线，手感极佳
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} 
                    className="overflow-hidden"
                  >
                    {/* pt-3 巧妙地充当了新展开区域与上方常驻区域的间距 */}
                    <div className="flex flex-col gap-3 pt-3">
                      {categories.slice(5).map((tag, index) => renderTag(tag, index + 5))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 展开/收起 按钮 */}
              {categories.length > 5 && (
                <button 
                  onClick={() => setShowAllCats(!showAllCats)}
                  className="text-left mt-5 text-[10px] 2xl:text-xs font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity w-fit"
                >
                  {showAllCats ? '[- 收起]' : '[+ 查看全部]'}
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