"use client";

import React from 'react';
import Link from 'next/link';

interface PaginationWidgetProps {
  /** 当前所在页码 */
  currentPage: number;
  /** 总页数 */
  totalPages: number;
  /** * 基础路径，用于构建跳转链接 
   * 例如: "/blog" 或 "/blog/category/Tech"
   */
  basePath: string;
}

export default function PaginationWidget({
  currentPage,
  totalPages,
  basePath,
}: PaginationWidgetProps) {
  
  if (totalPages <= 1) return null;

  // 生成带省略号的分页数组 (例如: [1, 2, 3, '...', 10])
  const getPaginationGroup = () => {
    let pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, '...', totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
      }
    }
    return pages;
  };

  const paginationGroup = getPaginationGroup();

  return (
    <div className="mt-32 pt-12 border-t sc-border flex flex-col md:flex-row items-center justify-between gap-8 content-block">
      
      {/* ================= [ PREV ] ================= */}
      {currentPage > 1 ? (
        <Link 
          href={`${basePath}?page=${currentPage - 1}`}
          className="group flex items-center gap-4 text-xs font-black uppercase tracking-widest hover:text-[var(--sc-text)] opacity-60 hover:opacity-100 transition-all"
        >
          <span className="w-10 h-10 rounded-full border border-current flex items-center justify-center group-hover:-translate-x-2 transition-transform">←</span>
          Prev Page
        </Link>
      ) : (
        <div className="opacity-20 flex items-center gap-4 text-xs font-black uppercase tracking-widest cursor-not-allowed">
          <span className="w-10 h-10 rounded-full border border-current flex items-center justify-center">←</span>
          Prev Page
        </div>
      )}

      {/* ================= [ NUMBERS ] ================= */}
      <div className="flex gap-2 font-mono text-sm font-bold flex-wrap justify-center">
        {paginationGroup.map((p, i) => {
          if (p === '...') {
            return (
              <span key={`dots-${i}`} className="w-10 h-10 flex items-center justify-center opacity-40 font-black tracking-widest">
                ...
              </span>
            );
          }
          
          const isCurrent = p === currentPage;
          return (
            <Link 
              key={`page-${p}`} 
              href={`${basePath}?page=${p}`}
              className={`w-10 h-10 flex items-center justify-center border sc-border transition-colors ${
                isCurrent 
                  ? 'bg-[var(--sc-text)] text-[var(--sc-bg)]' 
                  : 'hover:bg-[var(--sc-text)] hover:text-[var(--sc-bg)] opacity-60 hover:opacity-100'
              }`}
            >
              {p}
            </Link>
          )
        })}
      </div>

      {/* ================= [ NEXT ] ================= */}
      {currentPage < totalPages ? (
        <Link 
          href={`${basePath}?page=${currentPage + 1}`}
          className="group flex items-center gap-4 text-xs font-black uppercase tracking-widest hover:text-[var(--sc-text)] opacity-60 hover:opacity-100 transition-all"
        >
          Next Page
          <span className="w-10 h-10 rounded-full border border-current flex items-center justify-center group-hover:translate-x-2 transition-transform">→</span>
        </Link>
      ) : (
        <div className="opacity-20 flex items-center gap-4 text-xs font-black uppercase tracking-widest cursor-not-allowed">
          Next Page
          <span className="w-10 h-10 rounded-full border border-current flex items-center justify-center">→</span>
        </div>
      )}
      
    </div>
  );
}