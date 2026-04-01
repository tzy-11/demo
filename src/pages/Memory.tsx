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
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-stone-900 mb-4">记忆库管理</h1>
        <p className="text-stone-600">
          管理故事中的角色、事件和设定，构建完整的故事世界。
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white border border-stone-200 rounded-lg p-8 shadow-sm">
          <h3 className="text-xl font-semibold text-stone-900 mb-4">角色记忆</h3>
          <p className="text-stone-600 mb-6">
            管理角色的设定、关系和情感状态
          </p>
          <button 
            onClick={() => setShowAddCharacterModal(true)}
            className="w-full px-6 py-4 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors"
          >
            添加角色
          </button>
        </div>
        
        <div className="bg-white border border-stone-200 rounded-lg p-8 shadow-sm">
          <h3 className="text-xl font-semibold text-stone-900 mb-4">情节记忆</h3>
          <p className="text-stone-600 mb-6">
            记录关键事件、伏笔和世界观设定
          </p>
          <button 
            onClick={() => setShowAddEventModal(true)}
            className="w-full px-6 py-4 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors"
          >
            添加事件
          </button>
        </div>
        
        <div className="bg-white border border-stone-200 rounded-lg p-8 shadow-sm">
          <h3 className="text-xl font-semibold text-stone-900 mb-4">设定记忆</h3>
          <p className="text-stone-600 mb-6">
            管理世界观设定、规则和物品
          </p>
          <button 
            onClick={() => setShowAddSettingModal(true)}
            className="w-full px-6 py-4 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors"
          >
            添加设定
          </button>
        </div>
      </div>
      
      <div className="bg-white border border-stone-200 rounded-lg p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-stone-900 mb-6">记忆库</h2>
        <div className="space-y-6">
          {/* 角色记忆 */}
          {characters.map((character) => (
            <div key={character.id} className="border-b border-stone-200 pb-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-stone-900">{character.name}</h3>
                <span className="text-xs px-3 py-1 rounded-full bg-stone-100 text-stone-800">
                  角色
                </span>
              </div>
              <p className="text-stone-700 mb-3">{character.description}</p>
              <p className="text-xs text-stone-500">创建于: {new Date(character.createdAt).toLocaleString()}</p>
            </div>
          ))}
          
          {/* 事件记忆 */}
          {events.map((event) => (
            <div key={event.id} className="border-b border-stone-200 pb-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-stone-900">{event.title}</h3>
                <span className="text-xs px-3 py-1 rounded-full bg-stone-100 text-stone-800">
                  事件
                </span>
              </div>
              <p className="text-stone-700 mb-3">{event.description}</p>
              <p className="text-xs text-stone-500">时间: {event.timestamp}</p>
            </div>
          ))}
          
          {/* 设定记忆 */}
          {settings.map((setting) => (
            <div key={setting.id} className="border-b border-stone-200 pb-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-stone-900">{setting.name}</h3>
                <span className="text-xs px-3 py-1 rounded-full bg-stone-100 text-stone-800">
                  设定
                </span>
              </div>
              <p className="text-stone-700 mb-3">{setting.description}</p>
              <p className="text-xs text-stone-500">类型: {setting.type}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* 添加角色模态框 */}
      {showAddCharacterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-md border border-stone-200 shadow-lg">
            <h3 className="text-xl font-semibold text-stone-900 mb-6">添加角色</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">
                  角色名称
                </label>
                <input
                  type="text"
                  value={characterForm.name}
                  onChange={(e) => setCharacterForm({...characterForm, name: e.target.value})}
                  className="w-full px-6 py-4 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">
                  角色描述
                </label>
                <textarea
                  value={characterForm.description}
                  onChange={(e) => setCharacterForm({...characterForm, description: e.target.value})}
                  className="w-full px-6 py-4 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowAddCharacterModal(false)}
                  className="px-6 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddCharacter}
                  className="px-6 py-3 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors"
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
          <div className="bg-white p-8 rounded-lg w-full max-w-md border border-stone-200 shadow-lg">
            <h3 className="text-xl font-semibold text-stone-900 mb-6">添加事件</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">
                  事件标题
                </label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                  className="w-full px-6 py-4 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">
                  事件描述
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  className="w-full px-6 py-4 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowAddEventModal(false)}
                  className="px-6 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddEvent}
                  className="px-6 py-3 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors"
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
          <div className="bg-white p-8 rounded-lg w-full max-w-md border border-stone-200 shadow-lg">
            <h3 className="text-xl font-semibold text-stone-900 mb-6">添加设定</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">
                  设定名称
                </label>
                <input
                  type="text"
                  value={settingForm.name}
                  onChange={(e) => setSettingForm({...settingForm, name: e.target.value})}
                  className="w-full px-6 py-4 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">
                  设定描述
                </label>
                <textarea
                  value={settingForm.description}
                  onChange={(e) => setSettingForm({...settingForm, description: e.target.value})}
                  className="w-full px-6 py-4 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowAddSettingModal(false)}
                  className="px-6 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddSetting}
                  className="px-6 py-3 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors"
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