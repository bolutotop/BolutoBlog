import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // 必须确保上一步的 lib/prisma.ts 已正确创建

// [GET] 获取所有文章列表
export async function GET(request: NextRequest) {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' }, // 按创建时间倒序
    });
    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// [POST] 创建新文章
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, content, published, coverImage } = body;

    // 字段非空审计
    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Missing required fields: title, slug, or content' }, { status: 400 });
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        published: published ?? false,
        coverImage: coverImage ?? null,
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    // 拦截唯一键冲突 (P2002 是 Prisma 的 Unique constraint failed 错误码)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists. It must be unique.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}