// 角色记忆相关类型
export interface CharacterMemory {
  id: string;
  name: string;
  description: string;
  personality: string[]; // 性格特点
  appearance: string; // 外貌描述
  background: string; // 背景故事
  relationships: Relationship[]; // 与其他角色的关系
  emotionalState: {
   好感度: number; // 0-100
    信任度: number; // 0-100
    情绪: 'happy' | 'sad' | 'angry' | 'neutral' | 'scared';
  };
  createdAt: string;
  updatedAt: string;
}

export interface Relationship {
  characterId: string;
  type: 'friend' | 'enemy' | 'family' | 'colleague' | 'stranger';
  description: string;
  strength: number; // 0-100
}

// 情节记忆相关类型
export interface EventMemory {
  id: string;
  title: string;
  description: string;
  timestamp: string; // 故事内时间
  location: string;
  characters: string[]; // 涉及的角色ID
  importance: number; // 0-100，事件重要性
 伏笔: boolean; // 是否为伏笔
  resolved: boolean; // 伏笔是否回收
  createdAt: string;
  updatedAt: string;
}

export interface WorldSetting {
  id: string;
  type: 'location' | 'rule' | 'item' | 'concept';
  name: string;
  description: string;
  relevance: number; // 0-100，与当前故事的相关度
  createdAt: string;
  updatedAt: string;
}

// 向量存储相关类型
export interface VectorEmbedding {
  id: string;
  content: string;
  embedding: number[];
  memoryType: 'character' | 'event' | 'setting';
  memoryId: string;
  createdAt: string;
}

// 记忆检索结果
export interface MemorySearchResult {
  memory: CharacterMemory | EventMemory | WorldSetting;
  score: number; // 相关性得分
}

// 记忆库类型
export interface MemoryStore {
  characters: CharacterMemory[];
  events: EventMemory[];
  settings: WorldSetting[];
  embeddings: VectorEmbedding[];
}