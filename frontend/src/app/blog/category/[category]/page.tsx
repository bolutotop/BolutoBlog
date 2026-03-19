import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import BlogArchiveClientWrapper from '../../BlogArchiveClientWrapper';
import PaginationWidget from '@/components/blog/PaginationWidget'; // 根据你的实际路径调整
// 巨型标题文字切割组件 (保持不变)
const SplitText = ({ text, className = "" }: { text: string, className?: string }) => (
  <div className={`flex flex-wrap overflow-hidden pb-4 -mb-4 ${className}`}>
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

// 每页显示的文章数量 (Featured 1 篇 + Grid 中 n 篇)
const POSTS_PER_PAGE = 3; 

export default async function CategoryArchivePage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>; // 🚀 获取 URL 参数
}) {
  const resolvedParams = await params;
  const decodedCategory = decodeURIComponent(resolvedParams.category);
  
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;

  // 🚀 1. 粗筛：找出所有字面上包含该字符的文章，但不直接分页，因为需要“精筛”
  const allCandidatePosts = await prisma.post.findMany({
    where: { 
      published: true,
      category: { contains: decodedCategory }
    },
    orderBy: { createdAt: 'desc' }
  });

  // 🚀 2. 精筛：在服务端内存中进行严格的“一级标签全等匹配”
  const allFilteredPosts = allCandidatePosts.filter(post => {
    if (!post.category) return false;
    const topLevelTags = post.category.split(',').map(cat => cat.split('/')[0].trim());
    return topLevelTags.includes(decodedCategory);
  });

  const totalPosts = allFilteredPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // 🚀 3. 内存分页：根据当前页截取数据
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedPosts = allFilteredPosts.slice(startIndex, endIndex);

  // 如果没有数据（或者页码超出范围），可以给个提示或者直接返回空状态
  if (paginatedPosts.length === 0) {
    return (
      <BlogArchiveClientWrapper postsCount={0} lastUpdated="N/A">
        <section className="relative min-h-screen flex flex-col justify-center items-center px-6">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">No Logs Found</h1>
          <p className="font-mono text-sm opacity-50 mb-8">Category: {decodedCategory}</p>
          <Link href="/blog" className="px-8 py-4 border sc-border hover:bg-[var(--sc-text)] hover:text-[var(--sc-inverse-text)] transition-colors font-bold uppercase tracking-widest text-xs">
            Return to Archive
          </Link>
        </section>
      </BlogArchiveClientWrapper>
    );
  }

  // 逻辑拆分：第一页的第一篇作为 Featured，其他作为 Grid。
  // 注意：只有第一页才显示 featured post 的特殊排版，后面的页全都是 grid。
  const isFirstPage = currentPage === 1;
  const rawFeaturedPost = isFirstPage ? paginatedPosts[0] : null;
  const rawGridPosts = isFirstPage ? paginatedPosts.slice(1) : paginatedPosts;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const featuredPost = rawFeaturedPost ? {
    id: rawFeaturedPost.id,
    title: rawFeaturedPost.title,
    slug: rawFeaturedPost.slug,
    category: rawFeaturedPost.category || 'Uncategorized',
    date: formatDate(rawFeaturedPost.createdAt),
    excerpt: rawFeaturedPost.content.substring(0, 150) + '...', 
    image: rawFeaturedPost.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', 
  } : null;

  const gridPosts = rawGridPosts.map((post, index) => ({
    id: post.id,
    displayIndex: String(startIndex + (isFirstPage ? index + 2 : index + 1)).padStart(2, '0'), 
    title: post.title,
    slug: post.slug,
    category: post.category || 'Uncategorized',
    date: formatDate(post.createdAt),
    excerpt: post.content.substring(0, 120) + '...',
    image: post.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
  }));

  return (
    <BlogArchiveClientWrapper postsCount={totalPosts} lastUpdated={featuredPost ? featuredPost.date : gridPosts[0]?.date || 'N/A'}>
      
      {/* ==================== 1. Hero 区域 (定制化大字) ==================== */}
      <section className="relative min-h-[70vh] flex flex-col justify-end px-6 lg:px-12 pb-20">
        <div className="relative z-10 border-b sc-border pb-12">
          
          <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] opacity-50 mb-4 animate-pulse">
            Filtered By Category
          </div>
          
          <div className="uppercase font-black text-[clamp(3rem,8vw,12rem)] leading-[0.85] tracking-tighter text-[var(--sc-text)]">
            <SplitText text={decodedCategory.toUpperCase()} />
          </div>
          
          <div className="uppercase font-black text-[clamp(3rem,8vw,12rem)] leading-[0.85] tracking-tighter text-[var(--sc-text)] flex flex-wrap items-center gap-6">
            <SplitText text="ARCHIVE" />
            <span className="text-[clamp(1rem,2vw,3rem)] font-mono opacity-40 translate-y-[-20%] hero-bottom-content">
              ({totalPosts})
            </span>
          </div>
        </div>

        <div className="hero-bottom-content mt-8 flex flex-col md:flex-row md:items-center justify-between gap-8 opacity-0">
          <Link href="/blog" className="text-xs md:text-sm font-black tracking-widest leading-tight uppercase hover:opacity-50 transition-opacity">
            [ ← RETURN TO ALL LOGS ]
          </Link>
          <div className="font-mono text-xs uppercase opacity-60">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </section>

      {/* ==================== 2. Featured Post (仅在第一页显示) ==================== */}
      {featuredPost && (
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
                
                <Link 
                  href={`/blog/${featuredPost.slug}`}
                  className="btn-ripple group relative overflow-hidden bg-[var(--sc-inverse-bg)] border border-[var(--sc-inverse-bg)] px-10 py-5 flex items-center justify-between transition-transform active:scale-95 duration-500 isolate w-full lg:w-fit"
                >
                  <span className="relative z-10 font-black text-xs uppercase tracking-[0.2em] text-[var(--sc-inverse-text)] transition-colors duration-300 group-hover:text-transparent">
                    Read Article
                  </span>
                  <span className="relative z-10 font-black text-xs text-[var(--sc-inverse-text)] group-hover:translate-x-2 transition-transform duration-500 ml-8">→</span>
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
      )}

      {/* ==================== 3. Grid List ==================== */}
      <section className="relative py-20 px-6 lg:px-12 bg-[var(--sc-bg)] transition-colors duration-700">
        <div className="max-w-[1600px] mx-auto w-full">
          
          <div className="flex justify-between items-end border-b-2 sc-border pb-6 mb-16 content-block">
            <h4 className="text-xl md:text-3xl font-black uppercase tracking-tight">Recent Logs</h4>
            <span className="text-xs font-bold uppercase tracking-widest opacity-50">Filter: {decodedCategory}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
            {gridPosts.map((post, index) => (
              <Link href={`/blog/${post.slug}`} scroll={false} key={post.id} className={`flex flex-col group cursor-pointer content-block ${index % 2 !== 0 && gridPosts.length > 1 ? 'md:mt-32' : ''}`}>
                <div className="img-mask-container w-full h-[40vh] md:h-[55vh] bg-[var(--sc-border)] relative overflow-hidden mb-8">
                  <img src={post.image} alt={post.title} className="parallax-img absolute -top-[10%] left-0 w-full h-[120%] object-cover object-center transition-transform duration-[1.5s] ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-[var(--sc-inverse-bg)]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                </div>
                <div className="flex flex-col flex-grow">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b sc-border">
                    <span className="text-[clamp(1.5rem,2.5vw,3rem)] font-black tabular-nums tracking-tighter opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                      {post.displayIndex}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">
                      {post.category} • {post.date}
                    </span>
                  </div>
                  <h3 className="text-[clamp(1.5rem,2vw,2.5rem)] font-black tracking-tight uppercase mb-4 leading-tight group-hover:translate-x-2 transition-transform duration-300">
                    {post.title}
                  </h3>
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

          {/* ==================== 4. 分页控件 ==================== */}
          <PaginationWidget 
            currentPage={currentPage} 
            totalPages={totalPages} 
            basePath={`/blog/category/${resolvedParams.category}`} 
          />

        </div>
      </section>

    </BlogArchiveClientWrapper>
  );
}