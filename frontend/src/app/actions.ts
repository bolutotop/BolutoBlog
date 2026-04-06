'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { auth } from '@/auth'; // 🚀 引入 auth 校验器

// =========================================================================
// 🛡️ 核心鉴权包裹器 (保护敏感的写操作)
// =========================================================================
async function protectAction<T>(action: () => Promise<T>): Promise<T | { success: false; message: string }> {
  try {
    const session = await auth();
    
    // 未登录拦截
    if (!session || !session.user) {
      console.error("❌ 拦截未授权的服务操作 (Unauthorized Server Action)");
      return { success: false, message: "Unauthorized Request: 请先登录" };
    }
    
    // 执行真正的业务逻辑并直接透传返回结果，避免多层嵌套
    return await action();
    
  } catch (error: any) {
    console.error("Action 出错:", error);
    
    // 全局处理 Prisma 唯一性冲突错误
    if (error.code === 'P2002') {
        return { success: false, message: '数据冲突：URL Slug 或关键字段已存在，请换一个' };
    }
    return { success: false, message: error.message || "Internal Server Error" };
  }
}

// =========================================================================
// 🔒 需要管理员权限的写操作 (Mutations) - 使用 protectAction 包裹
// =========================================================================

export async function savePostAction(formData: FormData) {
  return await protectAction(async () => {
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    let slug = formData.get('slug') as string;
    const category = formData.get('category') as string;
    const content = formData.get('content') as string;
    const coverImage = formData.get('coverImage') as string;
    const published = formData.get('published') === 'true';

    if (!slug) {
      slug = title.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '');
    }

    if (id) {
      await prisma.post.update({
        where: { id },
        data: { title, slug, category, content, coverImage, published }
      });
    } else {
      await prisma.post.create({
        data: { title, slug, category, content, coverImage, published }
      });
    }

    revalidatePath('/admin');
    revalidatePath('/'); 
    
    return { success: true };
  });
}

export async function deletePostAction(id: string) {
  return await protectAction(async () => {
    await prisma.post.delete({
      where: { id }
    });
    
    revalidatePath('/admin');
    revalidatePath('/');
    
    return { success: true };
  });
}

export async function uploadImage(formData: FormData) {
  return await protectAction(async () => {
    const file = formData.get('file') as File;
    if (!file) throw new Error('未检测到文件');

    // 🛡️ 安全校验 1：文件类型白名单
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('不支持的文件类型，仅允许 JPEG / PNG / GIF / WebP / SVG');
    }

    // 🛡️安全校验 2：文件大小上限 (10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('文件大小超过 10MB 限制');
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), 'public', 'uploads'); // 注意：通常需要存放在 public 下才能直接访问
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // 目录已存在，忽略错误
    }

    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}-${safeFilename}`;
    const filePath = join(uploadDir, uniqueName);

    await writeFile(filePath, buffer);

    // 返回给前端
    return { success: true, url: `/uploads/${uniqueName}` };
  });
}

export async function saveHomePageConfigAction(jsonData: any) {
  return await protectAction(async () => {
    await prisma.systemConfig.upsert({
      where: { key: 'HOMEPAGE_DATA' },
      update: { value: JSON.stringify(jsonData) },
      create: { 
        key: 'HOMEPAGE_DATA', 
        value: JSON.stringify(jsonData) 
      }
    });

    revalidatePath('/'); 

    return { success: true };
  });
}

// =========================================================================
// 🌍 公开的读操作 (Queries) - 保持原样，不包裹鉴权，允许前台访客直接读取
// =========================================================================

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
    const posts = await prisma.post.findMany({
      where: { category: { not: null } },
      select: { category: true },
    });

    const topLevelCategories = new Set<string>();

    posts.forEach(post => {
      if (!post.category) return;
      const categories = post.category.split(',').map(c => c.trim());
      categories.forEach(cat => {
        const topLevel = cat.split('/')[0].trim();
        if (topLevel) topLevelCategories.add(topLevel);
      });
    });

    return { success: true, categories: Array.from(topLevelCategories) };
  } catch (error) {
    console.error("Failed to fetch top-level categories:", error);
    return { success: false, categories: [] };
  }
}

export async function searchPostsAction(query: string) {
  if (!query || query.trim() === '') return { success: true, posts: [] };

  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
          { category: { contains: query } }
        ]
      },
      select: { id: true, title: true, slug: true, category: true, createdAt: true },
      take: 6, 
      orderBy: { createdAt: 'desc' }
    });

    const formattedPosts = posts.map(post => ({
      ...post,
      date: post.createdAt.toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric' 
      })
    }));

    return { success: true, posts: formattedPosts };
  } catch (error) {
    console.error("Search failed:", error);
    return { success: false, posts: [] };
  }
}

export async function getHomePageConfigAction() {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'HOMEPAGE_DATA' }
    });
    
    if (config && config.value) {
      return { success: true, data: JSON.parse(config.value) };
    }
    return { success: false, data: null };
  } catch (error) {
    console.error("Failed to fetch home page config:", error);
    return { success: false, data: null };
  }
}