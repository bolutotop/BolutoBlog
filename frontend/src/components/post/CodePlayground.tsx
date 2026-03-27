"use client";

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PlayIcon, StopIcon } from '@heroicons/react/24/outline';
import { useLenis } from '@studio-freight/react-lenis';

// --- CodeMirror & 语法高亮生态 ---
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import '@fontsource/jetbrains-mono';

import { cpp } from '@codemirror/lang-cpp';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';

const macLightHighlight = HighlightStyle.define([
  { tag: [t.keyword, t.modifier, t.meta], color: "#c678dd" },
  { tag: [t.string, t.special(t.string)], color: "#98c379" },
  { tag: [t.className, t.macroName], color: "#e5c07b" },
  { tag: [t.typeName, t.standard(t.typeName)], color: "#61afef" },
  { tag: [t.function(t.variableName)], color: "#61afef" },
  { tag: [t.function(t.propertyName)], color: "#e5c07b" },
  { tag: [t.number], color: "#d19a66" },
  { tag: [t.comment], color: "#abb2bf", fontStyle: "italic" },
  { tag: [t.variableName, t.propertyName, t.operator, t.punctuation], color: "#383a42" },
]);

const macLightTheme = EditorView.theme({
  "&": { backgroundColor: "#f8f9fa", color: "#383a42" },
  "&.cm-focused": { outline: "none" },
  ".cm-content": { fontFamily: "'JetBrains Mono', Consolas, monospace", fontSize: "15px", lineHeight: "1.6" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#528bff", borderWidth: "2px" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": { backgroundColor: "#e5ebf1" },
  ".cm-activeLine": { backgroundColor: "transparent" },
  ".cm-gutters": { backgroundColor: "#f8f9fa", color: "#abb2bf", border: "none", paddingRight: "10px", paddingLeft: "4px" },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "#383a42" }
});

const customMacTheme = [macLightTheme, syntaxHighlighting(macLightHighlight)];

// 🚀 1. 扩展 WSMessage 接口，支持时空消耗与多种错误状态
interface WSMessage {
  status?: 'running' | 'success' | 'error' | 'timeout' | 'oom' | 'compile_error' | 'runtime_error';
  output?: string;
  time_ms?: number;
  memory_kb?: number;
}

interface CodePlaygroundProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode: string;
  language?: string;
}

const getLanguageExtension = (lang: string) => {
  switch (lang.toLowerCase()) {
    case 'js':
    case 'javascript':
    case 'ts':
    case 'typescript':
      return javascript({ jsx: true, typescript: true });
    case 'py':
    case 'python':
      return python();
    case 'cpp':
    case 'c++':
    case 'c':
    default:
      return cpp();
  }
};

