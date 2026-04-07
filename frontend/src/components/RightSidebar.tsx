"use client";

import React, { useState, useEffect } from 'react';
import CalendarWidget from './CalendarWidget';

interface RightSidebarProps {
  dateInfo: {
    day: string;
    month: string;
  };
}

export default function RightSidebar({ dateInfo }: RightSidebarProps) {
  const [time, setTime] = useState('');
  const [ms, setMs] = useState('000');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-GB', { hour12: false }));
      setMs(now.getMilliseconds().toString().padStart(3, '0'));
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <aside id="sidebar-right" className="fixed right-0 top-0 h-screen w-72 2xl:w-96 sc-border border-l z-30 flex flex-col pt-8 xl:pt-14 2xl:pt-20 pb-6 px-6 2xl:px-8 hidden xl:flex pointer-events-auto animate-sidebar-right overflow-y-auto hide-scrollbar">
      
      {/* 🧬 侧边栏左边缘刻度线 (Architectural Ruler) */}
      <div className="absolute left-0 top-0 bottom-0 w-4 flex flex-col justify-around py-16 opacity-20 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className={`h-px bg-on-surface ${i % 5 === 0 ? 'w-3' : 'w-1.5'}`} />
            {i % 5 === 0 && <span className="text-[6px] font-mono tabular-nums">{i.toString().padStart(2, '0')}</span>}
          </div>
        ))}
      </div>

      {/* 1. 顶部日期 & 动态波形状态 (Headline Date) */}
      <div className="pointer-events-auto flex items-end justify-between sc-border border-b pb-4 relative">
        <div className="flex flex-col">
          <div className="text-[7px] 2xl:text-[8px] font-mono font-bold tracking-[0.3em] opacity-30 mb-1">SYSTEM_CHRONO.LOG</div>
          <div className="text-[clamp(3rem,4.5vw,4.5rem)] font-thin tabular-nums tracking-[-0.1em] leading-[0.7]">{dateInfo.day}</div>
          <div className="text-[9px] 2xl:text-xs font-bold uppercase tracking-[0.25em] mt-2 opacity-40">{dateInfo.month}</div>
        </div>
        
        <div className="flex flex-col items-end gap-2 mb-1">
          {/* 实时活动波形图 (Activity Waveform) */}
          <div className="flex items-end gap-[2px] h-3">
            {[0.4, 0.7, 0.5, 0.9, 0.6, 0.3, 0.8, 0.4].map((delay, i) => (
              <div 
                key={i} 
                className="w-0.5 bg-green-500/60 transition-all duration-300" 
                style={{ animation: 'waveform 0.8s ease-in-out infinite', animationDelay: `${delay}s`, height: `${delay * 100}%` }} 
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
             <span className="text-[7px] 2xl:text-[9px] font-black uppercase tracking-widest opacity-30 text-nowrap">STATUS: ACTIVE</span>
          </div>
        </div>
      </div>

      {/* 2. 实时终端时钟 (Terminal Clock) */}
      <div className="pointer-events-auto py-3 flex items-center justify-between font-mono opacity-80">
        <div className="text-[9px] 2xl:text-[10px] font-bold tracking-widest opacity-40 uppercase">REALTIME_OS</div>
        <div className="flex items-baseline gap-1">
          <span className="text-xs 2xl:text-base font-black tabular-nums">{time}</span>
          <span className="text-[8px] 2xl:text-[9px] opacity-30 tabular-nums">:{ms}</span>
        </div>
      </div>

      {/* 3. 核心日历组件 (Desktop 版) */}
      <div className="pointer-events-auto mt-2 relative z-20">
         <CalendarWidget variant="desktop" />
      </div>

      {/* 4. 底部社交矩阵 (Digital Stamp Matrix) */}
      <div className="pointer-events-auto mt-auto pt-4 sc-border border-t flex flex-col gap-4">
         <div className="flex justify-between items-center">
            <div className="text-[7px] 2xl:text-[9px] font-bold uppercase tracking-[0.25em] opacity-30">CONNECT_PROTOCOL</div>
            <div className="text-[7px] 2xl:text-[8px] font-mono opacity-20">REF: B-02</div>
         </div>
         
         <div className="flex items-center gap-2.5">
            {/* Pinterest */}
            <a href="https://www.pinterest.com/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 2xl:w-11 2xl:h-11 border border-on-surface/10 flex items-center justify-center transition-all duration-500 hover:border-on-surface/40 hover:bg-on-surface/[0.03] group" aria-label="Pinterest">
              <svg className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 opacity-40 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.182 0 7.436 2.983 7.436 6.966 0 4.156-2.618 7.502-6.255 7.502-1.221 0-2.372-.635-2.766-1.386l-.75 2.862c-.272 1.042-1.011 2.345-1.507 3.141 1.191.368 2.454.568 3.753.568 6.621 0 11.988-5.368 11.988-11.988C24 5.367 18.638 0 12.017 0z"/>
              </svg>
            </a>
            
            {/* Awwwards */}
            <a href="https://www.awwwards.com/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 2xl:w-11 2xl:h-11 border border-on-surface/10 flex items-center justify-center transition-all duration-500 hover:border-on-surface/40 hover:bg-on-surface/[0.03] group" aria-label="Awwwards">
              <span className="font-serif italic font-bold text-base 2xl:text-lg leading-none tracking-tighter opacity-40 group-hover:opacity-100 transition-opacity">W.</span>
            </a>
            
            {/* GitHub */}
            <a href="https://github.com/bolutotop/BolutoBlog" target="_blank" rel="noopener noreferrer" className="w-9 h-9 2xl:w-11 2xl:h-11 border border-on-surface/10 flex items-center justify-center transition-all duration-500 hover:border-on-surface/40 hover:bg-on-surface/[0.03] group" aria-label="GitHub">
              <svg className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 opacity-40 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
         </div>

         <div className="flex justify-between items-end opacity-20 text-[6px] 2xl:text-[7px] font-mono tracking-widest mt-1 uppercase">
            <span>Studio © 2026</span>
            <div className="flex flex-col items-end">
              <span>LAT: 31.23N</span>
              <span>LNG: 121.47E</span>
            </div>
         </div>
      </div>
      
    </aside>
  );
}