import React, { useState } from 'react';

const Player: React.FC = () => {
  const [currentScene, setCurrentScene] = useState({
    id: 1,
    text: '在一个风雨交加的夜晚，你独自坐在办公室里，突然电话铃声响起。',
    options: [
      { id: 1, text: '接听电话', nextScene: 2 },
      { id: 2, text: '忽略电话', nextScene: 3 },
      { id: 3, text: '查看来电显示', nextScene: 4 }
    ]
  });

  interface Scene {
    id: number;
    text: string;
    options: { id: number; text: string; nextScene: number }[];
  }

  const handleOptionSelect = (nextSceneId: number) => {
    // 模拟场景切换
    const scenes: Record<number, Scene> = {
      2: {
        id: 2,
        text: '你接听了电话，电话那头传来一个低沉的声音："我知道你在调查什么，小心点。"然后电话挂断了。',
        options: [
          { id: 4, text: '追查电话号码', nextScene: 5 },
          { id: 5, text: '报警', nextScene: 6 }
        ]
      },
      3: {
        id: 3,
        text: '你忽略了电话，继续工作。过了一会儿，你收到了一封匿名邮件，内容是一张你家的照片。',
        options: [
          { id: 6, text: '查看邮件来源', nextScene: 7 },
          { id: 7, text: '回家检查', nextScene: 8 }
        ]
      },
      4: {
        id: 4,
        text: '你查看来电显示，发现是一个未知号码。你犹豫了一下，还是接听了电话。',
        options: [
          { id: 8, text: '询问对方身份', nextScene: 9 },
          { id: 9, text: '直接挂断', nextScene: 10 }
        ]
      }
    };

    if (scenes[nextSceneId]) {
      setCurrentScene(scenes[nextSceneId]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">互动播放器</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6">
          <p className="text-lg text-gray-800 dark:text-gray-200">
            {currentScene.text}
          </p>
        </div>
        
        <div className="space-y-3">
          {currentScene.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.nextScene)}
              className="w-full text-left px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Player;