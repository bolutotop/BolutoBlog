import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat, unlink } from 'fs/promises';
import { join } from 'path';

const uploadDir = join(process.cwd(), 'uploads');

// [GET] 扫描本地上传目录并返回图片列表
export async function GET() {
  try {
    const files = await readdir(uploadDir);
    
    // 获取文件元数据 (大小、创建时间)
    const images = await Promise.all(
      files.map(async (file) => {
        const filePath = join(uploadDir, file);
        const fileStat = await stat(filePath);
        return {
          name: file,
          url: `/uploads/${file}`,
          // 转换为 KB
          size: (fileStat.size / 1024).toFixed(2) + ' KB', 
          createdAt: fileStat.birthtime.toISOString(),
        };
      })
    );

    // 按时间倒序排列 (最新的在最前)
    images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, images });
  } catch (error: any) {
    // 如果目录不存在 (还没上传过任何图片)，返回空数组
    if (error.code === 'ENOENT') {
        return NextResponse.json({ success: true, images: [] });
    }
    return NextResponse.json({ success: false, error: '读取图库失败' }, { status: 500 });
  }
}

// [DELETE] 物理删除指定图片
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    
    if (!name) {
      return NextResponse.json({ success: false, error: '缺少文件名参数' }, { status: 400 });
    }

    // 防御路径穿越漏洞 (Directory Traversal)
    const safeName = name.replace(/(\.\.[\/\\])+/g, '');
    const filePath = join(uploadDir, safeName);

    await unlink(filePath);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: '删除文件失败' }, { status: 500 });
  }
}