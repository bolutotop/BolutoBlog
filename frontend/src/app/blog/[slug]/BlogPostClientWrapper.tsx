"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import StudioLayout from '@/components/StudioLayout';
import './blog-post.css';
// 🚀 1. 引入 md-editor-rt 预览组件及样式
import { MdPreview } from 'md-editor-rt';
import 'md-editor-rt/lib/preview.css';
import TocSidebar from '@/components/post/TocSidebar';
// 🚀 2. 引入你配置的精美字体
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/noto-serif-sc/400.css';
import '@fontsource/noto-serif-sc/700.css';

// 🚀 修复：使用支持 Unicode 的正则，保留中文、英文、数字，过滤掉特殊标点符号
const generateSlug = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}\-_]/gu, '');

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// 标题文字切割组件
const SplitText = ({ text, className = "" }: { text: string, className?: string }) => (
  <div className={`flex flex-wrap overflow-hidden pb-2 -mb-2 ${className}`}>
    {text.split(' ').map((word, wordIndex) => (
      <div key={wordIndex} className="flex overflow-hidden mr-[0.25em]">
        {word.split('').map((char, charIndex) => (
          <span 
            key={charIndex} 
            className="hero-char inline-block translate-y-[150%] rotate-12 opacity-0" 
            style={{ whiteSpace: 'pre' }}
          >
            {char}
          </span>
        ))}
      </div>
    ))}
  </div>
);

interface BlogPostProps {
  post: {
    id: string;
    title: string;
    category: string;
    date: string;
    content: string;
    coverImage: string;
  };
}

export default function BlogPostClientWrapper({ post }: BlogPostProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isReadyToAnimate, setIsReadyToAnimate] = useState(false);
  const [toc, setToc] = useState<{ level: number, text: string, id: string }[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  const setRef = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      containerRef.current = node;
      setIsReadyToAnimate(true);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--x', `${x}px`);
    e.currentTarget.style.setProperty('--y', `${y}px`);
  };
