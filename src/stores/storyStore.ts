import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. 类型定义（基于 DATA_STRUCTURE.md 约定）
export interface StoryOption {
  id: string;
  text: string;
  nextNodeId: string | null;
}

export interface StoryNode {
  id: string;
  storyId: string;
  title: string;
  content: string;
  chapterName?: string;
  imagePrompt?: string;
  imageUrl?: string;
  options: StoryOption[];
  isRoot?: boolean;
}

export interface Story {
  id: string;
  title: string;
  author: string;
  summary: string;
  coverUrl?: string;
  createdAt: number;
  updatedAt: number;
}

// 2. Store 状态与方法接口
export interface StoryStoreState {
  stories: Story[];
  nodes: StoryNode[];
  
  // D 模块负责的方法
  getStories: () => Story[];
  createStory: (title: string, author: string, summary: string) => Story;
  updateStory: (storyId: string, updates: Partial<Story>) => void;
  deleteStory: (storyId: string) => void;
  getStoryById: (storyId: string) => Story | undefined;
}

// 3. 创建 Zustand Store 并使用 persist 中间件
export const useStoryStore = create<StoryStoreState>()(
  persist(
    (set, get) => ({
      // 初始状态面板
      stories: [],
      nodes: [],

      // --- D 模块的基础 CRUD 实现 ---
      getStories: () => get().stories,
      
      getStoryById: (storyId: string) => get().stories.find((s) => s.id === storyId),

      // 创建作品及初始节点
      createStory: (title, author, summary) => {
        const newStory: Story = {
          id: crypto.randomUUID(), 
          title,
          author,
          summary,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        const rootNode: StoryNode = {
          id: crypto.randomUUID(),
          storyId: newStory.id,
          title: '序章',
          content: '故事就从这里开始...',
          options: [],
          isRoot: true,
        };

        set((state) => ({
          stories: [...state.stories, newStory],
          nodes: [...state.nodes, rootNode],
        }));

        return newStory;
      },

      updateStory: (storyId, updates) => {
        set((state) => ({
          stories: state.stories.map((story) =>
            story.id === storyId ? { ...story, ...updates, updatedAt: Date.now() } : story
          ),
        }));
      },

      deleteStory: (storyId) => {
        set((state) => ({
          stories: state.stories.filter((story) => story.id !== storyId),
          // 级联删除属于该故事的章节节点
          nodes: state.nodes.filter((node) => node.storyId !== storyId),
        }));
      },
    }),
    {
      name: 'vibe-coding-story-storage', // 存在 localStorage 里的 key 名称
    }
  )
);
