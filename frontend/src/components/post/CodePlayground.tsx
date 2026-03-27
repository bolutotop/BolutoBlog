"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom'; // 🚀 引入 Portal 神器
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PlayIcon, StopIcon } from '@heroicons/react/24/outline';
import Editor, { useMonaco } from '@monaco-editor/react';

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
  const [mounted, setMounted] = useState(false); // 用于处理 SSR 和 Portal
  const [code, setCode] = useState<string>('');
  const [output, setOutput] = useState<string>("> 终端就绪. 等待执行...\n");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // 🚀 1. 挂载状态，确保 createPortal 只在客户端运行
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. 同步 Markdown 里的初始代码
  useEffect(() => {
    if (isOpen) {
      setCode(initialCode);
      setOutput("> 终端就绪. 等待执行...\n");
    }
  }, [isOpen, initialCode]);

  // 3. 初始化 WebSocket 链路 (仅在弹窗打开时连接)
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
      setOutput(prev => prev + "\n[Fatal] WebSocket 连接失败，请检查沙盒后端是否启动.\n");
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

  // 🚀 4. 强行扒皮 Monaco，注入极简 Brutalist 暗黑主题
  const handleEditorWillMount = (monaco: any) => {
    monaco.editor.defineTheme('brutalist-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0a0a0a', // 极深的黑灰色背景
        'editor.lineHighlightBackground': '#111111', // 极其微弱的当前行高亮
        'editorLineNumber.foreground': '#333333', // 暗淡的行号
        'editorIndentGuide.background': '#0a0a0a', // 隐藏对齐线
        'editor.selectionBackground': '#222222', // 选中文本时的冷灰色
      }
    });
  };

  // 如果还没挂载，或者没打开，不渲染任何东西
  if (!mounted) return null;

  // 🚀 5. 使用 createPortal 将弹窗直接挂载到 document.body
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-10 pointer-events-auto"
        >
          {/* 粗野主义弹窗面板 */}
          <div className="bg-[#0a0a0a] w-full max-w-[1400px] h-[90vh] md:h-[85vh] flex flex-col sc-border border border-white/20 shadow-2xl overflow-hidden relative">
            
            {/* 头部控制栏 */}
            <div className="flex items-center justify-between border-b border-white/20 px-6 py-4 bg-[#f8f9fa] text-black shrink-0">
              <div className="flex items-center gap-4">
                <span className="font-black tracking-widest uppercase text-sm md:text-base">Playground</span>
                <span className="font-mono text-[10px] font-bold opacity-60 uppercase bg-black/10 px-2 py-1">C++20 Isolate</span>
              </div>
              <div className="flex items-center gap-4">
                {isRunning ? (
                  <button onClick={handleStop} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 font-black uppercase text-[10px] md:text-xs transition-colors shadow-md">
                    <StopIcon className="w-4 h-4 stroke-2" /> Stop
                  </button>
                ) : (
                  <button onClick={handleExecute} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 font-black uppercase text-[10px] md:text-xs transition-colors shadow-md">
                    <PlayIcon className="w-4 h-4 stroke-2" /> Run Code
                  </button>
                )}
                <div className="w-px h-6 bg-black/20 mx-2"></div>
                <button onClick={onClose} className="hover:opacity-50 transition-opacity">
                  <XMarkIcon className="w-6 h-6 stroke-2" />
                </button>
              </div>
            </div>

            {/* 编辑器与终端分屏区域 */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-[#0a0a0a]">
              
              {/* 左侧：极简版 Monaco 编辑区 */}
              <div className="w-full md:w-7/12 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-white/10 flex flex-col relative">
                <Editor
                  height="100%"
                  defaultLanguage="cpp"
                  theme="brutalist-dark"
                  beforeMount={handleEditorWillMount}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  options={{ 
                    minimap: { enabled: false }, // 关掉右侧小地图
                    fontSize: 14,
                    fontFamily: 'Consolas, "Courier New", monospace',
                    scrollBeyondLastLine: false, // 禁止滚动到最后一行之下留大片空白
                    padding: { top: 24, bottom: 24 }, // 上下留白，更有呼吸感
                    lineNumbers: 'on', // 保留行号但变暗（前面主题里设置了）
                    lineDecorationsWidth: 0, // 去掉行号旁边的空隙
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'none', // 关闭恶心的当前行边框高亮
                    hideCursorInOverviewRuler: true,
                    overviewRulerBorder: false, // 关掉滚动条边框
                    scrollbar: {
                      vertical: 'hidden', // 隐藏丑陋的原生滚动条
                      horizontal: 'hidden'
                    }
                  }}
                />
              </div>

              {/* 右侧：纯粹的终端输出区 */}
              <div className="w-full md:w-5/12 h-1/2 md:h-full bg-[#050505] text-green-500 p-6 md:p-8 font-mono text-xs md:text-sm overflow-y-auto relative custom-scrollbar selection:bg-green-500/30">
                <div className="absolute top-4 right-6 text-[10px] font-black uppercase tracking-widest opacity-20 text-white pointer-events-none select-none">
                  Terminal Output
                </div>
                <pre className="whitespace-pre-wrap break-all font-mono leading-relaxed mt-4">
                  {output}
                </pre>
                <div ref={terminalEndRef} />
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body // 🚀 挂载到 body 最后，神挡杀神，绝对位于最顶层！
  );
}