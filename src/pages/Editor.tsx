import React, { useState } from 'react';
import { claudeAPI } from '../ai/narrative-engine/claude-api';
import { storyStyles } from '../ai/prompt-templates/styles';
import { saveStory } from '../db/stories';

const Editor: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [style, setStyle] = useState('default');
  const [maxLength, setMaxLength] = useState(1500);
  const [temperature, setTemperature] = useState(0.7);

  const handleGenerate = async () => {
    if (!prompt) return;
    
    setIsGenerating(true);
    
    try {
      const response = await claudeAPI.generateStory({
        prompt,
        style,
        maxLength,
        temperature
      });
      
      setStory(response.story);
      setOptions(response.options);
      setImagePrompt(response.imagePrompt || '');

      // 持久化保存故事
      await saveStory({
        prompt,
        content: response.story,
        options: response.options,
        imagePrompt: response.imagePrompt || '',
        style
      });
      console.error('Error generating story:', Error);
      setStory('生成故事时出错，请重试。');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-stone-900 mb-4">创作工作台</h1>
        <p className="text-stone-600">
          输入故事的起点，选择风格和参数，AI 将为你生成独特的互动小说。
        </p>
      </div>
      
      <div className="bg-white border border-stone-200 rounded-lg p-8 mb-8 shadow-sm">
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            故事起点
          </label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="输入故事的起点，例如：一个侦探在雨夜接到神秘电话"
            className="w-full px-6 py-4 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            故事风格
          </label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full px-6 py-4 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
          >
            {Object.entries(storyStyles).map(([key, styleItem]) => (
              <option key={key} value={key}>
                {styleItem.name}
              </option>
            ))}
          </select>
          <p className="mt-3 text-sm text-stone-500">
            {storyStyles[style]?.description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">
              故事长度
            </label>
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={maxLength}
              onChange={(e) => setMaxLength(Number(e.target.value))}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-stone-500 mt-2">
              <span>500</span>
              <span>{maxLength}</span>
              <span>3000</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">
              创意程度
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-stone-500 mt-2">
              <span>保守</span>
              <span>{temperature.toFixed(1)}</span>
              <span>创意</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className="w-full px-6 py-4 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              生成中...
            </>
          ) : (
            '一键生成故事'
          )}
        </button>
      </div>
      
      {story && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-lg p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-stone-900 mb-6">生成的故事</h2>
            <div className="whitespace-pre-wrap text-stone-900 leading-relaxed font-serif">
              {story}
            </div>
          </div>
          
          {options.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-lg p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-stone-900 mb-6">故事选项</h2>
              <ul className="space-y-4">
                {options.map((option, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-3 text-stone-900 font-medium">{index + 1}.</span>
                    <span className="text-stone-700">{option}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {imagePrompt && (
            <div className="bg-white border border-stone-200 rounded-lg p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-stone-900 mb-6">图像提示词</h2>
              <p className="text-stone-700">
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