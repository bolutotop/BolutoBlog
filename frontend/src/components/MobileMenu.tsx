"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { siteConfig } from '@/config/site';

interface MobileMenuProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dateInfo: { day: string; month: string };
  categories: string[];
  showAllCats: boolean;
  setShowAllCats: React.Dispatch<React.SetStateAction<boolean>>;
  navItems: Array<{ name: string; href: string }>;
}

// 交错动画配置，强制声明为 Variants 类型以修复 TS 报错
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const staggerItem: Variants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function MobileMenu({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  dateInfo,
  categories,
  showAllCats,
  setShowAllCats,
  navItems
}: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* 1. 模糊黑纱背景 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md xl:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* 2. 右侧滑出抽屉 (已缩减 max-w 解决留白问题) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed top-0 right-0 bottom-0 h-full w-[85vw] max-w-[320px] bg-[var(--sc-bg)] z-[70] xl:hidden flex flex-col pt-24 pb-12 px-6 overflow-y-auto sc-border border-l shadow-2xl"
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

              {/* 核心导航栏目 */}
              <motion.nav
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                // 🟢 调整 1：将 gap-5 改为 gap-3，收缩整体列表的垂直间距
                className="flex flex-col gap-3 sc-border border-t pt-6"
              >
                <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">
                  系统索引 / Index
                </div>
                {navItems.map((item) => (
                  <motion.div key={item.href} variants={staggerItem}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      // 🟢 调整 2：将 py-2 改为 py-1，进一步压缩单行的占位高度
                      className="flex items-center justify-between py-1 active:opacity-50 transition-opacity"
                    >
                      {/* 🟢 调整 3：将 text-3xl 改为 text-2xl (字号从 30px 缩小至 24px) */}
                      <span className="text-2xl font-black uppercase tracking-widest">
                        {item.name}
                      </span>
                      <span className="font-mono text-xs opacity-30 tracking-widest">
                        [ {item.href === '/' ? 'INDEX' : item.href.substring(1).toUpperCase()} ]
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>

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