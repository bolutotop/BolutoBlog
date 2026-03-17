'use client';

import { useState, useEffect, useRef } from 'react';
import { uploadImage } from '@/app/actions'; // 引入已有的 Server Action
import { 
  TrashIcon, 
  ArrowPathIcon, 
  CloudArrowUpIcon, 
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface ImageFile {
  name: string;
  url: string;
  size: string;
  createdAt: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/images');
      const data = await res.json();
      if (data.success) {
        setImages(data.images);
      }
    } catch (error) {
      console.error('加载失败', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 核心替换：直接使用 Server Action 替代 fetch
      const url = await uploadImage(formData);
      if (url) {
        fetchImages(); 
      }
    } catch (err: any) {
      alert(`上传出错: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm('确定要物理删除这张图片吗？这也将导致引用该图片的文章图片失效。')) return;

    try {
      const res = await fetch(`/api/admin/images?name=${filename}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setImages(prev => prev.filter(img => img.name !== filename));
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('删除请求失败');
    }
  };

const handleCopy = async (url: string) => {
    const fullUrl = url; 

    try {
      // 1. 尝试使用现代剪贴板 API (仅限 localhost 或 HTTPS)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(fullUrl);
        setCopied(url);
        setTimeout(() => setCopied(null), 2000);
      } else {
        // 2. 降级方案：动态创建 textarea 实现复制 (兼容 HTTP 局域网 IP 访问)
        const textArea = document.createElement("textarea");
        textArea.value = fullUrl;
        
        // 将 textarea 移出视口避免闪烁
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        
        textArea.select();
        
        // 执行物理复制指令
        const successful = document.execCommand('copy');
        textArea.remove();
        
        if (successful) {
          setCopied(url);
          setTimeout(() => setCopied(null), 2000);
        } else {
          throw new Error("降级复制失败");
        }
      }
    } catch (err) {
      console.error('复制失败:', err);
      alert('当前浏览器环境不支持自动复制，请长按或手动选中复制该链接: ' + fullUrl);
    }
  };

  return (
    <div className="max-w-7xl mx-auto min-h-screen pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white  p-6 rounded-3xl shadow-sm border border-zinc-100 ">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 ">媒体库</h1>
          <p className="text-zinc-500 text-sm mt-1">管理全站资源文件 ({images.length})</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchImages} 
            className="p-2.5 rounded-full hover:bg-zinc-100  transition text-zinc-600"
            title="刷新列表"
          >
            <ArrowPathIcon className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-6 py-2.5 bg-black  text-white  rounded-full font-bold hover:scale-105 active:scale-95 transition"
          >
            {uploading ? (
               <span className="animate-pulse">上传中...</span>
            ) : (
               <>
                 <CloudArrowUpIcon className="w-5 h-5" />
                 上传新图片
               </>
            )}
          </button>
          
          {/* 将 input 移出 button 标签外，修复 HTML 嵌套语义错误 */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            className="hidden" 
            accept="image/*"
          />
        </div>
      </div>

      {loading && images.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">加载资源中...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {images.map((img) => (
            <div 
              key={img.name} 
              className="group relative aspect-square bg-zinc-100  rounded-2xl overflow-hidden border border-zinc-200  hover:shadow-lg transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={img.url} 
                alt={img.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                
                <div className="flex justify-between items-start">
                   <span className="text-[10px] bg-black/50 text-white px-2 py-1 rounded backdrop-blur-md">
                     {img.size}
                   </span>
                   <button 
                     onClick={() => handleDelete(img.name)}
                     className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-md transition"
                     title="物理删除"
                   >
                     <TrashIcon className="w-4 h-4" />
                   </button>
                </div>

                <button 
                  onClick={() => handleCopy(img.url)}
                  className="w-full py-2 bg-white/90  backdrop-blur-md rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-white text-zinc-900 transition"
                >
                  {copied === img.url ? (
                    <>
                      <CheckIcon className="w-4 h-4 text-green-500" />
                      已复制
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="w-4 h-4" />
                      复制链接
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}