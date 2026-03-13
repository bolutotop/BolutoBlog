'use client'; // 强制声明为客户端组件

import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

interface WSMessage {
    status?: 'running' | 'success' | 'error';
    output?: string;
}

export default function CodePlayground() {
    const [code, setCode] = useState<string>('#include <iostream>\n\nint main() {\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}');
    const [output, setOutput] = useState<string>('');
    const [isRunning, setIsRunning] = useState<boolean>(false);
    
    // 使用 useRef 维持 WS 实例，避免重复渲染导致连接断开
    const wsRef = useRef<WebSocket | null>(null);

    // 初始化 WebSocket 链路
    useEffect(() => {
        // 替换为实际 C++ 后端 IP/域名，需处理 wss:// (若有 SSL)
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8080/run';
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('[WebSocket] Connection established');
        };

        ws.onmessage = (event: MessageEvent) => {
            try {
                const data: WSMessage = JSON.parse(event.data);
                if (data.output) {
                    // 流式追加输出终端
                    setOutput((prev) => prev + data.output);
                }
                if (data.status && data.status !== 'running') {
                    setIsRunning(false);
                }
            } catch (err) {
                console.error('[WebSocket] Parsing error', err);
            }
        };

        ws.onerror = (err) => {
            console.error('[WebSocket] Error', err);
            setIsRunning(false);
        };

        ws.onclose = () => {
            console.log('[WebSocket] Connection closed');
            setIsRunning(false);
        };

        wsRef.current = ws;

        // 组件卸载时清理连接
        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, []);

    const handleExecute = () => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            setOutput('Error: WebSocket is not connected.\n');
            return;
        }

        setIsRunning(true);
        setOutput(''); // 清空历史输出

        // 构造 Protocol Payload
        const payload = {
            action: 'execute',
            code: code,
            lang: 'cpp'
        };

        wsRef.current.send(JSON.stringify(payload));
    };

    return (
        <div className="flex flex-col gap-4 border border-gray-700 rounded-lg p-4 bg-gray-900 my-6">
            <div className="flex justify-between items-center">
                <span className="text-gray-300 font-mono text-sm">C++20 Playground</span>
                <button 
                    onClick={handleExecute} 
                    disabled={isRunning}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
                >
                    {isRunning ? 'Running...' : 'Run Code'}
                </button>
            </div>
            
            <div className="h-64 border border-gray-800 rounded">
                <Editor
                    height="100%"
                    defaultLanguage="cpp"
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    options={{ minimap: { enabled: false }, fontSize: 14 }}
                />
            </div>

            <div className="bg-black text-green-400 font-mono text-sm p-4 h-32 overflow-y-auto rounded border border-gray-800 whitespace-pre-wrap">
                {output || 'Ready to run...'}
            </div>
        </div>
    );
}