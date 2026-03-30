'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // 初始化时从 URL 读取搜索词
  const [query, setQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      // 获取当前 URL 中实际的 q 参数
      const currentQ = searchParams.get('q') || '';
      
      // 🚀 核心修复：只有当输入框的值和 URL 里的值【不一致】时，才触发路由跳转！
      // 这直接打破了 searchParams 改变导致的无限循环更新
      if (query.trim() === currentQ) {
        return; 
      }

      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set('q', query.trim());
      } else {
        params.delete('q');
      }
      
      router.push(`${pathname}?${params.toString()}`);
    }, 300); // 300ms 防抖延迟

    return () => clearTimeout(timer);
  }, [query, pathname, router, searchParams]);

  return (
    <div className="relative w-full sm:w-64 shrink-0">
      <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 stroke-[2.5]" />
      <input
        type="text"
        placeholder="搜索标题、路径或分类..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all shadow-sm placeholder:text-gray-400 placeholder:font-medium"
      />
    </div>
  );
}