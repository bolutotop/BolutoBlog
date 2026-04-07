"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom'; 
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getCalendarPostsAction } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { useLenis } from '@studio-freight/react-lenis';
interface CalendarWidgetProps {
  variant: 'mobile' | 'desktop';
}

export default function CalendarWidget({ variant }: CalendarWidgetProps) {
  const lenis = useLenis();
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
      if (activeModal) {
        document.body.style.overflow = 'hidden';
        lenis?.stop();
      } else {
        document.body.style.overflow = '';
        lenis?.start();
      }
      return () => {
        document.body.style.overflow = '';
        lenis?.start();
      };
    }, [activeModal, lenis]);
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
      
      <div className={`flex justify-between items-end shrink-0 ${isMobile ? 'mb-6' : 'mb-8'}`}>
        <div className="flex flex-col gap-1">
          <span className={`font-mono font-bold uppercase tracking-[0.3em] opacity-30 text-[7px] 2xl:text-[8px]`}>REF_CAL.INDEX</span>
          <span className={`font-display italic font-bold tracking-tight ${isMobile ? 'text-2xl' : 'text-3xl 2xl:text-4xl'}`}>
            {currentDate.toLocaleString('en-US', { month: 'long' })}
          </span>
        </div>
        
        <div className="flex items-center gap-4 relative z-30 pb-1">
          <div className="flex items-center gap-1.5">
            <button onClick={handlePrevMonth} className="w-5 h-5 flex items-center justify-center opacity-30 hover:opacity-100 transition-all hover:bg-on-surface/5 rounded-full"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
            <span className="font-mono text-[9px] 2xl:text-[10px] opacity-40 font-bold tracking-widest">{year}</span>
            <button onClick={handleNextMonth} className="w-5 h-5 flex items-center justify-center opacity-30 hover:opacity-100 transition-all hover:bg-on-surface/5 rounded-full"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></button>
          </div>
        </div>
      </div>
      
      <div className={`grid grid-cols-7 gap-1 text-center font-mono font-bold uppercase opacity-20 shrink-0 ${isMobile ? 'text-[7px] tracking-[0.3em] mb-4' : 'text-[8px] 2xl:text-[9px] tracking-[0.4em] mb-6'}`}>
        {weekDays.map((d, i) => <div key={i}>{d}</div>)}
      </div>
      
      <div className="relative overflow-hidden w-full">
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.div key={year + '-' + month} custom={direction} variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }} className="grid grid-cols-7 w-full gap-y-1 gap-x-1">
            {allCalendarCells.map((day, idx) => {
              if (day === null) return <div key={`blank-${idx}`} className="aspect-square" />;
              
              const hasPost = calendarData[day];
              const realToday = new Date();
              const isToday = day === realToday.getDate() && month === realToday.getMonth() && year === realToday.getFullYear();
              
              return (
                <button
                  key={day}
                  onClick={() => hasPost && setActiveModal(hasPost)}
                  onMouseMove={hasPost ? handleMouseMove : undefined}
                  disabled={!hasPost}
                  className={`
                    relative aspect-square flex items-center justify-center transition-all duration-300 group
                    ${hasPost ? 'cursor-pointer hover:font-black' : 'cursor-default'}
                  `}
                >
                  {/* 今日高亮 - 艺术圈圈 */}
                  {isToday && (
                    <div className="absolute inset-0 flex items-center justify-center z-0">
                      <div className="w-6 h-6 2xl:w-8 2xl:h-8 border border-on-surface rounded-full opacity-100 animate-[pulse_2s_infinite]" />
                    </div>
                  )}

                  {/* 日期数字 */}
                  <span className={`
                    relative z-10 font-mono text-[9px] 2xl:text-[10px] tracking-tighter
                    ${hasPost ? 'opacity-100 font-bold' : 'opacity-25'}
                    ${isToday ? 'text-on-surface' : ''}
                  `}>
                    {day.toString().padStart(2, '0')}
                  </span>

                  {/* 有文章的标记 - 极细下划线 */}
                  {hasPost && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-[1px] bg-on-surface/40 group-hover:w-5 transition-all duration-300" />
                  )}

                  {/* Hover 时的微弱底色 */}
                  {hasPost && (
                    <div className="absolute inset-0 bg-on-surface/[0.03] scale-0 group-hover:scale-100 rounded-full transition-transform duration-500 -z-10" />
                  )}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

  {mounted && activeModal && createPortal(
        <div 
          // 🚀 3. 增加 data-lenis-prevent="true" 和 overscroll-contain
          data-lenis-prevent="true"
          className={`fixed inset-0 z-[99999] flex items-center justify-center transition-opacity duration-400 overscroll-contain ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className="absolute inset-0 bg-[var(--sc-bg)]/20 backdrop-blur-xl" onClick={handleCloseModal} />
          
          <div 
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