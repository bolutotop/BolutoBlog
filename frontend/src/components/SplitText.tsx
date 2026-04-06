import React from 'react';

/**
 * 巨型标题文字切割组件 — 每个字符独立渲染，配合 GSAP `.hero-char` 实现入场动画。
 * 使用 flex-wrap 支持长文本自动换行（搜索/分类页面的动态标题可能很长）。
 */
export default function SplitText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`flex flex-wrap overflow-hidden pb-4 -mb-4 ${className}`}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="hero-char inline-block translate-y-[150%] rotate-12 opacity-0"
          style={{ whiteSpace: 'pre' }}
        >
          {char}
        </span>
      ))}
    </div>
  );
}
