import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import BlogArchiveClientWrapper from '../../BlogArchiveClientWrapper';
import PaginationWidget from '@/components/blog/PaginationWidget';
import Footer from '@/components/Footer';
import PostLayoutSwitcher from '@/components/blog/PostLayoutSwitcher';
import SplitText from '@/components/SplitText';
import { formatDate } from '@/lib/utils';
import { siteConfig } from '@/config/site';

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

  // 🚀 1. 轻量筛选：只拉 id 和 category 用于精确过滤，不拉 content 等大字段
  const allCandidates = await prisma.post.findMany({
    where: {
      published: true,
      category: { contains: decodedCategory }
    },
    select: { id: true, category: true },
    orderBy: { createdAt: 'desc' }
  });

  // 🚀 2. 精筛：严格的一级标签全等匹配，只保留 ID
  const filteredIds = allCandidates
    .filter(post => {
      if (!post.category) return false;
      const topLevelTags = post.category.split(',').map(cat => cat.split('/')[0].trim());
      return topLevelTags.includes(decodedCategory);
    })
    .map(post => post.id);

  const totalPosts = filteredIds.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // 🚀 3. 精准分页：只取当前页的 ID 切片，再查完整数据
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const pageIds = filteredIds.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const paginatedPosts = await prisma.post.findMany({
    where: { id: { in: pageIds } },
    orderBy: { createdAt: 'desc' },
  });

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
    image: post.coverImage || siteConfig.defaultCoverImage,
  }));

  return (
    <BlogArchiveClientWrapper postsCount={totalPosts} lastUpdated={featuredPost ? featuredPost.date : gridPosts[0]?.date || 'N/A'}>

      {/* ==================== 1. Hero 区域 (定制化大字) ==================== */}
      {/* 🚀 核心修复：把 justify-end 改为 justify-start，加入 pt-28/40 让文字吸顶。保留 min-h-[50vh] 作为滚动缓冲池 */}
      <section className="relative min-h-[50vh] lg:min-h-[60vh] flex flex-col justify-start pt-28 md:pt-40 px-6 lg:px-12 pb-10">
        {/* 💡 缩小底边距 pb-12 -> pb-8 md:pb-12 */}
        <div className="relative z-10 border-b sc-border pb-8 md:pb-12">

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

        {/* 💡 缩小顶边距 mt-8 -> mt-6 md:mt-8 */}
        <div className="hero-bottom-content mt-6 md:mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 opacity-0">
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
        // 💡 调整 Hero 到 Featured 的距离：mt-12 改为 mt-0。
        // 💡 调整移动端上下内边距：py-32 改为 py-16 md:py-32。
        <section className="dark-section hide-sidebar-trigger relative py-16 md:py-32 px-6 lg:px-12 mt-0 bg-[var(--sc-bg)] transition-colors duration-700">
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

      {/* ==================== 3. Grid List (自带双视图切换) ==================== */}
      {/* 💡 调整列表距离上方块的间距：原 py-20 改为 pt-12 pb-20，拉近顶部距离 */}
      <section className="relative pt-12 pb-20 px-6 lg:px-12 bg-[var(--sc-bg)] transition-colors duration-700">

        {/* 🚀 核心修复：去掉了包裹在外面的 content-block，防止分页器被 GSAP 隐藏！ */}
        <div className="max-w-[1600px] mx-auto w-full">

          {/* 只有列表区域参与滚动淡入动画 */}
          <div className="content-block">
            <PostLayoutSwitcher
              posts={gridPosts}
              headerTitle="Recent Logs"
              headerSubtitle={`Filter: ${decodedCategory}`}
            />
          </div>

          {/* ==================== 4. 分页控件 ==================== */}
          {/* 分页器独立，永远可见 */}
          <div>
            <PaginationWidget
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/blog/category/${resolvedParams.category}`}
            />
          </div>

        </div>
      </section>
      <Footer />
    </BlogArchiveClientWrapper>

  );
}