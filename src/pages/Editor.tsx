import React, { useMemo, useState } from 'react';
import { claudeAPI } from '../ai/narrative-engine/claude-api';
import { PromptBuilder } from '../ai/prompt-templates/prompt-builder';
import { storyStyles } from '../ai/prompt-templates/styles';
import { saveStory } from '../db/stories';
import useMemoryStore from '../stores/memoryStore';
import useStoryStore from '../stores/storyStore';

const Editor: React.FC = () => {
  const [title, setTitle] = useState('长篇创作');
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [story, setStory] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [style, setStyle] = useState('default');
  const [maxLength, setMaxLength] = useState(1500);
  const [temperature, setTemperature] = useState(0.7);
  const [selectedMemoryIds, setSelectedMemoryIds] = useState<string[]>([]);
  const [memoryQuery, setMemoryQuery] = useState('');
  const [storyId, setStoryId] = useState<string | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);

  const { characters, events, settings } = useMemoryStore((state) => ({
    characters: state.characters,
    events: state.events,
    settings: state.settings,
  }));

  const { createStory, getRootNode, updateNodeContent, addOptionToNode } = useStoryStore(
    (state) => ({
      createStory: state.createStory,
      getRootNode: state.getRootNode,
      updateNodeContent: state.updateNodeContent,
      addOptionToNode: state.addOptionToNode,
    })
  );

  const currentNode = useStoryStore(
    (state) => (currentNodeId ? state.nodes.find((node) => node.id === currentNodeId) : undefined)
  );

  type MemoryItem = {
    id: string;
    kind: '角色' | '事件' | '设定';
    label: string;
    summary: string;
  };

  const allMemories: MemoryItem[] = useMemo(() => {
    const characterMemories: MemoryItem[] = characters.map((character) => ({
      id: character.id,
      kind: '角色',
      label: character.name,
      summary: `${character.description}；性格：${character.personality.join('，')}`,
    }));

    const eventMemories: MemoryItem[] = events.map((event) => ({
      id: event.id,
      kind: '事件',
      label: event.title,
      summary: `${event.description}；地点：${event.location}`,
    }));

    const settingMemories: MemoryItem[] = settings.map((setting) => ({
      id: setting.id,
      kind: '设定',
      label: setting.name,
      summary: setting.description,
    }));

    return [...characterMemories, ...eventMemories, ...settingMemories];
  }, [characters, events, settings]);

  const filteredMemories = useMemo(() => {
    const keyword = memoryQuery.trim().toLowerCase();
    if (!keyword) return allMemories;
    return allMemories.filter((memory) =>
      memory.label.toLowerCase().includes(keyword) || memory.summary.toLowerCase().includes(keyword)
    );
  }, [allMemories, memoryQuery]);

  const selectedMemories = useMemo(
    () => allMemories.filter((memory) => selectedMemoryIds.includes(memory.id)),
    [allMemories, selectedMemoryIds]
  );

  const selectedMemoryText = useMemo(() => {
    if (selectedMemories.length === 0) return '';
    return selectedMemories
      .map((memory) => `${memory.kind}: ${memory.label}\n${memory.summary}`)
      .join('\n\n');
  }, [selectedMemories]);

  const handleToggleMemory = (memoryId: string) => {
    setSelectedMemoryIds((prev) =>
      prev.includes(memoryId) ? prev.filter((id) => id !== memoryId) : [...prev, memoryId]
    );
  };

  const buildStoryPrompt = () => {
    return PromptBuilder.buildStoryPrompt({
      style,
      prompt,
      context,
      memory: selectedMemoryText,
    });
  };

  const handleGenerate = async () => {
    if (!prompt) return;

    setIsGenerating(true);

    try {
      const finalPrompt = buildStoryPrompt();
      const response = await claudeAPI.generateStory({
        prompt: finalPrompt,
        style,
        maxLength,
        temperature,
      });

      setStory(response.story);
      setOptions(response.options || []);
      setImagePrompt(response.imagePrompt || '');

      await saveStory({
        prompt: finalPrompt,
        content: response.story,
        options: response.options,
        imagePrompt: response.imagePrompt || '',
        style,
      });
<<<<<<< HEAD
    } catch (error) {
      console.error('Error generating story:', error);
=======

      let currentStoryId = storyId;
      if (!currentStoryId) {
        const createdStory = createStory(title.trim() || '长篇创作', '作者', context || prompt);
        currentStoryId = createdStory.id;
        setStoryId(currentStoryId);
      }

      const rootNode = currentStoryId ? getRootNode(currentStoryId) : undefined;
      if (rootNode) {
        updateNodeContent(rootNode.id, response.story, response.imagePrompt || '');
        setCurrentNodeId(rootNode.id);
        response.options.forEach((option) => {
          addOptionToNode(rootNode.id, {
            text: option,
            nextNodeId: null,
          });
        });
      }
    } catch (error) {
      console.error('生成故事失败：', error);
>>>>>>> 54898c1 (增强 Editor，支持长篇创作记忆注入与续写功能)
      setStory('生成故事时出错，请重试。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = async () => {
    if (!currentNode) return;

    setIsGenerating(true);

    try {
      const continuationPrompt = PromptBuilder.buildContinuationPrompt(
        currentNode.content,
        style,
        selectedMemoryText,
        context
      );

      const response = await claudeAPI.generateStory({
        prompt: continuationPrompt,
        style,
        maxLength,
        temperature,
      });

      const nextContent = `${currentNode.content}\n\n${response.story}`;
      updateNodeContent(currentNode.id, nextContent, response.imagePrompt || currentNode.imagePrompt || '');
      setStory(nextContent);
      setOptions(response.options || []);
      setImagePrompt(response.imagePrompt || currentNode.imagePrompt || '');

      response.options.forEach((option) => {
        addOptionToNode(currentNode.id, {
          text: option,
          nextNodeId: null,
        });
      });
    } catch (error) {
      console.error('续写失败：', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedCount = selectedMemories.length;

  return (
<<<<<<< HEAD
    <div className="max-w-4xl mx-auto">
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
=======
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 mb-2">长篇创作工作台</h1>
            <p className="text-stone-600 max-w-2xl">
              通过记忆注入、上下文设定和续写操作，生成更连贯的长篇故事。
            </p>
>>>>>>> 54898c1 (增强 Editor，支持长篇创作记忆注入与续写功能)
          </div>
          <div className="text-right text-sm text-stone-500">当前记忆注入：{selectedCount} 条</div>
        </div>
<<<<<<< HEAD
        
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? '生成中...' : '一键生成故事'}
        </button>
      </div>
      
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
=======
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <div className="bg-white border border-stone-200 rounded-lg p-8 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">作品标题</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入作品标题，例如：午夜侦探日记"
                  className="w-full px-5 py-4 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">故事简介 / 背景</label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="输入故事背景设定，可辅助 AI 生成更一致的世界观"
                  className="w-full min-h-[150px] px-5 py-4 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-stone-700 mb-2">故事起点</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="例如：暴雨夜里，你在空旷的写字楼里发现了一张写着‘不要相信他’的便条。"
                className="w-full min-h-[140px] px-5 py-4 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
              />
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">故事风格</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-5 py-4 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                >
                  {Object.entries(storyStyles).map(([key, styleItem]) => (
                    <option key={key} value={key}>
                      {styleItem.name}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-stone-500">{storyStyles[style]?.description}</p>
              </div>
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">生成长度</label>
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
                  <label className="block text-sm font-medium text-stone-700 mb-2">创意程度</label>
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
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
                className="w-full sm:w-auto px-6 py-4 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? '生成中...' : '生成长篇故事'}
              </button>
              <button
                onClick={handleContinue}
                disabled={isGenerating || !currentNode}
                className="w-full sm:w-auto px-6 py-4 border border-stone-300 rounded-lg font-medium hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                继续续写当前章节
              </button>
            </div>
          </div>

          {story && (
            <div className="space-y-6">
              <div className="bg-white border border-stone-200 rounded-lg p-8 shadow-sm">
                <h2 className="text-xl font-semibold text-stone-900 mb-6">当前故事内容</h2>
                <div className="whitespace-pre-wrap text-stone-900 leading-relaxed font-serif">
                  {story}
                </div>
              </div>

              {options.length > 0 && (
                <div className="bg-white border border-stone-200 rounded-lg p-8 shadow-sm">
                  <h2 className="text-xl font-semibold text-stone-900 mb-6">生成选项</h2>
                  <ul className="space-y-4">
                    {options.map((option, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-stone-900 font-medium">{index + 1}.</span>
                        <span className="text-stone-700">{option}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {imagePrompt && (
                <div className="bg-white border border-stone-200 rounded-lg p-8 shadow-sm">
                  <h2 className="text-xl font-semibold text-stone-900 mb-6">图像提示词</h2>
                  <p className="text-stone-700">{imagePrompt}</p>
                </div>
              )}
>>>>>>> 54898c1 (增强 Editor，支持长篇创作记忆注入与续写功能)
            </div>
          )}
        </div>

        <aside className="space-y-8">
          <div className="bg-white border border-stone-200 rounded-lg p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-stone-900 mb-4">记忆注入</h2>
            <p className="text-sm text-stone-500 mb-6">
              从记忆库中选择角色、事件或设定，让 AI 在生成时保持世界观一致性。
            </p>

            <div className="mb-4">
              <input
                type="text"
                value={memoryQuery}
                onChange={(e) => setMemoryQuery(e.target.value)}
                placeholder="搜索记忆，例如：侦探、神秘电话、写字楼"
                className="w-full px-5 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
              />
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
              {filteredMemories.map((memory) => (
                <button
                  key={memory.id}
                  type="button"
                  onClick={() => handleToggleMemory(memory.id)}
                  className={`w-full text-left rounded-2xl border px-4 py-3 transition-colors ${
                    selectedMemoryIds.includes(memory.id)
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-stone-900">{memory.label}</div>
                      <div className="text-xs text-stone-500">{memory.kind}</div>
                    </div>
                    <div className="text-xs px-3 py-1 rounded-full bg-stone-100 text-stone-700">
                      {selectedMemoryIds.includes(memory.id) ? '已选' : '选择'}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-stone-600">{memory.summary}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-lg p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-stone-900 mb-4">已注入记忆</h2>
            {selectedMemories.length > 0 ? (
              <div className="space-y-3 text-sm text-stone-700">
                {selectedMemories.map((memory) => (
                  <div key={memory.id} className="rounded-2xl border border-stone-200 p-4 bg-stone-50">
                    <div className="font-semibold text-stone-900">{memory.label}</div>
                    <div className="text-stone-600">{memory.summary}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-500">暂无内存注入内容，请从上方选择记忆。</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Editor;
