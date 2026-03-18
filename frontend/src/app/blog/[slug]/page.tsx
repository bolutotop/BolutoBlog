import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import BlogPostClientWrapper from './BlogPostClientWrapper';

// 强制动态渲染 (可选，确保每次访问都能拿到最新数据)
export const dynamic = 'force-dynamic';

export default async function BlogPostPage({
  params,
}: {
  // 兼容 Next.js 15 的异步 params
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. 去数据库查询对应 slug 的文章
  const post = await prisma.post.findUnique({
    where: { slug },
  });

  // 2. 如果没找到文章，或者文章设为草稿未发布，则返回 404
  if (!post || !post.published) {
    notFound();
  }

  // 3. 格式化数据，传递给客户端组件
  const formattedPost = {
    id: post.id,
    title: post.title,
    category: post.category || 'Uncategorized',
    date: post.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    content: post.content,
    // 如果没有封面图，给一张极简的黑白建筑占位图
    coverImage: post.coverImage || 'https://images.unsplash.com/photo-1513628253939-010e64ac66cd?q=80&w=2564&auto=format&fit=crop&grayscale',
  };

  return <BlogPostClientWrapper post={formattedPost} />;
}