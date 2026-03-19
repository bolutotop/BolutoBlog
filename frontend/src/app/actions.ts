'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';


export async function savePostAction(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    let slug = formData.get('slug') as string;
    const category = formData.get('category') as string; // 新增提取 category
    const content = formData.get('content') as string;
    const coverImage = formData.get('coverImage') as string;
    const published = formData.get('published') === 'true';

    if (!slug) {
      slug = title.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '');
    }

    if (id) {
      // 编辑模式
      await prisma.post.update({
        where: { id },
        // 加入 category
        data: { title, slug, category, content, coverImage, published }
      });
    } else {
      // 新建模式
      await prisma.post.create({
        // 加入 category
        data: { title, slug, category, content, coverImage, published }
      });
    }

    revalidatePath('/admin');
    revalidatePath('/'); // 同步刷新前台主页缓存
    
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
        return { success: false, message: 'URL Slug 已存在，请换一个' };
    }
    return { success: false, message: error.message || 'Database error' };
  }
}


// app/actions.ts 追加内容

export async function deletePostAction(id: string) {
  try {
    await prisma.post.delete({
      where: { id }
    });
    
    // 强制刷新前后台缓存，使 UI 立即更新
    revalidatePath('/admin');
    revalidatePath('/');
    
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || '删除失败' };
  }
}


export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) throw new Error('未检测到文件');

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 定义存储路径: public/uploads
    const uploadDir = join(process.cwd(), 'uploads');
    
    // 确保目录存在，不存在则自动创建
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // 目录已存在，忽略错误
    }

    // 生成唯一文件名，过滤特殊字符防止路径注入
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}-${safeFilename}`;
    const filePath = join(uploadDir, uniqueName);

    // 写入物理文件系统
    await writeFile(filePath, buffer);

    // 返回可访问的公开 URL
    return `/uploads/${uniqueName}`;
  } catch (error: any) {
    console.error('Image upload failed:', error);
    throw new Error(error.message || '上传失败');
  }
}

// app/actions.ts 追加内容

export async function getCalendarPostsAction() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: { title: true, slug: true, content: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, posts };
  } catch (error: any) {
    return { success: false, message: error.message || '获取日历数据失败' };
  }
}


export async function getCategoriesAction() {
  try {
    // 1. 获取所有包含分类的文章
    const posts = await prisma.post.findMany({
      where: { category: { not: null } },
      select: { category: true },
    });

    const topLevelCategories = new Set<string>();

    // 2. 遍历并解析字符串 (例如："Tech/React, Life")
    posts.forEach(post => {
      if (!post.category) return;
      
      // 先按逗号拆分出所有分类
      const categories = post.category.split(',').map(c => c.trim());
      
      categories.forEach(cat => {
        // 再按斜杠拆分，永远只取第一项作为“一级标签”
        const topLevel = cat.split('/')[0].trim();
        if (topLevel) {
          topLevelCategories.add(topLevel); // Set 会自动去重
        }
      });
    });

    // 3. 转回数组并返回
    return { success: true, categories: Array.from(topLevelCategories) };
  } catch (error) {
    console.error("Failed to fetch top-level categories from posts:", error);
    return { success: false, categories: [] };
  }
}