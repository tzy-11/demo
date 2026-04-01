import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CharacterMemory, EventMemory, WorldSetting, MemoryStore, MemorySearchResult } from '../types/memory';

interface MemoryStoreState extends MemoryStore {
  // 添加记忆
  addCharacter: (character: Omit<CharacterMemory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addEvent: (event: Omit<EventMemory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addSetting: (setting: Omit<WorldSetting, 'id' | 'createdAt' | 'updatedAt'>) => void;
  
  // 更新记忆
  updateCharacter: (id: string, character: Partial<CharacterMemory>) => void;
  updateEvent: (id: string, event: Partial<EventMemory>) => void;
  updateSetting: (id: string, setting: Partial<WorldSetting>) => void;
  
  // 删除记忆
  deleteCharacter: (id: string) => void;
  deleteEvent: (id: string) => void;
  deleteSetting: (id: string) => void;
  
  // 检索记忆
  searchMemories: (query: string, limit?: number) => MemorySearchResult[];
  
  // 获取相关记忆
  getRelatedMemories: (memoryId: string, memoryType: 'character' | 'event' | 'setting', limit?: number) => MemorySearchResult[];
}

export const useMemoryStore = create<MemoryStoreState>()(
  persist(
    (set, get) => ({
      characters: [
        {
          id: '1',
          name: '主角',
          description: '一名侦探，擅长推理，性格谨慎',
          personality: ['谨慎', '聪明', '执着', '正义'],
          appearance: '中等身材，穿着深色风衣，眼神锐利',
          background: '曾在警队工作，后辞职成为私人侦探',
          relationships: [],
          emotionalState: {
            好感度: 50,
            信任度: 50,
            情绪: 'neutral'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      events: [
        {
          id: '1',
          title: '神秘电话',
          description: '在雨夜接到神秘电话，对方警告主角小心',
          timestamp: '2026-04-01 22:00',
          location: '侦探事务所',
          characters: ['1'],
          importance: 80,
          伏笔: true,
          resolved: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      settings: [
        {
          id: '1',
          type: 'location',
          name: '侦探事务所',
          description: '位于城市中心的老旧建筑，夜晚灯光昏暗',
          relevance: 90,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      embeddings: [],
      
      addCharacter: (character) => {
        const id = Date.now().toString();
        const now = new Date().toISOString();
        const newCharacter: CharacterMemory = {
          ...character,
          id,
          createdAt: now,
          updatedAt: now
        };
        set((state) => ({
          characters: [...state.characters, newCharacter]
        }));
      },
      
      addEvent: (event) => {
        const id = Date.now().toString();
        const now = new Date().toISOString();
        const newEvent: EventMemory = {
          ...event,
          id,
          createdAt: now,
          updatedAt: now
        };
        set((state) => ({
          events: [...state.events, newEvent]
        }));
      },
      
      addSetting: (setting) => {
        const id = Date.now().toString();
        const now = new Date().toISOString();
        const newSetting: WorldSetting = {
          ...setting,
          id,
          createdAt: now,
          updatedAt: now
        };
        set((state) => ({
          settings: [...state.settings, newSetting]
        }));
      },
      
      updateCharacter: (id, character) => {
        const now = new Date().toISOString();
        set((state) => ({
          characters: state.characters.map((c) => 
            c.id === id ? { ...c, ...character, updatedAt: now } : c
          )
        }));
      },
      
      updateEvent: (id, event) => {
        const now = new Date().toISOString();
        set((state) => ({
          events: state.events.map((e) => 
            e.id === id ? { ...e, ...event, updatedAt: now } : e
          )
        }));
      },
      
      updateSetting: (id, setting) => {
        const now = new Date().toISOString();
        set((state) => ({
          settings: state.settings.map((s) => 
            s.id === id ? { ...s, ...setting, updatedAt: now } : s
          )
        }));
      },
      
      deleteCharacter: (id) => {
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== id)
        }));
      },
      
      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id)
        }));
      },
      
      deleteSetting: (id) => {
        set((state) => ({
          settings: state.settings.filter((s) => s.id !== id)
        }));
      },
      
      searchMemories: (query, limit = 10) => {
        const { characters, events, settings } = get();
        const results: MemorySearchResult[] = [];
        
        // 简单的文本匹配搜索
        const searchTerm = query.toLowerCase();
        
        // 搜索角色
        characters.forEach((character) => {
          const score = [
            character.name.toLowerCase().includes(searchTerm) ? 1.0 : 0,
            character.description.toLowerCase().includes(searchTerm) ? 0.8 : 0,
            character.personality.some((trait) => trait.toLowerCase().includes(searchTerm)) ? 0.6 : 0,
            character.background.toLowerCase().includes(searchTerm) ? 0.4 : 0
          ].reduce((sum, score) => sum + score, 0);
          
          if (score > 0) {
            results.push({ memory: character, score });
          }
        });
        
        // 搜索事件
        events.forEach((event) => {
          const score = [
            event.title.toLowerCase().includes(searchTerm) ? 1.0 : 0,
            event.description.toLowerCase().includes(searchTerm) ? 0.8 : 0,
            event.location.toLowerCase().includes(searchTerm) ? 0.6 : 0
          ].reduce((sum, score) => sum + score, 0);
          
          if (score > 0) {
            results.push({ memory: event, score });
          }
        });
        
        // 搜索设定
        settings.forEach((setting) => {
          const score = [
            setting.name.toLowerCase().includes(searchTerm) ? 1.0 : 0,
            setting.description.toLowerCase().includes(searchTerm) ? 0.8 : 0
          ].reduce((sum, score) => sum + score, 0);
          
          if (score > 0) {
            results.push({ memory: setting, score });
          }
        });
        
        // 按得分排序并限制数量
        return results
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
      },
      
      getRelatedMemories: (memoryId, memoryType, limit = 5) => {
        const { characters, events, settings } = get();
        const results: MemorySearchResult[] = [];
        
        // 根据记忆类型获取相关记忆
        if (memoryType === 'character') {
          const character = characters.find((c) => c.id === memoryId);
          if (character) {
            // 查找与该角色相关的事件
            events.forEach((event) => {
              if (event.characters.includes(character.id)) {
                results.push({ memory: event, score: 1.0 });
              }
            });
          }
        } else if (memoryType === 'event') {
          const event = events.find((e) => e.id === memoryId);
          if (event) {
            // 查找事件涉及的角色
            event.characters.forEach((characterId) => {
              const character = characters.find((c) => c.id === characterId);
              if (character) {
                results.push({ memory: character, score: 1.0 });
              }
            });
            
            // 查找事件发生的地点
            const setting = settings.find((s) => 
              s.type === 'location' && s.name === event.location
            );
            if (setting) {
              results.push({ memory: setting, score: 0.8 });
            }
          }
        } else if (memoryType === 'setting') {
          const setting = settings.find((s) => s.id === memoryId);
          if (setting) {
            // 查找与该地点相关的事件
            events.forEach((event) => {
              if (event.location === setting.name) {
                results.push({ memory: event, score: 1.0 });
              }
            });
          }
        }
        
        // 按得分排序并限制数量
        return results
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
      }
    }),
    {
      name: 'ai-narrative-memory',
    }
  )
);

export default useMemoryStore;