"use client";

import React, { useEffect, useRef, useState } from 'react';

// 🚀 定义目录项的类型
interface TocItem {
  level: number;
  text: string;
  id: string;
}

// 🚀 接收从父组件传来的必要状态
interface TocSidebarProps {
  toc: TocItem[];
  activeId: string;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function TocSidebar({ toc, activeId, isMobileMenuOpen, setIsMobileMenuOpen }: TocSidebarProps) {
  // === 移动端悬浮球的内部状态 ===
  const [winSize, setWinSize] = useState({ w: 0, h: 0 });
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const dragInfo = useRef({ startX: 0, startY: 0, elX: 0, elY: 0, moved: false });
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // 1. 监听点击外部关闭弹窗
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

  // 2. 初始化和监听窗口大小
  useEffect(() => {
    setWinSize({ w: window.innerWidth, h: window.innerHeight });
    setPos({ x: window.innerWidth - 80, y: window.innerHeight - 120 }); // 初始在右下角
    const handleResize = () => setWinSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3. 拖拽事件处理
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

  return (
    <>
      {/* ========================================== */}
      {/* 🖥️ Desktop 版侧边栏 */}
      {/* ========================================== */}
      <aside className="toc-sidebar hidden lg:flex fixed right-0 top-0 h-screen w-72 2xl:w-96 sc-border border-l z-40 flex-col pt-28 pb-10 px-6 2xl:px-8 opacity-0 translate-x-full pointer-events-none bg-[var(--sc-bg)]">
        <div className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest mb-8 sc-border border-b pb-4 opacity-50">
          Table of Contents
        </div>
        <nav className="brutalist-toc-nav flex flex-col gap-5 overflow-y-auto hide-scrollbar">
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
                className={`block text-xs 2xl:text-sm font-bold uppercase transition-colors hover:text-[var(--sc-text)] ${
                  item.level === 3 ? 'ml-4' : ''
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
      {/* 📱 Mobile 版全屏可拖拽的悬浮目录 (FAB) */}
      {/* ========================================== */}
      {winSize.w > 0 && (
        <div 
          ref={mobileMenuRef}
          className="mobile-toc-fab fixed z-[100] lg:hidden opacity-0 invisible"
          style={{ left: pos.x, top: pos.y, touchAction: 'none' }}
        >
          {/* 悬浮菜单 Popover */}
          <div 
            className={`absolute w-64 bg-[var(--sc-bg)] sc-border border shadow-2xl p-5 flex flex-col gap-4 pointer-events-auto mobile-menu-popover transform ${
              isMobileMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none menu-closed'
            } ${
              pos.y > winSize.h / 2 
                ? (pos.x > winSize.w / 2 ? 'origin-bottom-right' : 'origin-bottom-left') 
                : (pos.x > winSize.w / 2 ? 'origin-top-right' : 'origin-top-left')
            } ${
              pos.x > winSize.w / 2 ? 'right-[120%]' : 'left-[120%]'
            } ${
              pos.y > winSize.h / 2 ? 'bottom-0' : 'top-0'
            }`}
          >
            <div className="text-[10px] font-black uppercase tracking-widest opacity-50 sc-border border-b pb-3">
              Table of Contents
            </div>
            <nav className="brutalist-toc-nav flex flex-col gap-4 overflow-y-auto max-h-[50vh] hide-scrollbar">
              {toc.length > 0 ? toc.map((item, i) => {
                const isActive = item.id === activeId;
                return (
                  <a 
                    key={i} href={`#${item.id}`} title={item.text}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMobileMenuOpen(false);
                      const targetElement = document.getElementById(item.id);
                      if (targetElement) {
                        const headerOffset = 140;
                        const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                        window.scrollTo({ top: elementPosition - headerOffset, behavior: 'smooth' });
                      }
                    }}
                    className={`block text-xs font-bold uppercase transition-colors ${
                      item.level === 3 ? 'ml-3' : ''
                    } ${isActive ? 'opacity-100' : 'opacity-40'}`}
                  >
                    <span className={`toc-text-wrapper truncate max-w-full block ${isActive ? 'active-toc' : ''}`}>{item.text}</span>
                  </a>
                );
              }) : (
                <span className="text-[10px] font-mono opacity-30 uppercase">No indices found.</span>
              )}
            </nav>
          </div>

          {/* 可拖拽的圆圈汉堡按钮 */}
          <button 
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className="w-14 h-14 bg-[var(--sc-inverse-bg)] text-[var(--sc-inverse-text)] rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform cursor-grab active:cursor-grabbing"
          >
            <div className="relative w-5 h-5 flex flex-col justify-center items-center pointer-events-none">
              <span className={`absolute h-[2px] w-full bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`}></span>
              <span className={`absolute h-[2px] w-full bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`absolute h-[2px] w-full bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`}></span>
            </div>
          </button>
        </div>
      )}
    </>
  );
}