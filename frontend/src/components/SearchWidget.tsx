"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { searchPostsAction } from '@/app/actions';

interface SearchWidgetProps {
  inputRadius?: string;
  dropdownRadius?: string;
  animationSpeed?: string;
}

export default function SearchWidget({
  inputRadius = 'rounded-full',
  dropdownRadius = 'rounded-2xl',
  animationSpeed = 'duration-500'
}: SearchWidgetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 🚀 核心修复 1：直接初始化为空字符串！不要去读 searchParams，确保每次出来都是干干净净的
  const [term, setTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLFormElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 防抖实时下拉搜索逻辑
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (term.trim().length > 0) {
        setIsSearching(true);
        const res = await searchPostsAction(term);
        if (res.success) {
          setSearchResults(res.posts);
          setIsDropdownOpen(true);
        }
        setIsSearching(false);
      } else {
        setSearchResults([]);
        setIsDropdownOpen(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [term]);

  // 🚀 核心修复 2：利用 setTimeout 把耗时的网络请求往后推，让 UI 先瞬间收起！
  const executeSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    // 1. 第一时间强制收起面板、失去焦点、清空文字
    setIsDropdownOpen(false); 
    setIsFocused(false);
    setTerm(''); 
    
    // 2. 把跳转任务放进宏任务队列。这就骗过了 Next.js，让 UI 瞬间刷新，然后再跳转！
    setTimeout(() => {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }, 10);
  };

  // 回车提交
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(term);
  };

  // 展开状态判断
  const isExpanded = isFocused || term.length > 0;

  return (
    <form 
      ref={searchContainerRef}
      onSubmit={handleSearch} 
      className="relative group flex items-center justify-end"
    >
      {/* 放大镜图标 */}
      <svg 
        className={`
          absolute left-3 w-4 h-4 pointer-events-none z-10 
          transition-colors ${animationSpeed}
          text-[var(--sc-text)] 
          ${isExpanded ? 'opacity-50' : 'opacity-100'}
        `} 
        fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>

      {/* 输入框主体 */}
      <input
        type="text"
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setIsDropdownOpen(true);
        }}
        onFocus={() => {
          setIsFocused(true);
          if (term.trim().length > 0) setIsDropdownOpen(true);
        }}
        onBlur={() => setIsFocused(false)}
        placeholder={isExpanded ? "Search..." : ""}
        className={`
          outline-none border-none focus:ring-0 focus:outline-none h-9 
          ${inputRadius} 
          text-sm text-[var(--sc-text)] placeholder:text-[var(--sc-text)]/40
          transition-[width,background-color,padding] ${animationSpeed} ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isExpanded 
            ? 'w-36 md:w-48 pl-10 pr-4 bg-[var(--sc-text)]/10 cursor-text' 
            : 'w-9 pl-9 pr-0 bg-transparent cursor-pointer hover:bg-[var(--sc-text)]/10'
          }
        `}
      />
{/* 现代风格下拉菜单 */}
      {isDropdownOpen && term.trim().length > 0 && (
<div 
          className={`
            /* 📱 移动端：强制屏幕物理居中 (fixed + mx-auto)，完美避开动画冲突 */
            fixed top-[60px] left-0 right-0 mx-auto w-[90vw] max-w-[300px]
            
            /* 💻 PC端：绝对不碰！保持你的左边对齐 */
            md:absolute md:top-[120%] md:left-0 md:right-auto md:mx-0 md:w-[400px] 
            
            bg-[var(--sc-bg)] flex flex-col transform origin-top animate-panel-enter
            shadow-xl border border-[var(--sc-border)] overflow-hidden
            max-h-[60vh] overflow-y-auto hide-scrollbar
            ${dropdownRadius}
          `}
        >
          {/* 加载进度条 */}
          {isSearching && (
            <div className="h-[2px] w-full bg-[var(--sc-text)]/10 overflow-hidden relative">
              <div className="absolute left-0 top-0 h-full bg-[var(--sc-text)] opacity-60 w-1/3 animate-[slide_1s_infinite_ease-in-out]"></div>
            </div>
          )}
          
          <div className="flex flex-col p-2">
            {searchResults.length > 0 ? (
              <>
                {searchResults.slice(0, 5).map((post) => (
                  <Link 
                    key={post.id} 
                    href={`/blog/${post.slug}`}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setTerm(''); 
                    }}
                    className="
                      group flex flex-col p-3 mx-1 my-0.5 rounded-xl 
                      hover:bg-[var(--sc-text)]/5 
                      transition-colors duration-200
                    "
                  >
                    <div className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-40 mb-1 transition-opacity">
                      {post.category || 'LOG'} • {post.date}
                    </div>
                    <h4 className="text-sm font-bold tracking-tight leading-tight group-hover:translate-x-1 transition-transform duration-300 text-[var(--sc-text)]">
                      {post.title}
                    </h4>
                  </Link>
                ))}

                {searchResults.length >= 5 && (
                  // 🚀 核心修复 3：把底部的 Link 换成了 button，调用专门打破冻结的 executeSearch 函数
                  <button 
                    type="button"
                    onClick={() => executeSearch(term)}
                    className="mt-2 pt-3 border-t sc-border text-center text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity flex items-center justify-center gap-2 w-full pb-1"
                  >
                    View all results for "{term}" <span>→</span>
                  </button>
                )}
              </>
            ) : (
              !isSearching && (
                <div className="py-8 text-xs font-bold uppercase tracking-widest opacity-40 text-center">
                  No matching results
                </div>
              )
            )}
          </div>
        </div>
      )}
      
      <style jsx global>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </form>
  );
}