// 🚀 1. 新增：移动端拖拽悬浮按钮的状态与逻辑
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [winSize, setWinSize] = useState({ w: 0, h: 0 });
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const dragInfo = useRef({ startX: 0, startY: 0, elX: 0, elY: 0, moved: false });

  // 👉 1. 新增：弹窗的 DOM 引用，用于判断点击区域
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // 👉 2. 新增：监听点击外部自动收起
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      // 如果菜单开着，且点击的位置不在弹窗组件内部，就关闭它
      if (isMobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen]);
  useEffect(() => {
    setWinSize({ w: window.innerWidth, h: window.innerHeight });
    setPos({ x: window.innerWidth - 80, y: window.innerHeight - 120 }); // 初始在右下角
    const handleResize = () => setWinSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragInfo.current = { startX: e.clientX, startY: e.clientY, elX: pos.x, elY: pos.y, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const dx = e.clientX - dragInfo.current.startX;
    const dy = e.clientY - dragInfo.current.startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragInfo.current.moved = true;
    
    let newX = Math.max(16, Math.min(dragInfo.current.elX + dx, winSize.w - 72));
    let newY = Math.max(16, Math.min(dragInfo.current.elY + dy, winSize.h - 72));
    setPos({ x: newX, y: newY });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (!dragInfo.current.moved) setIsMobileMenuOpen(prev => !prev);
  };

useEffect(() => {
    const handleScroll = () => {
      const headings = toc.map(item => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
      let currentActiveId = '';
      
      // 遍历所有标题，找到最后一个已经越过页面顶部 160px 警戒线的标题
      for (const heading of headings) {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 160) {
          currentActiveId = heading.id;
        } else {
          break; 
        }
      }
      
      // 设置高亮 ID（如果滑到最顶端，默认高亮第一个）
      if (currentActiveId) {
        setActiveId(currentActiveId);
      } else if (headings.length > 0) {
        setActiveId(headings[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    setTimeout(handleScroll, 100); // 页面加载后立即测算一次

    return () => window.removeEventListener('scroll', handleScroll);
  }, [toc]);

  useEffect(() => {
    // 依然提取正文中的二级 (##) 和三级 (###) 标题生成目录
    const headings = [];
    const regex = /^(##|###)\s+(.+)$/gm;
    let match;
    while ((match = regex.exec(post.content)) !== null) {
      const text = match[2].replace(/[*_~`]/g, ''); 
      headings.push({ level: match[1].length, text, id: generateSlug(text) });
    }
    setToc(headings);
  }, [post.content]);

  useEffect(() => {
    if (!isReadyToAnimate || !containerRef.current) return;

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      
      // 1. 标题和元数据入场动画
      gsap.to('.hero-char', { y: 0, rotation: 0, opacity: 1, stagger: 0.02, duration: 1.2, ease: 'expo.out', delay: 0.2 });
      gsap.fromTo('.meta-fade', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'expo.out', delay: 0.8 });

      // 2. 模糊背景视差
      gsap.to('.cover-img-blur', { 
        yPercent: 15, 
        ease: 'none', 
        scrollTrigger: { trigger: '.hero-atmos-container', start: 'top top', end: 'bottom top', scrub: true } 
      });

      // 3. 当正文到达屏幕中间时，仅隐藏右侧日历，TOC 从右侧滑入！
      ScrollTrigger.create({
        trigger: '.article-body',
        start: 'top 150px',
        onEnter: () => {
          document.getElementById('showcase-root')?.classList.add('hide-right-sidebar');
          gsap.to('.toc-sidebar', { x: 0, opacity: 1, pointerEvents: 'auto', duration: 0.6, ease: 'expo.out' });
          gsap.to('.mobile-toc-fab', { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(1.5)' });
        },
        onLeaveBack: () => {
          document.getElementById('showcase-root')?.classList.remove('hide-right-sidebar');
          gsap.to('.toc-sidebar', { x: '100%', opacity: 0, pointerEvents: 'none', duration: 0.4, ease: 'expo.out' });
          gsap.to('.mobile-toc-fab', { scale: 0, autoAlpha: 0, duration: 0.3 });
          setIsMobileMenuOpen(false);
        },
      });

      // 4. 正文内容上浮进入
      gsap.fromTo('.article-content',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.article-content', start: 'top 85%' } }
      );

      // 5. 阅读进度条
      gsap.to('.reading-progress', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.article-body',
          start: 'top 50%',
          end: 'bottom 80%',
          scrub: true
        }
      });

    }, containerRef);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    return () => { 
      clearTimeout(timer);
      ctx.revert(); 
    };
  }, [isReadyToAnimate]);

  return (
    <StudioLayout>
      <main ref={setRef} className="overflow-x-hidden pb-32 min-h-screen bg-[var(--sc-bg)]">
        
        {/* 顶部阅读进度条 */}
        <div className="fixed top-0 left-0 w-full h-[3px] bg-[var(--sc-border)] z-[60]">
          <div className="reading-progress h-full bg-[var(--sc-text)] origin-left scale-x-0" />
        </div>

        {/* ==================== 1. 氛围感 Hero 区域 ==================== */}
        <section className="hero-atmos-container relative w-full pt-48 pb-20 md:pt-56 overflow-hidden border-b sc-border">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img 
              src={post.coverImage} 
              alt={post.title} 
              className="cover-img-blur absolute -top-[30%] left-0 w-full h-[160%] object-cover object-center scale-110 filter blur-[40px] opacity-60" 
            />
          </div>
          <div className="absolute inset-0 z-10 backdrop-blur-[20px] bg-[var(--sc-bg)]/60"></div>
          <div className="relative z-20 px-6 lg:px-12 max-w-[1600px] mx-auto w-full">
            <div className="meta-fade flex items-center gap-4 mb-8 opacity-0">
              <Link href="/blog" className="text-[10px] font-black uppercase tracking-widest hover:line-through transition-all brutalist-hero-text">
                ← 返回
              </Link>
              <span className="w-1 h-1 rounded-full bg-[var(--sc-border)]"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest brutalist-hero-meta">
                {post.category}
              </span>
            </div>
            <div className="uppercase font-black text-[clamp(2.5rem,6vw,8rem)] leading-none brutalist-hero-text mb-12 max-w-6xl">
              <SplitText text={post.title} />
            </div>
            <div className="meta-fade flex flex-wrap items-end justify-between gap-8 py-8 border-y sc-border opacity-0">
              <div className="flex gap-12">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest brutalist-hero-meta mb-2">发布时间</div>
                  <div className="font-mono text-sm font-bold uppercase brutalist-hero-text">{post.date}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest brutalist-hero-meta mb-2">作者</div>
                  <div className="font-mono text-sm font-bold uppercase brutalist-hero-text">Zhihui</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest brutalist-hero-meta mb-2">日志 ID</div>
                  <div className="font-mono text-sm font-bold uppercase brutalist-hero-text">#{post.id.slice(-6)}</div>
                </div>
              </div>
              <button className="text-[10px] font-black uppercase tracking-widest hover:opacity-50 transition-opacity brutalist-hero-text">
                [ Share Log ]
              </button>
            </div>
          </div>
        </section>

        {/* ==================== 3. 正文区域 ==================== */}
        <section className="article-body relative py-24 px-6 lg:px-12 max-w-[1600px] mx-auto w-full flex justify-center">
          
          <div className="article-content magazine-preview-wrapper w-full max-w-4xl opacity-0">
            {/* 🚀 替换为 md-editor-rt 的预览组件 */}
            <MdPreview 
              editorId="blog-preview"
              modelValue={post.content} 
              theme="light" 
              previewTheme="github"
              // 核心：强制编辑器用我们自定义的 ID 规则生成锚点，完美对接 TOC 点击跳转
              mdHeadingId={(params: any) => generateSlug(params.text || '')}
            />
          </div>

        </section>
        {/* ==================== 🚀 3. 动态 Markdown 目录侧边栏 (组件化) ==================== */}
        <TocSidebar 
          toc={toc} 
          activeId={activeId} 
          isMobileMenuOpen={isMobileMenuOpen} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
        />
        {/* ==================== 4. 底部返回操作区 ==================== */}
        <section className="py-20 px-6 lg:px-12 border-t sc-border flex justify-center">
          <Link 
            href="/blog" 
            scroll={false} 
            onClick={() => window.scrollTo(0, 0)}
            onMouseMove={handleMouseMove}
            className="group relative overflow-hidden bg-[var(--sc-inverse-bg)] border border-[var(--sc-inverse-bg)] px-16 py-8 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 duration-500 isolate w-fit"
          >
            <span className="relative z-10 font-black text-sm md:text-base uppercase tracking-[0.2em] text-[var(--sc-inverse-text)] transition-colors duration-300 group-hover:text-transparent">
              返回
            </span>
            <div 
              className="absolute inset-0 bg-[var(--sc-bg)] pointer-events-none z-20 flex items-center justify-center px-16 group-hover:animate-[rippleSpread_1s_cubic-bezier(0.16,1,0.3,1)_forwards]"
              style={{ clipPath: 'circle(0% at var(--x, 50%) var(--y, 50%))' }}
            >
              <span className="font-black text-sm md:text-base uppercase tracking-[0.2em] text-[var(--sc-text)]">
                返回
              </span>
            </div>
          </Link>
        </section>

      </main>
    </StudioLayout>
  );
}