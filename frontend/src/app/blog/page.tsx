import React from 'react';
import Link from 'next/link';

// 1. 引入数据库实例
import prisma from '@/lib/prisma';

// 2. 引入各个拆分出去的客户端组件
import BlogArchiveClientWrapper from './BlogArchiveClientWrapper';
import PostLayoutSwitcher from '@/components/blog/PostLayoutSwitcher';
import PaginationWidget from '@/components/blog/PaginationWidget';

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

// --- Server Component ---
export default async function BlogArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>; 
}) {
  const resolvedParams = await searchParams;
  
  // 🚀 1. 分页核心设置
  const currentPage = Number(resolvedParams.page) || 1; 
  const POSTS_PER_PAGE = 5; 
  
  // 🚀 2. 并行查询
  const [totalPosts, posts] = await Promise.all([
    prisma.post.count({ where: { published: true } }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * POSTS_PER_PAGE, 
      take: POSTS_PER_PAGE, 
    })
  ]);

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  
  if (!posts || posts.length === 0) {
    return (
      <BlogArchiveClientWrapper postsCount={0} lastUpdated="N/A">
        <div className="min-h-screen flex items-center justify-center font-black text-4xl uppercase tracking-tighter">
          No publications found.
        </div>
      </BlogArchiveClientWrapper>
    );
  }

  // 🚀 3. 核心逻辑修复：头条文章仅在第一页显示
  const isFirstPage = currentPage === 1;
  const rawFeaturedPost = isFirstPage ? posts[0] : null;
  const rawGridPosts = isFirstPage ? posts.slice(1) : posts;

  // 日期格式化
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // 格式化头条文章
  const featuredPost = rawFeaturedPost ? {
    id: rawFeaturedPost.id,
    title: rawFeaturedPost.title,
    slug: rawFeaturedPost.slug,
    category: rawFeaturedPost.category || 'Uncategorized',
    date: formatDate(rawFeaturedPost.createdAt),
    excerpt: rawFeaturedPost.content.substring(0, 150) + '...', 
    image: rawFeaturedPost.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', 
  } : null;

  // 格式化列表文章（完美计算绝对序列号）
  const gridPosts = rawGridPosts.map((post, index) => {
    // 绝对序号计算：(当前页数 - 1) * 每页数量 + (如果是第一页则索引+2，否则+1)
    const absoluteIndex = (currentPage - 1) * POSTS_PER_PAGE + (isFirstPage ? index + 2 : index + 1);
    
    return {
      id: post.id,
      displayIndex: String(absoluteIndex).padStart(2, '0'), 
      title: post.title,
      slug: post.slug,
      category: post.category || 'Uncategorized',
      date: formatDate(post.createdAt),
      excerpt: post.content.substring(0, 120) + '...',
      image: post.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    };
  });

return (
    <BlogArchiveClientWrapper postsCount={totalPosts} lastUpdated={featuredPost ? featuredPost.date : gridPosts[0]?.date || 'N/A'}>
      
{/* ==================== 1. Hero 区域 ==================== */}
      {/* 🚀 核心修复：把 min-h-[50vh] 加回来作为“滚动缓冲区”，防止下方动画提前触发！ */}
      {/* 💡 结合 justify-start 和 pt-28/40，做到“文字吸顶”与“滚动空间”兼得。 */}
      <section className="relative min-h-[50vh] lg:min-h-[60vh] pt-28 md:pt-40 px-6 lg:px-12 pb-10 flex flex-col justify-start">
        
        <div className="relative z-10 border-b sc-border pb-8 md:pb-12">
          
          <div className="uppercase font-black text-[clamp(3rem,8vw,12rem)] leading-[0.85] tracking-tighter text-[var(--sc-text)]">
            <SplitText text="" />
          </div>
          
          <div className="uppercase font-black text-[clamp(3rem,8vw,12rem)] leading-[0.85] tracking-tighter text-[var(--sc-text)] flex flex-wrap items-center gap-6">
            <SplitText text="目录" />
            <span className="text-[clamp(1rem,2vw,3rem)] font-mono opacity-40 translate-y-[-20%] hero-bottom-content">
              ({totalPosts})
            </span>
          </div>

        </div>

        <div className="hero-bottom-content mt-6 md:mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 opacity-0">
          <div className="text-xs md:text-sm font-bold tracking-widest leading-tight uppercase">
            Thoughts, methodologies, and <br className="hidden md:block" /> pure uncompromising code.
          </div>
          <div className="font-mono text-xs uppercase opacity-60">
            Page {currentPage} of {totalPages}
          </div>
        </div>

      </section>

      {/* ==================== 2. Featured Post (仅第一页渲染) ==================== */}
      {featuredPost && (
        // 💡 调整 Hero 到 Featured 的距离：原 mt-12，现改为 mt-0 (紧贴上方)。
        // 💡 调整 Featured 内部的上下内边距：原 py-32，现改为 py-16 (大幅压缩)。继续缩短可改 py-10
        <section className="dark-section hide-sidebar-trigger relative py-16 px-6 lg:px-12 mt-0 bg-[var(--sc-bg)] transition-colors duration-700">
          <div className="max-w-[1600px] mx-auto w-full">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
              
              <div className="w-full lg:w-7/12">
                {/* 💡 调整头条图片高度：原 lg:h-[80vh]，若嫌太大可改为 lg:h-[60vh] */}
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

      {/* ==================== 3. 动态视图列表 (Grid/List 切换) ==================== */}
      {/* 💡 调整 Featured 到 Grid/List 的距离：原 py-20，现改为 pt-12 pb-20 (顶部拉近)。继续缩短可改 pt-6 */}
      <section className="relative pt-12 pb-20 px-6 lg:px-12 bg-[var(--sc-bg)] transition-colors duration-700">
        
        {/* 🚀 核心修复：分离动画类名！将 content-block 从父级 div 移到 PostLayoutSwitcher 外面的一层 */}
        {/* 这样 Grid/List 会有滚动淡入动画，但底部的分页器绝不会被卡成透明！ */}
        <div className="max-w-[1600px] mx-auto w-full">
          
          <div className="content-block">
            <PostLayoutSwitcher 
              posts={gridPosts} 
              headerTitle="Recent Logs" 
              headerSubtitle="Filter: All" 
            />
          </div>

          {/* ==================== 4. 分页控件 ==================== */}
          {/* 💡 调整列表到底部分页器的距离：原 mt-32，现改为 mt-12。由 PaginationWidget 内部控制 */}
          <div>
            <PaginationWidget 
              currentPage={currentPage} 
              totalPages={totalPages} 
              basePath="/blog" 
            />
          </div>

        </div>
      </section>

    </BlogArchiveClientWrapper>
  );
}