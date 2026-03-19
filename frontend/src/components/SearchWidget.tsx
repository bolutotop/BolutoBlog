"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { searchPostsAction } from '@/app/actions';

interface SearchWidgetProps {
  /** 输入框的圆角 (默认: rounded-full 胶囊状) */
  inputRadius?: string;
  /** 下拉面板的圆角 (默认: rounded-2xl 大圆角) */
  dropdownRadius?: string;
  /** 动画持续时间 (默认: duration-500) */
  animationSpeed?: string;
}

export default function SearchWidget({
  inputRadius = 'rounded-full',
  dropdownRadius = 'rounded-2xl',
  animationSpeed = 'duration-500'
}: SearchWidgetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [term, setTerm] = useState(searchParams.get('q') || '');
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

  // 回车提交跳转逻辑
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim()) {
      router.push(`/search?q=${encodeURIComponent(term.trim())}`);
      setIsDropdownOpen(false); 
      setIsFocused(false);
    }
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

      {/* 🚀 输入框主体 */}
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
          /* 核心基础样式：移除边框/轮廓/聚焦环，设定高度和颜色 */
          outline-none border-none focus:ring-0 focus:outline-none h-9 
          ${inputRadius} 
          text-sm text-[var(--sc-text)] placeholder:text-[var(--sc-text)]/40
          
          /* 🚀 核心修复：明确指定过渡属性，确保 width 变化极其丝滑 */
          transition-[width,background-color,padding] ${animationSpeed} ease-[cubic-bezier(0.4,0,0.2,1)]
          
          /* 🚀 严格互斥的状态控制：宽度、背景和内边距 */
          ${isExpanded 
            ? 'w-36 md:w-48 pl-10 pr-4 bg-[var(--sc-text)]/10 cursor-text' 
            : 'w-9 pl-9 pr-0 bg-transparent cursor-pointer hover:bg-[var(--sc-text)]/10'
          }
        `}
      />

      {/* 🚀 现代风格下拉菜单 */}
      {isDropdownOpen && term.trim().length > 0 && (
        <div 
          className={`
            absolute top-[120%] right-0 md:left-0 w-[85vw] md:w-[400px] 
            bg-[var(--sc-bg)] flex flex-col transform origin-top animate-panel-enter
            shadow-xl border border-[var(--sc-border)] overflow-hidden
            max-h-[60vh] overflow-y-auto hide-scrollbar
            ${dropdownRadius}
          `}
        >
          {/* 顶部的加载进度条 */}
          {isSearching && (
            <div className="h-[2px] w-full bg-[var(--sc-text)]/10 overflow-hidden relative">
              <div className="absolute left-0 top-0 h-full bg-[var(--sc-text)] opacity-60 w-1/3 animate-[slide_1s_infinite_ease-in-out]"></div>
            </div>
          )}
          
          <div className="flex flex-col p-2">
            {searchResults.length > 0 ? (
              searchResults.map((post) => (
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
              ))
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