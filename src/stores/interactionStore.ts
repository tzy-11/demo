import { create } from 'zustand';
import type { StoryNode } from '../types/interaction';

interface InteractionState {
  // 核心状态
  currentNodeId: string | null;
  nodes: Record<string, StoryNode>;
  isPreloading: boolean;
  preloadedNodes: Record<string, StoryNode>;
  error: string | null;
  
  // 方法
  initStory: (firstNode: StoryNode) => void;
  makeChoice: (choiceId: string) => void;
  addPreloadedNode: (choiceId: string, node: StoryNode) => void;
  setIsPreloading: (isPreloading: boolean) => void;
  resetStory: () => void;
  clearError: () => void;
  loadStory: (currentNodeId: string, nodes: Record<string, StoryNode>) => void;
}

export const useInteractionStore = create<InteractionState>((set, get) => ({
  // 初始状态
  currentNodeId: null,
  nodes: {},
  isPreloading: false,
  preloadedNodes: {},
  error: null,
  
  // 初始化故事
  initStory: (firstNode: StoryNode) => {
    set({
      currentNodeId: firstNode.id,
      nodes: {
        [firstNode.id]: firstNode
      },
      preloadedNodes: {},
      error: null
    });
  },
  
  // 选择选项
  makeChoice: (choiceId: string) => {
    const { preloadedNodes, nodes, currentNodeId } = get();
    
    if (!currentNodeId) return;
    
    // 检查是否有预加载的节点
    if (preloadedNodes[choiceId]) {
      const preloadedNode = preloadedNodes[choiceId];
      
      // 更新状态
      set({
        currentNodeId: preloadedNode.id,
        nodes: {
          ...nodes,
          [preloadedNode.id]: preloadedNode
        },
        preloadedNodes: Object.fromEntries(
          Object.entries(preloadedNodes).filter(([key]) => key !== choiceId)
        )
      });
    } else {
      // 这里暂时不需要真调 AI，等待预加载或手动生成
      console.log('No preloaded node found for choice:', choiceId);
    }
  },
  
  // 添加预加载节点
  addPreloadedNode: (choiceId: string, node: StoryNode) => {
    set((state) => ({
      preloadedNodes: {
        ...state.preloadedNodes,
        [choiceId]: node
      }
    }));
  },
  
  // 重置故事
  resetStory: () => {
    set({
      currentNodeId: null,
      nodes: {},
      isPreloading: false,
      preloadedNodes: {},
      error: null
    });
  },
  
  // 清除错误
  clearError: () => {
    set({ error: null });
  },
  
  // 设置预加载状态
  setIsPreloading: (isPreloading: boolean) => {
    set({ isPreloading });
  },
  
  // 加载存档
  loadStory: (currentNodeId: string, nodes: Record<string, StoryNode>) => {
    set({
      currentNodeId,
      nodes,
      preloadedNodes: {},
      error: null
    });
  }
}));
