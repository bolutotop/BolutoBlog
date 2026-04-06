// =========================================================================
// 🔑 首页数据结构类型定义 — 首页渲染 & 后台主页设置共享
// =========================================================================

export interface ContentBlock {
  layout: 'left-img' | 'right-img' | 'center-img';
  subtitle: string;
  title: string;
  desc: string;
  tag: string;
  imgSrc: string;
  imgAlt: string;
  imgWrapperClass: string;
  textWrapperClass: string;
  imgContainerClass: string;
  imgClass: string;
}

export interface PageSection {
  id: string;
  title: string;
  className: string;
  isDarkTheme: boolean;
  hideSidebars: boolean;
  blocks: ContentBlock[];
}

export interface PageData {
  hero: {
    titles: string[];
    subtitle: string;
    btnText: string;
    btnLink: string;
  };
  vision: {
    title: string;
    image: string;
  };
  sections: PageSection[];
}
