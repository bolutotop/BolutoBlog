"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  DocumentTextIcon, 
  PencilSquareIcon, 
  PhotoIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const menuItems = [
    { name: '文章管理', href: '/admin', icon: DocumentTextIcon },
    { name: '新建文章', href: '/admin/editor', icon: PencilSquareIcon },
    { name: '媒体图库', href: '/admin/gallery', icon: PhotoIcon },
    { name: '主页设置', href: '/admin/home-settings', icon: HomeIcon },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#Fafafa] text-gray-900 font-sans overflow-hidden">
      
      {/* 📱 手机端专属：固定在顶部的导航栏 */}
      <header className="md:hidden flex items-center justify-between bg-white/80 backdrop-blur-md px-5 py-4 border-b border-gray-200 sticky top-0 z-30 shrink-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-black tracking-tight">ZHIHUI.</span>
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Admin</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-1.5 -mr-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Bars3Icon className="w-6 h-6 stroke-2" />
        </button>
      </header>

      {/* 📱 手机端专属：侧边栏展开时的遮罩 */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 侧边栏本体 */}
      <aside className={`
        fixed md:relative top-0 left-0 z-50 h-full w-[260px] bg-white border-r border-gray-200 
        flex flex-col shrink-0 shadow-2xl md:shadow-none
        transform transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Logo 区域 */}
        <div className="h-16 md:h-20 flex items-center justify-between px-6 border-b border-gray-100 shrink-0">
          <div className="flex items-baseline gap-1.5 hidden md:flex">
            <span className="text-xl font-black tracking-tight">ZHIHUI.</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin</span>
          </div>
          <span className="md:hidden text-sm font-bold text-gray-400 uppercase tracking-widest">MENU</span>
          <button 
            className="md:hidden p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <XMarkIcon className="w-6 h-6 stroke-2" />
          </button>
        </div>

        {/* 导航菜单栏 */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin');
            return (
              <Link 
                key={item.name}
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-gray-900 text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* 底部用户卡片 */}
        <div className="p-4 shrink-0 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-sm font-bold text-white shadow-sm">
              Z
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 leading-tight">Zhihui</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mt-0.5">Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto relative z-0 custom-scrollbar">
        <div className="p-5 md:p-8 lg:p-12 max-w-[1400px] mx-auto pb-24 md:pb-12">
          {children}
        </div>
      </main>
      
    </div>
  );
}