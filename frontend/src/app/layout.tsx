import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "600", "800"],
  variable: "--font-inter", 
});

export const metadata: Metadata = {
  title: "Boluto's Dev Log",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 🔴 核心修复：添加 suppressHydrationWarning 忽略插件注入的 class
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans selection:bg-blue-600 selection:text-white bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100`}>
        {children}
      </body>
    </html>
  );
}