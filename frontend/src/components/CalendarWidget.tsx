"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getCalendarPostsAction } from '@/app/actions';

interface CalendarWidgetProps {
  variant: 'mobile' | 'desktop';
}

export default function CalendarWidget({ variant }: CalendarWidgetProps) {
  const [activeModal, setActiveModal] = useState<any | null>(null);
  const [calendarData, setCalendarData] = useState<Record<number, any[]>>({});
  const [isClosing, setIsClosing] = useState(false);

  const currentD = new Date();
  const year = currentD.getFullYear();
  const month = currentD.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate(); 
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 

  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const allCalendarCells = [...blanks, ...days];
  const weekDays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

  const isMobile = variant === 'mobile';

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
              excerpt: post.content.substring(0, 150) + '...', 
            });
          }
        });
        setCalendarData(dataMap);
      }
    };
    fetchCalendarPosts();
  }, [year, month]);

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setActiveModal(null);
      setIsClosing(false);
    }, 400); 
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--x', `${x}px`);
    e.currentTarget.style.setProperty('--y', `${y}px`);
  };

  return (
    <div className={`relative ${isMobile ? 'max-w-[260px] mx-auto' : 'w-full'}`}>
      
      {/* 头部标题区 */}
      <div className={`flex justify-between items-center ${isMobile ? 'mb-4' : 'mb-6'}`}>
        <span className={`font-black uppercase tracking-widest opacity-50 ${isMobile ? 'text-[10px]' : 'text-[10px] 2xl:text-xs'}`}>
          Publication Log
        </span>
        <span className={`font-mono font-bold ${isMobile ? 'text-[10px]' : 'text-[10px] 2xl:text-xs'}`}>
          {year}.{String(month + 1).padStart(2, '0')}
        </span>
      </div>
      
      {/* 星期抬头 */}
      <div className={`grid grid-cols-7 gap-1 text-center font-mono font-bold uppercase opacity-40 ${isMobile ? 'text-[9px] mb-2' : 'text-[9px] 2xl:text-[10px] mb-4'}`}>
        {weekDays.map((d, i) => <div key={i}>{d}</div>)}
      </div>
      
      {/* 日历网格 */}
      <div className={`grid grid-cols-7 font-mono ${isMobile ? 'gap-y-2 gap-x-2 text-[10px]' : 'gap-y-2 gap-x-1 text-xs 2xl:text-sm'}`}>
        {allCalendarCells.map((day, idx) => {
          if (day === null) return <div key={`blank-${idx}`} className="aspect-square" />;
          const hasPost = calendarData[day];
          const isToday = day === currentD.getDate();

          return (
            <button 
              key={day}
              onClick={() => hasPost && setActiveModal(hasPost)}
              onMouseMove={hasPost ? handleMouseMove : undefined}
              disabled={!hasPost}
              className={`
                relative aspect-square flex items-center justify-center transition-transform duration-300
                ${hasPost ? `group overflow-hidden isolate bg-[var(--sc-inverse-bg)] shadow-md z-10 cursor-pointer ${isMobile ? 'active:scale-90' : 'hover:scale-110 hover:shadow-xl'}` : 'border-transparent opacity-40 cursor-default hover:opacity-100'}
                ${isToday && !hasPost ? 'sc-border border font-bold opacity-100' : ''}
              `}
            >
              {hasPost ? (
                <>
                  <span className="relative z-10 font-black text-[var(--sc-inverse-text)] transition-colors duration-300 group-hover:text-transparent">{day}</span>
                  <div 
                    className="absolute inset-0 bg-[var(--sc-bg)] pointer-events-none z-20 flex items-center justify-center group-hover:animate-[rippleSpread_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                    style={{ clipPath: 'circle(0% at var(--x, 50%) var(--y, 50%))' }}
                  >
                     <span className="font-black text-[var(--sc-text)]">{day}</span>
                  </div>
                </>
              ) : (
                <span>{day}</span>
              )}
              {isToday && !hasPost && <div className={`absolute bg-green-500 rounded-full ${isMobile ? 'w-1 h-1 bottom-0.5' : '-bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1'}`} />}
            </button>
          );
        })}
      </div>

      {/* 动态弹窗 */}
      {activeModal && (
        <>
          {/* 背景遮罩 */}
          <div 
            className={`fixed inset-0 z-40 transition-opacity duration-400 ${isMobile ? 'bg-[var(--sc-bg)]/90 flex items-center justify-center px-6' : 'bg-[var(--sc-bg)]/80'} backdrop-blur-md ${isClosing ? 'opacity-0' : 'opacity-100'}`} 
            onClick={handleCloseModal} 
          >
             {/* 仅在移动端时，我们需要遮罩也承担 flex 居中容器的作用，所以把实体面板作为它的子元素（或兄弟元素通过绝对定位）。为了统一，移动端直接把面板放这： */}
             {isMobile && (
               <div 
                  className={`relative w-full max-w-sm bg-[var(--sc-bg)] sc-border border p-6 shadow-2xl ${isClosing ? 'animate-panel-exit' : 'animate-panel-enter'}`}
                  onClick={(e) => e.stopPropagation()} // 防止点击面板内部触发关闭
                >
                 {/* 渲染 Modal 内容 */}
                 <ModalContent activeModal={activeModal} handleCloseModal={handleCloseModal} handleMouseMove={handleMouseMove} isMobile={true} />
               </div>
             )}
          </div>
          
          {/* PC端侧滑实体面板 */}
          {!isMobile && (
            <div className={`absolute top-0 right-[110%] w-80 2xl:w-96 bg-[var(--sc-bg)] sc-border border p-6 2xl:p-8 shadow-2xl z-50 pointer-events-auto flex flex-col h-auto max-h-[90vh] ${isClosing ? 'animate-panel-exit' : 'animate-panel-enter'}`}>
              <ModalContent activeModal={activeModal} handleCloseModal={handleCloseModal} handleMouseMove={handleMouseMove} isMobile={false} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// 提取 Modal 的内部内容，避免移动端和 PC 端写两遍
function ModalContent({ activeModal, handleCloseModal, handleMouseMove, isMobile }: any) {
  return (
    <>
      <div className="flex justify-between items-start mb-5 sc-border border-b pb-3 shrink-0">
         <div className={`font-mono font-bold opacity-50 uppercase tracking-widest ${isMobile ? 'text-[10px]' : 'text-[10px] 2xl:text-xs'}`}>{activeModal[0].date}</div>
         <button onClick={handleCloseModal} className={`font-black uppercase transition-opacity ${isMobile ? 'text-[10px] active:opacity-50 p-2 -mr-2 -mt-2' : 'text-[10px] 2xl:text-xs hover:opacity-50'}`}>
           [ Close ]
         </button>
      </div>
      
      <div className={`flex flex-col ${isMobile ? 'gap-8 max-h-[60vh]' : 'gap-10 pb-4'} overflow-y-auto hide-scrollbar`}>
        {activeModal.map((post: any, idx: number) => (
          <div key={idx} className="flex flex-col relative">
            {idx > 0 && <div className="absolute -top-5 left-0 w-full h-[1px] bg-[var(--sc-border)] opacity-30"></div>}
            
            <h2 className={`font-black uppercase tracking-tighter leading-tight mb-3 ${isMobile ? 'text-xl' : 'text-xl 2xl:text-2xl'}`}>{post.title}</h2>
            
            <div className={`font-bold leading-relaxed opacity-80 mb-6 [&>p]:mb-2 [&>h1]:text-sm [&>h2]:text-sm [&>h3]:text-sm ${isMobile ? 'text-xs [&_*]:!text-xs' : 'text-xs 2xl:text-sm [&_*]:!text-xs 2xl:[&_*]:!text-sm'}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.excerpt}</ReactMarkdown>
            </div>
            
            <Link 
              href={`/blog/${post.slug}`}
              onMouseMove={handleMouseMove}
              className={`group relative overflow-hidden flex items-center justify-between bg-[var(--sc-inverse-bg)] px-5 transition-transform isolate w-full ${isMobile ? 'py-4 active:scale-95' : 'py-3 hover:scale-105 active:scale-95 duration-500'}`}
            >
              <span className={`relative z-10 font-black uppercase tracking-widest text-[var(--sc-inverse-text)] transition-colors duration-300 group-hover:text-transparent ${isMobile ? 'text-[10px]' : 'text-[10px] 2xl:text-xs'}`}>Read Log</span>
              <span className={`relative z-10 font-black text-[var(--sc-inverse-text)] group-hover:translate-x-1 transition-transform ${isMobile ? 'text-[10px]' : 'text-[10px] 2xl:text-xs'}`}>→</span>

              <div 
                className="absolute inset-0 bg-[var(--sc-bg)] pointer-events-none z-20 flex items-center justify-between px-5 group-hover:animate-[rippleSpread_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                style={{ clipPath: 'circle(0% at var(--x, 50%) var(--y, 50%))' }}
              >
                <span className={`font-black uppercase tracking-widest text-[var(--sc-text)] ${isMobile ? 'text-[10px]' : 'text-[10px] 2xl:text-xs'}`}>Read Log</span>
                <span className={`font-black text-[var(--sc-text)] group-hover:translate-x-1 transition-transform ${isMobile ? 'text-[10px]' : 'text-[10px] 2xl:text-xs'}`}>→</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}