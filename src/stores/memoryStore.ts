// @ts-nocheck
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CharacterMemory,
  EventMemory,
  WorldSetting,
  MemoryStore,
  MemorySearchResult,
  MemoryRelation,
  ConflictIssue,
  SearchIndexEntry,
  EnhancedSearchResult,
  GraphData,
  GraphNode,
  GraphEdge,
  ContentSegment,
} from '../types/memory';

interface MemoryStoreState extends MemoryStore {
  // 新增字段
  searchIndex: SearchIndexEntry[];
  relations: MemoryRelation[];
  conflicts: ConflictIssue[];

  // 基础操作
  addCharacter: (character: Omit<CharacterMemory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addEvent: (event: Omit<EventMemory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addSetting: (setting: Omit<WorldSetting, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCharacter: (id: string, character: Partial<CharacterMemory>) => void;
  updateEvent: (id: string, event: Partial<EventMemory>) => void;
  updateSetting: (id: string, setting: Partial<WorldSetting>) => void;
  deleteCharacter: (id: string) => void;
  deleteEvent: (id: string) => void;
  deleteSetting: (id: string) => void;

  // 搜索能力
  searchMemories: (query: string, limit?: number) => MemorySearchResult[];
  getRelatedMemories: (
    memoryId: string,
    memoryType: 'character' | 'event' | 'setting',
    limit?: number
  ) => MemorySearchResult[];

  // 新增能力
  rebuildIndex: () => void;
  detectConflicts: () => ConflictIssue[];
  getGraphData: () => GraphData;
  addRelation: (relation: Omit<MemoryRelation, 'id' | 'createdAt'>) => void;
  removeRelation: (relationId: string) => void;
  resolveConflict: (conflictId: string) => void;
  advancedSearch: (
    query: string,
    options?: {
      types?: ('character' | 'event' | 'setting')[];
      sortBy?: 'relevance' | 'updated' | 'created';
      limit?: number;
    }
  ) => EnhancedSearchResult[];
}

// 辅助函数
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const extractSegments = (text: string, query: string, field: string): ContentSegment[] => {
  const searchTerm = query.toLowerCase();
  const regex = new RegExp(`(?:^|\\s)(\\S*${searchTerm}\\S*)(?:\\s|$)`, 'gi');
  const segments: ContentSegment[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    segments.push({
      text: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      field,
    });
  }
  return segments;
};

export const useMemoryStore = create<MemoryStoreState>()(
  persist(
    (set, get) => ({
      // 初始数据
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
            情绪: 'neutral',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
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
          updatedAt: new Date().toISOString(),
        },
      ],
      settings: [
        {
          id: '1',
          type: 'location',
          name: '侦探事务所',
          description: '位于城市中心的老旧建筑，夜晚灯光昏暗',
          relevance: 90,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      embeddings: [],
      searchIndex: [],
      relations: [],
      conflicts: [],

      // 添加记忆
      addCharacter: (character) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newCharacter: CharacterMemory = { ...character, id, createdAt: now, updatedAt: now };
        set((state) => ({ characters: [...state.characters, newCharacter] }));
        setTimeout(() => {
          get().rebuildIndex();
          get().detectConflicts();
        }, 0);
      },

      addEvent: (event) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newEvent: EventMemory = { ...event, id, createdAt: now, updatedAt: now };
        set((state) => ({ events: [...state.events, newEvent] }));
        setTimeout(() => {
          get().rebuildIndex();
          get().detectConflicts();
        }, 0);
      },

      addSetting: (setting) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newSetting: WorldSetting = { ...setting, id, createdAt: now, updatedAt: now };
        set((state) => ({ settings: [...state.settings, newSetting] }));
        setTimeout(() => {
          get().rebuildIndex();
          get().detectConflicts();
        }, 0);
      },

      updateCharacter: (id, character) => {
        const now = new Date().toISOString();
        set((state) => ({
          characters: state.characters.map((c) =>
            c.id === id ? { ...c, ...character, updatedAt: now } : c
          ),
        }));
        setTimeout(() => {
          get().rebuildIndex();
          get().detectConflicts();
        }, 0);
      },

      updateEvent: (id, event) => {
        const now = new Date().toISOString();
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, ...event, updatedAt: now } : e
          ),
        }));
        setTimeout(() => {
          get().rebuildIndex();
          get().detectConflicts();
        }, 0);
      },

      updateSetting: (id, setting) => {
        const now = new Date().toISOString();
        set((state) => ({
          settings: state.settings.map((s) =>
            s.id === id ? { ...s, ...setting, updatedAt: now } : s
          ),
        }));
        setTimeout(() => {
          get().rebuildIndex();
          get().detectConflicts();
        }, 0);
      },

      deleteCharacter: (id) => {
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== id),
          relations: state.relations.filter((r) => r.sourceId !== id && r.targetId !== id),
        }));
        setTimeout(() => {
          get().rebuildIndex();
          get().detectConflicts();
        }, 0);
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
          relations: state.relations.filter((r) => r.sourceId !== id && r.targetId !== id),
        }));
        setTimeout(() => {
          get().rebuildIndex();
          get().detectConflicts();
        }, 0);
      },

      deleteSetting: (id) => {
        set((state) => ({
          settings: state.settings.filter((s) => s.id !== id),
          relations: state.relations.filter((r) => r.sourceId !== id && r.targetId !== id),
        }));
        setTimeout(() => {
          get().rebuildIndex();
          get().detectConflicts();
        }, 0);
      },

      // 搜索记忆
      searchMemories: (query, limit = 10) => {
        const { characters, events, settings } = get();
        const results: MemorySearchResult[] = [];
        const searchTerm = query.toLowerCase();

        characters.forEach((character) => {
          const score = [
            character.name.toLowerCase().includes(searchTerm) ? 1.0 : 0,
            character.description.toLowerCase().includes(searchTerm) ? 0.8 : 0,
            character.personality.some((trait) => trait.toLowerCase().includes(searchTerm)) ? 0.6 : 0,
            character.background.toLowerCase().includes(searchTerm) ? 0.4 : 0,
          ].reduce((sum, s) => sum + s, 0);

          if (score > 0) {
            results.push({ memory: character, score });
          }
        });

        events.forEach((event) => {
          const score = [
            event.title.toLowerCase().includes(searchTerm) ? 1.0 : 0,
            event.description.toLowerCase().includes(searchTerm) ? 0.8 : 0,
            event.location.toLowerCase().includes(searchTerm) ? 0.6 : 0,
          ].reduce((sum, s) => sum + s, 0);

          if (score > 0) {
            results.push({ memory: event, score });
          }
        });

        settings.forEach((setting) => {
          const score = [
            setting.name.toLowerCase().includes(searchTerm) ? 1.0 : 0,
            setting.description.toLowerCase().includes(searchTerm) ? 0.8 : 0,
          ].reduce((sum, s) => sum + s, 0);

          if (score > 0) {
            results.push({ memory: setting, score });
          }
        });

        return results.sort((a, b) => b.score - a.score).slice(0, limit);
      },

      getRelatedMemories: (memoryId, memoryType, limit = 5) => {
        const { characters, events, settings } = get();
        const results: MemorySearchResult[] = [];

        if (memoryType === 'character') {
          const character = characters.find((c) => c.id === memoryId);
          if (character) {
            events.forEach((event) => {
              if (event.characters.includes(character.id)) {
                results.push({ memory: event, score: 1.0 });
              }
            });
          }
        } else if (memoryType === 'event') {
          const event = events.find((e) => e.id === memoryId);
          if (event) {
            event.characters.forEach((characterId) => {
              const character = characters.find((c) => c.id === characterId);
              if (character) {
                results.push({ memory: character, score: 1.0 });
              }
            });

            const setting = settings.find((s) => s.type === 'location' && s.name === event.location);
            if (setting) {
              results.push({ memory: setting, score: 0.8 });
            }
          }
        } else if (memoryType === 'setting') {
          const setting = settings.find((s) => s.id === memoryId);
          if (setting) {
            events.forEach((event) => {
              if (event.location === setting.name) {
                results.push({ memory: event, score: 1.0 });
              }
            });
          }
        }

        return results.sort((a, b) => b.score - a.score).slice(0, limit);
      },

      // 重建索引
      rebuildIndex: () => {
        const { characters, events, settings } = get();
        const newIndex: SearchIndexEntry[] = [];

        characters.forEach((char) => {
          const content = [char.name, char.description, char.personality.join(' '), char.appearance, char.background].join(' ');
          newIndex.push({
            entityId: char.id,
            entityType: 'character',
            content,
            fields: {
              name: char.name,
              description: char.description,
              personality: char.personality.join(', '),
              appearance: char.appearance,
              background: char.background,
            },
            weight: 1.0,
            createdAt: char.createdAt,
          });
        });

        events.forEach((event) => {
          const content = [event.title, event.description, event.location].join(' ');
          newIndex.push({
            entityId: event.id,
            entityType: 'event',
            content,
            fields: {
              title: event.title,
              description: event.description,
              location: event.location,
              timestamp: event.timestamp,
            },
            weight: 1.0,
            createdAt: event.createdAt,
          });
        });

        settings.forEach((setting) => {
          const content = [setting.name, setting.description].join(' ');
          newIndex.push({
            entityId: setting.id,
            entityType: 'setting',
            content,
            fields: { name: setting.name, description: setting.description, type: setting.type },
            weight: 1.0,
            createdAt: setting.createdAt,
          });
        });

        set({ searchIndex: newIndex });
      },

      // 高级搜索
      advancedSearch: (query, options = {}) => {
        const { types, sortBy = 'relevance', limit = 10 } = options;
        const { characters, events, settings, searchIndex } = get();
        const searchTerm = query.toLowerCase();
        const results: EnhancedSearchResult[] = [];

        searchIndex
          .filter((entry) => !types || types.includes(entry.entityType))
          .forEach((entry) => {
            let score = 0;
            const segments: EnhancedSearchResult['segments'] = [];

            Object.entries(entry.fields).forEach(([field, value]) => {
              if (value.toLowerCase().includes(searchTerm)) {
                const fieldScore = field === 'name' ? 1.0 : 0.7;
                score += fieldScore;
                const fieldSegments = extractSegments(value, query, field);
                segments.push(...fieldSegments);
              }
            });

            if (score > 0) {
              let memory;
              if (entry.entityType === 'character') {
                memory = characters.find((c) => c.id === entry.entityId);
              } else if (entry.entityType === 'event') {
                memory = events.find((e) => e.id === entry.entityId);
              } else {
                memory = settings.find((s) => s.id === entry.entityId);
              }

              if (memory) {
                results.push({
                  memory,
                  score,
                  segments,
                  fields: Object.keys(entry.fields),
                });
              }
            }
          });

        if (sortBy === 'relevance') {
          results.sort((a, b) => b.score - a.score);
        } else if (sortBy === 'updated') {
          results.sort((a, b) => new Date(b.memory.updatedAt).getTime() - new Date(a.memory.updatedAt).getTime());
        } else if (sortBy === 'created') {
          results.sort((a, b) => new Date(b.memory.createdAt).getTime() - new Date(a.memory.createdAt).getTime());
        }

        return results.slice(0, limit);
      },

      // 检测冲突
      detectConflicts: () => {
        const { events, settings, conflicts } = get();
        const newConflicts: ConflictIssue[] = [...conflicts];

        // 规则 1: 时间冲突
        const timeConflictMap = new Map<string, Array<{ event: EventMemory; location: string }>>();
        events.forEach((event) => {
          event.characters.forEach((charId) => {
            const key = `${charId}-${event.timestamp}`;
            if (!timeConflictMap.has(key)) {
              timeConflictMap.set(key, []);
            }
            timeConflictMap.get(key)!.push({ event, location: event.location });
          });
        });

        timeConflictMap.forEach((items, key) => {
          if (items.length > 1) {
            const locations = new Set(items.map((i) => i.location));
            if (locations.size > 1) {
              const [charId] = key.split('-');
              const existingConflict = newConflicts.find(
                (c) => c.ruleType === 'time_conflict' && c.entityIds.includes(charId)
              );
              if (!existingConflict) {
                newConflicts.push({
                  id: generateId(),
                  ruleType: 'time_conflict',
                  severity: 'error',
                  entityIds: [charId, ...items.map((i) => i.event.id)],
                  description: `角色在同一时刻出现在不同地点`,
                  details: { locations: Array.from(locations), events: items.map((i) => i.event.title) },
                  suggestedFixes: [{ type: 'adjust_time', description: '调整事件时间', actions: ['更改其中一个事件的时间'] }],
                  detectedAt: new Date().toISOString(),
                  resolved: false,
                });
              }
            }
          }
        });

        // 规则 2: 地点冲突
        events.forEach((event) => {
          const locationSetting = settings.find(
            (s) => s.type === 'location' && s.name.toLowerCase() === event.location.toLowerCase()
          );
          if (
            !locationSetting &&
            event.location &&
            !newConflicts.find((c) => c.ruleType === 'location_conflict' && c.entityIds.includes(event.id))
          ) {
            newConflicts.push({
              id: generateId(),
              ruleType: 'location_conflict',
              severity: 'warn',
              entityIds: [event.id],
              description: `事件的地点 "${event.location}" 未在设定中定义`,
              details: { eventLocation: event.location },
              suggestedFixes: [{ type: 'add_location', description: '在设定中添加此地点', actions: [`创建地点设定: ${event.location}`] }],
              detectedAt: new Date().toISOString(),
              resolved: false,
            });
          }
        });

        // 规则 3: 伏笔冲突
        events.forEach((event) => {
          if (
            event.伏笔 &&
            event.resolved &&
            !newConflicts.find((c) => c.ruleType === 'character_state_conflict' && c.entityIds.includes(event.id))
          ) {
            newConflicts.push({
              id: generateId(),
              ruleType: 'character_state_conflict',
              severity: 'warn',
              entityIds: [event.id],
              description: `伏笔已回收但仍标记为伏笔`,
              details: { eventTitle: event.title },
              suggestedFixes: [{ type: 'fix_flag', description: '取消伏笔标记', actions: ['将伏笔标记改为 false'] }],
              detectedAt: new Date().toISOString(),
              resolved: false,
            });
          }
        });

        // 规则 4: 设定自相矛盾
        const settingNames = new Map<string, WorldSetting[]>();
        settings.forEach((setting) => {
          const key = setting.name.toLowerCase();
          if (!settingNames.has(key)) {
            settingNames.set(key, []);
          }
          settingNames.get(key)!.push(setting);
        });

        settingNames.forEach((sameNameSettings, name) => {
          if (
            sameNameSettings.length > 1 &&
            !newConflicts.find((c) => c.ruleType === 'setting_contradiction' && c.entityIds.includes(sameNameSettings[0].id))
          ) {
            newConflicts.push({
              id: generateId(),
              ruleType: 'setting_contradiction',
              severity: 'warn',
              entityIds: sameNameSettings.map((s) => s.id),
              description: `存在多个同名设定: "${name}"`,
              details: { settingName: name, count: sameNameSettings.length },
              suggestedFixes: [{ type: 'merge', description: '合并重复设定', actions: [`删除或重命名重复的设定 "${name}"`] }],
              detectedAt: new Date().toISOString(),
              resolved: false,
            });
          }
        });

        set({ conflicts: newConflicts });
        return newConflicts;
      },

      // 添加关系
      addRelation: (relation) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newRelation: MemoryRelation = { ...relation, id, createdAt: now };
        set((state) => ({ relations: [...state.relations, newRelation] }));
      },

      // 移除关系
      removeRelation: (relationId: string) => {
        set((state) => ({ relations: state.relations.filter((r) => r.id !== relationId) }));
      },

      // 标记冲突解决
      resolveConflict: (conflictId: string) => {
        set((state) => ({
          conflicts: state.conflicts.map((c) => (c.id === conflictId ? { ...c, resolved: true } : c)),
        }));
      },

      // 生成图谱数据
      getGraphData: () => {
        const { characters, events, settings, relations } = get();
        const nodes: GraphNode[] = [];
        const edges: GraphEdge[] = [];

        characters.forEach((char) => {
          nodes.push({
            id: char.id,
            label: char.name,
            type: 'character',
            data: char,
            metadata: { conflictCount: 0, relatedCount: 0 },
          });
        });

        events.forEach((event) => {
          nodes.push({
            id: event.id,
            label: event.title,
            type: 'event',
            data: event,
            metadata: { conflictCount: 0, relatedCount: 0 },
          });
        });

        settings.forEach((setting) => {
          nodes.push({
            id: setting.id,
            label: setting.name,
            type: 'setting',
            data: setting,
            metadata: { conflictCount: 0, relatedCount: 0 },
          });
        });

        relations.forEach((relation) => {
          edges.push({
            id: relation.id,
            source: relation.sourceId,
            target: relation.targetId,
            label: relation.description || relation.relationshipType,
            type: relation.relationshipType,
            weight: relation.strength,
          });
        });

        events.forEach((event) => {
          event.characters.forEach((charId) => {
            edges.push({
              id: `${charId}-${event.id}-participates`,
              source: charId,
              target: event.id,
              label: 'participates_in',
              type: 'participates_in',
              weight: 0.8,
            });
          });
        });

        events.forEach((event) => {
          const setting = settings.find((s) => s.type === 'location' && s.name.toLowerCase() === event.location.toLowerCase());
          if (setting) {
            edges.push({
              id: `${event.id}-${setting.id}-happens`,
              source: event.id,
              target: setting.id,
              label: 'happens_at',
              type: 'happens_at',
              weight: 0.9,
            });
          }
        });

        return { nodes, edges };
      },
    }),
    {
      name: 'ai-narrative-memory',
    }
  )
);

export default useMemoryStore;
