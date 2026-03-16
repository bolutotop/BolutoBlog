'use client';

import React from 'react';
import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import { uploadImage } from '@/app/actions'; 

import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/noto-serif-sc/400.css';
import '@fontsource/noto-serif-sc/700.css';

interface EditorProps {
  value: string;
  onChange: (v: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
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
    if (validUrls.length > 0) callback(validUrls);
  };

  return (
    <div className="magazine-editor-wrapper">
      <MdEditor
        modelValue={value}
        onChange={onChange}
        theme="light" // 强制锁定为浅色模式
        language="en-US"
        toolbars={[
          'bold', 'underline', 'italic', 'strikeThrough', '-',
          'title', 'sub', 'sup', 'quote', 'unorderedList', 'orderedList', '-',
          'codeRow', 'code', 'link', 'image', 'table', 'mermaid', '-',
          'revoke', 'next', 'save', '=', 
          'pageFullscreen', 'fullscreen', 'preview', 'htmlPreview'
        ]}
        onUploadImg={onUploadImg}
        className="h-[650px] rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white"
        previewTheme="github" 
      />

      <style jsx global>{`
        .magazine-editor-wrapper .md-editor {
          font-family: 'Noto Serif SC', 'Playfair Display', serif !important;
          --md-bk-color: #ffffff !important;
          --md-color: #18181b !important;
        }
        .magazine-editor-wrapper .md-editor-preview h1,
        .magazine-editor-wrapper .md-editor-preview h2,
        .magazine-editor-wrapper .md-editor-preview h3 {
          font-family: 'Playfair Display', 'Noto Serif SC', serif !important;
          font-weight: 700;
        }
        .magazine-editor-wrapper .md-editor-content {
           background-color: #ffffff !important;
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