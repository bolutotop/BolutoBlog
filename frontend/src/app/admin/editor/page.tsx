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
  searchParams: Promise<{ id?: string }>; 
}) {
  const { id } = await searchParams;

  let post = null;
  
  if (id) {
    post = await getPostById(id);
  }

  return (
    <PostForm initialPost={post} />
  );
}