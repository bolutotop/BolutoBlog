"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import SplitText from '@/components/SplitText';
import Footer from '@/components/Footer';

type Post = {
  id: string;
  title: string;
  slug: string;
  category: string;
  dateStr: string;
  year: string;
  month: string;
};

export default function ArchiveClient({ posts }: { posts: Post[] }) {
  const [viewMode, setViewMode] = useState<'timeline' | 'category'>('timeline');

  // ==========================================
  // 🚀 数据处理：按时间线分组 (Year -> Month)
  // ==========================================
  const timelineData = useMemo(() => {
    const data: Record<string, Record<string, Post[]>> = {};
    posts.forEach(post => {
      if (!data[post.year]) data[post.year] = {};
      if (!data[post.year][post.month]) data[post.year][post.month] = [];
      data[post.year][post.month].push(post);
    });
    return data;
  }, [posts]);

  // ==========================================
  // 🚀 数据处理：按分类分组 (Category)
  // ==========================================
  const categoryData = useMemo(() => {
    const data: Record<string, Post[]> = {};
    posts.forEach(post => {
      if (!data[post.category]) data[post.category] = [];
      data[post.category].push(post);
    });
    return data;
  }, [posts]);

  // 统一的单篇文章条目组件（极具粗野主义风格）
  const PostItem = ({ post }: { post: Post }) => (
    <Link 
      href={`/blog/${post.slug}`}
      className="group flex flex-col md:flex-row md:items-center justify-between py-6 md:py-8 border-b sc-border hover:bg-[var(--sc-text)] hover:text-[var(--sc-bg)] transition-colors duration-300 px-4 md:px-8 -mx-4 md:-mx-8"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 lg:gap-16 w-full">
        {/* 日期 (左侧) */}
        <span className="font-mono text-xs md:text-sm font-bold opacity-50 group-hover:opacity-80 transition-opacity w-32 shrink-0">
          {post.dateStr}
        </span>
        
        {/* 标题 */}
        <h3 className="font-black text-2xl md:text-3xl lg:text-4xl uppercase tracking-tighter group-hover:translate-x-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] truncate pr-4">
          {post.title}
        </h3>
      </div>
      
      {/* 阅读箭头 (右侧，Hover 时显现) */}
      <span className="hidden md:block font-black text-sm uppercase tracking-widest opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 shrink-0">
        Read Log →
      </span>
    </Link>
  );

  return (
    <>
      {/* ==================== 1. Hero 区域 ==================== */}
      <section className="relative min-h-[50vh] lg:min-h-[60vh] flex flex-col justify-start pt-28 md:pt-40 px-6 lg:px-12 pb-10">
        <div className="relative z-10 border-b sc-border pb-8 md:pb-12">

          <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] opacity-50 mb-4 animate-pulse">
            Total Logs: {posts.length}
          </div>

          <div className="uppercase font-black text-[clamp(4rem,10vw,12rem)] leading-[0.85] tracking-tighter text-[var(--sc-text)]">
            <SplitText text="INDEX" />
          </div>
        </div>

        {/* 切换按钮 + 底部信息 */}
        <div className="hero-bottom-content mt-6 md:mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 opacity-0">
          <div className="flex flex-wrap items-center gap-4 shrink-0 font-mono text-xs md:text-sm font-bold uppercase tracking-widest">
            <button 
              onClick={() => setViewMode('timeline')}
              className={`px-6 py-3 transition-colors ${viewMode === 'timeline' ? 'bg-[var(--sc-text)] text-[var(--sc-bg)]' : 'sc-border border hover:opacity-50'}`}
            >
              [ 日期 ]
            </button>
            <button 
              onClick={() => setViewMode('category')}
              className={`px-6 py-3 transition-colors ${viewMode === 'category' ? 'bg-[var(--sc-text)] text-[var(--sc-bg)]' : 'sc-border border hover:opacity-50'}`}
            >
              [ 标签 ]
            </button>
          </div>
          <Link href="/blog" className="text-xs md:text-sm font-black tracking-widest leading-tight uppercase hover:opacity-50 transition-opacity">
            [ ← RETURN TO LOGS ]
          </Link>
        </div>
      </section>

      {/* ==================== 2. 内容列表 ==================== */}
      <section className="relative pt-6 pb-20 px-6 lg:px-12 bg-[var(--sc-bg)] transition-colors duration-700">
        <div className="max-w-[1600px] mx-auto w-full">
          <AnimatePresence mode="wait">
            
            {/* ==================================== */}
            {/* 视角 1：时间线 (Timeline) */}
            {/* ==================================== */}
            {viewMode === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {Object.keys(timelineData).sort((a, b) => Number(b) - Number(a)).map(year => (
                  <div key={year} className="content-block mb-24 md:mb-32 flex flex-col lg:flex-row gap-8 lg:gap-24 relative">
                    
                    {/* 年份侧边栏 (巨型年份悬浮效果) */}
                    <div className="lg:w-1/4 shrink-0 relative">
                      <div className="sticky top-32">
                        <h2 className="text-6xl md:text-[8rem] lg:text-[10rem] font-black tracking-tighter leading-none opacity-10" style={{ WebkitTextStroke: '2px var(--sc-text)', color: 'transparent' }}>
                          {year}
                        </h2>
                        <div className="absolute top-1/2 -translate-y-1/2 left-4 text-2xl md:text-4xl font-black">
                          {year}
                        </div>
                      </div>
                    </div>

                    {/* 每月的文章列表 */}
                    <div className="lg:w-3/4 flex flex-col gap-16">
                      {Object.keys(timelineData[year]).map(month => (
                        <div key={month}>
                          <h3 className="font-mono text-sm font-bold uppercase tracking-widest opacity-50 mb-6 sc-border border-l-4 pl-4">
                            / {month}
                          </h3>
                          <div className="flex flex-col sc-border border-t">
                            {timelineData[year][month].map(post => (
                              <PostItem key={post.id} post={post} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </motion.div>
            )}

            {/* ==================================== */}
            {/* 视角 2：分类 (Category) */}
            {/* ==================================== */}
            {viewMode === 'category' && (
              <motion.div
                key="category"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-24 md:gap-32"
              >
                {Object.keys(categoryData).sort().map(category => (
                  <div key={category} className="content-block flex flex-col">
                    
                    {/* 分类标题栏 */}
                    <div className="flex items-baseline justify-between border-b-[6px] sc-border pb-4 mb-8">
                      <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter">
                        {category}
                      </h2>
                      <span className="font-mono text-lg md:text-2xl font-bold opacity-30">
                        ({categoryData[category].length})
                      </span>
                    </div>

                    {/* 分类下的文章列表 */}
                    <div className="flex flex-col">
                      {categoryData[category].map(post => (
                        <PostItem key={post.id} post={post} />
                      ))}
                    </div>

                  </div>
                  
                ))}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </>
  );
}