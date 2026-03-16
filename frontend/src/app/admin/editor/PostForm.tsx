'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { savePostAction } from '../../actions'; 
import { ArrowLeftIcon, CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import Editor from '@/components/admin/Editor';

import Link from 'next/link';

interface PostFormProps {
  initialPost?: any;
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
    category: initialPost?.category || '', // 新增
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
        id: '',
        title: '',
        slug: '',
        category: '', // 新增
        coverImage: '',
        content: '',
        published: 'false',
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
        alert('保存失败: ' + result.message);
      }
    } catch (error) {
      alert('发生未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 mt-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            <ArrowLeftIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </Link>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
            {isEditMode ? '编辑文章' : '写新文章'}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
            {!isEditMode && lastSaved && (
              <span className="flex items-center gap-1 text-xs text-zinc-400 animate-pulse hidden md:flex">
                <CheckCircleIcon className="w-4 h-4" />
                已自动保存 {lastSaved.toLocaleTimeString()}
              </span>
            )}
            
            {!isEditMode && hasDraft && (
               <button 
                 type="button"
                 onClick={handleClearDraft} 
                 className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition" 
                 title="清空草稿"
               >
                 <TrashIcon className="w-5 h-5" />
               </button>
            )}

            <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold hover:scale-105 active:scale-95 transition disabled:opacity-50"
            >
                {isLoading ? '保存中...' : (isEditMode ? '更新文章' : '发布文章')}
            </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-zinc-500 mb-1">文章标题</label>
                    <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full text-lg font-bold px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Article Title"
                        required
                    />
                </div>
                 <div>
                    <label className="block text-sm font-bold text-zinc-500 mb-1">URL Slug</label>
                    <input
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none font-mono text-sm"
                        placeholder="为空时将根据标题自动生成"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-zinc-500 mb-1">分类 (Tags)</label>
                        <input
                            name="category"
                            type="text"
                            value={formData.category}
                            onChange={handleChange}
                            placeholder="e.g. Tech/React, Life"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-zinc-500 mb-1">发布状态</label>
                        <select
                            name="published"
                            value={formData.published}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="false">📝 存为草稿</option>
                            <option value="true">✅ 正式发布</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-zinc-500 mb-1">封面图 URL</label>
                    <input
                        name="coverImage"
                        value={formData.coverImage}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none text-sm"
                        placeholder="https://..."
                    />
                </div>
            </div>
        </div>

        <div>
            <div className="mb-2">
                <label className="block text-sm font-bold text-zinc-500">正文内容 (Markdown)</label>
            </div>
            
            {/* 替换为原生 textarea，强制使用等宽字体并提供足够的高度 */}
           <Editor 
                value={formData.content} 
                onChange={(v) => setFormData(prev => ({ ...prev, content: v }))} 
            />
        </div>
      </form>
    </div>
  );
}