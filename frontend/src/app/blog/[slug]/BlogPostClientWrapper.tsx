"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import StudioLayout from '@/components/StudioLayout';

// 🚀 1. 引入 md-editor-rt 预览组件及样式
import { MdPreview } from 'md-editor-rt';
import 'md-editor-rt/lib/preview.css';

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
        start: 'top 50%',
        onEnter: () => {
          document.getElementById('showcase-root')?.classList.add('hide-right-sidebar');
          gsap.to('.toc-sidebar', { x: 0, opacity: 1, pointerEvents: 'auto', duration: 0.6, ease: 'expo.out' });
        },
        onLeaveBack: () => {
          document.getElementById('showcase-root')?.classList.remove('hide-right-sidebar');
          gsap.to('.toc-sidebar', { x: '100%', opacity: 0, pointerEvents: 'none', duration: 0.4, ease: 'expo.out' });
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
        
        {/* ========================================== */}
        {/* 🚀 融合编辑器的杂志排版与你的 Brutalist 布局风格 */}
        {/* ========================================== */}
        {/* ========================================== */}
        {/* 🚀 融合编辑器的杂志排版与你的 Brutalist 布局风格 */}
        {/* ========================================== */}
        <style jsx global>{`
          /* 专门用于只隐藏右侧边栏的类 */
          .hide-right-sidebar #sidebar-right {
            translate: 100% 0 !important;
            opacity: 0 !important;
          }

          .brutalist-hero-text { color: var(--sc-text) !important; }
          .brutalist-hero-meta { color: var(--sc-text) !important; opacity: 0.6; }

          /* ========================================== */
          /* 🚀 md-editor-rt 预览区域专属覆盖样式 (严格对齐你的 Editor) */
          /* ========================================== */
          .magazine-preview-wrapper .md-editor {
            /* 强制锁定为白底黑字，防止被外部暗黑模式污染 */
            --md-bk-color: #ffffff !important;
            --md-color: #18181b !important;
            background-color: #ffffff !important;
          }

          .magazine-preview-wrapper .md-editor-preview {
            font-family: 'Noto Serif SC', 'Playfair Display', serif !important;
            font-size: clamp(1.125rem, 1.5vw, 1.35rem);
            line-height: 1.8;
            padding: 0; /* 移除多余的内边距 */
          }
          
          .magazine-preview-wrapper .md-editor-preview p {
            font-weight: 500;
            opacity: 0.85;
            margin-bottom: 2.5rem;
          }

          .magazine-preview-wrapper .md-editor-preview h1,
          .magazine-preview-wrapper .md-editor-preview h2,
          .magazine-preview-wrapper .md-editor-preview h3 {
            font-family: 'Playfair Display', 'Noto Serif SC', serif !important;
            font-weight: 700;
            text-transform: uppercase;
          }

          .magazine-preview-wrapper .md-editor-preview h2 {
            scroll-margin-top: 120px; 
            font-size: clamp(2rem, 3vw, 3.5rem);
            letter-spacing: -0.03em;
            margin-top: 5rem;
            margin-bottom: 2rem;
            border-bottom: 3px solid var(--sc-border);
            padding-bottom: 1rem;
            line-height: 1.1;
          }

          .magazine-preview-wrapper .md-editor-preview h3 {
            scroll-margin-top: 120px; 
            font-size: clamp(1.5rem, 2vw, 2rem);
            margin-top: 3rem;
            margin-bottom: 1.5rem;
          }

          .magazine-preview-wrapper .md-editor-preview blockquote {
            border-left: 6px solid var(--sc-text);
            padding-left: 2rem;
            font-size: clamp(1.5rem, 2.5vw, 2.5rem);
            font-style: italic;
            font-weight: 800;
            line-height: 1.3;
            margin: 4rem 0;
            opacity: 0.9;
            background: transparent;
            color: var(--sc-text);
          }

          .magazine-preview-wrapper .md-editor-preview img {
            width: 100%;
            height: auto;
            border: 2px solid var(--sc-border);
            margin: 4rem 0;
            filter: grayscale(20%); 
          }
          
          /* 🚨 注：已经彻底删除了所有对 pre 和 code 的强制覆盖！ */
          /* 现在代码块会完美呈现 md-editor-rt 自带的 github 主题语法高亮 */
        `}</style>

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
                ← Archive
              </Link>
              <span className="w-1 h-1 rounded-full bg-[var(--sc-border)]"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest brutalist-hero-meta">
                {post.category}
              </span>
            </div>
            <div className="uppercase font-black text-[clamp(2.5rem,6vw,8rem)] leading-[0.9] tracking-tighter brutalist-hero-text mb-12 max-w-6xl">
              <SplitText text={post.title} />
            </div>
            <div className="meta-fade flex flex-wrap items-end justify-between gap-8 py-8 border-y sc-border opacity-0">
              <div className="flex gap-12">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest brutalist-hero-meta mb-2">Published</div>
                  <div className="font-mono text-sm font-bold uppercase brutalist-hero-text">{post.date}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest brutalist-hero-meta mb-2">Author</div>
                  <div className="font-mono text-sm font-bold uppercase brutalist-hero-text">Zhihui</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest brutalist-hero-meta mb-2">Log ID</div>
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
{/* ==================== 🚀 3. 动态 Markdown 目录侧边栏 (从右侧滑入) ==================== */}
        <aside className="toc-sidebar fixed right-0 top-0 h-screen w-72 2xl:w-96 sc-border border-l z-40 flex flex-col pt-28 pb-10 px-6 2xl:px-8 opacity-0 translate-x-full pointer-events-none bg-[var(--sc-bg)]">
           <div className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest mb-8 sc-border border-b pb-4 opacity-50">
             Table of Contents
           </div>
           
           <nav className="flex flex-col gap-5 overflow-y-auto">
             {toc.length > 0 ? toc.map((item, i) => (
               <a 
                 key={i} 
                 href={`#${item.id}`}
                 onClick={(e) => {
                   e.preventDefault();
                   
                   // 🚀 核心修复：精准计算目标元素的绝对坐标，并减去头部遮挡高度
                   const targetElement = document.getElementById(item.id);
                   if (targetElement) {
                     const headerOffset = 140; // 设置你需要的偏移量 (头部高度 + 留白)
                     const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                     const offsetPosition = elementPosition - headerOffset;
                     
                     window.scrollTo({
                       top: offsetPosition,
                       behavior: 'smooth'
                     });
                   }
                 }}
                 className={`text-xs 2xl:text-sm font-bold uppercase transition-colors hover:text-gray-400 ${
                   item.level === 3 ? 'ml-4 opacity-40 text-[10px]' : 'opacity-80'
                 }`}
               >
                 {item.text}
               </a>
             )) : (
               <span className="text-xs font-mono opacity-30 uppercase">No indices found.</span>
             )}
           </nav>
        </aside>

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
              Return to Archive
            </span>
            <div 
              className="absolute inset-0 bg-[var(--sc-bg)] pointer-events-none z-20 flex items-center justify-center px-16 group-hover:animate-[rippleSpread_1s_cubic-bezier(0.16,1,0.3,1)_forwards]"
              style={{ clipPath: 'circle(0% at var(--x, 50%) var(--y, 50%))' }}
            >
              <span className="font-black text-sm md:text-base uppercase tracking-[0.2em] text-[var(--sc-text)]">
                Return to Archive
              </span>
            </div>
          </Link>
        </section>

      </main>
    </StudioLayout>
  );
}