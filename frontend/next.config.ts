// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true, // 注意：开发环境下会导致 useEffect 执行两次
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // 如果你后续要在公网服务器用 API Route 传图，最好也加上基础配置
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default nextConfig;