'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { savePostAction } from '../../actions'; 
import { ArrowLeftIcon, CheckCircleIcon, TrashIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import Editor from '@/components/admin/Editor';
import Link from 'next/link';

interface PostData {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  coverImage: string | null;
  content: string;
  published: boolean;
}

interface PostFormProps {
  initialPost?: PostData | null;
}

const DRAFT_KEY = 'admin-post-draft-v2';

export default function PostForm({ initialPost }: PostFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

  const isEditMode = !!initialPost?.id;

  const [formData, setFormData] = useState({
    id: initialPost?.id || '',
    title: initialPost?.title || '',
    slug: initialPost?.slug || '',
    category: initialPost?.category || '', 
    coverImage: initialPost?.coverImage || '',
    content: initialPost?.content || '',
    published: initialPost?.published ? 'true' : 'false',
  });

  // --- 1. 自动恢复草稿 ---
  useEffect(() => {
    if (isEditMode) return;
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const data = JSON.parse(savedDraft);
        setFormData((prev) => ({ ...prev, ...data }));
        if (data._saveTime) {
            setLastSaved(new Date(data._saveTime));
        }
        setHasDraft(true);
      } catch (e) {
        console.error('草稿读取失败', e);
      }
    }
  }, [isEditMode]);

  // --- 2. 自动保存草稿 ---
  useEffect(() => {
    if (isEditMode) return;
    const timer = setTimeout(() => {
      if (formData.title || formData.content || formData.slug) {
        const draftData = {
          ...formData,
          _saveTime: new Date().toISOString()
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        setLastSaved(new Date());
        setHasDraft(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClearDraft = () => {
    if (confirm('确定要清空草稿吗？此操作无法撤销。')) {
      localStorage.removeItem(DRAFT_KEY);
      setFormData({
        id: '', title: '', slug: '', category: '', coverImage: '', content: '', published: 'false',
      });
      setHasDraft(false);
      setLastSaved(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
        return alert("标题和正文不能为空");
    }
    
    setIsLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== '_saveTime') {
          data.append(key, String(value));
      }
    });

    try {
      const result = await savePostAction(data);
      if (result.success) {
        if (!isEditMode) {
            localStorage.removeItem(DRAFT_KEY);
        }
        router.push('/admin');
        router.refresh(); 
      } else {
        alert('保存失败: ' + ('message' in result ? result.message : '未知错误'));
      }
    } catch (error) {
      alert('发生未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* 头部操作栏 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-200/50 text-gray-500 transition-colors">
            <ArrowLeftIcon className="w-5 h-5 stroke-2" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            {isEditMode ? '编辑文章' : '创作新内容'}
          </h1>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
            {!isEditMode && lastSaved && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mr-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                已存草稿 {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            )}
            
            {!isEditMode && hasDraft && (
               <button 
                 type="button"
                 onClick={handleClearDraft} 
                 className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors" 
                 title="清空草稿"
               >
                 <TrashIcon className="w-5 h-5" />
               </button>
            )}

            <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
            >
                {isLoading ? (
                   <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> 保存中...</span>
                ) : (
                   <><CloudArrowUpIcon className="w-5 h-5 stroke-2" /> {isEditMode ? '更新文章' : '发布文章'}</>
                )}
            </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 卡片 1：文章元数据配置 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-8 shadow-sm space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-5">
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">文章标题 / Title</label>
                        <input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full text-base font-semibold px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                            placeholder="输入文章标题..."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">路由别名 / Slug</label>
                        <input
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none font-mono text-sm focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                            placeholder="留空则自动生成 (例: my-first-post)"
                        />
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">分类标签 / Tags</label>
                            <input
                                name="category"
                                type="text"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="例: Tech/React, Life"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none text-sm focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                                required
                            />
                        </div>
                         <div>
                            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">发布状态 / Status</label>
                            <select
                                name="published"
                                value={formData.published}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all appearance-none cursor-pointer"
                            >
                                <option value="false">📝 存为草稿 (Draft)</option>
                                <option value="true">✅ 正式发布 (Published)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">封面图链接 / Cover URL</label>
                        <input
                            name="coverImage"
                            value={formData.coverImage}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none font-mono text-sm focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                            placeholder="https://images.unsplash.com/..."
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* 卡片 2：正文编辑器 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-2 md:p-5 shadow-sm min-h-[500px] flex flex-col">
            <div className="mb-4 px-3 pt-3 md:px-0 md:pt-0">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500">正文内容 / Markdown Content</label>
            </div>
            
            <div className="flex-1 border border-gray-100 rounded-xl overflow-hidden">
               {/* 你的 Editor 组件渲染在这里 */}
               <Editor 
                  value={formData.content} 
                  onChange={(v) => setFormData(prev => ({ ...prev, content: v }))} 
               />
            </div>
        </div>
      </form>
    </div>
  );
}