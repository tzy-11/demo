import React, { useState } from 'react';
import useMemoryStore from '../stores/memoryStore';

const Memory: React.FC = () => {
  const { characters, events, settings, addCharacter, addEvent, addSetting } = useMemoryStore();
  const [showAddCharacterModal, setShowAddCharacterModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showAddSettingModal, setShowAddSettingModal] = useState(false);
  
  // 表单状态
  const [characterForm, setCharacterForm] = useState({
    name: '',
    description: '',
    personality: '',
    appearance: '',
    background: ''
  });
  
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    timestamp: '',
    location: '',
    characters: ''
  });
  
  const [settingForm, setSettingForm] = useState({
    name: '',
    description: '',
    type: 'location' as 'location' | 'rule' | 'item' | 'concept'
  });

  const handleAddCharacter = () => {
    if (characterForm.name && characterForm.description) {
      addCharacter({
        name: characterForm.name,
        description: characterForm.description,
        personality: characterForm.personality.split(',').map(t => t.trim()).filter(Boolean),
        appearance: characterForm.appearance,
        background: characterForm.background,
        relationships: [],
        emotionalState: {
          好感度: 50,
          信任度: 50,
          情绪: 'neutral'
        }
      });
      
      // 重置表单
      setCharacterForm({
        name: '',
        description: '',
        personality: '',
        appearance: '',
        background: ''
      });
      setShowAddCharacterModal(false);
    }
  };

  const handleAddEvent = () => {
    if (eventForm.title && eventForm.description) {
      addEvent({
        title: eventForm.title,
        description: eventForm.description,
        timestamp: eventForm.timestamp || new Date().toISOString(),
        location: eventForm.location,
        characters: eventForm.characters.split(',').map(c => c.trim()).filter(Boolean),
        importance: 50,
        伏笔: false,
        resolved: false
      });
      
      // 重置表单
      setEventForm({
        title: '',
        description: '',
        timestamp: '',
        location: '',
        characters: ''
      });
      setShowAddEventModal(false);
    }
  };

  const handleAddSetting = () => {
    if (settingForm.name && settingForm.description) {
      addSetting({
        name: settingForm.name,
        description: settingForm.description,
        type: settingForm.type,
        relevance: 50
      });
      
      // 重置表单
      setSettingForm({
        name: '',
        description: '',
        type: 'location'
      });
      setShowAddSettingModal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">记忆管理</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-3 text-purple-600 dark:text-purple-400">角色记忆</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            管理角色的设定、关系和情感状态
          </p>
          <button 
            onClick={() => setShowAddCharacterModal(true)}
            className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 py-2 rounded-md transition-colors"
          >
            添加角色
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400">情节记忆</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            记录关键事件、伏笔和世界观设定
          </p>
          <button 
            onClick={() => setShowAddEventModal(true)}
            className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 py-2 rounded-md transition-colors"
          >
            添加事件
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-3 text-green-600 dark:text-green-400">检索工具</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            搜索相关记忆，检测逻辑冲突
          </p>
          <button 
            onClick={() => setShowAddSettingModal(true)}
            className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 py-2 rounded-md transition-colors"
          >
            添加设定
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">记忆库</h2>
        <div className="space-y-4">
          {/* 角色记忆 */}
          {characters.map((character) => (
            <div key={character.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{character.name}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  角色
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">{character.description}</p>
              <p className="text-xs text-gray-400">创建于: {new Date(character.createdAt).toLocaleString()}</p>
            </div>
          ))}
          
          {/* 事件记忆 */}
          {events.map((event) => (
            <div key={event.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{event.title}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  事件
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">{event.description}</p>
              <p className="text-xs text-gray-400">时间: {event.timestamp}</p>
            </div>
          ))}
          
          {/* 设定记忆 */}
          {settings.map((setting) => (
            <div key={setting.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{setting.name}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  设定
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">{setting.description}</p>
              <p className="text-xs text-gray-400">类型: {setting.type}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* 添加角色模态框 */}
      {showAddCharacterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">添加角色</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  角色名称
                </label>
                <input
                  type="text"
                  value={characterForm.name}
                  onChange={(e) => setCharacterForm({...characterForm, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  角色描述
                </label>
                <textarea
                  value={characterForm.description}
                  onChange={(e) => setCharacterForm({...characterForm, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowAddCharacterModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddCharacter}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 添加事件模态框 */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">添加事件</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  事件标题
                </label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  事件描述
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowAddEventModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddEvent}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 添加设定模态框 */}
      {showAddSettingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">添加设定</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  设定名称
                </label>
                <input
                  type="text"
                  value={settingForm.name}
                  onChange={(e) => setSettingForm({...settingForm, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  设定描述
                </label>
                <textarea
                  value={settingForm.description}
                  onChange={(e) => setSettingForm({...settingForm, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowAddSettingModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddSetting}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Memory;