import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// StoryWeaver 风格的 Home 页面

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [sampleStory, setSampleStory] = useState('');

  const generateSampleStory = async () => {
    setIsGenerating(true);
    setSampleStory('');
    
    // 模拟 AI 生成过程
    setTimeout(() => {
      setSampleStory(`在一个风雨交加的夜晚，侦探李明独自坐在办公室里，突然电话铃声响起。

"喂？"李明接起电话。

"你好，李侦探。我知道你在调查那个失踪案，"电话那头传来一个低沉的声音，"小心点，他们已经注意到你了。"

"你是谁？你怎么知道我在调查什么？"李明警惕地问道。

但电话已经挂断了。李明看着桌上的案件资料，陷入了沉思。这个神秘电话似乎证实了他的猜测 - 这个案子比表面上看起来要复杂得多。

【你的选择】：
1. 继续调查，寻找更多线索
2. 暂时停止调查，避免危险
3. 联系警方，寻求帮助
4. 追踪这个神秘电话的来源`);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen">
      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* 头部区域 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-6 leading-tight">
            让每一个选择，编织出独一无二的故事
          </h1>
          <p className="text-stone-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            基于 AI 的互动小说创作平台，拒绝千篇一律的网文套路，利用大模型实时生成深度叙事内容。
          </p>
        </div>

        {/* 搜索 / Prompt 栏 */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              placeholder="输入一句话，生成你的 AI 故事..." 
              className="flex-1 px-6 py-4 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
            />
            <button className="px-8 py-4 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors">
              生成故事
            </button>
          </div>
        </div>

        {/* 生成结果展示区 */}
        {sampleStory && (
          <div className="max-w-4xl mx-auto mb-16 bg-white border border-stone-200 rounded-lg p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-stone-900 animate-pulse"></div>
              <h3 className="text-sm font-bold text-stone-600 tracking-widest uppercase">AI 故事预览</h3>
            </div>
            <div className="whitespace-pre-wrap text-stone-900 leading-relaxed font-serif text-lg md:text-xl">
              {sampleStory}
            </div>
          </div>
        )}

        {/* 核心功能 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white border border-stone-200 rounded-lg p-8 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-stone-900 mb-4">深度文学叙事</h3>
            <p className="text-stone-600 leading-relaxed">
              拒绝"AI味"内容，通过精心调校的 Prompt 引导 AI 生成具有文学质感的叙事段落。
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-lg p-8 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-stone-900 mb-4">智能投机预加载</h3>
            <p className="text-stone-600 leading-relaxed">
              在用户阅读当前章节时，已在后台预先构思可能的后续分支，实现无缝衔接的阅读体验。
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-lg p-8 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-stone-900 mb-4">意境级插图</h3>
            <p className="text-stone-600 leading-relaxed">
              为每个章节自动生成符合语境的意境插图，增强故事的视觉表现力和沉浸感。
            </p>
          </div>
        </div>

        {/* 推荐故事 */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-stone-900">精选故事</h2>
            <Link to="/player" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
              查看全部 →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 推荐故事 1 */}
            <Link to="/player" className="group">
              <div className="aspect-[3/4] bg-stone-100 rounded-lg mb-4 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-stone-900 font-medium mb-1">霓虹余烬</h3>
              <p className="text-sm text-stone-500">科幻 / 赛博</p>
            </Link>

            {/* 推荐故事 2 */}
            <Link to="/player" className="group">
              <div className="aspect-[3/4] bg-stone-100 rounded-lg mb-4 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-stone-900 font-medium mb-1">星渊异客</h3>
              <p className="text-sm text-stone-500">奇幻 / 冒险</p>
            </Link>

            {/* 推荐故事 3 */}
            <Link to="/player" className="group">
              <div className="aspect-[3/4] bg-stone-100 rounded-lg mb-4 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-stone-900 font-medium mb-1">权利的游戏</h3>
              <p className="text-sm text-stone-500">历史 / 权谋</p>
            </Link>

            {/* 推荐故事 4 */}
            <Link to="/player" className="group">
              <div className="aspect-[3/4] bg-stone-100 rounded-lg mb-4 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
              </div>
              <h3 className="text-stone-900 font-medium mb-1">暗影迷踪</h3>
              <p className="text-sm text-stone-500">悬疑 / 推理</p>
            </Link>
          </div>
        </div>

        {/* 行动号召 */}
        <div className="bg-stone-100 rounded-lg p-12 text-center">
          <h2 className="text-2xl font-bold text-stone-900 mb-6">开始你的故事之旅</h2>
          <p className="text-stone-600 mb-8 max-w-2xl mx-auto">
            在这里，你不仅是读者，更是故事的造物主。每一个细微的选择都会触发剧情分支，构建出一个无限延展的文学宇宙。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/editor')}
              className="px-8 py-3 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors"
            >
              开始创作
            </button>
            <button
              onClick={generateSampleStory}
              disabled={isGenerating}
              className="px-8 py-3 border border-stone-300 text-stone-900 rounded-lg font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
            >
              {isGenerating ? '生成中...' : '预览故事'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;