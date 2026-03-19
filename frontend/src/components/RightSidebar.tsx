"use client";

import React from 'react';
import CalendarWidget from './CalendarWidget';

// 🚀 接收从父组件传来的共享日期数据
interface RightSidebarProps {
  dateInfo: {
    day: string;
    month: string;
  };
}

export default function RightSidebar({ dateInfo }: RightSidebarProps) {
  return (
    <aside id="sidebar-right" className="fixed right-0 top-0 h-screen w-72 2xl:w-96 sc-border border-l z-30 flex-col pt-28 pb-10 px-6 2xl:px-8 hidden xl:flex pointer-events-none animate-sidebar-right">
      
      {/* 1. 顶部日期 & 绿点状态 */}
      <div className="pointer-events-auto flex items-end justify-between sc-border border-b pb-4">
        <div>
          <div className="text-[clamp(2.5rem,3vw,3.5rem)] font-black tabular-nums tracking-tighter leading-none">{dateInfo.day}</div>
          <div className="text-[10px] 2xl:text-xs font-bold uppercase tracking-widest mt-1 opacity-50">{dateInfo.month}</div>
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[8px] 2xl:text-[10px] font-black uppercase tracking-widest opacity-50">SG</span>
        </div>
      </div>

      {/* 2. 核心日历组件 (Desktop 版) */}
      <div className="pointer-events-auto mt-8 relative z-20">
         <CalendarWidget variant="desktop" />
      </div>

      {/* 3. 底部社交矩阵图标 */}
      <div className="pointer-events-auto mt-auto pt-6 sc-border border-t flex items-center justify-between">
         <div className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest opacity-50">
           Connect
         </div>
         
         <div className="flex items-center gap-5">
           {/* Pinterest */}
           <a href="https://www.pinterest.com/" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-all hover:-translate-y-1" aria-label="Pinterest">
             <svg className="w-4 h-4 2xl:w-5 2xl:h-5" viewBox="0 0 24 24" fill="currentColor">
               <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.182 0 7.436 2.983 7.436 6.966 0 4.156-2.618 7.502-6.255 7.502-1.221 0-2.372-.635-2.766-1.386l-.75 2.862c-.272 1.042-1.011 2.345-1.507 3.141 1.191.368 2.454.568 3.753.568 6.621 0 11.988-5.368 11.988-11.988C24 5.367 18.638 0 12.017 0z"/>
             </svg>
           </a>
           
           {/* Awwwards */}
           <a href="https://www.awwwards.com/" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-all hover:-translate-y-1" aria-label="Awwwards">
             <span className="font-serif italic font-bold text-lg 2xl:text-xl leading-none tracking-tighter">W.</span>
           </a>
           
           {/* GitHub */}
           <a href="https://github.com/bolutotop/BolutoBlog" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-all hover:-translate-y-1" aria-label="GitHub">
             <svg className="w-4 h-4 2xl:w-5 2xl:h-5" viewBox="0 0 24 24" fill="currentColor">
               <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
             </svg>
           </a>
         </div>
      </div>
      
    </aside>
  );
}