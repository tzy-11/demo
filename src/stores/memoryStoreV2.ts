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
  MemoryType,
} from '../types/memory';

interface MemoryStoreState extends MemoryStore {
  searchIndex: SearchIndexEntry[];
  relations: MemoryRelation[];
  conflicts: ConflictIssue[];

  addCharacter: (character: Omit<CharacterMemory, 'id' | 'createdAt' | 'updatedAt' | 'type'>) => void;
  addEvent: (event: Omit<EventMemory, 'id' | 'createdAt' | 'updatedAt' | 'type'>) => void;
  addSetting: (setting: Omit<WorldSetting, 'id' | 'createdAt' | 'updatedAt' | 'type'>) => void;
  updateCharacter: (id: string, character: Partial<CharacterMemory>) => void;
  updateEvent: (id: string, event: Partial<EventMemory>) => void;
  updateSetting: (id: string, setting: Partial<WorldSetting>) => void;
  deleteCharacter: (id: string) => void;
  deleteEvent: (id: string) => void;
  deleteSetting: (id: string) => void;

  searchMemories: (query: string, limit?: number) => MemorySearchResult[];
  getRelatedMemories: (memoryId: string, memoryType: MemoryType, limit?: number) => MemorySearchResult[];

  rebuildIndex: () => void;
  detectConflicts: () => ConflictIssue[];
  getGraphData: () => GraphData;
  addRelation: (relation: Omit<MemoryRelation, 'id' | 'createdAt'>) => void;
  removeRelation: (relationId: string) => void;
  resolveConflict: (conflictId: string) => void;
  advancedSearch: (
    query: string,
    options?: {
      types?: MemoryType[];
      sortBy?: 'relevance' | 'updated' | 'created';
      limit?: number;
      storyId?: string;
    }
  ) => EnhancedSearchResult[];
}

const generateId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const extractSegments = (text: string, query: string, field: string): ContentSegment[] => {
  const segments: ContentSegment[] = [];
  const source = text.toLowerCase();
  const keyword = query.trim().toLowerCase();
  if (!keyword) {
    return segments;
  }

  let from = 0;
  while (true) {
    const index = source.indexOf(keyword, from);
    if (index === -1) {
      break;
    }
    segments.push({
      text: text.slice(index, index + keyword.length),
      startIndex: index,
      endIndex: index + keyword.length,
      field,
    });
    from = index + keyword.length;
  }

  return segments;
};

const now = () => Date.now();
const normalizeTime = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return now();
};

const safeArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const normalizeCharacter = (raw: any): CharacterMemory => ({
  id: String(raw?.id ?? generateId()),
  type: 'character',
  storyId: String(raw?.storyId ?? 'story-default'),
  nodeId: raw?.nodeId ? String(raw.nodeId) : undefined,
  source: raw?.source === 'manual' ? 'manual' : 'ai-generated',
  name: String(raw?.name ?? '未命名角色'),
  description: String(raw?.description ?? ''),
  personality: safeArray<string>(raw?.personality).map((item) => String(item)),
  appearance: String(raw?.appearance ?? ''),
  background: String(raw?.background ?? ''),
  relationships: safeArray(raw?.relationships),
  emotionalState: {
    好感度: Number(raw?.emotionalState?.好感度 ?? 50),
    信任度: Number(raw?.emotionalState?.信任度 ?? 50),
    情绪: raw?.emotionalState?.情绪 ?? 'neutral',
  },
  createdAt: normalizeTime(raw?.createdAt),
  updatedAt: normalizeTime(raw?.updatedAt),
});

const normalizeEvent = (raw: any): EventMemory => ({
  id: String(raw?.id ?? generateId()),
  type: 'event',
  storyId: String(raw?.storyId ?? 'story-default'),
  nodeId: raw?.nodeId ? String(raw.nodeId) : undefined,
  source: raw?.source === 'manual' ? 'manual' : 'ai-generated',
  title: String(raw?.title ?? '未命名事件'),
  description: String(raw?.description ?? ''),
  timestamp: String(raw?.timestamp ?? ''),
  location: String(raw?.location ?? ''),
  characterIds: safeArray<string>(raw?.characterIds ?? raw?.characters).map((item) => String(item)),
  importance: Number(raw?.importance ?? 50),
  isForeshadowing: Boolean(raw?.isForeshadowing ?? raw?.伏笔 ?? false),
  isResolved: Boolean(raw?.isResolved ?? raw?.resolved ?? false),
  createdAt: normalizeTime(raw?.createdAt),
  updatedAt: normalizeTime(raw?.updatedAt),
});

