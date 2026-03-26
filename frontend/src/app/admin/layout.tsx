"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  DocumentTextIcon, 
  PencilSquareIcon, 
  PhotoIcon,
  Bars3Icon, // 你懂的：汉堡菜单图标
  XMarkIcon  // 用于手机端展开后关闭的叉叉图标
} from '@heroicons/react/24/outline';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // 控制手机端侧边栏展开/收起的状态
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 当路由发生跳转时，自动收起手机端侧边栏
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const menuItems = [
    { name: '文章列表', href: '/admin', icon: DocumentTextIcon },
    { name: '新建/编辑', href: '/admin/editor', icon: PencilSquareIcon },
    { name: '媒体图库', href: '/admin/gallery', icon: PhotoIcon },
    { name: '主页设置', href: '/admin/home-settings', icon: PencilSquareIcon },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#f8f9fa] text-gray-900 font-sans overflow-hidden">
      
      {/* 📱 手机端专属：顶部导航栏 */}
      <div className="md:hidden flex items-center justify-between bg-white px-6 py-4 border-b border-gray-100 z-20 shrink-0">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black tracking-tight">Censi.</span>
          <span className="text-xl font-bold text-gray-400">Admin</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -mr-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Bars3Icon className="w-6 h-6 stroke-2" />
        </button>
      </div>

      {/* 📱 手机端专属：侧边栏展开时的半透明遮罩背景 */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 侧边栏本体 (响应式：手机端为绝对定位的滑动抽屉，PC端为左侧固定布局) */}
      <aside className={`
        fixed md:relative top-0 left-0 z-40 h-full w-[240px] bg-white border-r border-gray-100 
        flex flex-col flex-shrink-0 shadow-[2px_0_12px_-4px_rgba(0,0,0,0.1)] md:shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)]
        transform transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Logo 区域 (手机端展示关闭按钮) */}
        <div className="h-16 md:h-20 flex items-center justify-between px-6 md:px-8 border-b border-gray-50 shrink-0">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black tracking-tight">BLOG.</span>
            <span className="text-xl font-bold text-gray-400">Admin</span>
          </div>
          <button 
            className="md:hidden p-1 text-gray-400 hover:bg-gray-50 rounded-md transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <XMarkIcon className="w-6 h-6 stroke-2" />
          </button>
        </div>

        {/* 导航菜单栏 */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin');
            return (
              <Link 
                key={item.name}
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-black text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* 底部用户卡片 */}
        <div className="p-4 shrink-0">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
              T
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 leading-tight">Towne</span>
              <span className="text-[10px] text-gray-400 font-medium">Super Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto relative z-0">
        <div className="p-4 sm:p-8 lg:p-12 max-w-[1200px] mx-auto pb-24 md:pb-12">
          {children}
        </div>
      </main>
      
    </div>
  );
}