"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '@/config/site';

interface MobileMenuProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dateInfo: { day: string; month: string };
  categories: string[];
  showAllCats: boolean;
  setShowAllCats: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function MobileMenu({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  dateInfo,
  categories,
  showAllCats,
  setShowAllCats
}: MobileMenuProps) {
  return (
    // AnimatePresence 负责监听内部组件的卸载，并在完全卸载前执行 exit 动画
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* ========================================= */}
          {/* 1. 模糊黑纱背景 */}
          {/* ========================================= */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md xl:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* ========================================= */}
          {/* 2. 右侧滑出抽屉 */}
          {/* ========================================= */}
          <motion.div
            // 初始状态：在屏幕右侧外
            initial={{ x: '100%' }}
            // 动画状态：回到原位
            animate={{ x: 0 }}
            // 退出状态：滑回屏幕右侧外
            exit={{ x: '100%' }}
            // 使用 spring 弹簧动画，手感更现代、更顺滑
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed top-0 right-0 bottom-0 h-full w-[85vw] max-w-[380px] bg-[var(--sc-bg)] z-[70] xl:hidden flex flex-col pt-24 pb-12 px-6 overflow-y-auto sc-border border-l shadow-2xl"
          >

            {/* 右上角关闭按钮 */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-6 font-mono text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
            >
              [ CLOSE ]
            </button>

            {/* 菜单内容区域 */}
            <div className="flex flex-col gap-8 mt-4">

              {/* 个人信息 */}
              <div className="flex items-center gap-5 sc-border border-b pb-6">
                <div className="w-14 h-14 rounded-full overflow-hidden sc-border border-2 shrink-0">
                  <Image src={siteConfig.avatar} alt={siteConfig.name} width={56} height={56} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-black uppercase text-xl leading-none tracking-tight">{siteConfig.name}</h3>
                  <p className="text-[10px] font-bold mt-1 uppercase tracking-widest opacity-50">{siteConfig.tagline}</p>
                </div>
              </div>

              {/* 日期与状态 */}
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-4xl font-black tabular-nums tracking-tighter leading-none">{dateInfo.day}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-50">{dateInfo.month}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Status</div>
                  <div className="text-[10px] font-bold uppercase tracking-tight flex items-center justify-end gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    CN
                  </div>
                </div>
              </div>

              {/* 分类导航 */}
              <div className="mt-2 sc-border border-t pt-6">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-4">
                  目录 / 标签
                </div>
                <div className="flex flex-wrap gap-2 font-mono text-[10px] font-bold uppercase">
                  {categories.length > 0 ? (
                    <>
                      {(showAllCats ? categories : categories.slice(0, 6)).map((tag) => (
                        <Link
                          key={tag}
                          href={`/blog/category/${encodeURIComponent(tag)}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="sc-border border px-3 py-1.5 active:bg-[var(--sc-text)] active:text-[var(--sc-inverse-text)] transition-colors"
                        >
                          {tag}
                        </Link>
                      ))}

                      {categories.length > 6 && (
                        <button
                          onClick={() => setShowAllCats(!showAllCats)}
                          className="sc-border border border-dashed px-3 py-1.5 opacity-50 active:opacity-100 transition-opacity"
                        >
                          {showAllCats ? '[-]' : '[+]'}
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="opacity-30 animate-pulse">Loading...</span>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}