export default function CodePlayground({ isOpen, onClose, initialCode, language = 'cpp' }: CodePlaygroundProps) {
  const lenis = useLenis();
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState<string>('');
  const [output, setOutput] = useState<string>("> 终端就绪. 等待执行...\n");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  
  // 🚀 2. 新增状态：保存执行指标和最终状态
  const [metrics, setMetrics] = useState<{ time: number; memory: number } | null>(null);
  const [finalStatus, setFinalStatus] = useState<string | null>(null);
  
 const wsRef = useRef<WebSocket | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  
  // 🚀 新增：用于记录上一次执行请求的时间戳
  const lastExecutionTime = useRef<number>(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOpen) {
      setCode(initialCode);
      setOutput(`> ${language.toUpperCase()} 终端就绪. 等待执行...\n`);
      setMetrics(null);
      setFinalStatus(null);
    }
  }, [isOpen, initialCode, language]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      lenis?.stop();
    } else {
      document.body.style.overflow = '';
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = '';
      lenis?.start();
    };
  }, [isOpen, lenis]);

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
        
        if (data.output) {
          // 🚀 增加防卡死机制：终端输出滑动窗口截断 (最大保留 20000 字符)
          const MAX_TERMINAL_LENGTH = 5000;
          setOutput(prev => {
            const nextStr = prev + data.output;
            if (nextStr.length > MAX_TERMINAL_LENGTH) {
              return "... [历史输出已截断] ...\n" + nextStr.slice(-MAX_TERMINAL_LENGTH);
            }
            return nextStr;
          });
        }
        
        // 🚀 3. 拦截最终状态，提取指标
        if (data.status && data.status !== 'running') {
          setOutput(prev => prev + "\n> 执行结束.\n");
          setIsRunning(false);
          setFinalStatus(data.status);
          
          if (data.time_ms !== undefined && data.memory_kb !== undefined) {
            setMetrics({ time: data.time_ms, memory: data.memory_kb });
          }
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

    return () => { if (ws.readyState === WebSocket.OPEN) ws.close(); };
  }, [isOpen]);

  useEffect(() => { terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [output, metrics]);

const handleExecute = () => {
    // 🚀 新增：1 秒防刷节流机制
    const now = Date.now();
    if (now - lastExecutionTime.current < 1000) {
      setOutput(prev => prev + "> [系统拦截] 提交过于频繁，请等待 1 秒后再试...\n");
      return;
    }

    if (isRunning) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    // 更新最后一次成功发起请求的时间
    lastExecutionTime.current = now;
    
    setIsRunning(true);
    setMetrics(null); 
    setFinalStatus(null);
    setOutput('> 编译并执行中...\n');
    
    // 如果你集成了之前的 Turnstile token，记得在这里一并发送
    wsRef.current.send(JSON.stringify({ action: 'execute', code: code, lang: language.toLowerCase() }));
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
          data-lenis-prevent="true" 
          className="fixed inset-0 z-[999999] bg-black/60 flex items-center justify-center p-4 md:p-10 pointer-events-auto overscroll-contain"
        >
          <motion.div 
            initial={{ y: 40, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            className="w-full max-w-[1400px] h-[90vh] md:h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-white shrink-0">
              <div className="flex items-center gap-4">
                <span className="font-black tracking-widest uppercase text-sm md:text-base text-gray-900">Playground</span>
                <span className="font-mono text-[10px] font-bold opacity-60 uppercase bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  {language} Isolate
                </span>
              </div>
              <div className="flex items-center gap-3">
                {isRunning ? (
                  <button onClick={handleStop} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-bold uppercase text-[10px] md:text-xs transition-colors shadow-sm"><StopIcon className="w-4 h-4 stroke-2" /> Stop</button>
                ) : (
                  <button onClick={handleExecute} className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md font-bold uppercase text-[10px] md:text-xs transition-colors shadow-sm"><PlayIcon className="w-4 h-4 stroke-2" /> Run Code</button>
                )}
                <div className="w-px h-6 bg-gray-200 mx-2"></div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full"><XMarkIcon className="w-5 h-5 stroke-2" /></button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-gray-50/50">
              <div className="w-full md:w-7/12 h-1/2 md:h-full flex flex-col relative bg-[#f8f9fa]">
                <div className="flex items-center gap-2 px-6 py-4 bg-[#f8f9fa] border-b border-gray-200/60 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-sm"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-sm"></div>
                </div>
                
                <div className="flex-1 overflow-auto custom-scrollbar relative">
                  <CodeMirror
                    value={code}
                    height="100%"
                    extensions={[getLanguageExtension(language), customMacTheme]} 
                    onChange={(val) => setCode(val)}
                    basicSetup={{
                      lineNumbers: true, highlightActiveLineGutter: false, highlightActiveLine: false, foldGutter: false, dropCursor: false, allowMultipleSelections: true, indentOnInput: true, autocompletion: true,
                    }}
                    style={{ outline: 'none' }}
                  />
                </div>
              </div>

              {/* 终端面板 */}
              <div className="w-full md:w-5/12 h-1/2 md:h-full bg-[#fafafa] md:border-l border-gray-100 flex flex-col relative">
                
                <div className="absolute top-4 right-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 pointer-events-none select-none flex items-center gap-2" style={{ fontFamily: "'JetBrains Mono', Consolas, monospace" }}>
                  <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-300'}`}></span>
                  Console
                </div>
                
                <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar selection:bg-blue-100 selection:text-blue-900">
                  <pre className="whitespace-pre-wrap break-all mt-4 text-[13px] md:text-[14px] text-gray-600" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace", lineHeight: "1.7", letterSpacing: "-0.01em" }}>
                    {output}
                  </pre>
                  
                  {/* 🚀 4. 动态渲染指标看板 */}
                  {finalStatus && metrics && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`mt-6 p-4 rounded-lg border flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono font-bold
                        ${finalStatus === 'success' ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 uppercase">Status</span>
                        <span className={finalStatus === 'success' ? 'text-green-600' : 'text-red-500'}>
                          {finalStatus.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 uppercase">Time</span>
                        <span className="text-gray-700">{metrics.time.toFixed(2)} ms</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 uppercase">Mem</span>
                        <span className="text-gray-700">{(metrics.memory / 1024).toFixed(2)} MB</span>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={terminalEndRef} className="h-4" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}