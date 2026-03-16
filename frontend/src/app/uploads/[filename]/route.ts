import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> } // Next.js 16 异步 params
) {
  const { filename } = await params;

  // 防御路径穿越漏洞 (Directory Traversal)
  const safeFilename = filename.replace(/(\.\.[\/\\])+/g, '');
  // 注意：这里读取的是根目录下的 uploads，而不是 public/uploads
  const filePath = join(process.cwd(), 'uploads', safeFilename);

  try {
    const buffer = await readFile(filePath);
    
    // 基础 MIME 类型推断
    const ext = safeFilename.split('.').pop()?.toLowerCase();
    let mimeType = 'image/jpeg';
    if (ext === 'png') mimeType = 'image/png';
    else if (ext === 'gif') mimeType = 'image/gif';
    else if (ext === 'webp') mimeType = 'image/webp';
    else if (ext === 'svg') mimeType = 'image/svg+xml';

    // 返回图片流，并增加强缓存提升性能
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=86400, immutable', 
      },
    });
  } catch (error) {
    return new NextResponse('Image Not Found', { status: 404 });
  }
}