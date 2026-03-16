'use client';

import React, { useState, useEffect } from 'react';
import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import { uploadImage } from '@/app/actions'; 

// 引入杂志级字体
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/noto-serif-sc/400.css';
import '@fontsource/noto-serif-sc/700.css';

interface EditorProps {
  value: string;
  onChange: (v: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // 1. 实时监听 Light/Dark 模式切换
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // 2. 增加上传反馈 (Alert)
  const onUploadImg = async (files: File[], callback: (urls: string[]) => void) => {
    const res = await Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
          const url = await uploadImage(formData);
          return url;
        } catch (error) {
          console.error('Upload failed:', error);
          alert(`图片 ${file.name} 上传失败，请检查网络或图片格式。`);
          return null;
        }
      })
    );

    const validUrls = res.filter((url) => url !== null) as string[];
    
    if (validUrls.length > 0) {
      callback(validUrls);
    }
  };

  return (
    <div className="magazine-editor-wrapper">
      <MdEditor
        modelValue={value}
        onChange={onChange}
        theme={theme}
        language="en-US" // md-editor-rt 默认内置中文，若报错可改为 en-US
        toolbars={[
          'bold', 'underline', 'italic', 'strikeThrough', '-',
          'title', 'sub', 'sup', 'quote', 'unorderedList', 'orderedList', '-',
          'codeRow', 'code', 'link', 'image', 'table', 'mermaid', '-',
          'revoke', 'next', 'save', '=', 
          'pageFullscreen', 'fullscreen', 'preview', 'htmlPreview'
        ]}
        onUploadImg={onUploadImg}
        className="h-[650px] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-[#1a1a1a]"
        previewTheme="github" 
      />

      <style jsx global>{`
        .magazine-editor-wrapper .md-editor {
          font-family: 'Noto Serif SC', 'Playfair Display', serif !important;
          --md-bk-color: ${theme === 'light' ? '#ffffff' : '#000000'} !important;
          --md-color: ${theme === 'light' ? '#18181b' : '#f4f4f5'} !important;
        }
        
        .magazine-editor-wrapper .md-editor-preview h1,
        .magazine-editor-wrapper .md-editor-preview h2,
        .magazine-editor-wrapper .md-editor-preview h3 {
          font-family: 'Playfair Display', 'Noto Serif SC', serif !important;
          font-weight: 700;
        }

        .magazine-editor-wrapper .md-editor-content {
           background-color: ${theme === 'light' ? '#ffffff' : '#09090b'} !important;
        }
        
        .magazine-editor-wrapper .cm-scroller {
           font-family: 'Noto Serif SC', serif !important;
           font-size: 16px;
           line-height: 1.8;
        }
      `}</style>
    </div>
  );
}