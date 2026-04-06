import type { MetadataRoute } from 'next';

/**
 * 自动生成 robots.txt — 允许所有搜索引擎爬虫索引，并指向 sitemap。
 * Next.js App Router 会自动在 /robots.txt 路径提供此文件。
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/login'],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://boluto.top'}/sitemap.xml`,
  };
}
