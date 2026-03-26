"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom'; 
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getCalendarPostsAction } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarWidgetProps {
  variant: 'mobile' | 'desktop';
}

export default function CalendarWidget({ variant }: CalendarWidgetProps) {
  const [activeModal, setActiveModal] = useState<any | null>(null);
  const [calendarData, setCalendarData] = useState<Record<number, any[]>>({});
  const [isClosing, setIsClosing] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [mounted, setMounted] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate(); 
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 

  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const allCalendarCells = [...blanks, ...days];
  const weekDays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

  const isMobile = variant === 'mobile';

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🚀 已删除：锁定 body 滚动的 useEffect，恢复外部网页自由滚动

  useEffect(() => {
    const fetchCalendarPosts = async () => {
      const res = await getCalendarPostsAction();
      if (res.success && res.posts) {
        const dataMap: Record<number, any[]> = {}; 
        res.posts.forEach((post: any) => {
          const postDate = new Date(post.createdAt);
          if (postDate.getFullYear() === year && postDate.getMonth() === month) {
            const day = postDate.getDate();
            if (!dataMap[day]) dataMap[day] = [];
            dataMap[day].push({
              title: post.title,
              slug: post.slug,
              date: postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              excerpt: post.content.substring(0, 60) + '...', 
            });
          }
        });
        setCalendarData(dataMap);
      }
    };
    fetchCalendarPosts();
  }, [year, month]);

  const handlePrevMonth = () => { setDirection('left'); setCurrentDate(new Date(year, month - 1, 1)); };
  const handleNextMonth = () => { setDirection('right'); setCurrentDate(new Date(year, month + 1, 1)); };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setActiveModal(null);
      setIsClosing(false);
    }, 400); 
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--x', `${x}px`);
    e.currentTarget.style.setProperty('--y', `${y}px`);
  };

  const variants = {
    initial: (dir: 'left' | 'right') => ({ x: dir === 'right' ? '100%' : '-100%', opacity: 0 }),
    animate: { x: 0, opacity: 1 },
    exit: (dir: 'left' | 'right') => ({ x: dir === 'right' ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <div className={`relative ${isMobile ? 'max-w-[260px] mx-auto' : 'w-full'}`}>
      
      <div className={`flex justify-between items-center shrink-0 ${isMobile ? 'mb-4' : 'mb-6'}`}>
        <span className={`font-black uppercase tracking-widest opacity-50 ${isMobile ? 'text-[10px]' : 'text-[10px] 2xl:text-xs'}`}>Publication Log</span>
        <div className="flex items-center gap-3 relative z-30">
          <button onClick={handlePrevMonth} className="w-5 h-5 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity sc-border border hover:bg-[var(--sc-text)]/10"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
          <span className={`font-mono font-bold w-[4.5rem] text-center ${isMobile ? 'text-[10px]' : 'text-[10px] 2xl:text-xs'}`}>{year}.{String(month + 1).padStart(2, '0')}</span>
          <button onClick={handleNextMonth} className="w-5 h-5 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity sc-border border hover:bg-[var(--sc-text)]/10"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></button>
        </div>
      </div>
      
      <div className={`grid grid-cols-7 gap-1 text-center font-mono font-bold uppercase opacity-40 shrink-0 ${isMobile ? 'text-[9px] mb-2' : 'text-[9px] 2xl:text-[10px] mb-4'}`}>{weekDays.map((d, i) => <div key={i}>{d}</div>)}</div>
      
      <div className="relative overflow-hidden w-full">
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.div key={year + '-' + month} custom={direction} variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }} className={`grid grid-cols-7 font-mono w-full ${isMobile ? 'gap-y-2 gap-x-2 text-[10px]' : 'gap-y-2 gap-x-1 text-xs 2xl:text-sm'}`}>
            {allCalendarCells.map((day, idx) => {
              if (day === null) return <div key={`blank-${idx}`} className="aspect-square" />;
              const hasPost = calendarData[day];
              const realToday = new Date();
              const isToday = day === realToday.getDate() && month === realToday.getMonth() && year === realToday.getFullYear();
              return (
                <button key={day} onClick={() => hasPost && setActiveModal(hasPost)} onMouseMove={hasPost ? handleMouseMove : undefined} disabled={!hasPost} className={`relative aspect-square flex items-center justify-center transition-transform duration-300 ${hasPost ? `group overflow-hidden isolate bg-[var(--sc-inverse-bg)] shadow-md z-10 cursor-pointer ${isMobile ? 'active:scale-90' : 'hover:scale-110 hover:shadow-xl'}` : 'border-transparent opacity-40 cursor-default hover:opacity-100'} ${isToday && !hasPost ? 'sc-border border font-bold opacity-100' : ''}`}>
                  {hasPost ? (<><span className="relative z-10 font-black text-[var(--sc-inverse-text)] transition-colors duration-300 group-hover:text-transparent">{day}</span><div className="absolute inset-0 bg-[var(--sc-bg)] pointer-events-none z-20 flex items-center justify-center group-hover:animate-[rippleSpread_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]" style={{ clipPath: 'circle(0% at var(--x, 50%) var(--y, 50%))' }}><span className="font-black text-[var(--sc-text)]">{day}</span></div></>) : (<span>{day}</span>)}
                  {isToday && !hasPost && <div className={`absolute bg-green-500 rounded-full ${isMobile ? 'w-1 h-1 bottom-0.5' : '-bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1'}`} />}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {mounted && activeModal && createPortal(
        <div className={`fixed inset-0 z-[99999] flex items-center justify-center transition-opacity duration-400 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
          <div className="absolute inset-0 bg-[var(--sc-bg)]/20 backdrop-blur-xl" onClick={handleCloseModal} />
          
          <div 
            // 🚀 核心修复：放大了整个弹窗的横向极限尺寸 (max-w-md -> max-w-lg -> max-w-xl)
            className={`
              relative z-10 bg-[var(--sc-bg)] sc-border border shadow-2xl overflow-hidden 
              w-[92vw] max-w-md md:max-w-lg 2xl:max-w-xl max-h-[85vh] 
              flex flex-col p-6 2xl:p-8 
              ${isClosing ? 'animate-panel-exit' : 'animate-panel-enter'}
            `} 
            onClick={(e) => e.stopPropagation()}
          >
           <ModalContent activeModal={activeModal} handleCloseModal={handleCloseModal} handleMouseMove={handleMouseMove} />
          </div>
        </div>,
        document.getElementById('showcase-root') || document.body 
      )}
    </div>
  );
}

// =========================================================
// ModalContent
// =========================================================
function ModalContent({ activeModal, handleCloseModal, handleMouseMove }: any) {
  const [showAll, setShowAll] = useState(false);
  
  // 🚀 核心修改：上限改为 2 篇
  const hasMore = activeModal.length > 2;
  const displayedPosts = showAll ? activeModal : activeModal.slice(0, 2);

  return (
    <>
      <div className="flex justify-between items-start mb-5 sc-border border-b pb-3 shrink-0">
         <div className="font-mono font-bold opacity-50 uppercase tracking-widest text-[10px] 2xl:text-xs">{activeModal[0].date}</div>
         <button onClick={handleCloseModal} className="font-black uppercase transition-opacity text-[10px] 2xl:text-xs hover:opacity-50">[ Close ]</button>
      </div>
      
      {/* 🚀 核心修改：增加 px-3 -mx-3 创建横向隐形缓冲区，并加上 overflow-x-hidden 强制消灭横向滚动条 */}
      <div className="flex flex-col gap-8 pb-4 overflow-y-auto overflow-x-hidden hide-scrollbar px-3 -mx-3">
        {displayedPosts.map((post: any, idx: number) => (
          <div key={idx} className="flex flex-col relative">
            {idx > 0 && <div className="absolute -top-4 left-0 w-full h-[1px] bg-[var(--sc-border)] opacity-30"></div>}
            <h2 className="font-black uppercase tracking-tighter leading-tight mb-3 text-xl 2xl:text-2xl">{post.title}</h2>
            <div className="font-bold leading-relaxed opacity-80 mb-5 text-xs 2xl:text-sm [&_*]:!text-xs 2xl:[&_*]:!text-sm [&>p]:mb-2 [&>h1]:text-sm [&>h2]:text-sm [&>h3]:text-sm"><ReactMarkdown remarkPlugins={[remarkGfm]}>{post.excerpt}</ReactMarkdown></div>
            
            <Link 
              href={`/blog/${post.slug}`} 
              onMouseMove={handleMouseMove} 
              // w-full 保持不变，它会在 px-3 -mx-3 提供的安全区内舒适地放大
              className="group relative overflow-hidden flex items-center justify-between bg-[var(--sc-inverse-bg)] px-5 transition-transform isolate w-full py-4 hover:scale-105 active:scale-95 duration-500"
            >
              <span className="relative z-10 font-black uppercase tracking-widest text-[var(--sc-inverse-text)] transition-colors duration-300 group-hover:text-transparent text-[10px] 2xl:text-xs">Read Log</span>
              <span className="relative z-10 font-black text-[var(--sc-inverse-text)] group-hover:translate-x-1 transition-transform text-[10px] 2xl:text-xs">→</span>
              <div className="absolute inset-0 bg-[var(--sc-bg)] pointer-events-none z-20 flex items-center justify-between px-5 group-hover:animate-[rippleSpread_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]" style={{ clipPath: 'circle(0% at var(--x, 50%) var(--y, 50%))' }}><span className="font-black uppercase tracking-widest text-[var(--sc-text)] text-[10px] 2xl:text-xs">Read Log</span><span className="font-black text-[var(--sc-text)] group-hover:translate-x-1 transition-transform text-[10px] 2xl:text-xs">→</span></div>
            </Link>
          </div>
        ))}

        {hasMore && !showAll && (
          <button 
            onClick={() => setShowAll(true)}
            // 修改了这里的数字提示逻辑，扣除显示的 2 篇
            className="w-full py-3 mt-2 sc-border border border-dashed font-black uppercase tracking-widest text-[10px] 2xl:text-xs opacity-60 hover:opacity-100 transition-opacity bg-[var(--sc-text)]/5 hover:bg-[var(--sc-text)]/10"
          >
            + Show {activeModal.length - 2} More Logs
          </button>
        )}

        {hasMore && showAll && (
          <button 
            onClick={() => setShowAll(false)}
            className="w-full py-3 mt-2 sc-border border border-dashed font-black uppercase tracking-widest text-[10px] 2xl:text-xs opacity-60 hover:opacity-100 transition-opacity bg-[var(--sc-text)]/5 hover:bg-[var(--sc-text)]/10"
          >
            - Collapse
          </button>
        )}
      </div>
    </>
  );
}