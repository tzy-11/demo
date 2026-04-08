import React, { useState } from 'react';
import { useStoryStore } from '../stores/storyStore';

const Home: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sampleStory, setSampleStory] = useState('');

  // 引入 D 模块的核心操作方法和状态
  const createStory = useStoryStore((state) => state.createStory);
  const stories = useStoryStore((state) => state.stories);

  const generateSampleStory = async () => {
    setIsGenerating(true);
    // 模拟 AI 生成过程
    setTimeout(() => {
      setSampleStory(`
在一个风雨交加的夜晚，侦探李明独自坐在办公室里，突然电话铃声响起。

"喂？"李明接起电话。

"你好，李侦探。我知道你在调查那个失踪案，"电话那头传来一个低沉的声音，"小心点，他们已经注意到你了。"

"你是谁？你怎么知道我在调查什么？"李明警惕地问道。

但电话已经挂断了。李明看着桌上的案件资料，陷入了沉思。这个神秘电话似乎证实了他的猜测 - 这个案子比表面上看起来要复杂得多。

选择：
1. 继续调查，寻找更多线索
2. 暂时停止调查，避免危险
3. 联系警方，寻求帮助
4. 追踪这个神秘电话的来源
      `);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-6 text-purple-600 dark:text-purple-400">AI 叙事创作平台</h1>
        <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
          利用 AI 技术，轻松创作引人入胜的故事和互动叙事
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">AI 叙事生成</h3>
            <p className="text-gray-600 dark:text-gray-300">
              输入单行起点，AI 自动展开完整场景，支持多种风格和多结局生成
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">记忆跨度系统</h3>
            <p className="text-gray-600 dark:text-gray-300">
              智能记忆管理，保障长篇故事的连贯性和一致性
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">互动体验</h3>
            <p className="text-gray-600 dark:text-gray-300">
              动态选项生成，角色视角切换，打造沉浸式互动叙事
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-center">示例故事生成</h2>
        <p className="text-center mb-6 text-gray-600 dark:text-gray-300">
          点击下方按钮，体验 AI 生成故事的魔力
        </p>
        <div className="flex justify-center mb-6">
          <button
            onClick={generateSampleStory}
            disabled={isGenerating}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? '生成中...' : '生成示例故事'}
          </button>
        </div>
        {sampleStory && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <h3 className="text-lg font-semibold mb-2">生成的故事：</h3>
            <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
              {sampleStory}
            </div>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-4 text-center">开始你的创作之旅</h2>
        <p className="mb-6 text-center">
          无论你是专业作家还是业余爱好者，我们的平台都能帮助你释放创意
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a 
            href="/editor" 
            className="bg-white text-purple-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors text-center"
          >
            开始创作
          </a>
          <a 
            href="/player" 
            className="bg-transparent border border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white hover:text-purple-600 transition-colors text-center"
          >
            体验示例
          </a>
          <a 
            href="/memory" 
            className="bg-transparent border border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white hover:text-purple-600 transition-colors text-center"
          >
            管理记忆
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;