const normalizeSetting = (raw: any): WorldSetting => ({
  id: String(raw?.id ?? generateId()),
  type: 'setting',
  storyId: String(raw?.storyId ?? 'story-default'),
  nodeId: raw?.nodeId ? String(raw.nodeId) : undefined,
  source: raw?.source === 'manual' ? 'manual' : 'ai-generated',
  settingType: (raw?.settingType ?? raw?.type ?? 'concept') as WorldSetting['settingType'],
  name: String(raw?.name ?? '未命名设定'),
  description: String(raw?.description ?? ''),
  relevance: Number(raw?.relevance ?? 50),
  createdAt: normalizeTime(raw?.createdAt),
  updatedAt: normalizeTime(raw?.updatedAt),
});

const refreshDerivedState = (get: () => MemoryStoreState) => {
  get().rebuildIndex();
  get().detectConflicts();
};

export const useMemoryStore = create<MemoryStoreState>()(
  persist(
    (set, get) => ({
      characters: [
        {
          id: 'char-1',
          type: 'character',
          storyId: 'story-default',
          nodeId: 'node-root',
          source: 'ai-generated',
          name: '主角',
          description: '从 AI 生成文本中抽取的核心角色。',
          personality: ['谨慎', '聪明', '执着'],
          appearance: '深色风衣，眼神敏锐。',
          background: '前警探，现为私人侦探。',
          relationships: [],
          emotionalState: { 好感度: 50, 信任度: 55, 情绪: 'neutral' },
          createdAt: now(),
          updatedAt: now(),
        },
      ],
      events: [
        {
          id: 'event-1',
          type: 'event',
          storyId: 'story-default',
          nodeId: 'node-root',
          source: 'ai-generated',
          title: '雨夜来电',
          description: '主角在事务所接到神秘电话。',
          timestamp: '2026-04-01 22:00',
          location: '侦探事务所',
          characterIds: ['char-1'],
          importance: 80,
          isForeshadowing: true,
          isResolved: false,
          createdAt: now(),
          updatedAt: now(),
        },
      ],
      settings: [
        {
          id: 'setting-1',
          type: 'setting',
          storyId: 'story-default',
          nodeId: 'node-root',
          source: 'ai-generated',
          settingType: 'location',
          name: '侦探事务所',
          description: '城市中心的一处老旧办公室。',
          relevance: 92,
          createdAt: now(),
          updatedAt: now(),
        },
      ],
      embeddings: [],
      searchIndex: [],
      relations: [],
      conflicts: [],

      addCharacter: (character) => {
        set((state) => ({
          characters: [...state.characters, { ...character, id: generateId(), type: 'character', createdAt: now(), updatedAt: now() }],
        }));
        refreshDerivedState(get);
      },
      addEvent: (event) => {
        set((state) => ({
          events: [...state.events, { ...event, id: generateId(), type: 'event', createdAt: now(), updatedAt: now() }],
        }));
        refreshDerivedState(get);
      },
      addSetting: (setting) => {
        set((state) => ({
          settings: [...state.settings, { ...setting, id: generateId(), type: 'setting', createdAt: now(), updatedAt: now() }],
        }));
        refreshDerivedState(get);
      },

      updateCharacter: (id, character) => {
        set((state) => ({ characters: state.characters.map((item) => (item.id === id ? { ...item, ...character, updatedAt: now() } : item)) }));
        refreshDerivedState(get);
      },
      updateEvent: (id, event) => {
        set((state) => ({ events: state.events.map((item) => (item.id === id ? { ...item, ...event, updatedAt: now() } : item)) }));
        refreshDerivedState(get);
      },
      updateSetting: (id, setting) => {
        set((state) => ({ settings: state.settings.map((item) => (item.id === id ? { ...item, ...setting, updatedAt: now() } : item)) }));
        refreshDerivedState(get);
      },

      deleteCharacter: (id) => {
        set((state) => ({
          characters: state.characters.filter((item) => item.id !== id),
          relations: state.relations.filter((item) => item.sourceId !== id && item.targetId !== id),
        }));
        refreshDerivedState(get);
      },
      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((item) => item.id !== id),
          relations: state.relations.filter((item) => item.sourceId !== id && item.targetId !== id),
        }));
        refreshDerivedState(get);
      },
      deleteSetting: (id) => {
        set((state) => ({
          settings: state.settings.filter((item) => item.id !== id),
          relations: state.relations.filter((item) => item.sourceId !== id && item.targetId !== id),
        }));
        refreshDerivedState(get);
      },

      searchMemories: (query, limit = 10) => get().advancedSearch(query, { limit }),
      getRelatedMemories: (memoryId, memoryType, limit = 5) => {
        const state = get();
        const results: MemorySearchResult[] = [];
        const targetStoryId =
          state.characters.find((item) => item.id === memoryId)?.storyId ||
          state.events.find((item) => item.id === memoryId)?.storyId ||
          state.settings.find((item) => item.id === memoryId)?.storyId;

        const memoryByType = (id: string, type: MemoryType) =>
          type === 'character'
            ? state.characters.find((item) => item.id === id)
            : type === 'event'
              ? state.events.find((item) => item.id === id)
              : state.settings.find((item) => item.id === id);

        state.relations
          .filter((item) => item.storyId === targetStoryId && (item.sourceId === memoryId || item.targetId === memoryId))
          .forEach((item) => {
            const relatedId = item.sourceId === memoryId ? item.targetId : item.sourceId;
            const relatedType = item.sourceId === memoryId ? item.targetType : item.sourceType;
            const memory = memoryByType(relatedId, relatedType);
            if (memory) {
              results.push({ memory, score: item.strength / 100 });
            }
          });

        if (memoryType === 'event') {
          const event = state.events.find((item) => item.id === memoryId);
          if (event) {
            event.characterIds.forEach((id) => {
              const character = state.characters.find((item) => item.id === id);
              if (character) {
                results.push({ memory: character, score: 0.95 });
              }
            });
          }
        }

        return results.sort((a, b) => b.score - a.score).slice(0, limit);
      },

      rebuildIndex: () => {
        const state = get();
        const index: SearchIndexEntry[] = [];

        state.characters.forEach((item) => {
          const fields = {
            name: item.name,
            description: item.description,
            personality: item.personality.join(' '),
            background: item.background,
          };
          index.push({ storyId: item.storyId, nodeId: item.nodeId, entityId: item.id, entityType: 'character', content: Object.values(fields).join(' '), fields, weight: 1, createdAt: item.createdAt });
        });

        state.events.forEach((item) => {
          const fields = { title: item.title, description: item.description, location: item.location, timestamp: item.timestamp };
          index.push({ storyId: item.storyId, nodeId: item.nodeId, entityId: item.id, entityType: 'event', content: Object.values(fields).join(' '), fields, weight: 1, createdAt: item.createdAt });
        });

        state.settings.forEach((item) => {
          const fields = { name: item.name, description: item.description, settingType: item.settingType };
          index.push({ storyId: item.storyId, nodeId: item.nodeId, entityId: item.id, entityType: 'setting', content: Object.values(fields).join(' '), fields, weight: 1, createdAt: item.createdAt });
        });

        set({ searchIndex: index });
      },

      advancedSearch: (query, options = {}) => {
        const { types, sortBy = 'relevance', limit = 10, storyId } = options;
        const state = get();
        const keyword = query.trim().toLowerCase();
        if (!keyword) {
          return [];
        }

        const results: EnhancedSearchResult[] = state.searchIndex
          .filter((entry) => (!types || types.includes(entry.entityType)) && (!storyId || entry.storyId === storyId))
          .map((entry) => {
            let score = 0;
            const segments: ContentSegment[] = [];
            const matchedFields: string[] = [];

            Object.entries(entry.fields).forEach(([field, value]) => {
              const lower = value.toLowerCase();
              if (lower.includes(keyword)) {
                score += field === 'name' || field === 'title' ? 1 : 0.7;
                segments.push(...extractSegments(value, keyword, field));
                matchedFields.push(field);
              }
            });

            if (score <= 0) {
              return null;
            }

            const memory =
              entry.entityType === 'character'
                ? state.characters.find((item) => item.id === entry.entityId)
                : entry.entityType === 'event'
                  ? state.events.find((item) => item.id === entry.entityId)
                  : state.settings.find((item) => item.id === entry.entityId);

            if (!memory) {
              return null;
            }

            return { memory, score, segments, fields: matchedFields };
          })
          .filter((item): item is EnhancedSearchResult => Boolean(item));

        if (sortBy === 'updated') {
          results.sort((a, b) => b.memory.updatedAt - a.memory.updatedAt);
        } else if (sortBy === 'created') {
          results.sort((a, b) => b.memory.createdAt - a.memory.createdAt);
        } else {
          results.sort((a, b) => b.score - a.score);
        }

        return results.slice(0, limit);
      },

      detectConflicts: () => {
        const state = get();
        const conflicts: ConflictIssue[] = [];

        const byStory = new Map<string, { events: EventMemory[]; settings: WorldSetting[] }>();
        state.events.forEach((item) => {
          if (!byStory.has(item.storyId)) {
            byStory.set(item.storyId, { events: [], settings: [] });
          }
          byStory.get(item.storyId)?.events.push(item);
        });
        state.settings.forEach((item) => {
          if (!byStory.has(item.storyId)) {
            byStory.set(item.storyId, { events: [], settings: [] });
          }
          byStory.get(item.storyId)?.settings.push(item);
        });

        byStory.forEach(({ events, settings }, storyId) => {
          const locationSet = new Set(settings.filter((s) => s.settingType === 'location').map((s) => s.name.toLowerCase()));

          const timeline = new Map<string, EventMemory[]>();
          events.forEach((event) => {
            (event.characterIds ?? []).forEach((characterId) => {
              const key = `${characterId}::${event.timestamp}`;
              if (!timeline.has(key)) {
                timeline.set(key, []);
              }
              timeline.get(key)?.push(event);
            });

            if (event.location && !locationSet.has(event.location.toLowerCase())) {
              conflicts.push({
                id: generateId(),
                storyId,
                ruleType: 'location_conflict',
                severity: 'warn',
                entityIds: [event.id],
                description: `事件地点“${event.location}”未在设定中定义`,
                details: { location: event.location },
                suggestedFixes: [{ type: 'add_location', description: '补全地点设定', actions: [`创建地点设定：${event.location}`] }],
                detectedAt: now(),
                resolved: false,
              });
            }

            if (event.isForeshadowing && event.isResolved) {
              conflicts.push({
                id: generateId(),
                storyId,
                ruleType: 'character_state_conflict',
                severity: 'warn',
                entityIds: [event.id],
                description: `事件“${event.title}”伏笔状态冲突（已回收但仍标记伏笔）`,
                details: { eventId: event.id },
                suggestedFixes: [{ type: 'fix_foreshadowing', description: '取消伏笔标记', actions: ['将 isForeshadowing 改为 false'] }],
                detectedAt: now(),
                resolved: false,
              });
            }
          });

          timeline.forEach((sameTimeEvents, key) => {
            const locations = new Set(sameTimeEvents.map((item) => item.location.toLowerCase()));
            if (sameTimeEvents.length > 1 && locations.size > 1) {
              conflicts.push({
                id: generateId(),
                storyId,
                ruleType: 'time_conflict',
                severity: 'error',
                entityIds: sameTimeEvents.map((item) => item.id),
                description: `同一角色同一时刻出现在不同地点（${key}）`,
                details: { locations: [...locations] },
                suggestedFixes: [{ type: 'adjust_time', description: '调整事件时间线', actions: ['修改冲突事件 timestamp 或 location'] }],
                detectedAt: now(),
                resolved: false,
              });
            }
          });

          const settingNameMap = new Map<string, WorldSetting[]>();
          settings.forEach((setting) => {
            const key = setting.name.trim().toLowerCase();
            if (!settingNameMap.has(key)) {
              settingNameMap.set(key, []);
            }
            settingNameMap.get(key)?.push(setting);
          });

          settingNameMap.forEach((sameNameSettings, name) => {
            const descriptions = new Set(sameNameSettings.map((item) => item.description.trim()));
            if (sameNameSettings.length > 1 && descriptions.size > 1) {
              conflicts.push({
                id: generateId(),
                storyId,
                ruleType: 'setting_contradiction',
                severity: 'warn',
                entityIds: sameNameSettings.map((item) => item.id),
                description: `同名设定“${name}”描述不一致`,
                details: { count: sameNameSettings.length },
                suggestedFixes: [{ type: 'merge_setting', description: '合并冲突设定', actions: ['统一同名设定描述', '保留一个主设定'] }],
                detectedAt: now(),
                resolved: false,
              });
            }
          });
        });

        set({ conflicts });
        return conflicts;
      },

      addRelation: (relation) => {
        set((state) => ({ relations: [...state.relations, { ...relation, id: generateId(), createdAt: now() }] }));
      },
      removeRelation: (relationId) => {
        set((state) => ({ relations: state.relations.filter((item) => item.id !== relationId) }));
      },
      resolveConflict: (conflictId) => {
        set((state) => ({ conflicts: state.conflicts.map((item) => (item.id === conflictId ? { ...item, resolved: true } : item)) }));
      },

      getGraphData: () => {
        const state = get();
        const edges: GraphEdge[] = [];

        const nodes: GraphNode[] = [
          ...state.characters.map((item) => ({ id: item.id, label: item.name, type: 'character' as const, data: item, metadata: { storyId: item.storyId, conflictCount: 0, relatedCount: 0 } })),
          ...state.events.map((item) => ({ id: item.id, label: item.title, type: 'event' as const, data: item, metadata: { storyId: item.storyId, conflictCount: 0, relatedCount: 0 } })),
          ...state.settings.map((item) => ({ id: item.id, label: item.name, type: 'setting' as const, data: item, metadata: { storyId: item.storyId, conflictCount: 0, relatedCount: 0 } })),
        ];

        state.relations.forEach((item) => {
          edges.push({ id: item.id, source: item.sourceId, target: item.targetId, label: item.relationshipType, type: item.relationshipType, weight: item.strength });
        });

        state.events.forEach((event) => {
          (event.characterIds ?? []).forEach((characterId) => {
            edges.push({ id: `${characterId}-${event.id}-participates`, source: characterId, target: event.id, label: 'participates_in', type: 'participates_in', weight: 90 });
          });
          const location = state.settings.find((item) => item.storyId === event.storyId && item.settingType === 'location' && item.name.toLowerCase() === event.location.toLowerCase());
          if (location) {
            edges.push({ id: `${event.id}-${location.id}-happens`, source: event.id, target: location.id, label: 'happens_at', type: 'happens_at', weight: 95 });
          }
        });

        const conflictCountMap = new Map<string, number>();
        state.conflicts.filter((item) => !item.resolved).forEach((item) => {
          item.entityIds.forEach((id) => {
            conflictCountMap.set(id, (conflictCountMap.get(id) || 0) + 1);
          });
        });

        const relationCountMap = new Map<string, number>();
        edges.forEach((item) => {
          relationCountMap.set(item.source, (relationCountMap.get(item.source) || 0) + 1);
          relationCountMap.set(item.target, (relationCountMap.get(item.target) || 0) + 1);
        });

        const finalNodes = nodes.map((node) => ({
          ...node,
          metadata: {
            ...node.metadata,
            conflictCount: conflictCountMap.get(node.id) || 0,
            relatedCount: relationCountMap.get(node.id) || 0,
          },
        }));

        return { nodes: finalNodes, edges };
      },
    }),
    {
      name: 'ai-narrative-memory',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.characters = safeArray(state.characters).map(normalizeCharacter);
          state.events = safeArray(state.events).map(normalizeEvent);
          state.settings = safeArray(state.settings).map(normalizeSetting);
          state.rebuildIndex();
          state.detectConflicts();
        }
      },
    }
  )
);

export default useMemoryStore;
