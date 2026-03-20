"use client";

import React, { useState } from 'react';
import Link from 'next/link';

interface Post {
  id: string;
  displayIndex: string;
  title: string;
  slug: string;
  category: string;
  date: string;
  excerpt: string;
  image: string;
}

interface PostLayoutSwitcherProps {
  posts: Post[];
  headerTitle?: string;
  headerSubtitle?: string;
}

export default function PostLayoutSwitcher({ 
  posts, 
  headerTitle = "Recent Logs", 
  headerSubtitle = "Filter: All" 
}: PostLayoutSwitcherProps) {
  const [view, setView] = useState<'grid' | 'list'>('list');

  return (
    <div className="w-full">
      
      {/* ========================================= */}
      {/* 1. 顶部栏：标题 + 切换器 */}
      {/* ========================================= */}
      <div className="flex flex-row justify-between items-end border-b-2 sc-border pb-6 mb-12 md:mb-16 gap-4">
        <div>
          <h4 className="text-xl md:text-3xl font-black uppercase tracking-tight">{headerTitle}</h4>
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-50 mt-1 md:mt-2 block">
            {headerSubtitle}
          </span>
        </div>

        {/* 视图切换器 */}
        <div className="flex items-center gap-1 md:gap-2 border sc-border p-1 shrink-0">
          <button 
            onClick={() => setView('grid')}
            className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-colors duration-300 ${
              view === 'grid' ? 'bg-[var(--sc-text)] text-[var(--sc-bg)]' : 'text-[var(--sc-text)] opacity-40 hover:opacity-100'
            }`}
            aria-label="Grid View"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>

          <button 
            onClick={() => setView('list')}
            className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-colors duration-300 ${
              view === 'list' ? 'bg-[var(--sc-text)] text-[var(--sc-bg)]' : 'text-[var(--sc-text)] opacity-40 hover:opacity-100'
            }`}
            aria-label="List View"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* ========================================= */}
      {/* 2. 动态渲染区 */}
      {/* ========================================= */}
      <div className="relative">
        
        {/* ========================================= */}
        {/* A. 网格视图 (Grid View) */}
        {/* ========================================= */}
        {view === 'grid' && (
          // 💡 调整 Grid 总体间距：修改 gap-x-12 (列间距) 和 gap-y-16 md:gap-y-24 (行间距)
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 md:gap-y-24 animate-[headerEnter_0.6s_ease-out]">
            {posts.map((post, index) => (
              <Link href={`/blog/${post.slug}`} scroll={false} key={post.id} className={`flex flex-col group cursor-pointer ${index % 2 !== 0 && posts.length > 1 ? 'md:mt-32' : ''}`}>
                
                {/* 💡 调整 Grid 图片高度：修改 h-[40vh] (手机端高度) 和 md:h-[55vh] (PC端高度) */}
                <div className="img-mask-container w-full h-[40vh] md:h-[55vh] bg-[var(--sc-border)] relative overflow-hidden mb-6 md:mb-8">
                  <img src={post.image} alt={post.title} className="absolute -top-[10%] left-0 w-full h-[120%] object-cover object-center transition-transform duration-[1.5s] ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-[var(--sc-inverse-bg)]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                </div>

                <div className="flex flex-col flex-grow">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b sc-border">
                    <span className="text-2xl md:text-[clamp(1.5rem,2.5vw,3rem)] font-black tabular-nums tracking-tighter opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                      {post.displayIndex}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">
                      {post.category} • {post.date}
                    </span>
                  </div>
                  {/* 💡 调整 Grid 标题大小：修改 text-xl (手机) 和 md:text-[clamp(...)] (PC) */}
                  <h3 className="text-xl md:text-[clamp(1.5rem,2vw,2.5rem)] font-black tracking-tight uppercase mb-4 leading-tight group-hover:translate-x-2 transition-transform duration-300">
                    {post.title}
                  </h3>
                  {/* 💡 调整 Grid 摘要行数：修改 line-clamp-3 (最多显示3行) */}
                  <p className="text-sm md:text-base font-medium leading-relaxed opacity-70 mb-8 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto flex items-center gap-4 text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-[2px] bg-current transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                    Read More
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ========================================= */}
        {/* B. 列表视图 (List View) */}
        {/* ========================================= */}
        {view === 'list' && (
          // 💡 调整 List 行与行之间的总体间距：修改 gap-8 (手机) 和 md:gap-16 (PC)
          <div className="flex flex-col gap-8 md:gap-16 animate-[headerEnter_0.6s_ease-out]">
            {posts.map((post) => (
              <Link 
                href={`/blog/${post.slug}`} 
                scroll={false} 
                key={post.id} 
                className="group flex flex-row gap-6 md:gap-12 border-b sc-border pb-8 md:pb-12 cursor-pointer items-stretch"
              >
                
                {/* 💡 调整 List 图片大小 (本次已调低高度)： 
                    - 宽度：w-[35%] (手机) / md:w-[30%] (平板) / lg:w-[25%] (桌面)
                    - 高度：h-[15vh] (手机高度，原20vh) / md:h-[20vh] (PC高度，也可设为 h-auto 让内容撑开)
                    - 最小高度：min-h-[100px] (防止图片被压得太扁) 
                */}
                <div className="w-[40%] md:w-[30%] lg:w-[25%] h-[17vh] md:h-[20vh] min-h-[100px] md:min-h-[180px] bg-[var(--sc-border)] relative overflow-hidden shrink-0">
                  <img src={post.image} alt={post.title} className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-[var(--sc-inverse-bg)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                </div>

                {/* 💡 调整 List 右侧文字区域宽度：w-[65%] 配合左侧图片的 w-[35%] */}
                <div className="flex flex-col justify-center flex-grow pt-1 md:pt-2 w-[65%] md:w-auto">
                  <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-4">
                    <span className="text-lg md:text-xl font-black tabular-nums tracking-tighter opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                      {post.displayIndex}
                    </span>
                    <div className="h-4 w-[1px] bg-[var(--sc-border)] rotate-12 opacity-40"></div>
                    <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest opacity-60">
                      {post.category} • {post.date}
                    </span>
                  </div>
                  
                  {/* 💡 调整 List 标题大小：修改 text-lg (手机，原xl) 和 md:text-[clamp(...)] (PC) */}
                  <h3 className="text-lg md:text-[clamp(1.5rem,2.5vw,3rem)] font-black tracking-tight uppercase mb-2 md:mb-4 leading-[1.1] md:leading-[1.1] group-hover:translate-x-2 transition-transform duration-300">
                    {post.title}
                  </h3>
                  
                  {/* 💡 调整 List 摘要显示：修改 line-clamp-2 (最多两行，让高度更紧凑) */}
                  <p className="text-xs md:text-base font-medium leading-relaxed opacity-70 mb-4 md:mb-6 line-clamp-2 max-w-3xl">
                    {post.excerpt}
                  </p>
                  
                  <div className="mt-auto flex items-center gap-3 md:gap-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="w-6 md:w-8 h-[2px] bg-current transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                    Read Article
                  </div>
                </div>

              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}