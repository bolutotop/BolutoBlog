import Link from 'next/link';
import { DocumentTextIcon, PhotoIcon } from '@heroicons/react/24/outline';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="h-full px-4 py-6 overflow-y-auto">
          <h2 className="px-2 mb-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Admin Panel
          </h2>
          <ul className="space-y-2 font-medium text-sm">
            <li>
              <Link 
                href="/admin" 
                className="flex items-center gap-3 p-2 text-gray-900 rounded-md dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <DocumentTextIcon className="w-5 h-5" />
                文章管理
              </Link>
            </li>
            {/* 新增图库入口 */}
            <li>
              <Link 
                href="/admin/gallery" 
                className="flex items-center gap-3 p-2 text-gray-900 rounded-md dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <PhotoIcon className="w-5 h-5" />
                图库管理
              </Link>
            </li>
          </ul>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}