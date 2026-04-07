import type { Metadata } from "next";
import { Inter, Newsreader, Playfair_Display, Syncopate, Italiana, Space_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "800"],
  variable: "--font-inter", 
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ['normal', 'italic'],
  variable: "--font-newsreader",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ['normal', 'italic'],
  variable: "--font-playfair",
});

const syncopate = Syncopate({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-syncopate",
});

const italiana = Italiana({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-italiana",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: {
    default: "ZHIHUI Dev Log",
    template: "%s | ZHIHUI Dev Log",
  },
  description: "Zhihui 的个人创意工作室 — 技术日志、编程洞察与创意设计探索。Breaking grids, defying templates.",
  keywords: ["blog", "programming", "creative studio", "web development", "Zhihui", "技术博客"],
  authors: [{ name: "Zhihui" }],
  openGraph: {
    title: "ZHIHUI Dev Log",
    description: "Breaking grids. Defying templates. Pure digital architecture.",
    type: "website",
    locale: "zh_CN",
    siteName: "ZHIHUI Dev Log",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZHIHUI Dev Log",
    description: "Breaking grids. Defying templates. Pure digital architecture.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 🔴 核心修复：移除 dark: 类名，suppressHydrationWarning 忽略插件注入的 class
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${newsreader.variable} ${playfair.variable} ${syncopate.variable} ${italiana.variable} ${spaceMono.variable} font-body bg-background text-on-background selection:bg-primary/20 selection:text-on-background antialiased`}>
        <SessionProvider>
{children}
        </SessionProvider>
        
      </body>
    </html>
  );
}