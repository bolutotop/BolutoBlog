import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// [GET] 获取树状标签列表
export async function GET() {
  try {
    // 包含子标签的嵌套查询
    const tags = await prisma.tag.findMany({
      where: { parentId: null }, // 只查顶层
      include: {
        children: {
          include: { children: true } // 支持向下查询两级子标签
        }
      }
    });
    return NextResponse.json(tags);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

// [POST] 创建新标签
export async function POST(request: NextRequest) {
  try {
    const { name, slug, parentId } = await request.json();
    if (!name || !slug) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const newTag = await prisma.tag.create({
      data: { name, slug, parentId: parentId || null }
    });
    return NextResponse.json(newTag, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Slug must be unique' }, { status: 409 });
    return NextResponse.json({ error: 'Creation failed' }, { status: 500 });
  }
}