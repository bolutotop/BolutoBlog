import Link from 'next/link';
import prisma from '@/lib/prisma';
import DeleteButton from '@/components/admin/DeleteButton';
import SearchBar from '@/components/admin/SearchBar'; // 🚀 引入搜索组件
import { PlusIcon, DocumentTextIcon, PencilSquareIcon, XCircleIcon } from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard({
  searchParams,
}: {
  // 兼容 Next.js 15 的异步 searchParams
  searchParams: Promise<{ q?: string }>; 
}) {
  const { q } = await searchParams;
  const keyword = q || '';

  // 🚀 Prisma 查询逻辑：如果存在关键字，则模糊匹配 标题、路径 或 分类
  const whereClause = keyword
    ? {
        OR: [
          { title: { contains: keyword } },
          { slug: { contains: keyword } },
          { category: { contains: keyword } },
        ],
      }
    : {};

  const posts = await prisma.post.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      published: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 页面头部 */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">内容控制中心</h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">
            {keyword ? (
              <>在全库搜索 "<span className="text-gray-900 font-bold">{keyword}</span>" ，共找到 <span className="font-bold text-gray-900">{posts.length}</span> 个结果</>
            ) : (
              <>当前全站共计 <span className="font-bold text-gray-900">{posts.length}</span> 篇文章</>
            )}
          </p>
        </div>
        
        {/* 🚀 搜索框与新建按钮 */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <SearchBar />
            
            <Link 
                href="/admin/editor" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg active:scale-95 shrink-0"
            >
                <PlusIcon className="w-4 h-4 stroke-2" />
                创作新内容
            </Link>
        </div>
      </div>

      {/* 数据表格区域 */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[850px]"> 
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[11px] w-[40%]">文章标题 / 路径</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[11px] w-[20%]">分类标签</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[11px] w-[15%]">发布状态</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[11px] w-[15%]">创建日期</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-widest text-[11px] w-[10%] text-right">操作</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 transition-colors group">
                  
                  {/* 标题带跳转 */}
                  <td className="px-6 py-4 align-middle">
                    <Link href={`/blog/${post.slug}`} target="_blank" className="font-bold text-sm text-gray-900 block max-w-xs truncate hover:text-blue-600 transition-colors" title={post.title}>
                        {post.title}
                    </Link>
                    <div className="text-xs text-gray-400 font-mono mt-1 truncate max-w-[250px]">
                        /{post.slug}
                    </div>
                  </td>

                  {/* 分类 */}
                  <td className="px-6 py-4 align-middle">
                    <div className="flex flex-wrap gap-1.5">
                        {post.category ? post.category.split(',').filter(Boolean).map((tag) => {
                            const parts = tag.trim().split('/');
                            const p = parts[0];
                            const c = parts.length > 1 ? parts[1] : null;
                            if (!p) return null;
                            return (
                            <span 
                                key={tag} 
                                className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border border-gray-200 bg-white text-gray-600 whitespace-nowrap shadow-sm"
                            >
                                {p}
                                {c && <span className="text-gray-300 mx-1">/</span>}
                                {c && <span>{c}</span>}
                            </span>
                            )
                        }) : <span className="text-gray-300 text-xs">-</span>}
                    </div>
                  </td>

                  {/* 状态徽章 */}
                  <td className="px-6 py-4 align-middle">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                      post.published 
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${post.published ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>

                  {/* 日期 */}
                  <td className="px-6 py-4 align-middle text-gray-500 font-mono text-xs">
                    {post.createdAt.toISOString().split('T')[0]}
                  </td>

                  {/* 操作按钮 */}
                  <td className="px-6 py-4 align-middle text-right">
                     <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Link 
                           href={`/admin/editor?id=${post.id}`} 
                           className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                           title="编辑文章"
                        >
                           <PencilSquareIcon className="w-5 h-5"/>
                        </Link>
                        <DeleteButton id={post.id} title={post.title} />
                     </div>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* 🚀 空数据状态优化 (区分全局空数据 和 搜索无结果) */}
        {posts.length === 0 && (
           <div className="py-24 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  {keyword ? <XCircleIcon className="w-8 h-8 text-gray-400" /> : <DocumentTextIcon className="w-8 h-8 text-gray-400" />}
              </div>
              <h3 className="text-gray-900 text-sm font-bold mb-1">
                {keyword ? `未找到与 "${keyword}" 相关的文章` : '还没有任何文章'}
              </h3>
              <p className="text-xs text-gray-500 font-medium mb-4">
                {keyword ? '换个关键词试试，或者检查拼写错误' : '点击右上角按钮开始创作你的第一篇内容'}
              </p>
              {keyword && (
                <Link href="/admin" className="text-sm text-blue-600 hover:underline font-semibold">
                  清除搜索条件
                </Link>
              )}
           </div>
        )}
      </div>
    </div>
  );
}