// =========================================================================
// 🛠️ 通用工具函数 — 消除跨页面重复定义
// =========================================================================

/**
 * 将 Date 对象格式化为英文长日期字符串。
 * 例：April 6, 2026
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
