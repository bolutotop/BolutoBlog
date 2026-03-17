"use client";

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// 在客户端注册插件
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function useGsapAnimations() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 获取所有需要添加动画的元素
    const header = document.getElementById('gsap-header');
    const cover = document.getElementById('gsap-cover');
    const content = document.getElementById('gsap-content');
    const images = content?.querySelectorAll('img');

    // 1. 头部逐行浮现动画
    if (header) {
      gsap.to(header, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out', // 使用极致的缓动函数
      });
    }

    // 2. 封面图缩放浮现动画
    if (cover) {
      gsap.to(cover, {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        delay: 0.3, // 稍微延迟，让头部先动
        ease: 'expo.out',
      });
    }

    // 3. 正文图片滚动触发动画
    if (images) {
      images.forEach((img) => {
        gsap.to(img, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: img,
            start: 'top 80%', // 当图片顶部到达屏幕80%位置时触发
            end: 'top 50%', // 动画结束位置
            scrub: true, // 动画与滚动条绑定
            markers: false, // 开启标记用于调试，生产环境需关闭
          },
        });
      });
    }

  }, []);
}