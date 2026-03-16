"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  DocumentTextIcon, 
  PencilSquareIcon, 
  PhotoIcon
} from '@heroicons/react/24/outline';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 只保留三个核心菜单
  const menuItems = [
    { name: '文章列表', href: '/admin', icon: DocumentTextIcon },
    { name: '新建/编辑', href: '/admin/editor', icon: PencilSquareIcon },
    { name: '媒体图库', href: '/admin/gallery', icon: PhotoIcon },
  ];

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-gray-900 font-sans">
      <aside className="w-[240px] bg-white border-r border-gray-100 flex flex-col flex-shrink-0 relative z-10 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)]">
        <div className="h-20 flex items-center px-8 border-b border-gray-50">
          <span className="text-xl font-black tracking-tight">Censi.</span>
          <span className="text-xl font-bold text-gray-400">Admin</span>
        </div>

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

        <div className="p-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 leading-tight">Admin User</span>
              <span className="text-[10px] text-gray-400 font-medium">Super Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 lg:p-12 max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}