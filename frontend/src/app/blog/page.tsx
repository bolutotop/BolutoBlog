import React from 'react';
import Link from 'next/link';

// 1. 引入数据库实例
import prisma from '@/lib/prisma';

// 2. 引入分离出去的交互式动画客户端组件 (我们稍后创建它)
import BlogArchiveClientWrapper from './BlogArchiveClientWrapper';
import PaginationWidget from '@/components/blog/PaginationWidget'; // 根据你的实际路径调整
import PostLayoutSwitcher from '@/components/blog/PostLayoutSwitcher';
// 巨型标题文字切割组件 (保持不变，因为它是纯 UI)
const SplitText = ({ text, className = "" }: { text: string, className?: string }) => (
  <div className={`flex overflow-hidden pb-4 -mb-4 ${className}`}>
    {text.split('').map((char, i) => (
      <span 
        key={i} 
        className="hero-char inline-block translate-y-[150%] rotate-12 opacity-0" 
        style={{ whiteSpace: 'pre' }}
      >
        {char}
      </span>
    ))}
  </div>
);

// --- Server Component ---
// 因为我们要查询数据库，所以这个页面不再有 'use client'，它是一个纯粹的服务端组件。
export default async function BlogArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>; // 🚀 接收 page 参数
}) {
  const resolvedParams = await searchParams;
  
  // 🚀 1. 分页核心设置
  const currentPage = Number(resolvedParams.page) || 1; 
  const POSTS_PER_PAGE = 5; // 设定每页显示几篇 (1篇作为头条 + 10篇网格)
  
  // 🚀 2. 并行查询：同时获取“总文章数”和“当前页的文章”
  const [totalPosts, posts] = await Promise.all([
    prisma.post.count({ where: { published: true } }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * POSTS_PER_PAGE, // 跳过前面的文章
      take: POSTS_PER_PAGE, // 限制提取数量
    })
  ]);

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  
const getPaginationGroup = () => {
    let pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, '...', totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
      }
    }
    return pages;
  };
  const paginationGroup = getPaginationGroup();
  
  // 如果没有文章，提供一个空状态或者默认占位
  if (!posts || posts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center font-black text-4xl uppercase tracking-tighter">
        No publications found.
      </div>
    );
  }

  // 🚀 核心 2：数据格式化与逻辑拆分
  // 将第一篇文章作为 Featured Post (头条文章)，其他的作为网格文章
  const rawFeaturedPost = posts[0];
  const rawGridPosts = posts.slice(1);

  // 日期格式化函数
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // 为了适配原先 UI，我们将数据库的结构映射一下
  const featuredPost = {
    id: rawFeaturedPost.id,
    title: rawFeaturedPost.title,
    slug: rawFeaturedPost.slug,
    category: rawFeaturedPost.category || 'Uncategorized',
    date: formatDate(rawFeaturedPost.createdAt),
    // 截取 content 的前 150 个字符作为简介
    excerpt: rawFeaturedPost.content.substring(0, 150) + '...', 
    // 如果没有传封面图，给一个默认的黑灰色占位图
    image: rawFeaturedPost.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', 
  };

  const gridPosts = rawGridPosts.map((post, index) => ({
    id: post.id,
    // 给网格加上 01, 02 这样的序列号 (因为 featured 占了第一个，所以从 2 开始算)
    displayIndex: String(index + 2).padStart(2, '0'), 
    title: post.title,
    slug: post.slug,
    category: post.category || 'Uncategorized',
    date: formatDate(post.createdAt),
    excerpt: post.content.substring(0, 120) + '...',
    image: post.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
  }));


  // 🚀 核心 3：渲染结构
  // 注意我们用了一个叫做 <BlogArchiveClientWrapper> 的客户端组件把内容包起来了。
  // 这样做是因为页面是服务端的，但我们需要 GSAP 动画和鼠标追踪，所以要把交互抽离。
  return (
    <BlogArchiveClientWrapper postsCount={posts.length} lastUpdated={featuredPost.date}>
      
      {/* ==================== 1. Hero 区域 ==================== */}
      <section className="relative min-h-[70vh] flex flex-col justify-end px-6 lg:px-12 pb-20">
        <div className="relative z-10 border-b sc-border pb-12">
          <div className="uppercase font-black text-[clamp(3rem,8vw,12rem)] leading-[0.85] tracking-tighter text-[var(--sc-text)]">
            <SplitText text="PUBLICATION" />
          </div>
          <div className="uppercase font-black text-[clamp(3rem,8vw,12rem)] leading-[0.85] tracking-tighter text-[var(--sc-text)] flex items-center gap-6">
            <SplitText text="ARCHIVE" />
            <span className="text-[clamp(1rem,2vw,3rem)] font-mono opacity-40 translate-y-[-20%] hero-bottom-content">
              ({posts.length})
            </span>
          </div>
        </div>

        <div className="hero-bottom-content mt-8 flex flex-col md:flex-row md:items-center justify-between gap-8 opacity-0">
          <div className="text-xs md:text-sm font-bold tracking-widest leading-tight uppercase">
            Thoughts, methodologies, and <br/> pure uncompromising code.
          </div>
          <div className="font-mono text-xs uppercase opacity-60">
            Updated: {featuredPost.date}
          </div>
        </div>
      </section>

      {/* ==================== 2. Featured Post (头条文章) ==================== */}
      <section className="dark-section hide-sidebar-trigger relative py-32 px-6 lg:px-12 mt-12 bg-[var(--sc-bg)] transition-colors duration-700">
        <div className="max-w-[1600px] mx-auto w-full">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
            
            <div className="w-full lg:w-7/12">
              <div className="img-mask-container w-full h-[50vh] lg:h-[80vh] max-h-[800px] bg-[var(--sc-border)] relative overflow-hidden group cursor-pointer">
                <Link href={`/blog/${featuredPost.slug}`}>
                  <img src={featuredPost.image} alt={featuredPost.title} className="parallax-img absolute -top-[15%] left-0 w-full h-[130%] object-cover object-center opacity-90 transition-transform duration-[1.5s] ease-out group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-sm z-20 pointer-events-none">
                    <span className="font-black uppercase tracking-widest text-white text-sm sc-border border py-3 px-6 rounded-full bg-black/50">Read Featured</span>
                  </div>
                </Link>
              </div>
            </div>

            <div className="w-full lg:w-5/12 content-block flex flex-col">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest bg-[var(--sc-text)] text-[var(--sc-bg)] py-1.5 px-3">Featured</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{featuredPost.category}</span>
                <span className="text-[10px] font-mono opacity-40 ml-auto">{featuredPost.date}</span>
              </div>
              
              <h3 className="text-[clamp(2.5rem,4vw,5rem)] font-black tracking-tight uppercase mb-8 leading-[0.95]">
                {featuredPost.title}
              </h3>
              
              <p className="text-[clamp(0.875rem,1.2vw,1.25rem)] font-medium leading-relaxed opacity-80 mb-12">
                {featuredPost.excerpt}
              </p>
              
              {/* 阅读按钮 */}
              <Link 
                href={`/blog/${featuredPost.slug}`}
                className="btn-ripple group relative overflow-hidden bg-[var(--sc-inverse-bg)] border border-[var(--sc-inverse-bg)] px-10 py-5 flex items-center justify-between transition-transform active:scale-95 duration-500 isolate w-full lg:w-fit"
              >
                <span className="relative z-10 font-black text-xs uppercase tracking-[0.2em] text-[var(--sc-inverse-text)] transition-colors duration-300 group-hover:text-transparent">
                  Read Article
                </span>
                <span className="relative z-10 font-black text-xs text-[var(--sc-inverse-text)] group-hover:translate-x-2 transition-transform duration-500 ml-8">
                  →
                </span>
                <div 
                  className="absolute inset-0 bg-[var(--sc-bg)] pointer-events-none z-20 flex items-center justify-between px-10 group-hover:animate-[rippleSpread_1s_cubic-bezier(0.16,1,0.3,1)_forwards] ripple-mask"
                  style={{ clipPath: 'circle(0% at 50% 50%)' }}
                >
                  <span className="font-black text-xs uppercase tracking-[0.2em] text-[var(--sc-text)]">Read Article</span>
                  <span className="font-black text-xs text-[var(--sc-text)] group-hover:translate-x-2 transition-transform duration-500 ml-8">→</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

{/* ==================== 3. Grid List (自带双视图切换) ==================== */}
      <section className="relative py-20 px-6 lg:px-12 bg-[var(--sc-bg)] transition-colors duration-700">
        <div className="max-w-[1600px] mx-auto w-full content-block">
          
          <PostLayoutSwitcher 
            posts={gridPosts} 
            headerTitle="Recent Logs" 
            headerSubtitle={"Filter: All"} 
          />
{/* ==================== 4. 分页控件 ==================== */}
          <PaginationWidget 
            currentPage={currentPage} 
            totalPages={totalPages} 
            basePath="/blog" 
          />

        </div>
      </section>

    </BlogArchiveClientWrapper>
  );
}