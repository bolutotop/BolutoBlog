// =========================================================================
// 🏠 全站配置常量 — 个人信息、品牌、默认值统一管理
// =========================================================================

export const siteConfig = {
  /** 站点名称（显示在 Header Logo 等处） */
  name: "Zhihui",

  /** 头像路径（LeftSidebar、MobileMenu 共用） */
  avatar: "/uploads/1774537145969-_20260326225851.jpg",

  /** 个人简介 */
  tagline: "A programming enthusiast",

  /** 站点标题 */
  title: "ZHIHUI Dev Log",

  /** 默认的文章封面图（当文章未设置封面时使用） */
  defaultCoverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
} as const;
