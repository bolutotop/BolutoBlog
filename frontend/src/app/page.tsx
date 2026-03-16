import Link from 'next/link';
import prisma from '@/lib/prisma';

// 强制动态渲染，保证你在后台发布文章后，前台立刻刷新
export const dynamic = 'force-dynamic';

export default async function Home() {
  // 从数据库拉取数据：只展示 published 为 true（已发布）的文章
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="max-w-4xl mx-auto p-8 mt-10 space-y-12">
      
      {/* 顶部导航与【后台入口】 */}
      <header className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
          Boluto's Dev Log
        </h1>
        
        {/* 🔴 核心：这就是你需要的后台入口按钮 */}
        <Link 
          href="/admin" 
          className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full text-sm font-bold hover:scale-105 transition-transform shadow-sm"
        >
          进入后台管理 &rarr;
        </Link>
      </header>

      {/* 前台文章列表展示区 */}
      <section className="space-y-6">
        {posts.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl">
            前台暂无已发布的文章。请点击右上角进入后台发布。
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {posts.map(post => (
              <article 
                key={post.id} 
                className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all bg-white dark:bg-zinc-900"
              >
                <div className="flex flex-col gap-3">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                    <Link href={`/posts/${post.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                      {post.title}
                    </Link>
                  </h2>
                  
                  {/* 新增：分类标签渲染逻辑 */}
                  {post.category && (
                    <div className="flex flex-wrap gap-2">
                        {post.category.split(',').map((tag) => {
                            const [p, c] = tag.trim().split('/');
                            if (!p) return null; // 容错处理
                            return (
                            <span 
                                key={tag} 
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 whitespace-nowrap"
                            >
                                {p}
                                {c && <span className="text-zinc-400 mx-1">/</span>}
                                {c && <span>{c}</span>}
                            </span>
                            )
                        })}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-zinc-500 font-mono mt-1">
                    <time>{post.createdAt.toISOString().split('T')[0]}</time>
                    <span>/ {post.slug}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

    </main>
  );
}