import { notFound } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';
import { MDXRemote } from 'next-mdx-remote/rsc';
import CodePlayground from '@/components/CodePlayground'; // 需后续创建

// 定义自定义组件映射，允许在 MDX 中直接使用 <CodePlayground />
const components = {
    CodePlayground,
};

interface BlogPostProps {
    params: { slug: string };
}

export default async function BlogPost({ params }: BlogPostProps) {
    const { slug } = params;
    const filePath = path.join(process.cwd(), 'content', `${slug}.mdx`);

    let fileContent: string;
    try {
        fileContent = await fs.readFile(filePath, 'utf8');
    } catch (error) {
        // 文件不存在则触发 404
        notFound();
    }

    return (
        <article className="prose prose-invert max-w-4xl mx-auto p-6">
            {/* 服务端组件直接渲染 MDX，并将 CodePlayground 作为客户端组件水合 (Hydration) */}
            <MDXRemote source={fileContent} components={components} />
        </article>
    );
}