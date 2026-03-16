import Link from 'next/link';
import prisma from '@/lib/prisma';
import DeleteButton from '@/components/admin/DeleteButton';
import { PlusIcon, PencilSquareIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-100">文章管理</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            共找到 {posts.length} 篇文章
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
            <Link 
                href="/admin/editor" 
                className="flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-80 transition active:scale-95 shadow-lg shadow-black/10 dark:shadow-white/10"
            >
                <PlusIcon className="w-4 h-4" />
                写新文章
            </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]"> 
            <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium text-zinc-500 dark:text-zinc-400 w-[40%]">标题</th>
                <th className="px-6 py-4 font-medium text-zinc-500 dark:text-zinc-400 w-[20%]">状态</th>
                <th className="px-6 py-4 font-medium text-zinc-500 dark:text-zinc-400 w-[20%]">创建日期</th>
                <th className="px-6 py-4 font-medium text-zinc-500 dark:text-zinc-400 w-[20%] text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 align-top">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100 block max-w-xs truncate" title={post.title}>
                        {post.title}
                    </div>
                    <div className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-1 truncate max-w-[200px]">
                        /{post.slug}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                      post.published 
                        ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400' 
                        : 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/50 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                        {post.published ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top text-zinc-500 dark:text-zinc-400">
                    {/* 强制服务端与客户端保持一致的日期格式输出，修复 Hydration 错误 */}
                    {post.createdAt.toISOString().split('T')[0]}
                  </td>
                  <td className="px-6 py-4 align-top text-right">
                     <div className="flex items-center justify-end gap-2">
                        <Link 
                           href={`/admin/editor?id=${post.id}`} 
                           className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-blue-600 dark:text-blue-400 transition-colors"
                           title="编辑"
                        >
                           <PencilSquareIcon className="w-5 h-5"/>
                        </Link>
                        <span className="text-zinc-300 dark:text-zinc-700">|</span>
                        <div className="scale-90 origin-right">
                           <DeleteButton id={post.id} title={post.title} />
                        </div>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {posts.length === 0 && (
           <div className="p-12 text-center text-zinc-500 dark:text-zinc-400 flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-3xl">
                 <DocumentTextIcon className="w-8 h-8 text-zinc-400" />
              </div>
              <p>暂无文章，请点击右上角新建。</p>
           </div>
        )}
      </div>
    </div>
  );
}