import React, { useState, useEffect } from 'react';
// 注意：这里的路径请确认与你实际的文件路径一致
import AIAPI from '../ai/narrative-engine/claude-api'; 
import { storyStyles } from '../ai/prompt-templates/styles';
import useStoryStore from '../stores/storyStore';

const Editor: React.FC = () => {
  // 核心状态
  const [aiAPI, setAIAPI] = useState<AIAPI | null>(null);
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 参数配置状态
  const [style, setStyle] = useState('default');
  const [maxLength, setMaxLength] = useState(1500);
  const [temperature, setTemperature] = useState(0.7);

  // 组件加载时自动初始化 AI (读取环境变量)
  useEffect(() => {
    try {
      const apiInstance = new AIAPI();
      setAIAPI(apiInstance);
    } catch (error) {
      console.error('初始化 AI 引擎失败:', error);
    }
  }, []);

  // 补全缺失的生成函数
  const handleGenerate = async () => {
    if (!aiAPI || !prompt.trim()) return;

    setIsGenerating(true);
    // 生成前清空旧数据
    setStory('');
    setOptions([]);
    setImagePrompt('');
    
    try {
      const response = await aiAPI.generateStory({
        prompt,
        style,
        maxLength,
        temperature
      });
      
      setStory(response.story);
      setOptions(response.options);
      setImagePrompt(response.imagePrompt || '');

      // 持久化保存故事
      const newStory = useStoryStore.getState().createStory(
        '新故事',
        '匿名',
        prompt
      );
      
      const rootNode = useStoryStore.getState().getRootNode(newStory.id);
      if (rootNode) {
        useStoryStore.getState().updateNodeContent(
          rootNode.id,
          response.story,
          response.imagePrompt
        );
        
        // 添加选项
        response.options.forEach(optionText => {
          useStoryStore.getState().addOptionToNode(rootNode.id, {
            text: optionText,
            nextNodeId: null
          });
        });
      }
    } catch (error) {
      console.error('Error generating story:', error);
      setStory('生成故事时出错，请重试或检查环境变量配置。');
    } finally {
      setIsGenerating(false);
    }
  };

  // 如果 AI 还没初始化好，给个过渡状态
  if (!aiAPI) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center text-gray-600 dark:text-gray-400">
        正在连接创作引擎，请稍候...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">创作工作台</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            故事起点
          </label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="输入故事的起点，例如：一个侦探在雨夜接到神秘电话"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            故事风格
          </label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {Object.entries(storyStyles).map(([key, styleItem]) => (
              <option key={key} value={key}>
                {styleItem.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {storyStyles[style]?.description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              故事长度
            </label>
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={maxLength}
              onChange={(e) => setMaxLength(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>500</span>
              <span>{maxLength}</span>
              <span>3000</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              创意程度
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>保守</span>
              <span>{temperature.toFixed(1)}</span>
              <span>创意</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? '生成中...' : '一键生成故事'}
        </button>
      </div>
      
      {/* 渲染生成结果 */}
      {story && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">生成的故事</h2>
            <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
              {story}
            </div>
          </div>
          
          {options.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">故事选项</h2>
              <ul className="space-y-2">
                {options.map((option, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-purple-600 dark:text-purple-400 font-medium">{index + 1}.</span>
                    <span className="text-gray-800 dark:text-gray-200">{option}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {imagePrompt && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">图像提示词</h2>
              <p className="text-gray-800 dark:text-gray-200">
                {imagePrompt}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Editor;