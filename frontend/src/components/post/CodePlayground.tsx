"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PlayIcon, StopIcon } from '@heroicons/react/24/outline';

// --- CodeMirror & 语法高亮生态 ---
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import '@fontsource/jetbrains-mono'; // 全局加载极客字体
import { useLenis } from '@studio-freight/react-lenis';
// ==========================================
// 🚀 定制化主题定义 (在组件外定义以优化性能)
// ==========================================

// 1. 词法树精准着色 (匹配你提供的 One Dark 变体)
const macLightHighlight = HighlightStyle.define([
  { tag: [t.keyword, t.modifier, t.meta], color: "#c678dd" }, // 紫红: enum, class, public, #include, return
  { tag: [t.string, t.special(t.string)], color: "#98c379" }, // 绿色: <iostream>, "helloword"
  { tag: [t.className, t.macroName], color: "#e5c07b" },      // 黄色: test (类名)
  { tag: [t.typeName, t.standard(t.typeName)], color: "#61afef" }, // 蓝色: int
  { tag: [t.function(t.variableName)], color: "#61afef" },    // 蓝色: main
  { tag: [t.function(t.propertyName)], color: "#e5c07b" },    // 黄色: push_back
  { tag: [t.number], color: "#d19a66" },                      // 橙色: 1, 0
  { tag: [t.comment], color: "#abb2bf", fontStyle: "italic" },// 浅灰斜体: //1
  { tag: [t.variableName, t.propertyName, t.operator, t.punctuation], color: "#383a42" }, // 深灰: 变量, 括号, 分号 
]);

// 2. 编辑器外壳样式覆盖 (匹配图示的浅色背景与去网格化)
const macLightTheme = EditorView.theme({
  "&": {
    backgroundColor: "#f8f9fa", // 浅灰白底色
    color: "#383a42"
  },
  ".cm-content": {
    fontFamily: "'JetBrains Mono', Consolas, monospace",
    fontSize: "15px",
    lineHeight: "1.6",
  },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#528bff", borderWidth: "2px" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": { backgroundColor: "#e5ebf1" },
  ".cm-activeLine": { backgroundColor: "transparent" }, // 关闭当前行背景高亮
  ".cm-gutters": {
    backgroundColor: "#f8f9fa",
    color: "#abb2bf", // 行号浅灰色
    border: "none",
    paddingRight: "10px",
    paddingLeft: "4px"
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
    color: "#383a42" // 当前行号加深
  }
});

// 3. 组合为最终的主题扩展
const customMacTheme = [macLightTheme, syntaxHighlighting(macLightHighlight)];

// ==========================================
// 🚀 组件主体逻辑
// ==========================================

interface WSMessage {
  status?: 'running' | 'success' | 'error';
  output?: string;
}

interface CodePlaygroundProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode: string;
}

export default function CodePlayground({ isOpen, onClose, initialCode }: CodePlaygroundProps) {
    const lenis = useLenis();
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState<string>('');
  const [output, setOutput] = useState<string>("> 终端就绪. 等待执行...\n");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);



  // SSR 防护
  useEffect(() => {
    setMounted(true);
  }, []);

  // 同步初始代码
  useEffect(() => {
    if (isOpen) {
      setCode(initialCode);
      setOutput("> 终端就绪. 等待执行...\n");
    }
  }, [isOpen, initialCode]);


  // 🚀 新增：锁定底层页面滚动 (防止滚动穿透)
useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
        lenis?.stop(); // 强行暂停背后的平滑滚动
      } else {
        document.body.style.overflow = '';
        lenis?.start(); // 恢复平滑滚动
      }
      
      return () => {
        document.body.style.overflow = '';
        lenis?.start();
      };
    }, [isOpen, lenis]);
  // WebSocket 链路管理
  useEffect(() => {
    if (!isOpen) {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsRunning(false);
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8080';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => setOutput(prev => prev + "[WebSocket] Connection established.\n");

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data: WSMessage = JSON.parse(event.data);
        if (data.output) setOutput(prev => prev + data.output);
        if (data.status && data.status !== 'running') {
          setOutput(prev => prev + "\n> 执行结束.\n");
          setIsRunning(false);
        }
      } catch (err) {
        setOutput(prev => prev + "\n[Fatal] 无法解析沙盒响应.\n");
        setIsRunning(false);
      }
    };

    ws.onerror = () => {
      setOutput(prev => prev + "\n[Fatal] WebSocket 连接失败，请检查沙盒后端.\n");
      setIsRunning(false);
    };

    ws.onclose = () => {
      setOutput(prev => prev + "[WebSocket] Connection closed.\n");
      setIsRunning(false);
    };

    wsRef.current = ws;

    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [isOpen]);

  // 自动滚动终端到底部
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  const handleExecute = () => {
    if (isRunning) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setOutput(prev => prev + 'Error: WebSocket is not connected.\n');
      return;
    }
    setIsRunning(true);
    setOutput('> 编译并执行中...\n');
    wsRef.current.send(JSON.stringify({ action: 'execute', code: code, lang: 'cpp' }));
  };

  const handleStop = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close(); 
      setOutput(prev => prev + "\n> 用户强制终止连接.\n");
    }
    setIsRunning(false);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
