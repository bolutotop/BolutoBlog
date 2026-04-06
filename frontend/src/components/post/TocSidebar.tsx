"use client";

import React, { useEffect, useRef, useState } from 'react';
// 🚀 核心修复 1：引入 useDragControls 来精确控制拖拽区域
import { motion, AnimatePresence, useDragControls } from 'framer-motion';

interface TocItem {
  level: number;
  text: string;
  id: string;
}

interface TocSidebarProps {
  toc: TocItem[];
  activeId: string;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function TocSidebar({ toc, activeId, isMobileMenuOpen, setIsMobileMenuOpen }: TocSidebarProps) {
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  // 🚀 核心修复 2：新增状态，控制悬浮球是否显示（默认隐藏）
  const [isVisible, setIsVisible] = useState(false);

  // 实例化拖拽控制器
  const dragControls = useDragControls();

  const EXPANDED_WIDTH = 280;

  // 监听外部点击关闭弹窗
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
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
  }, [isMobileMenuOpen, setIsMobileMenuOpen]);

  // 🚀 核心修复 3：监听滚动高度，超过 300px（滑过首屏）才显示悬浮球
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsMobileMenuOpen(false); // 滚回顶部时自动收起菜单
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 初始化检测一次

    return () => window.removeEventListener('scroll', handleScroll);
  }, [setIsMobileMenuOpen]);

  return (
    <>
      {/* ========================================== */}
      {/* 🖥️ Desktop 版侧边栏 (原封不动) */}
      {/* ========================================== */}
      <aside className="toc-sidebar hidden xl:flex fixed right-0 top-0 h-screen w-72 2xl:w-96 sc-border border-l z-40 flex-col pt-28 pb-10 px-6 2xl:px-8 opacity-0 translate-x-full pointer-events-none bg-[var(--sc-bg)]">

        {/* 💡 修复 1：加上 shrink-0，防止在屏幕太矮时标题被挤变形 */}
        <div className="shrink-0 text-[10px] 2xl:text-xs font-black uppercase tracking-widest mb-8 sc-border border-b pb-4 opacity-50">
          Table of Contents
        </div>

        {/* 🚀 核心修复 2：加上 flex-1 min-h-0。强制它动态占据浏览器所有剩余的纵向空间！ */}
        {/* 💡 顺便加上 pb-8 让底部留点呼吸空间，防止真出现滚动条时文字贴死底边 */}
        <nav className="brutalist-toc-nav flex-1 min-h-0 flex flex-col gap-5 overflow-y-auto hide-scrollbar pb-8">
          {toc.length > 0 ? toc.map((item, i) => {
            const isActive = item.id === activeId;
            return (
              <a
                key={i}
                href={`#${item.id}`}
                title={item.text}
                onClick={(e) => {
                  e.preventDefault();
                  const targetElement = document.getElementById(item.id);
                  if (targetElement) {
                    const headerOffset = 140;
                    const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                    window.scrollTo({ top: elementPosition - headerOffset, behavior: 'smooth' });
                  }
                }}
                className={`block text-xs 2xl:text-sm font-bold uppercase transition-colors hover:text-[var(--sc-text)] ${item.level === 3 ? 'ml-4' : ''
                  } ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-80'}`}
              >
                <span className={`toc-text-wrapper truncate max-w-full block ${isActive ? 'active-toc' : ''}`}>
                  {item.text}
                </span>
              </a>
            );
          }) : (
            <span className="text-xs font-mono opacity-30 uppercase">No indices found.</span>
          )}
        </nav>
      </aside>

      {/* ========================================== */}
      {/* 📱 Mobile 版：Framer Motion 丝滑形变悬浮球 */}
      {/* ========================================== */}
      <motion.nav
        ref={mobileMenuRef}
        drag
        // 🚀 核心修复 4：绑定拖拽控制器，并且关闭整个容器的默认拖拽监听！
        dragControls={dragControls}
        dragListener={false}

        dragMomentum={false}
        whileDrag={{ scale: 1.1 }}

        // 初始状态修改为缩小且透明
        initial={{ opacity: 0, scale: 0.8, width: 56, height: 56, borderRadius: 28 }}

        // 动画状态：结合 isVisible 控制整体显示隐藏
        animate={{
          opacity: isVisible ? (isMobileMenuOpen || isDragging ? 1 : 0.8) : 0,
          scale: isVisible ? 1 : 0.8,
          width: isMobileMenuOpen ? EXPANDED_WIDTH : 56,
          height: isMobileMenuOpen ? 'auto' : 56,
          borderRadius: isMobileMenuOpen ? 16 : 28,
        }}

        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}

        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setTimeout(() => setIsDragging(false), 100)}

        // 根据 isVisible 开启或关闭底层点击事件
        style={{ pointerEvents: isVisible ? 'auto' : 'none' }}

        className={`
          lg:hidden fixed bottom-12 right-6 z-[100]
          bg-[var(--sc-bg)]/90 backdrop-blur-md sc-border border shadow-2xl overflow-hidden
          flex flex-col text-[var(--sc-text)]
          will-change-[width,height]
        `}
      >

        {/* ========================================================= */}
        {/* 🚀 顶部拖拽把手与点击区域 (仅这部分可以拖动和触发开关) */}
        {/* ========================================================= */}
        <div
          // 把 cursor-grab 移到这里，明确告诉用户只有这里可以拖
          className={`flex items-center justify-center flex-shrink-0 cursor-grab active:cursor-grabbing ${isMobileMenuOpen ? 'w-full h-12 border-b sc-border' : 'w-14 h-14'}`}

          // 这两行是魔法：接管指针按下事件并传递给 dragControls，禁止触摸默认事件
          onPointerDown={(e) => dragControls.start(e)}
          style={{ touchAction: "none" }}

          // 点击控制展开/收起
          onClick={() => {
            if (!isDragging) setIsMobileMenuOpen(!isMobileMenuOpen);
          }}
        >
          {isMobileMenuOpen ? (
            <div className="flex items-center justify-between w-full px-5 pointer-events-none">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-50">TOC</span>
              <div className="relative w-4 h-4 opacity-50">
                <span className="absolute top-1/2 left-0 w-full h-[2px] bg-current rotate-45 -translate-y-1/2"></span>
                <span className="absolute top-1/2 left-0 w-full h-[2px] bg-current -rotate-45 -translate-y-1/2"></span>
              </div>
            </div>
          ) : (
            <div className="relative w-5 h-4 flex flex-col justify-between pointer-events-none">
              <span className="w-full h-[2px] bg-current"></span>
              <span className="w-full h-[2px] bg-current"></span>
              <span className="w-full h-[2px] bg-current"></span>
            </div>
          )}
        </div>

        {/* 列表内容区域 (带有淡入淡出效果) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-y-auto hide-scrollbar max-h-[50vh]"
              style={{ minWidth: EXPANDED_WIDTH }}
            >
              <nav className="brutalist-toc-nav flex flex-col gap-4 p-5">
                {toc.length > 0 ? toc.map((item, i) => {
                  const isActive = item.id === activeId;
                  return (
                    <a
                      key={i} href={`#${item.id}`} title={item.text}
                      // 保持拦截点击，防止穿透
                      onPointerDownCapture={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsMobileMenuOpen(false);
                        setTimeout(() => {
                          const targetElement = document.getElementById(item.id);
                          if (targetElement) {
                            const headerOffset = 140;
                            const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                            window.scrollTo({ top: elementPosition - headerOffset, behavior: 'smooth' });
                          }
                        }, 50);
                      }}
                      className={`block text-xs font-bold uppercase transition-colors ${item.level === 3 ? 'ml-3' : ''
                        } ${isActive ? 'opacity-100 text-[var(--sc-text)]' : 'opacity-40 hover:opacity-80'}`}
                    >
                      <span className={`toc-text-wrapper truncate max-w-full block ${isActive ? 'active-toc' : ''}`}>{item.text}</span>
                    </a>
                  );
                }) : (
                  <span className="text-[10px] font-mono opacity-30 uppercase">No indices found.</span>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.nav>
    </>
  );
}