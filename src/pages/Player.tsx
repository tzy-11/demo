import React, { useState, useEffect } from 'react';
import { useInteractionStore } from '../stores/interactionStore';
import { claudeAPI } from '../ai/narrative-engine/claude-api';
import { PromptBuilder } from '../ai/prompt-templates/prompt-builder';
import { ChoicePanel } from '../components/ChoicePanel';
import { SaveLoadManager } from '../components/SaveLoadManager';
import type { StoryNode, Choice } from '../types/interaction';
import { v4 as uuidv4 } from 'uuid';

interface GameSettings {
  genre: string;
  customGenre: string;
  background: string;
  customBackground: string;
  character: string;
  customCharacter: string;
  style: string;
  customStyle: string;
}

const Player: React.FC = () => {
  const {
    currentNodeId,
    nodes,
    error,
    initStory,
    makeChoice,
    addPreloadedNode,
    resetStory,
    clearError,
    loadStory
  } = useInteractionStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  const [saveLoadManager, setSaveLoadManager] = useState({
    isOpen: false,
    mode: 'save' as 'save' | 'load'
  });

  const [gameSettings, setGameSettings] = useState<GameSettings>({
    genre: 'adventure',
    customGenre: '',
    background: 'castle',
    customBackground: '',
    character: 'warrior',
    customCharacter: '',
    style: 'dark',
    customStyle: ''
  });

  // 从本地存储自动加载上次的设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('lastGameSettings');
    if (savedSettings) {
      try {
        setGameSettings(JSON.parse(savedSettings));
      } catch (e) {}
    }
  }, []);

  const settingOptions = {
    genres: [
      { value: 'adventure', label: '奇幻冒险', desc: '探索未知，斩妖除魔' },
      { value: 'romance', label: '恋爱日常', desc: '心跳加速，甜虐交织' },
      { value: 'suspense', label: '悬疑推理', desc: '拨开迷雾，寻找真相' },
      { value: 'scifi', label: '科幻星辰', desc: '未来科技，星际史诗' },
      { value: 'wuxia', label: '武侠江湖', desc: '刀光剑影，快意恩仇' },
      { value: 'workplace', label: '职场生存', desc: '步步为营，升职加薪' }
    ],
    backgrounds: [
      { value: 'castle', label: '古老城堡', desc: '阴森的古堡，隐藏着秘密' },
      { value: 'school', label: '青春校园', desc: '充满阳光与八卦的学园' },
      { value: 'spaceship', label: '虚空飞船', desc: '航行于星际间的巨舰' },
      { value: 'city', label: '赛博都市', desc: '霓虹闪烁的未来犯罪都市' },
      { value: 'office', label: '高档写字楼', desc: '暗流涌动的商业中心' }
    ],
    characters: [
      { value: 'warrior', label: '战斗专家', desc: '身手不凡，擅长物理说服' },
      { value: 'detective', label: '敏锐侦探', desc: '观察力极强，善于推理' },
      { value: 'student', label: '普通学生', desc: '看似平凡，实则暗藏玄机' },
      { value: 'hacker', label: '极客黑客', desc: '精通技术，能入侵任何网络' },
      { value: 'rookie', label: '职场新人', desc: '初出茅庐，渴望证明自己' }
    ],
    styles: [
      { value: 'dark', label: '暗黑压抑', desc: '绝望、恐怖、充满未知' },
      { value: 'epic', label: '热血高燃', desc: '宏大、刺激、充满激情' },
      { value: 'sweet', label: '轻松高甜', desc: '幽默、治愈、疯狂撒糖' },
      { value: 'comedy', label: '沙雕搞笑', desc: '无厘头、脑洞大开、反套路' }
    ]
  };

  const getCurrentStyle = () => {
    let genreDesc = settingOptions.genres.find(g => g.value === gameSettings.genre)?.label;
    if (gameSettings.genre === 'custom') genreDesc = gameSettings.customGenre.trim() || '奇幻冒险';

    let styleDesc = settingOptions.styles.find(s => s.value === gameSettings.style)?.label;
    if (gameSettings.style === 'custom') styleDesc = gameSettings.customStyle.trim() || '跌宕起伏';

    return `${genreDesc}题材（${styleDesc}的基调）`;
  };

  const generateStartPrompt = (settings: GameSettings): string => {
    let bg = settingOptions.backgrounds.find(b => b.value === settings.background)?.label;
    if (settings.background === 'custom') bg = settings.customBackground.trim() || '神秘的未知之地';

    let char = settingOptions.characters.find(c => c.value === settings.character)?.label;
    if (settings.character === 'custom') char = settings.customCharacter.trim() || '无名主角';

    const openingHooks = [
      "In Media Res (半路杀出)：故事开始时，你正处于一场极其激烈的冲突或尴尬的危机之中，必须立刻做出反应。",
      "神秘物品：你正盯着手中一件极不寻常的物品，它刚刚触发了某种异象或引出了一个大麻烦。",
      "致命谎言/秘密：你刚刚无意中发现了一个巨大的秘密（或骗局），而这个秘密正要改变你的命运。",
      "反客为主：你原本在执行一项日常行动，但突然间局势反转，你陷入了完全被动的局面。",
      "突如其来的访客：一个举止极其怪异（或带着满身麻烦）的人突然闯入你的视线，并强行把你卷入事件。",
      "异象骤起：原本平静的环境中，突然发生了某种打破常识的变故，周围人都在恐慌或震惊，而你首当其冲。",
      "黑色幽默：故事以一个极其荒诞、滑稽但又暗藏危机的误会作为开场。"
    ];
    
    const randomHook = openingHooks[Math.floor(Math.random() * openingHooks.length)];

    return `游戏设定：玩家扮演【${char}】，当前所处环境是【${bg}】。

请你作为剧本杀导演，使用以下“切入手法”来开场：
【${randomHook}】

核心要求：
1. 不要写任何多余的背景铺垫和自我介绍，直接把你抽到的“切入手法”砸向玩家。
2. 营造出符合当前题材的强烈画面感（如恋爱的拉扯感、悬疑的紧张感等）。
3. 把这个情境生动地描写出来，然后在这个关键的冲突点停下，交给玩家选择。`;
  };

  const handleStartGame = async () => {
    setIsGenerating(true);
    setGameStarted(true);
    localStorage.setItem('lastGameSettings', JSON.stringify(gameSettings));
    
    try {
      const prompt = generateStartPrompt(gameSettings);
      const combinedStyleForAI = getCurrentStyle();
      
      const response = await claudeAPI.generateStory({
        prompt: prompt,
        style: combinedStyleForAI
      });

      const choices: Choice[] = response.options ? response.options.map(opt => ({
        id: uuidv4(),
        text: opt.replace(/^\d+\.\s*/, '').trim(),
        hint: ''
      })) : [];

      const initialNode: StoryNode = {
        id: uuidv4(),
        title: '序章：变局',
        content: response.story,
        choices: choices.length > 0 ? choices : [{ id: uuidv4(), text: '静观其变', hint: '' }],
        parentId: null,
        createdAt: Date.now()
      };
      initStory(initialNode);
    } catch (err) {
      console.error('开局生成失败:', err);
      setGameStarted(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChoiceSelect = async (choiceId: string) => {
    const currentNode = currentNodeId ? nodes[currentNodeId] : null;
    if (!currentNode) return;
    const selectedChoice = currentNode.choices.find(c => c.id === choiceId);
    if (!selectedChoice) return;

    setIsGenerating(true);
    try {
      const prompt = PromptBuilder.buildContinuationPrompt(
        `${currentNode.content}\n\n玩家做出了选择：【${selectedChoice.text}】`,
        getCurrentStyle()
      );
      const response = await claudeAPI.generateStory({
        prompt: prompt,
        style: getCurrentStyle()
      });

      const optionList = response.options || [];
      const newChoices: Choice[] = optionList.map(optText => ({
        id: uuidv4(),
        text: optText.replace(/^\d+\.\s*/, '').trim(),
        hint: 'AI 动态推演的选项'
      }));

      const newNode: StoryNode = {
        id: uuidv4(),
        title: `第 ${Object.keys(nodes).length + 1} 章`,
        content: response.story || '剧情正在生成中...',
        choices: newChoices.length > 0 ? newChoices : [{ id: uuidv4(), text: '继续', hint: '' }],
        parentId: currentNode.id,
        createdAt: Date.now()
      };
      addPreloadedNode(choiceId, newNode);
      makeChoice(choiceId);
    } catch (err) {
      console.error('剧情生成失败:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRestart = () => {
    resetStory();
    setGameStarted(false);
    setIsGenerating(false);
  };

  const handleSave = () => {
    if (!currentNodeId) {
      alert('当前没有可保存的游戏进度。');
      return;
    }
    setSaveLoadManager({ isOpen: true, mode: 'save' });
  };

  const handleLoad = () => {
    setSaveLoadManager({ isOpen: true, mode: 'load' });
  };

  // ✅ 修复：读档函数完整修复
  const handleSaveGame = (slotId: string, name: string, data: { currentNodeId: string; nodes: Record<string, StoryNode> }) => {
    const saveData = {
      ...data,
      gameSettings,
      saveName: name,
      timestamp: Date.now()
    };
    localStorage.setItem(`storySave_${slotId}`, JSON.stringify(saveData));
    setSaveLoadManager(prev => ({ ...prev, isOpen: false }));
  };

  // ✅ 修复：读档成功后自动进入游戏
  const handleLoadGame = (slotId: string) => {
    const saveDataString = localStorage.getItem(`storySave_${slotId}`);
    if (!saveDataString) {
      alert('存档不存在或已损坏');
      return;
    }

    try {
      const parsed = JSON.parse(saveDataString);
      const { currentNodeId: savedNodeId, nodes: savedNodes, gameSettings: savedSettings } = parsed;

      if (savedNodeId && savedNodes) {
        loadStory(savedNodeId, savedNodes);
        if (savedSettings) setGameSettings(savedSettings);
        setGameStarted(true);
        setSaveLoadManager(prev => ({ ...prev, isOpen: false }));
      } else {
        alert('存档数据不完整');
      }
    } catch (err) {
      console.error(err);
      alert('读取失败：数据格式错误');
    }
  };

  const currentNode = currentNodeId ? nodes[currentNodeId] : null;

  // ✅ 新增：选中选项高亮特效
  const renderOptionButton = (
    type: keyof GameSettings,
    value: string,
    label: string,
    desc: string
  ) => {
    const isSelected = gameSettings[type] === value;
    return (
      <button
        key={value}
        type="button"
        onClick={() => setGameSettings(prev => ({ ...prev, [type]: value }))}
        className={`p-5 rounded-xl border text-left transition-all duration-300 hover:scale-[1.02] ${
          isSelected 
            ? 'border-[#6d28d9] bg-gradient-to-r from-[#6d28d9] to-[#9333ea] text-white shadow-lg scale-[1.02]' 
            : 'border-gray-200 bg-white hover:bg-gray-100'
        }`}
      >
        <div className={`font-bold text-lg mb-1 ${isSelected ? 'text-white' : 'text-[#1e1b4b]'}`}>
          {label}
        </div>
        {desc && (
          <div className={`text-sm ${isSelected ? 'text-gray-200' : 'text-gray-600'}`}>
            {desc}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#f8f4ff] to-[#f0e8ff] text-[#1e1b4b] overflow-x-hidden relative">
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="fixed top-6 right-6 z-50">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-red-600 font-bold text-lg mb-1">出错了</h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  <button 
                    onClick={clearError}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-xl border border-red-200"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!gameStarted && !currentNodeId ? (
          <div className="animate-fade-in-up">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-[#1e1b4b]">
                故事织梦者
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                选择题材与设定，AI 将为你编织独一无二的互动剧情
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-lg">
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <span className="text-black font-bold">1</span>
                  </div>
                  <h3 className="text-2xl font-bold text-black">选择题材</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {settingOptions.genres.map(g => renderOptionButton('genre', g.value, g.label, g.desc))}
                  {renderOptionButton('genre', 'custom', '自定义题材', '脑洞大开...')}
                </div>
                {gameSettings.genre === 'custom' && (
                  <div className="mt-6">
                    <input
                      type="text"
                      placeholder="请输入题材（例如：无限流、废土生存、宫斗权谋...）"
                      value={gameSettings.customGenre}
                      onChange={e => setGameSettings(prev => ({ ...prev, customGenre: e.target.value }))}
                      className="w-full px-6 py-4 bg-white border border-gray-300 rounded-2xl text-black placeholder-gray-400"
                    />
                  </div>
                )}
              </div>

              <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <span className="text-black font-bold">2</span>
                  </div>
                  <h3 className="text-2xl font-bold text-black">故事背景</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {settingOptions.backgrounds.map(bg => renderOptionButton('background', bg.value, bg.label, bg.desc))}
                  {renderOptionButton('background', 'custom', '自定义背景', '发挥想象...')}
                </div>
                {gameSettings.background === 'custom' && (
                  <div className="mt-6">
                    <input
                      type="text"
                      placeholder="请输入背景（例如：霍格沃茨魔法学校、19世纪伦敦...）"
                      value={gameSettings.customBackground}
                      onChange={e => setGameSettings(prev => ({ ...prev, customBackground: e.target.value }))}
                      className="w-full px-6 py-4 bg-white border border-gray-300 rounded-2xl text-black placeholder-gray-400"
                    />
                  </div>
                )}
              </div>

              <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <span className="text-black font-bold">3</span>
                  </div>
                  <h3 className="text-2xl font-bold text-black">扮演身份</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {settingOptions.characters.map(char => renderOptionButton('character', char.value, char.label, char.desc))}
                  {renderOptionButton('character', 'custom', '自定义身份', '专属人设...')}
                </div>
                {gameSettings.character === 'custom' && (
                  <div className="mt-6">
                    <input
                      type="text"
                      placeholder="请输入身份（例如：霸道总裁、隐世剑客、时间旅行者...）"
                      value={gameSettings.customCharacter}
                      onChange={e => setGameSettings(prev => ({ ...prev, customCharacter: e.target.value }))}
                      className="w-full px-6 py-4 bg-white border border-gray-300 rounded-2xl text-black placeholder-gray-400"
                    />
                  </div>
                )}
              </div>

              <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <span className="text-black font-bold">4</span>
                  </div>
                  <h3 className="text-2xl font-bold text-black">叙事风格</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {settingOptions.styles.map(style => renderOptionButton('style', style.value, style.label, ''))}
                  {renderOptionButton('style', 'custom', '自定义', '')}
                </div>
                 {gameSettings.style === 'custom' && (
                  <div className="mt-6">
                    <input
                      type="text"
                      placeholder="请输入叙事风格（例如：克苏鲁神话风、王道热血漫风...）"
                      value={gameSettings.customStyle}
                      onChange={e => setGameSettings(prev => ({ ...prev, customStyle: e.target.value }))}
                      className="w-full px-6 py-4 bg-white border border-gray-300 rounded-2xl text-black placeholder-gray-400"
                    />
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleStartGame}
                  disabled={isGenerating}
                  className="w-full py-6 bg-gradient-to-r from-[#6d28d9] to-[#9333ea] text-white rounded-2xl font-bold text-xl hover:from-[#5b21b6] hover:to-[#7e22ce] transition-all shadow-lg hover:shadow-xl"
                >
                  {isGenerating ? 'AI 正在生成...' : '揭开帷幕'}
                </button>
                
                <button
                  type="button"
                  onClick={handleLoad}
                  className="w-full mt-4 py-4 text-gray-600 hover:text-[#6d28d9] hover:bg-gray-50 rounded-2xl font-medium"
                >
                  读取本地存档
                </button>
              </div>
            </div>
          </div>
        ) : (
          currentNode && (
            <div className="animate-fade-in-up">
              <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-[#1e1b4b] mb-2">互动阅读</h1>
                  <p className="text-gray-600">每一个选择都会引发不可预知的蝴蝶效应</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleSave} 
                    disabled={isGenerating} 
                    className="px-5 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-[#1e1b4b] rounded-xl font-medium"
                  >
                    存档
                  </button>
                  <button 
                    onClick={handleLoad} 
                    disabled={isGenerating} 
                    className="px-5 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-[#1e1b4b] rounded-xl font-medium"
                  >
                    读档
                  </button>
                  <button 
                    onClick={handleRestart} 
                    disabled={isGenerating} 
                    className="px-5 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-[#1e1b4b] rounded-xl font-medium"
                  >
                    重置
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-lg">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
                  <span className="text-gray-500 font-mono text-sm tracking-wider uppercase">
                    {currentNode.title}
                  </span>
                </div>

                <div className="mb-12">
                  <p className="text-[#1e1b4b] leading-relaxed text-xl md:text-2xl whitespace-pre-wrap">
                    {currentNode.content}
                  </p>
                </div>

                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 border-t-[#6d28d9]" />
                    <span className="mt-6 text-gray-600 font-medium text-lg">AI 正在生成剧情...</span>
                  </div>
                ) : (
                  <ChoicePanel choices={currentNode.choices} onSelect={handleChoiceSelect} />
                )}
              </div>
            </div>
          )
        )}

        {!currentNode && gameStarted && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-black" />
            <span className="mt-8 text-gray-600 font-medium text-xl">加载中...</span>
          </div>
        )}
      </div>
      
      <SaveLoadManager
        isOpen={saveLoadManager.isOpen}
        onClose={() => setSaveLoadManager({ ...saveLoadManager, isOpen: false })}
        mode={saveLoadManager.mode}
        currentNodeId={currentNodeId}
        nodes={nodes}
        onSave={handleSaveGame}
        onLoad={handleLoadGame}
      />

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Player;