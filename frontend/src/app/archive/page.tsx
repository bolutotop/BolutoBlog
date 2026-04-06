import prisma from '@/lib/prisma';
import BlogArchiveClientWrapper from '@/app/blog/BlogArchiveClientWrapper';
import ArchiveClient from './ArchiveClient';

export const dynamic = 'force-dynamic';

export default async function ArchivePage() {
  // 1. 获取所有已发布的文章，按时间倒序排列
  const rawPosts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      createdAt: true,
    }
  });

  // 2. 格式化数据，提取供客户端分组的元信息
  const formattedPosts = rawPosts.map(post => {
    const d = new Date(post.createdAt);
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      // 如果没有分类，默认归入 UNTITLED
      category: post.category ? post.category.split('/')[0].trim().toUpperCase() : 'UNTITLED', 
      dateStr: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }), // e.g., "Mar 26, 2026"
      year: d.getFullYear().toString(),
      month: d.toLocaleString('en-US', { month: 'long' }).toUpperCase(), // e.g., "MARCH"
    };
  });

  return (
    <BlogArchiveClientWrapper postsCount={formattedPosts.length} lastUpdated="N/A">
      <ArchiveClient posts={formattedPosts} />
    </BlogArchiveClientWrapper>
  );
}