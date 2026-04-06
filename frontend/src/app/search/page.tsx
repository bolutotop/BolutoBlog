import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';

import BlogArchiveClientWrapper from '@/app/blog/BlogArchiveClientWrapper';
import PostLayoutSwitcher from '@/components/blog/PostLayoutSwitcher';
import PaginationWidget from '@/components/blog/PaginationWidget';
import Footer from '@/components/Footer';
import SplitText from '@/components/SplitText';
import { formatDate } from '@/lib/utils';
import { siteConfig } from '@/config/site';

const POSTS_PER_PAGE = 5;

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const rawQuery = resolvedParams.q || '';
  const decodedQuery = decodeURIComponent(rawQuery).trim();
  const currentPage = Number(resolvedParams.page) || 1;
  // 🚀 执行数据库搜索（模糊匹配标题、内容或分类）
  const [totalPosts, posts] = await Promise.all([
    prisma.post.count({
      where: {
        published: true,
        OR: [
          { title: { contains: decodedQuery } },
          { content: { contains: decodedQuery } },
          { category: { contains: decodedQuery } }
        ]
      }
    }),
    prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: decodedQuery } },
          { content: { contains: decodedQuery } },
          { category: { contains: decodedQuery } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
    })
  ]);
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);



  // 格式化搜索结果文章列表
  const gridPosts = posts.map((post, index) => {
    const absoluteIndex = (currentPage - 1) * POSTS_PER_PAGE + index + 1;
    return {
      id: post.id,
      displayIndex: String(absoluteIndex).padStart(2, '0'),
      title: post.title,
      slug: post.slug,
      category: post.category || 'Uncategorized',
      date: formatDate(post.createdAt),
      excerpt: post.content.substring(0, 120) + '...',
      image: post.coverImage || siteConfig.defaultCoverImage,
    };
  });

  return (
    <BlogArchiveClientWrapper postsCount={totalPosts} lastUpdated="N/A">

      {/* ==================== 1. Hero 区域 ==================== */}
      <section className="relative min-h-[50vh] lg:min-h-[60vh] flex flex-col justify-start pt-28 md:pt-40 px-6 lg:px-12 pb-10">
        <div className="relative z-10 border-b sc-border pb-8 md:pb-12">

          <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] opacity-50 mb-4 animate-pulse">
            Search Results For
          </div>

          <div className="uppercase font-black text-[clamp(2.5rem,6vw,8rem)] leading-[0.9] tracking-tighter text-[var(--sc-text)] break-words">
            <SplitText text={decodedQuery ? `"${decodedQuery}"` : "ANYTHING"} />
          </div>

        </div>

        <div className="hero-bottom-content mt-6 md:mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 opacity-0">
          <Link href="/blog" className="text-xs md:text-sm font-black tracking-widest leading-tight uppercase hover:opacity-50 transition-opacity">
            [ ← RETURN TO ALL LOGS ]
          </Link>
          <div className="font-mono text-xs uppercase opacity-60">
            {totalPosts} MATCHES FOUND
          </div>
        </div>
      </section>

      {/* ==================== 2. 搜索结果列表 ==================== */}
      <section className="relative pt-6 pb-20 px-6 lg:px-12 bg-[var(--sc-bg)] transition-colors duration-700">
        <div className="max-w-[1600px] mx-auto w-full">

          {totalPosts > 0 ? (
            <>
              <div className="content-block">
                {/* 借用你已经写好的 PostLayoutSwitcher 完美呈现列表 */}
                <PostLayoutSwitcher
                  posts={gridPosts}
                  headerTitle="Search Archive"
                  headerSubtitle={`Query: ${decodedQuery}`}
                />
              </div>

              <div>
                <PaginationWidget
                  currentPage={currentPage}
                  totalPages={totalPages}
                  basePath={`/search`}
                />
              </div>
            </>
          ) : (
            <div className="py-32 flex flex-col items-center justify-center content-block text-center border-t sc-border">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6">Zero Matches</h2>
              <p className="text-sm md:text-base font-medium opacity-60 max-w-lg leading-relaxed mb-8">
                The system could not locate any documents containing "{decodedQuery}". Try refining your search parameters.
              </p>
              <Link href="/blog" className="btn-ripple group relative overflow-hidden bg-[var(--sc-text)] text-[var(--sc-bg)] px-8 py-4 flex items-center justify-center font-black text-xs uppercase tracking-widest isolate">
                Browse All Logs
              </Link>
            </div>
          )}

        </div>
      </section>
      <Footer />
    </BlogArchiveClientWrapper>
  );
}