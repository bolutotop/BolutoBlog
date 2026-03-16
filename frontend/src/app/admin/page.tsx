import Link from 'next/link';
import prisma from '@/lib/prisma';
import DeleteButton from '@/components/admin/DeleteButton';
import { PlusIcon, ArrowRightOnRectangleIcon, PencilSquareIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">控制中心</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            共找到 {posts.length} 篇文章
          </p>
        </div>
        
        <div className="flex items-center gap-3">
            <Link 
                href="/admin/editor" 
                className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-80 transition active:scale-95 shadow-md"
            >
                <PlusIcon className="w-4 h-4 stroke-2" />
                写新文章
            </Link>
            <button className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-50 transition">
                <ArrowRightOnRectangleIcon className="w-4 h-4 text-gray-400" />
                退出
            </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]"> 
            <thead className="border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 font-bold text-gray-400 w-[40%]">标题</th>
                <th className="px-8 py-5 font-bold text-gray-400 w-[20%]">分类</th>
                <th className="px-8 py-5 font-bold text-gray-400 w-[15%]">状态</th>
                <th className="px-8 py-5 font-bold text-gray-400 w-[15%]">日期</th>
                <th className="px-8 py-5 font-bold text-gray-400 w-[10%] text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-[#fafafa] transition-colors group">
                  
                  {/* 标题带跳转 */}
                  <td className="px-8 py-6 align-top">
                    {/* target="_blank" 在新标签页打开前台文章 */}
                    <Link href={`/posts/${post.slug}`} target="_blank" className="font-bold text-base text-gray-900 block max-w-xs truncate hover:text-purple-600 transition-colors" title={post.title}>
                        {post.title}
                    </Link>
                    <div className="text-xs text-gray-400 font-mono mt-1.5 truncate max-w-[200px]">
                        /{post.slug}
                    </div>
                  </td>

                  {/* 分类 */}
                  <td className="px-8 py-6 align-top">
                    <div className="flex flex-wrap gap-2">
                        {post.category ? post.category.split(',').map((tag) => {
                            const [p, c] = tag.trim().split('/');
                            if (!p) return null;
                            return (
                            <span 
                                key={tag} 
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-gray-100 bg-gray-50 text-gray-600 whitespace-nowrap"
                            >
                                {p}
                                {c && <span className="text-gray-300 mx-1.5">/</span>}
                                {c && <span>{c}</span>}
                            </span>
                            )
                        }) : <span className="text-gray-300 text-xs">-</span>}
                    </div>
                  </td>

                  {/* 恢复真实发布状态 */}
                  <td className="px-8 py-6 align-top">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                      post.published 
                        ? 'border-green-200 bg-green-50 text-green-700' 
                        : 'border-yellow-200 bg-yellow-50 text-yellow-700'
                    }`}>
                        {post.published ? '已发布' : '草稿'}
                    </span>
                  </td>

                  <td className="px-8 py-6 align-top text-gray-500">
                    {post.createdAt.toISOString().split('T')[0]}
                  </td>

                  <td className="px-8 py-6 align-top text-right">
                     <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                           href={`/admin/editor?id=${post.id}`} 
                           className="flex items-center text-purple-600 hover:text-purple-800 transition-colors font-medium text-xs gap-1"
                           title="编辑"
                        >
                           <PencilSquareIcon className="w-4 h-4"/>
                        </Link>
                        <span className="text-gray-200">|</span>
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
           <div className="py-20 text-center text-gray-400 flex flex-col items-center gap-3">
              <DocumentTextIcon className="w-10 h-10 text-gray-200" />
              <p className="text-sm font-medium">暂无数据</p>
           </div>
        )}
      </div>
    </div>
  );
}