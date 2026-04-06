'use client';

import { useState, useEffect, useRef } from 'react';
import { uploadImage } from '@/app/actions'; 
import { 
  TrashIcon, 
  ArrowPathIcon, 
  CloudArrowUpIcon, 
  ClipboardDocumentIcon,
  CheckIcon,
  PhotoIcon
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
      const result = await uploadImage(formData);
      if (result && 'url' in result) {
        fetchImages(); 
      } else {
        alert('上传失败：服务器返回异常');
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
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(fullUrl);
        setCopied(url);
        setTimeout(() => setCopied(null), 2000);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = fullUrl;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
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
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 头部操作栏 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">媒体图库</h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">
            全站静态资源管理，共计 <span className="font-bold text-gray-900">{images.length}</span> 个文件
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchImages} 
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-all shadow-sm"
            title="刷新列表"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin text-blue-500' : ''}`} />
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
          >
            {uploading ? (
               <span className="flex items-center gap-2">
                 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                 上传中...
               </span>
            ) : (
               <>
                 <CloudArrowUpIcon className="w-5 h-5 stroke-2" />
                 上传新图片
               </>
            )}
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            className="hidden" 
            accept="image/*"
          />
        </div>
      </div>

      {/* 画廊展示区 */}
      {loading && images.length === 0 ? (
        // 加载中骨架屏
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : images.length === 0 ? (
        // 空状态
        <div className="py-24 bg-white border border-gray-200 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <PhotoIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 text-sm font-bold mb-1">媒体库为空</h3>
            <p className="text-xs text-gray-500 font-medium mb-4">点击右上角按钮上传你的第一张图片</p>
        </div>
      ) : (
        // 图片网格
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {images.map((img) => (
            <div 
              key={img.name} 
              className="group relative aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={img.url} 
                alt={img.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />

              {/* 悬浮操作层 */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-gray-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                
                {/* 顶部：大小标签与删除按钮 */}
                <div className="flex justify-between items-start">
                   <span className="text-[10px] font-mono font-bold bg-white/20 text-white px-2 py-1 rounded-lg backdrop-blur-md shadow-sm">
                     {img.size}
                   </span>
                   <button 
                     onClick={() => handleDelete(img.name)}
                     className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm transition-transform active:scale-90"
                     title="物理删除"
                   >
                     <TrashIcon className="w-4 h-4 stroke-2" />
                   </button>
                </div>

                {/* 底部：复制按钮 */}
                <button 
                  onClick={() => handleCopy(img.url)}
                  className="w-full py-2 bg-white/95 backdrop-blur-md rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-white text-gray-900 transition-transform active:scale-95 shadow-sm"
                >
                  {copied === img.url ? (
                    <>
                      <CheckIcon className="w-4 h-4 text-emerald-500 stroke-2" />
                      已复制
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="w-4 h-4 text-gray-500" />
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