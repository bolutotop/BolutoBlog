import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat, unlink } from 'fs/promises';
import { join, resolve } from 'path';
import { auth } from '@/auth';

const uploadDir = join(process.cwd(), 'uploads');

// 🛡️ 鉴权守卫：确保只有已登录管理员能访问
async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 });
  }
  return null; // 通过
}

// [GET] 扫描本地上传目录并返回图片列表
export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const files = await readdir(uploadDir);
    
    const images = await Promise.all(
      files.map(async (file) => {
        const filePath = join(uploadDir, file);
        const fileStat = await stat(filePath);
        return {
          name: file,
          url: `/uploads/${file}`,
          size: (fileStat.size / 1024).toFixed(2) + ' KB', 
          createdAt: fileStat.birthtime.toISOString(),
        };
      })
    );

    // 按时间倒序排列
    images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, images });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return NextResponse.json({ success: true, images: [] });
    }
    return NextResponse.json({ success: false, error: '读取图库失败' }, { status: 500 });
  }
}

// [DELETE] 物理删除指定图片
export async function DELETE(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    
    if (!name) {
      return NextResponse.json({ success: false, error: '缺少文件名参数' }, { status: 400 });
    }

    // 🛡️ 路径穿越防御：resolve 后验证是否仍在 uploadDir 内
    const resolvedPath = resolve(uploadDir, name);
    if (!resolvedPath.startsWith(resolve(uploadDir))) {
      return NextResponse.json({ success: false, error: '非法文件路径' }, { status: 403 });
    }

    await unlink(resolvedPath);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: '删除文件失败' }, { status: 500 });
  }
}