import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react"
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "600", "800"],
  variable: "--font-inter", 
});

export const metadata: Metadata = {
  title: "ZHIHUI Dev Log",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 🔴 核心修复：移除 dark: 类名，suppressHydrationWarning 忽略插件注入的 class
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans selection:bg-black selection:text-white bg-white text-gray-900`}>
        <SessionProvider>
{children}
        </SessionProvider>
        
      </body>
    </html>
  );
}