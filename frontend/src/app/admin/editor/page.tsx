import prisma from '@/lib/prisma';
import PostForm from './PostForm';

// 根据 ID 获取文章数据
async function getPostById(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
  });
  return post;
}

export default async function WritePage({
  searchParams,
}: {
  // 兼容 Next.js 15 的异步 searchParams
  searchParams: Promise<{ id?: string }>; 
}) {
  const { id } = await searchParams;

  let post = null;
  
  // 1. 如果 URL 里有 id (编辑模式)，去数据库查数据
  if (id) {
    post = await getPostById(id);
  }

  // 2. 将数据传给客户端表单组件 (新建模式时 post 为 null)
  return (
    <PostForm initialPost={post} />
  );
}