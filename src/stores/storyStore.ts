import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  imagePrompt?: string;
  options: StoryOption[];
  parentNodeId: string | null;
  createdAt: string;
}

export interface Story {
  id: string;
  title: string;
  author: string;
  background: string;
  rootNodeId: string;
  createdAt: string;
  updatedAt: string;
}

interface StoryStoreState {
  stories: Story[];
  nodes: StoryNode[];
  createStory: (title: string, author: string, background: string) => Story;
  getStories: () => Story[];
  getRootNode: (storyId: string) => StoryNode | undefined;
  getNodeById: (nodeId: string) => StoryNode | undefined;
  addOptionToNode: (nodeId: string, option: Omit<StoryOption, 'id'>) => void;
  createNewNodeFromOption: (storyId: string, optionId: string, nodeData: Omit<StoryNode, 'id' | 'storyId' | 'options' | 'parentNodeId' | 'createdAt'>) => StoryNode;
  updateNodeContent: (nodeId: string, content: string, imagePrompt?: string) => void;
  updateStory: (storyId: string, updates: Partial<Story>) => void;
  deleteStory: (storyId: string) => void;
}

const useStoryStore = create<StoryStoreState>()(
  persist(
    (set, get) => ({
      stories: [],
      nodes: [],

      createStory: (title, author, background) => {
        const storyId = Date.now().toString();
        const rootNodeId = `${storyId}-root`;
        const now = new Date().toISOString();

        const newStory: Story = {
          id: storyId,
          title,
          author,
          background,
          rootNodeId,
          createdAt: now,
          updatedAt: now
        };

        const rootNode: StoryNode = {
          id: rootNodeId,
          storyId,
          title: '开始',
          content: '',
          options: [],
          parentNodeId: null,
          createdAt: now
        };

        set((state) => ({
          stories: [...state.stories, newStory],
          nodes: [...state.nodes, rootNode]
        }));

        return newStory;
      },

      getStories: () => get().stories,

      getRootNode: (storyId) => {
        const story = get().stories.find(s => s.id === storyId);
        if (!story) return undefined;
        return get().nodes.find(n => n.id === story.rootNodeId);
      },

      getNodeById: (nodeId) => get().nodes.find(n => n.id === nodeId),

      addOptionToNode: (nodeId, option) => {
        const optionId = `${nodeId}-opt-${Date.now()}`;
        const newOption: StoryOption = { ...option, id: optionId };

        set((state) => ({
          nodes: state.nodes.map(node =>
            node.id === nodeId ? { ...node, options: [...node.options, newOption] } : node
          )
        }));
      },

      createNewNodeFromOption: (storyId, optionId, nodeData) => {
        const nodeId = `${storyId}-${Date.now()}`;
        const newNode: StoryNode = {
          ...nodeData,
          id: nodeId,
          storyId,
          options: [],
          parentNodeId: null,
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          nodes: [
            ...state.nodes.map(node => ({
              ...node,
              options: node.options.map(opt =>
                opt.id === optionId ? { ...opt, nextNodeId: nodeId } : opt
              )
            })),
            newNode
          ]
        }));

        return newNode;
      },

      updateNodeContent: (nodeId, content, imagePrompt) => {
        set((state) => ({
          nodes: state.nodes.map(node =>
            node.id === nodeId ? { ...node, content, imagePrompt } : node
          )
        }));
      },

      updateStory: (storyId, updates) => {
        set((state) => ({
          stories: state.stories.map(story =>
            story.id === storyId ? { ...story, ...updates, updatedAt: new Date().toISOString() } : story
          )
        }));
      },

      deleteStory: (storyId) => {
        set((state) => ({
          stories: state.stories.filter(s => s.id !== storyId),
          nodes: state.nodes.filter(n => n.storyId !== storyId)
        }));
      }
    }),
    { name: 'ai-narrative-story-store' }
  )
);

export default useStoryStore;
