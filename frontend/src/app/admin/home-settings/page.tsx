"use client";

import React, { useState, useEffect } from 'react';
import { getHomePageConfigAction, saveHomePageConfigAction } from '@/app/actions';
import { 
  CheckCircleIcon, 
  PhotoIcon, 
  ViewColumnsIcon, 
  QueueListIcon,
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  FolderPlusIcon
} from '@heroicons/react/24/outline';

const DEFAULT_PAGE_DATA = {
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
  const [formData, setFormData] = useState<any>(null);
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

  // ==========================================
  // 🚀 Section 大板块操作逻辑
  // ==========================================
  
  // 1. 添加一个全新的大板块
  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`, // 生成唯一 ID
      title: "NEW SECTION",
      className: "overlap-section", // 默认给一个带动画的排版类名
      isDarkTheme: false,
      hideSidebars: false,
      blocks: [] // 初始图文块为空，让用户自己点添加
    };
    const newSections = [...formData.sections, newSection];
    setFormData({ ...formData, sections: newSections });
    // 自动展开刚刚新建的这个板块
    setExpandedSection(newSections.length - 1);
  };

  // 2. 删除整个大板块
  const removeSection = (sIdx: number) => {
    if (confirm("⚠️ 危险操作：确定要删除整个大板块及其包含的所有图文吗？此操作不可恢复！")) {
      const newSections = [...formData.sections];
      newSections.splice(sIdx, 1);
      setFormData({ ...formData, sections: newSections });
      setExpandedSection(null); // 删除后收起所有手风琴
    }
  };

  // ==========================================
  // 🚀 Block 内部图文块操作逻辑
  // ==========================================
  const updateSection = (sIdx: number, field: string, value: any) => {
    const newSections = [...formData.sections];
    newSections[sIdx] = { ...newSections[sIdx], [field]: value };
    setFormData({ ...formData, sections: newSections });
  };

  const updateBlock = (sIdx: number, bIdx: number, field: string, value: any) => {
    const newSections = [...formData.sections];
    const newBlocks = [...newSections[sIdx].blocks];
    newBlocks[bIdx] = { ...newBlocks[bIdx], [field]: value };
    newSections[sIdx].blocks = newBlocks;
    setFormData({ ...formData, sections: newSections });
  };

  const addBlock = (sIdx: number) => {
    const newSections = [...formData.sections];
    newSections[sIdx].blocks.push({
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
    });
    setFormData({ ...formData, sections: newSections });
  };

  const removeBlock = (sIdx: number, bIdx: number) => {
    if (confirm("确定要删除这个图文块吗？")) {
      const newSections = [...formData.sections];
      newSections[sIdx].blocks.splice(bIdx, 1);
      setFormData({ ...formData, sections: newSections });
    }
  };

  if (!formData) return <div className="p-10 font-mono animate-pulse">Loading System Core...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32">
      
      {/* 头部区域 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sticky top-0 bg-[#f8f9fa] pt-4 pb-6 z-50">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">主页定制中心</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">实时修改前台 Showcase 页面的文案、排版与图片</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full text-sm font-bold hover:opacity-80 transition active:scale-95 shadow-md disabled:opacity-50"
        >
          <CheckCircleIcon className="w-5 h-5" />
          {isSaving ? "Publishing..." : "发布更新 (Publish)"}
        </button>
      </div>

      {/* 主体卡片 */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* Tab 导航 */}
        <div className="flex border-b border-gray-100 px-4 pt-4 gap-2 bg-gray-50/50 overflow-x-auto hide-scrollbar">
          <TabButton active={activeTab === 'hero'} onClick={() => setActiveTab('hero')} icon={<ViewColumnsIcon className="w-4 h-4" />} text="首屏巨幕 (Hero)" />
          <TabButton active={activeTab === 'vision'} onClick={() => setActiveTab('vision')} icon={<PhotoIcon className="w-4 h-4" />} text="视觉遮罩 (Vision)" />
          <TabButton active={activeTab === 'sections'} onClick={() => setActiveTab('sections')} icon={<QueueListIcon className="w-4 h-4" />} text="模块矩阵 (Sections)" />
        </div>

        <div className="p-6 md:p-8">
          
          {/* ==================== 1. Hero 设置 ==================== */}
          {activeTab === 'hero' && (
             <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">巨型标题阵列 (Title Array)</label>
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
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black font-black uppercase text-xl"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">子标题箴言 (Subtitle)</label>
                <textarea 
                  value={formData.hero.subtitle}
                  onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, subtitle: e.target.value } })}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black font-medium text-sm h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">按钮文字</label>
                  <input type="text" value={formData.hero.btnText} onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, btnText: e.target.value } })} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black text-sm font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">跳转链接</label>
                  <input type="text" value={formData.hero.btnLink} onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, btnLink: e.target.value } })} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black text-sm font-mono" />
                </div>
              </div>
            </div>
          )}

          {/* ==================== 2. Vision 设置 ==================== */}
          {activeTab === 'vision' && (
             <div className="space-y-6 max-w-2xl">
               <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">背景遮罩文字</label>
                  <input type="text" value={formData.vision.title} onChange={(e) => setFormData({ ...formData, vision: { ...formData.vision, title: e.target.value } })} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black font-black uppercase text-2xl" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">背景图片 URL / 路径</label>
                  <input type="text" value={formData.vision.image} onChange={(e) => setFormData({ ...formData, vision: { ...formData.vision, image: e.target.value } })} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black font-mono text-sm" />
                  <div className="mt-6 aspect-[21/9] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                     <img src={formData.vision.image} alt="Vision Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
            </div>
          )}

          {/* ==================== 3. 可视化图文矩阵引擎 ==================== */}
          {activeTab === 'sections' && (
            <div className="space-y-6">
              
              {formData.sections.map((section: any, sIdx: number) => (
                <div key={section.id || sIdx} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                  
                  {/* 手风琴头部 (Section 控制) */}
                  <div 
                    className="flex items-center justify-between p-4 md:p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setExpandedSection(expandedSection === sIdx ? null : sIdx)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                        S{sIdx + 1}
                      </div>
                      <div>
                        <h3 className="font-black text-lg uppercase tracking-tight">{section.title}</h3>
                        <p className="text-xs text-gray-500 font-medium mt-1">{section.blocks.length} 个图文模块</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* 🚀 核心补充：删除整个大板块的按钮 */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeSection(sIdx); }} 
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除整个大板块"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-2"></div>
                      <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === sIdx ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* 手风琴内容 (Blocks 控制) */}
                  {expandedSection === sIdx && (
                    <div className="p-4 md:p-6 border-t border-gray-200 bg-white space-y-8">
                      
                      {/* Section 全局配置 */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-gray-100">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">板块标题 (Section Title)</label>
                          <input type="text" value={section.title} onChange={(e) => updateSection(sIdx, 'title', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border-none rounded-lg text-sm font-bold uppercase focus:ring-2 focus:ring-black" />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <input type="checkbox" id={`dark-${sIdx}`} checked={section.isDarkTheme} onChange={(e) => updateSection(sIdx, 'isDarkTheme', e.target.checked)} className="rounded text-black focus:ring-black w-4 h-4" />
                          <label htmlFor={`dark-${sIdx}`} className="text-sm font-bold cursor-pointer select-none">黑白反色触发器 (Invert Theme)</label>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <input type="checkbox" id={`hide-${sIdx}`} checked={section.hideSidebars} onChange={(e) => updateSection(sIdx, 'hideSidebars', e.target.checked)} className="rounded text-black focus:ring-black w-4 h-4" />
                          <label htmlFor={`hide-${sIdx}`} className="text-sm font-bold cursor-pointer select-none">画廊模式 (Hide Sidebars)</label>
                        </div>
                      </div>

                      {/* Blocks 列表 */}
                      <div className="space-y-6">
                        {section.blocks.length === 0 && (
                          <div className="text-center py-10 text-gray-400 text-sm font-medium border-2 border-dashed border-gray-100 rounded-xl">
                            当前板块还没有任何内容，点击下方按钮添加吧！
                          </div>
                        )}

                        {section.blocks.map((block: any, bIdx: number) => (
                          <div key={bIdx} className="bg-gray-50 rounded-xl p-5 border border-gray-100 relative">
                            
                            {/* 删除图文块按钮 */}
                            <button onClick={() => removeBlock(sIdx, bIdx)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <TrashIcon className="w-5 h-5" />
                            </button>
                            
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-xs font-black text-gray-400">BLOCK {bIdx + 1}</span>
                              <div className="h-px bg-gray-200 flex-1 mx-2"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* 左侧：文字设置 */}
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">排版模式 (Layout)</label>
                                  <select 
                                    value={block.layout} 
                                    onChange={(e) => updateBlock(sIdx, bIdx, 'layout', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border-none rounded-lg text-sm font-bold shadow-sm focus:ring-2 focus:ring-black cursor-pointer"
                                  >
                                    <option value="left-img">左图右文 (Left Image)</option>
                                    <option value="right-img">右图左文 (Right Image)</option>
                                    <option value="center-img">居中大图 (Center Full)</option>
                                  </select>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">副标题 (Subtitle)</label>
                                    <input type="text" value={block.subtitle} onChange={(e) => updateBlock(sIdx, bIdx, 'subtitle', e.target.value)} className="w-full px-3 py-2 bg-white border-none rounded-lg text-sm font-mono shadow-sm" />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">底部小标签 (Tag)</label>
                                    <input type="text" value={block.tag} onChange={(e) => updateBlock(sIdx, bIdx, 'tag', e.target.value)} className="w-full px-3 py-2 bg-white border-none rounded-lg text-sm font-mono shadow-sm" />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">主标题 (Main Title)</label>
                                  <input type="text" value={block.title} onChange={(e) => updateBlock(sIdx, bIdx, 'title', e.target.value)} className="w-full px-3 py-2 bg-white border-none rounded-lg text-lg font-black uppercase shadow-sm focus:ring-2 focus:ring-black" />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">正文描述 (Description)</label>
                                  <textarea value={block.desc} onChange={(e) => updateBlock(sIdx, bIdx, 'desc', e.target.value)} className="w-full px-3 py-2 bg-white border-none rounded-lg text-sm shadow-sm h-32 resize-none focus:ring-2 focus:ring-black" />
                                </div>
                              </div>

                              {/* 右侧：图片设置 */}
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">图片链接 (Image URL)</label>
                                  <input type="text" value={block.imgSrc} onChange={(e) => updateBlock(sIdx, bIdx, 'imgSrc', e.target.value)} className="w-full px-3 py-2 bg-white border-none rounded-lg text-xs font-mono shadow-sm focus:ring-2 focus:ring-black" placeholder="/uploads/..." />
                                </div>
                                <div className="aspect-[4/3] w-full bg-gray-200 rounded-xl overflow-hidden shadow-inner border border-gray-100 flex items-center justify-center">
                                  {block.imgSrc ? (
                                    <img src={block.imgSrc} alt="preview" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-xs text-gray-400 font-bold uppercase">No Image</span>
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
                        className="w-full py-4 mt-4 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:text-black hover:border-black hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <PlusIcon className="w-5 h-5" />
                        在 {section.title} 中添加新图文模块
                      </button>

                    </div>
                  )}
                </div>
              ))}

              {/* 🚀 核心补充：添加一个全新的大板块按钮 */}
              <button 
                onClick={addSection}
                className="w-full py-6 mt-8 border-2 border-dashed border-gray-300 rounded-2xl text-base font-black text-gray-400 hover:text-black hover:border-black hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 uppercase tracking-widest"
              >
                <FolderPlusIcon className="w-6 h-6 stroke-2" />
                新增全新大板块 (Add New Section)
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, text }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-t-xl text-sm font-bold transition-all whitespace-nowrap ${
        active ? 'bg-white text-black shadow-[0_-4px_10px_rgba(0,0,0,0.02)] border-x border-t border-gray-100 relative top-[1px]' : 'text-gray-400 hover:text-gray-600 border border-transparent'
      }`}
    >
      {icon} {text}
    </button>
  );
}