export type MemoryType = 'character' | 'event' | 'setting';

export interface MemoryEntity {
  id: string;
  type: MemoryType;
  storyId: string;
  nodeId?: string;
  source: 'ai-generated' | 'manual';
  createdAt: number;
  updatedAt: number;
}

export interface Relationship {
  characterId: string;
  type: 'friend' | 'enemy' | 'family' | 'colleague' | 'stranger';
  description: string;
  strength: number;
}

export interface CharacterMemory extends MemoryEntity {
  type: 'character';
  name: string;
  description: string;
  personality: string[];
  appearance: string;
  background: string;
  relationships: Relationship[];
  emotionalState: {
    好感度: number;
    信任度: number;
    情绪: 'happy' | 'sad' | 'angry' | 'neutral' | 'scared';
  };
}

export interface EventMemory extends MemoryEntity {
  type: 'event';
  title: string;
  description: string;
  timestamp: string;
  location: string;
  characterIds: string[];
  importance: number;
  isForeshadowing: boolean;
  isResolved: boolean;
}

export interface WorldSetting extends MemoryEntity {
  type: 'setting';
  settingType: 'location' | 'rule' | 'item' | 'concept';
  name: string;
  description: string;
  relevance: number;
}

export interface VectorEmbedding {
  id: string;
  storyId: string;
  nodeId?: string;
  content: string;
  embedding: number[];
  memoryType: MemoryType;
  memoryId: string;
  createdAt: number;
}

export interface MemorySearchResult {
  memory: CharacterMemory | EventMemory | WorldSetting;
  score: number;
}

export interface ContentSegment {
  text: string;
  startIndex: number;
  endIndex: number;
  field: string;
}

export interface MemoryRelation {
  id: string;
  storyId: string;
  sourceId: string;
  sourceType: MemoryType;
  targetId: string;
  targetType: MemoryType;
  relationshipType: 'participates_in' | 'happens_at' | 'related_to' | 'references' | 'conflicts_with';
  description?: string;
  strength: number;
  createdAt: number;
}

export type ConflictRuleType =
  | 'time_conflict'
  | 'location_conflict'
  | 'character_state_conflict'
  | 'setting_contradiction';

export interface ConflictFix {
  type: string;
  description: string;
  actions: string[];
}

export interface ConflictIssue {
  id: string;
  storyId: string;
  ruleType: ConflictRuleType;
  severity: 'error' | 'warn';
  entityIds: string[];
  description: string;
  details: Record<string, unknown>;
  suggestedFixes: ConflictFix[];
  detectedAt: number;
  resolved: boolean;
}

export interface SearchIndexEntry {
  storyId: string;
  nodeId?: string;
  entityId: string;
  entityType: MemoryType;
  content: string;
  fields: Record<string, string>;
  weight: number;
  createdAt: number;
}

export interface EnhancedSearchResult extends MemorySearchResult {
  segments: ContentSegment[];
  fields: string[];
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: MemoryType;
  data: CharacterMemory | EventMemory | WorldSetting;
  metadata: {
    storyId: string;
    conflictCount: number;
    relatedCount: number;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 'participates_in' | 'happens_at' | 'related_to' | 'references' | 'conflicts_with';
  weight: number;
}

export interface MemoryStore {
  characters: CharacterMemory[];
  events: EventMemory[];
  settings: WorldSetting[];
  embeddings: VectorEmbedding[];
}