<motion.div 
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.3 }}
          // 🚀 增加 data-lenis-prevent 彻底免疫外层拦截
          data-lenis-prevent="true" 
          className="fixed inset-0 z-[999999] bg-black/60 flex items-center justify-center p-4 md:p-10 pointer-events-auto overscroll-contain"
        >
          {/* 现代卡片设计，内部嵌套 macOS 风格代码块与黑客终端 */}
          <motion.div 
            initial={{ y: 40, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            className="w-full max-w-[1400px] h-[90vh] md:h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5"
          >
            {/* 顶部控制栏 */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-white shrink-0">
              <div className="flex items-center gap-4">
                <span className="font-black tracking-widest uppercase text-sm md:text-base text-gray-900">Playground</span>
                <span className="font-mono text-[10px] font-bold opacity-60 uppercase bg-gray-100 text-gray-800 px-2 py-1 rounded">C++20 Isolate</span>
              </div>
              <div className="flex items-center gap-3">
                {isRunning ? (
                  <button onClick={handleStop} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-bold uppercase text-[10px] md:text-xs transition-colors shadow-sm">
                    <StopIcon className="w-4 h-4 stroke-2" /> Stop
                  </button>
                ) : (
                  <button onClick={handleExecute} className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md font-bold uppercase text-[10px] md:text-xs transition-colors shadow-sm">
                    <PlayIcon className="w-4 h-4 stroke-2" /> Run Code
                  </button>
                )}
                <div className="w-px h-6 bg-gray-200 mx-2"></div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full">
                  <XMarkIcon className="w-5 h-5 stroke-2" />
                </button>
              </div>
            </div>

            {/* 编辑器与终端分屏区域 */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-gray-50/50">
              
 {/* 左侧：CodeMirror macOS 风格编辑区 (无缝吸附展开) */}
              <div className="w-full md:w-7/12 h-1/2 md:h-full flex flex-col relative bg-[#f8f9fa]">
                
                {/* macOS 交通灯控制点 (贴合顶部) */}
                <div className="flex items-center gap-2 px-6 py-4 bg-[#f8f9fa] border-b border-gray-200/60 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-sm"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-sm"></div>
                </div>
                
                {/* CodeMirror 本体 (自适应填满剩余空间) */}
                <div className="flex-1 overflow-auto custom-scrollbar relative">
                  <CodeMirror
                    value={code}
                    height="100%"
                    extensions={[cpp(), customMacTheme]} 
                    onChange={(val) => setCode(val)}
                    basicSetup={{
                      lineNumbers: true,
                      highlightActiveLineGutter: false,
                      highlightActiveLine: false,
                      foldGutter: false,
                      dropCursor: false,
                      allowMultipleSelections: true,
                      indentOnInput: true,
                      autocompletion: true,
                    }}
                    // 强制覆盖 CodeMirror 默认外轮廓
                    style={{ outline: 'none' }}
                  />
                </div>
              </div>
{/* 右侧：现代亮色控制台输出区 */}
              <div className="w-full md:w-5/12 h-1/2 md:h-full bg-[#fafafa] md:border-l border-gray-100 p-6 md:p-8 overflow-y-auto relative custom-scrollbar selection:bg-blue-100 selection:text-blue-900 flex flex-col">
                
                {/* 顶部状态角标 */}
                <div 
                  className="absolute top-4 right-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 pointer-events-none select-none flex items-center gap-2"
                  style={{ fontFamily: "'JetBrains Mono', Consolas, monospace" }}
                >
                  <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-300'}`}></span>
                  Console
                </div>
                
                {/* 输出文本区 */}
                <pre 
                  className="whitespace-pre-wrap break-all mt-6 flex-1 text-[13px] md:text-[14px] text-gray-600"
                  style={{ 
                    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                    lineHeight: "1.7",
                    letterSpacing: "-0.01em"
                  }}
                >
                  {output}
                </pre>
                <div ref={terminalEndRef} />
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}