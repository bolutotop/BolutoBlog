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

import CodePlayground from '@/components/post/CodePlayground'; // 🚀 引入游乐场组件

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

const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);
  const [playgroundCode, setPlaygroundCode] = useState('');

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

const [playgroundLang, setPlaygroundLang] = useState('cpp');
// 🚀 核心修改：精准劫持代码块，将 PLAY 按钮插入到语言标识左侧
  useEffect(() => {
    const SUPPORTED_LANGUAGES = ['cpp', 'c', 'c++', 'js', 'javascript', 'ts', 'typescript', 'py', 'python'];

    const timer = setTimeout(() => {
      const codeBlocks = document.querySelectorAll('.md-editor-preview pre');
      
      codeBlocks.forEach((pre) => {
        if (pre.getAttribute('data-has-play-btn')) return;
        
        const codeNode = pre.querySelector('code');
        if (!codeNode) return;

        // 🛡️ 语言白名单拦截
        const langClass = Array.from(codeNode.classList).find(c => c.startsWith('language-'));
        const lang = langClass ? langClass.replace('language-', '').toLowerCase() : '';
        if (!SUPPORTED_LANGUAGES.includes(lang)) return;

        pre.setAttribute('data-has-play-btn', 'true');

        // 🚀 创建美化版按钮
        const btn = document.createElement('div'); // 改用 div 作为外壳，更容易控制布局
        btn.className = 'flex items-center gap-1.5 px-2 py-0.5 mr-2 hover:bg-black/5 rounded transition-colors text-xs font-bold uppercase text-[var(--sc-text)]/60 hover:text-[var(--sc-text)] cursor-pointer select-none';
btn.innerHTML = `
          <svg class="w-3.5 h-3.5 stroke-[2.5] mt-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653z" />
          </svg>
          <span class="tracking-wide">[ PLAY ]</span>
        `;

// ✅ 修复后：明确指定 e 的类型为标准 DOM Event
const blockEvent = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
};

        // 阻断可能触发折叠的底层事件
        btn.addEventListener('mousedown', blockEvent);
        btn.addEventListener('mouseup', blockEvent);
        btn.addEventListener('touchstart', blockEvent, { passive: false });
        btn.addEventListener('touchend', blockEvent, { passive: false });

        // 使用捕获阶段 (capture: true) 优先处理点击，确保在 md-editor-rt 之前触发
        btn.addEventListener('click', (e) => {
          blockEvent(e);
          setPlaygroundLang(lang);
          setPlaygroundCode(codeNode.innerText);
          setIsPlaygroundOpen(true);
        }, { capture: true });

        // 🚀 核心查找逻辑：定位语言文本节点
        // md-editor-rt 的 Mac 风格代码块，通常在 pre 的上一级(或同级)有一个头部栏
        // 头部栏里面有 "语言名称" 和 "复制代码"
        const wrapper = pre.parentElement;
        if (!wrapper) return;

        // 策略 A：查找官方用于显示语言的 span 标签
        const langSpan = wrapper.querySelector('.md-editor-code-language');
        
        if (langSpan) {
          // 如果找到了语言标签，直接插到它前面
          langSpan.parentElement?.insertBefore(btn, langSpan);
        } else {
          // 策略 B：由于你的图片中显示的是纯文本 "python 复制代码"，
          // 我们需要寻找包含这个文本的容器，通常是最右侧的 flex 容器
          
          // 获取头部区域 (通常是 pre 的上一个兄弟元素，或者是包装器里的第一个 div)
          let headerArea = wrapper.firstElementChild;
          if (headerArea === pre && pre.previousElementSibling) {
              headerArea = pre.previousElementSibling;
          }

          if (headerArea) {
            // 强行改变头部右侧动作区的布局，让它水平居中对齐
            const rightActionArea = headerArea.lastElementChild as HTMLElement;
            if (rightActionArea) {
               rightActionArea.style.display = 'flex';
               rightActionArea.style.alignItems = 'center';
               // 插入到右侧区域的最前面
               rightActionArea.insertBefore(btn, rightActionArea.firstChild);
            }
          }
        }
      });
    }, 800); // 稍微增加一点延迟，确保 md-editor-rt 的工具栏渲染完毕

    return () => clearTimeout(timer);
  }, [post.content, isReadyToAnimate]);

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
        {/* ==================== 4. 底部整合页脚 (版权矩阵 + 操作区) ==================== */}
        <section className="max-w-[1600px] mx-auto w-full px-6 lg:px-12 mt-1 mb-12 relative z-10 bg-[var(--sc-bg)]">
          <div className="w-full h-px bg-[var(--sc-border)] mb-8 opacity-50"></div>
          {/* 第一部分：感谢阅读 & 返回列表 */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div className="flex flex-col gap-1">

            </div>
            <Link 
              href="/blog" 
              scroll={false} 
              className="text-xs font-bold uppercase tracking-widest hover:opacity-50 transition-opacity flex items-center gap-2 w-fit"
            >
              ← 返回日志列表
            </Link>
          </div>

          {/* 第二部分：版权与元数据矩阵 (带 CC 水印) */}
          <div className="w-full border border-[var(--sc-border)] p-6 md:p-10 relative overflow-hidden group mb-8">
            
            {/* 右侧巨大的 CC 背景水印 */}
            <div className="absolute -right-4 -bottom-8 text-[12rem] md:text-[16rem] font-black text-[var(--sc-text)] opacity-[0.03] select-none pointer-events-none leading-none">
              CC
            </div>

            {/* 文章标题与路径 */}
            <div className="mb-8 md:mb-12 relative z-10">
<div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">
              ---ZHIHUIBLOG---
              </div>
              <h3 className="text-lg md:text-xl font-black tracking-tight mb-2">
                {post.title}
              </h3>
              <div className="text-xs font-mono opacity-50 break-all select-all selection:bg-[var(--sc-text)] selection:text-[var(--sc-bg)]">
                https://yourdomain.com/blog/{post.slug || 'post-id'}
              </div>
            </div>

            {/* 四列元数据 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-xs relative z-10">
              <div className="flex flex-col gap-2">
                <span className="font-bold uppercase tracking-widest opacity-40">作者</span>
                <span className="font-mono font-bold text-sm">Zhihui</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-bold uppercase tracking-widest opacity-40">发布于</span>
                <span className="font-mono font-bold text-sm">{post.date}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-bold uppercase tracking-widest opacity-40">更新于</span>
                <span className="font-mono font-bold text-sm">{post.date}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-bold uppercase tracking-widest opacity-40">许可协议</span>
                <a 
                  href="https://creativecommons.org/licenses/by/4.0/deed.zh-hans" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-mono font-bold text-sm hover:underline hover:opacity-70 transition-opacity flex items-center gap-1.5 w-fit"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-9.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v3c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5v-3z"/>
                  </svg>
                  CC BY 4.0
                </a>
              </div>
            </div>
          </div>

          {/* 第三部分：底部操作与版权信息 */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="text-[10px] font-mono opacity-40 uppercase tracking-widest order-2 md:order-1">
              © {new Date().getFullYear()} Zhihui. All rights reserved.
            </div>
            
            <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest order-1 md:order-2">
              {/* 无弹窗安全分享按钮 (兼容局域网 HTTP) */}
              <button 
                onClick={(e) => {
                  const url = window.location.href;
                  if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(url);
                  } else {
                    const textArea = document.createElement("textarea");
                    textArea.value = url;
                    textArea.style.position = "absolute";
                    textArea.style.left = "-999999px";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    try { document.execCommand('copy'); } catch (err) {}
                    document.body.removeChild(textArea);
                  }
                  
                  const target = e.currentTarget;
                  const originalText = target.innerText;
                  target.innerText = "已复制 ✓";
                  setTimeout(() => { target.innerText = originalText; }, 2000);
                }}
                className="hover:opacity-50 transition-opacity w-[4.5rem] text-left"
              >
                分享文章
              </button>
              
              <span className="w-1 h-1 rounded-full bg-[var(--sc-border)]"></span>
              
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:opacity-50 transition-opacity"
              >
                回到顶部 ↑
              </button>
            </div>
          </div>

        </section>
      </main>

<CodePlayground 
        isOpen={isPlaygroundOpen} 
        onClose={() => setIsPlaygroundOpen(false)} 
        initialCode={playgroundCode} 
        language={playgroundLang} // 🚀 动态传递语言
      />
    </StudioLayout>
  );
}