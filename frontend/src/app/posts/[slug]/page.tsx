import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

export default async function PostDetail({
  params,
}: {
  // Next.js 15+ 强制要求 params 为 Promise
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. 数据库精准查询：匹配 slug 且状态必须为已发布 (published: true)
  const post = await prisma.post.findUnique({
    where: { 
      slug: slug,
      published: true 
    },
  });

  // 2. 查无此文或未发布时，触发 Next.js 的 404 页面
  if (!post) {
    notFound();
  }

  // 3. 渲染正文
  return (
    <main className="max-w-3xl mx-auto p-8 mt-10 pb-32">
      {/* 顶部返回导航 */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors mb-12"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        返回主页
      </Link>

      <article className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* 文章头部元数据 (Metadata) */}
        <header className="mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 font-mono text-sm">
            <time dateTime={post.createdAt.toISOString()}>
{post.createdAt.toISOString().split('T')[0]}
            </time>
            <span>·</span>
            <span>/{post.slug}</span>
          </div>
        </header>

        {/* 封面图 (如果存在) */}
        {post.coverImage && (
          <div className="mb-12 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
            {/* 暂时使用 img，后续需优化为 next/image */}
            <img 
              src={post.coverImage} 
              alt={post.title} 
              className="w-full h-auto object-cover max-h-[400px]"
            />
          </div>
        )}

        {/* Markdown 渲染核心区 
            使用 prose 开启 Tailwind Typography 默认排版
            dark:prose-invert 自动适配暗色模式
        */}
        <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none 
                        prose-headings:font-bold prose-headings:tracking-tight
                        prose-a:text-blue-600 dark:prose-a:text-blue-400
                        prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800">
          <MDXRemote source={post.content} />
        </div>
      </article>
    </main>
  );
}