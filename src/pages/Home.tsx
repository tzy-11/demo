import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// StoryWeaver 风格的 Home 页面（无图标版）

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

        {/* 核心功能（已删除所有图标） */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white border border-stone-200 rounded-lg p-8 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-stone-900 mb-4">深度文学叙事</h3>
            <p className="text-stone-600 leading-relaxed">
              拒绝"AI味"内容，通过精心调校的 Prompt 引导 AI 生成具有文学质感的叙事段落。
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-lg p-8 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-stone-900 mb-4">智能投机预加载</h3>
            <p className="text-stone-600 leading-relaxed">
              在用户阅读当前章节时，已在后台预先构思可能的后续分支，实现无缝衔接的阅读体验。
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-lg p-8 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-stone-900 mb-4">意境级插图</h3>
            <p className="text-stone-600 leading-relaxed">
              为每个章节自动生成符合语境的意境插图，增强故事的视觉表现力和沉浸感。
            </p>
          </div>
        </div>

        {/* 推荐故事（已删除所有图标） */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-stone-900">精选故事</h2>
            <Link to="/player" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
              查看全部 →
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