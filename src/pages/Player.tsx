import React, { useState, useEffect } from 'react';
import AIAPI from '../ai/narrative-engine/claude-api';
import useStoryStore, { type Story, type StoryNode, type StoryOption } from '../stores/storyStore';



const Player: React.FC = () => {
  const [aiAPI, setAIAPI] = useState<AIAPI | null>(null);
  const [storyBackground, setStoryBackground] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);
  const [showBackgroundForm, setShowBackgroundForm] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showLoadModal, setShowLoadModal] = useState(false);

  // 使用故事商店
  const { 
    createStory, 
    getStories, 
    getRootNode, 
    getNodeById, 
    addOptionToNode, 
    createNewNodeFromOption 
  } = useStoryStore();

  // 初始化智谱 AI 服务
  useEffect(() => {
    try {
      const apiInstance = new AIAPI();
      setAIAPI(apiInstance);
    } catch (error) {
      console.error('初始化 AI 服务失败:', error);
      alert('初始化 AI 服务失败，请检查环境变量配置');
    }
  }, []);

  const storyBackgrounds = [
    '奇幻世界：一个充满魔法的王国，你是一名年轻的魔法师',
    '科幻未来：2150年的太空殖民地，你是一名宇航员',
    '历史冒险：18世纪的海盗时代，你是一名海盗船长',
    '现代悬疑：现代都市，你是一名私家侦探',
    '武侠江湖：古代中国，你是一名武林高手'
  ];

  const handleBackgroundSelect = async (background: string) => {
    if (!aiAPI) {
      alert('AI 服务初始化中，请稍候');
      return;
    }

    setIsGenerating(true);
    try {
      // 创建新故事
      const story = createStory('互动故事', '匿名', background);
      
      // 生成初始场景
      const response = await aiAPI.generateStory({
        prompt: background,
        style: 'default',
        maxLength: 500,
        temperature: 0.7
      });

      // 生成初始选项
      const optionsResponse = await aiAPI.generateOptions({
        story: response.story,
        context: background
      });

      // 获取根节点
      const rootNode = getRootNode(story.id);
      if (!rootNode) throw new Error('根节点未找到');

      // 更新根节点内容
      useStoryStore.getState().updateNodeContent(rootNode.id, response.story, response.imagePrompt);

      // 添加选项
      optionsResponse.options.forEach(optionText => {
        addOptionToNode(rootNode.id, {
          text: optionText,
          nextNodeId: null
        });
      });

      // 更新当前节点
      const updatedRootNode = getNodeById(rootNode.id);
      if (updatedRootNode) {
        setCurrentNode(updatedRootNode);
      }

      setShowBackgroundForm(false);
    } catch (error) {
      console.error('生成故事失败:', error);
      alert('生成故事失败，请检查环境变量配置');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptionSelect = async (option: StoryOption) => {
    if (!currentNode || !aiAPI) return;

    setIsGenerating(true);
    try {
      // 构建新的上下文
      const newContext = `${currentNode.content}\n\n选择：${option.text}`;

      // 生成后续故事
      const response = await aiAPI.generateStory({
        prompt: newContext,
        style: 'default',
        maxLength: 500,
        temperature: 0.7
      });

      // 生成新的选项
      const optionsResponse = await aiAPI.generateOptions({
        story: response.story,
        context: newContext
      });

      // 创建新节点
      const newNode = createNewNodeFromOption(currentNode.storyId, option.id, {
        title: `章节 ${Date.now()}`,
        content: response.story,
        imagePrompt: response.imagePrompt
      });

      // 添加新选项到新节点
      optionsResponse.options.forEach(optionText => {
        addOptionToNode(newNode.id, {
          text: optionText,
          nextNodeId: null
        });
      });

      // 更新当前节点
      const updatedNode = getNodeById(newNode.id);
      if (updatedNode) {
        setCurrentNode(updatedNode);
      }
    } catch (error) {
      console.error('生成后续故事失败:', error);
      alert('生成后续故事失败，请检查环境变量配置');
    } finally {
      setIsGenerating(false);
    }
  };



  const handleCustomBackground = async () => {
    if (!storyBackground.trim()) return;
    await handleBackgroundSelect(storyBackground);
  };

  const handleBack = () => {
    // 这里可以实现回退功能，通过查找当前节点的父节点
    // 暂时留空
  };

  const handleSave = () => {
    if (!currentNode) return;
    setShowSaveModal(true);
  };

  const confirmSave = () => {
    if (!currentNode || !saveName.trim()) return;
    // 这里可以实现保存功能，通过更新故事信息
    useStoryStore.getState().updateStory(currentNode.storyId, {
      title: saveName.trim()
    });
    setShowSaveModal(false);
    setSaveName('');
  };

  const handleLoad = () => {
    setShowLoadModal(true);
  };

  const confirmLoad = (story: Story) => {
    const rootNode = getRootNode(story.id);
    if (rootNode) {
      setCurrentNode(rootNode);
      setShowBackgroundForm(false);
    }
    setShowLoadModal(false);
  };

  const deleteSave = (storyId: string) => {
    useStoryStore.getState().deleteStory(storyId);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">互动阅读</h1>

      {showBackgroundForm ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">选择故事背景</h2>
          
          <div className="space-y-3 mb-6">
            {storyBackgrounds.map((background, index) => (
              <button
                key={index}
                onClick={() => handleBackgroundSelect(background)}
                className="w-full text-left px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                {background}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              或输入自定义背景
            </label>
            <textarea
              value={storyBackground}
              onChange={(e) => setStoryBackground(e.target.value)}
              placeholder="输入你想要的故事背景..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              rows={3}
            />
          </div>

          <div className="flex space-x-3 mb-4">
            <button
              onClick={handleLoad}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
            >
              加载存档
            </button>
          </div>

          <button
            onClick={handleCustomBackground}
            disabled={isGenerating || !storyBackground.trim()}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? '生成中...' : '开始故事'}
          </button>
        </div>
      ) : currentNode ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {currentNode.title}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
              >
                存档
              </button>
              <button
                onClick={handleBack}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm transition-colors"
              >
                回退
              </button>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
              {currentNode.content}
            </p>
          </div>

          <div className="space-y-3">
            {currentNode.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option)}
                disabled={isGenerating}
                className="w-full text-left px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {option.text}
              </button>
            ))}
          </div>

          {isGenerating && (
            <div className="mt-4 text-center text-gray-600 dark:text-gray-400">
              生成中，请稍候...
            </div>
          )}

          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleLoad}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
            >
              加载存档
            </button>
            <button
              onClick={() => setShowBackgroundForm(true)}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
            >
              重新开始
            </button>
          </div>
        </div>
      ) : null}

      {/* 存档模态框 */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">保存游戏</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                存档名称
              </label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="输入存档名称..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmSave}
                disabled={!saveName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 读档模态框 */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">加载存档</h3>
            {getStories().length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 mb-4">暂无存档</p>
            ) : (
              <div className="space-y-3">
                {getStories().map((story) => (
                  <div key={story.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">{story.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(story.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => confirmLoad(story)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
                      >
                        加载
                      </button>
                      <button
                        onClick={() => deleteSave(story.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowLoadModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;