"use client";

import React, { useState, useEffect } from 'react';
import { getHomePageConfigAction, saveHomePageConfigAction } from '@/app/actions';
import type { PageData, PageSection, ContentBlock } from '@/types/page';
import { 
  CheckCircleIcon, 
  PhotoIcon, 
  ViewColumnsIcon, 
  QueueListIcon,
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  FolderPlusIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

const DEFAULT_PAGE_DATA: PageData = {
  hero: {
    titles: ["ZHIHUI", "CREATIVE", "STUDIO"],
    subtitle: "Breaking grids. Defying templates. Pure uncompromising digital architecture.",
    btnText: "Access Logs",
    btnLink: "/blog"
  },
  vision: {
    title: "VISION",
    image: "/uploads/1773747290074-dbc2a046d7e894928498b6c95ad29482.jpg"
  },
  sections: [
    {
      id: "philosophy",
      title: "PHILOSOPHY",
      className: "overlap-section",
      isDarkTheme: true,
      hideSidebars: true,
      blocks: [
        {
          layout: "left-img",
          subtitle: "01 / Mindset",
          title: "Boundless",
          desc: "The world tries to put you in a box...",
          tag: "Seek the edge",
          imgSrc: "/uploads/1773764885354-b53ef7f6ef4665411f4282b6ced7fe32.jpg",
          imgAlt: "Boundless",
          imgWrapperClass: "w-full md:w-7/12",
          textWrapperClass: "w-full md:w-5/12",
          imgContainerClass: "w-full h-[60vh] md:h-[80vh] max-h-[750px] bg-[var(--sc-border)]",
          imgClass: "-top-[15%] left-0 w-full h-[130%] object-cover object-center opacity-90"
        }
      ]
    }
  ]
};

export default function HomeSettingsPage() {
  const [formData, setFormData] = useState<PageData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'hero' | 'vision' | 'sections'>('hero');
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  useEffect(() => {
    const loadData = async () => {
      const res = await getHomePageConfigAction();
      if (res.success && res.data) {
        setFormData(res.data);
      } else {
        setFormData(DEFAULT_PAGE_DATA);
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await saveHomePageConfigAction(formData);
      if (res.success) {
        alert("🎉 主页配置已成功发布！");
      } else {
        alert("保存失败，请查看控制台。");
      }
    } catch (error) {
      alert("❌ 发生未知错误！");
    } finally {
      setIsSaving(false);
    }
  };

  const addSection = () => {
    if (!formData) return;
    const newSection: PageSection = {
      id: `section-${Date.now()}`,
      title: "NEW SECTION",
      className: "overlap-section",
      isDarkTheme: false,
      hideSidebars: false,
      blocks: []
    };
    const newSections = [...formData.sections, newSection];
    setFormData({ ...formData, sections: newSections });
    setExpandedSection(newSections.length - 1);
  };

  const removeSection = (sIdx: number) => {
    if (!formData) return;
    if (confirm("⚠️ 危险操作：确定要删除整个大板块及其包含的所有图文吗？此操作不可恢复！")) {
      const newSections = [...formData.sections];
      newSections.splice(sIdx, 1);
      setFormData({ ...formData, sections: newSections });
      setExpandedSection(null);
    }
  };

  const updateSection = (sIdx: number, field: keyof PageSection, value: string | boolean) => {
    if (!formData) return;
    const newSections = [...formData.sections];
    newSections[sIdx] = { ...newSections[sIdx], [field]: value };
    setFormData({ ...formData, sections: newSections });
  };

  const updateBlock = (sIdx: number, bIdx: number, field: keyof ContentBlock, value: string) => {
    if (!formData) return;
    const newSections = [...formData.sections];
    const newBlocks = [...newSections[sIdx].blocks];
    newBlocks[bIdx] = { ...newBlocks[bIdx], [field]: value };
    newSections[sIdx] = { ...newSections[sIdx], blocks: newBlocks };
    setFormData({ ...formData, sections: newSections });
  };

  const addBlock = (sIdx: number) => {
    if (!formData) return;
    const newBlock: ContentBlock = {
      layout: "left-img",
      subtitle: "NEW / Subtitle",
      title: "New Block",
      desc: "Enter your description here...",
      tag: "Action tag",
      imgSrc: "",
      imgAlt: "Image description",
      imgWrapperClass: "w-full md:w-6/12",
      textWrapperClass: "w-full md:w-6/12",
      imgContainerClass: "w-full h-[50vh] md:h-[60vh] bg-[var(--sc-border)]",
      imgClass: "-top-[10%] left-0 w-full h-[120%] object-cover object-center"
    };
    const newSections = [...formData.sections];
    newSections[sIdx] = { ...newSections[sIdx], blocks: [...newSections[sIdx].blocks, newBlock] };
    setFormData({ ...formData, sections: newSections });
  };

  const removeBlock = (sIdx: number, bIdx: number) => {
    if (!formData) return;
    if (confirm("确定要删除这个图文块吗？")) {
      const newSections = [...formData.sections];
      const newBlocks = [...newSections[sIdx].blocks];
      newBlocks.splice(bIdx, 1);
      newSections[sIdx] = { ...newSections[sIdx], blocks: newBlocks };
      setFormData({ ...formData, sections: newSections });
    }
  };

  if (!formData) return (
     <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
        <div className="text-sm font-bold text-gray-400 tracking-widest uppercase">Loading System Core...</div>
     </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32 max-w-[1200px] mx-auto">
      
      {/* 头部区域 (毛玻璃悬浮) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sticky top-0 bg-[#Fafafa]/80 backdrop-blur-md pt-4 pb-6 z-40 border-b border-gray-100/50">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">主页定制中心</h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">实时修改前台 Showcase 页面的文案、排版与图片</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {isSaving ? (
             <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Publishing...</span>
          ) : (
             <><CloudArrowUpIcon className="w-5 h-5 stroke-2" /> 发布更新</>
          )}
        </button>
      </div>

      {/* Segmented Control 导航 (SaaS 级 Tab) */}
      <div className="flex p-1 bg-gray-100 rounded-xl overflow-x-auto hide-scrollbar border border-gray-200 shadow-inner w-full md:w-fit">
        <TabButton active={activeTab === 'hero'} onClick={() => setActiveTab('hero')} icon={<ViewColumnsIcon className="w-4 h-4" />} text="首屏巨幕 (Hero)" />
        <TabButton active={activeTab === 'vision'} onClick={() => setActiveTab('vision')} icon={<PhotoIcon className="w-4 h-4" />} text="视觉遮罩 (Vision)" />
        <TabButton active={activeTab === 'sections'} onClick={() => setActiveTab('sections')} icon={<QueueListIcon className="w-4 h-4" />} text="模块矩阵 (Sections)" />
      </div>

      {/* 主内容面板 */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-5 md:p-8">
        
        {/* ==================== 1. Hero 设置 ==================== */}
        {activeTab === 'hero' && (
           <div className="space-y-6 max-w-2xl animate-in slide-in-from-bottom-2 duration-300">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">巨型标题阵列 / Title Array</label>
              <div className="space-y-3">
                {formData.hero.titles.map((title: string, idx: number) => (
                  <input 
                    key={idx}
                    type="text" 
                    value={title}
                    onChange={(e) => {
                      const newTitles = [...formData.hero.titles];
                      newTitles[idx] = e.target.value;
                      setFormData({ ...formData, hero: { ...formData.hero, titles: newTitles } });
                    }}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent font-black uppercase text-xl transition-all outline-none"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">子标题箴言 / Subtitle</label>
              <textarea 
                value={formData.hero.subtitle}
                onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, subtitle: e.target.value } })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent font-medium text-sm h-24 resize-none transition-all outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">按钮文字 / Button Text</label>
                <input type="text" value={formData.hero.btnText} onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, btnText: e.target.value } })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm font-bold transition-all outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">跳转链接 / Link</label>
                <input type="text" value={formData.hero.btnLink} onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, btnLink: e.target.value } })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm font-mono transition-all outline-none" />
              </div>
            </div>
          </div>
        )}

        {/* ==================== 2. Vision 设置 ==================== */}
        {activeTab === 'vision' && (
           <div className="space-y-6 max-w-2xl animate-in slide-in-from-bottom-2 duration-300">
             <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">背景遮罩文字 / Mask Title</label>
                <input type="text" value={formData.vision.title} onChange={(e) => setFormData({ ...formData, vision: { ...formData.vision, title: e.target.value } })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent font-black uppercase text-xl transition-all outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">背景图片路径 / Image URL</label>
                <input type="text" value={formData.vision.image} onChange={(e) => setFormData({ ...formData, vision: { ...formData.vision, image: e.target.value } })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono text-sm transition-all outline-none" />
                <div className="mt-4 aspect-[21/9] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-inner flex items-center justify-center">
                   {formData.vision.image ? (
                     <img src={formData.vision.image} alt="Vision Preview" className="w-full h-full object-cover" />
                   ) : (
                     <PhotoIcon className="w-10 h-10 text-gray-300" />
                   )}
                </div>
              </div>
          </div>
        )}

        {/* ==================== 3. 可视化图文矩阵引擎 ==================== */}
        {activeTab === 'sections' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            
            {formData.sections.map((section: PageSection, sIdx: number) => (
              <div key={section.id || sIdx} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300">
                
                {/* 手风琴头部 (Section 控制) */}
                <div 
                  className={`flex items-center justify-between p-4 md:p-5 cursor-pointer hover:bg-gray-50 transition-colors ${expandedSection === sIdx ? 'bg-gray-50 border-b border-gray-200' : 'bg-white'}`}
                  onClick={() => setExpandedSection(expandedSection === sIdx ? null : sIdx)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      S{sIdx + 1}
                    </div>
                    <div>
                      <h3 className="font-black text-base uppercase tracking-tight text-gray-900">{section.title || 'UNNAMED SECTION'}</h3>
                      <p className="text-[11px] text-gray-500 font-semibold mt-0.5 uppercase tracking-widest">{section.blocks.length} Blocks</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeSection(sIdx); }} 
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除整个大板块"
                    >
                      <TrashIcon className="w-5 h-5 stroke-2" />
                    </button>
                    <div className="w-px h-6 bg-gray-200 mx-1"></div>
                    <div className={`p-2 text-gray-400 transition-transform duration-300 ${expandedSection === sIdx ? 'rotate-180' : ''}`}>
                      <ChevronDownIcon className="w-5 h-5 stroke-2" />
                    </div>
                  </div>
                </div>

                {/* 手风琴内容 (Blocks 控制) */}
                {expandedSection === sIdx && (
                  <div className="p-4 md:p-6 bg-white space-y-8 animate-in slide-in-from-top-2 duration-300">
                    
                    {/* Section 全局配置 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-6 border-b border-gray-100">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">板块标题 / Section Title</label>
                        <input type="text" value={section.title} onChange={(e) => updateSection(sIdx, 'title', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold uppercase focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all" />
                      </div>
                      <div className="flex items-center gap-3 pt-2 md:pt-6">
                        <input type="checkbox" id={`dark-${sIdx}`} checked={section.isDarkTheme} onChange={(e) => updateSection(sIdx, 'isDarkTheme', e.target.checked)} className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 w-4 h-4 cursor-pointer transition-all" />
                        <label htmlFor={`dark-${sIdx}`} className="text-xs font-bold text-gray-700 uppercase tracking-widest cursor-pointer select-none">反色模式 / Dark Theme</label>
                      </div>
                      <div className="flex items-center gap-3 pt-2 md:pt-6">
                        <input type="checkbox" id={`hide-${sIdx}`} checked={section.hideSidebars} onChange={(e) => updateSection(sIdx, 'hideSidebars', e.target.checked)} className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 w-4 h-4 cursor-pointer transition-all" />
                        <label htmlFor={`hide-${sIdx}`} className="text-xs font-bold text-gray-700 uppercase tracking-widest cursor-pointer select-none">画廊模式 / Hide Sidebars</label>
                      </div>
                    </div>

                    {/* Blocks 列表 */}
                    <div className="space-y-6">
                      {section.blocks.length === 0 && (
                        <div className="text-center py-12 text-gray-400 text-sm font-semibold border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                          此版块暂无内容，点击下方添加图文模块
                        </div>
                      )}

                      {section.blocks.map((block: ContentBlock, bIdx: number) => (
                        <div key={bIdx} className="bg-gray-50/80 rounded-2xl p-5 md:p-6 border border-gray-200 relative shadow-sm hover:shadow-md transition-all">
                          
                          <button onClick={() => removeBlock(sIdx, bIdx)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-red-100">
                            <TrashIcon className="w-4 h-4 stroke-2" />
                          </button>
                          
                          <div className="flex items-center gap-3 mb-6">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-gray-200 text-gray-600 px-2 py-1 rounded-md">BLOCK {bIdx + 1}</span>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* 左侧：文字设置 */}
                            <div className="space-y-5">
                              <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">排版布局 / Layout</label>
                                <select 
                                  value={block.layout} 
                                  onChange={(e) => updateBlock(sIdx, bIdx, 'layout', e.target.value)}
                                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold shadow-sm focus:ring-2 focus:ring-gray-900 outline-none cursor-pointer appearance-none transition-all"
                                >
                                  <option value="left-img">🖼️ 左图右文 (Left Image)</option>
                                  <option value="right-img">📝 右图左文 (Right Image)</option>
                                  <option value="center-img">🌟 居中大图 (Center Full)</option>
                                </select>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">副标题 / Subtitle</label>
                                  <input type="text" value={block.subtitle} onChange={(e) => updateBlock(sIdx, bIdx, 'subtitle', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-mono shadow-sm focus:ring-2 focus:ring-gray-900 outline-none transition-all" />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">小标签 / Tag</label>
                                  <input type="text" value={block.tag} onChange={(e) => updateBlock(sIdx, bIdx, 'tag', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-mono shadow-sm focus:ring-2 focus:ring-gray-900 outline-none transition-all" />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">主标题 / Main Title</label>
                                <input type="text" value={block.title} onChange={(e) => updateBlock(sIdx, bIdx, 'title', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-lg font-black uppercase shadow-sm focus:ring-2 focus:ring-gray-900 outline-none transition-all" />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">描述文案 / Description</label>
                                <textarea value={block.desc} onChange={(e) => updateBlock(sIdx, bIdx, 'desc', e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm shadow-sm h-32 resize-none focus:ring-2 focus:ring-gray-900 outline-none transition-all" />
                              </div>
                            </div>

                            {/* 右侧：图片设置 */}
                            <div className="space-y-5">
                              <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">图片链接 / Image URL</label>
                                <input type="text" value={block.imgSrc} onChange={(e) => updateBlock(sIdx, bIdx, 'imgSrc', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono shadow-sm focus:ring-2 focus:ring-gray-900 outline-none transition-all" placeholder="/uploads/..." />
                              </div>
                              <div className="aspect-[4/3] w-full bg-gray-100/50 rounded-2xl overflow-hidden shadow-inner border border-gray-200 flex items-center justify-center">
                                {block.imgSrc ? (
                                  <img src={block.imgSrc} alt="preview" className="w-full h-full object-cover" />
                                ) : (
                                  <PhotoIcon className="w-10 h-10 text-gray-300" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 添加新 Block 按钮 */}
                    <button 
                      onClick={() => addBlock(sIdx)}
                      className="w-full py-4 mt-6 border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-2xl text-sm font-bold text-gray-500 hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                    >
                      <PlusIcon className="w-5 h-5 stroke-2" />
                      添加图文模块 (Add Block)
                    </button>

                  </div>
                )}
              </div>
            ))}

            {/* 添加全新大板块按钮 */}
            <button 
              onClick={addSection}
              className="w-full py-6 mt-8 border-2 border-dashed border-gray-300 rounded-3xl text-sm font-black text-gray-500 hover:text-gray-900 hover:border-gray-900 hover:bg-gray-50 transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-sm hover:shadow-md"
            >
              <FolderPlusIcon className="w-6 h-6 stroke-2" />
              新增主题大板块 (Add Section)
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, text }: { active: boolean; onClick: () => void; icon: React.ReactNode; text: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
        active 
          ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' 
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 border border-transparent'
      }`}
    >
      {icon} <span className="hidden sm:inline">{text}</span>
    </button>
  );
}