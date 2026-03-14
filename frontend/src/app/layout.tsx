import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 配置 Inter 字体并生成 CSS 变量供 Tailwind 使用
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "600", "800"],
  variable: "--font-inter", 
});

export const metadata: Metadata = {
  title: "Personal Log | Life, Tech, & Learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      {/* 注入字体变量及全局基础类名 */}
      <body className={`${inter.variable} font-sans selection:bg-brand selection:text-white`}>
        {children}
      </body>
    </html>
  );
}