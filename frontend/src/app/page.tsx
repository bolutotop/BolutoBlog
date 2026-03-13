// app/page.tsx
import CodePlayground from '@/components/CodePlayground';

export default function Home() {
  return (
    <div className="flex flex-col gap-6 mt-10">
      <header className="border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-extrabold mb-2 text-white">功能测试节点 (Functional Test Node)</h1>
        <p className="text-gray-400 font-mono text-sm">Target: UI Rendering & WebSocket Client Initialization</p>
      </header>

      {/* 直接挂载代码演示组件 */}
      <section className="w-full">
        <CodePlayground />
      </section>
    </div>
  );
}