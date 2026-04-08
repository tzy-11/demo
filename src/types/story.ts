export interface Story {
  id: string;
  title: string;
  author: string;
  summary: string;
  coverUrl?: string;
  createdAt: number;
  updatedAt: number;
}

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

export interface StoryStoreState {
  stories: Story[];
  nodes: StoryNode[];
  getStories: () => Story[];
  createStory: (title: string, author: string, summary: string) => Story;
  updateStory: (storyId: string, updates: Partial<Story>) => void;
  deleteStory: (storyId: string) => void;
  getStoryById: (storyId: string) => Story | undefined;
  exportStory: (storyId: string) => string;
  updateNodeContent: (nodeId: string, content: string, imagePrompt?: string) => void;
  addOptionToNode: (nodeId: string, option: Omit<StoryOption, 'id'>) => StoryOption;
  createNewNodeFromOption: (storyId: string, optionId: string, nodeData: Partial<StoryNode>) => StoryNode;
  deleteNode: (nodeId: string) => void;
  getRootNode: (storyId: string) => StoryNode | undefined;
  getNodeById: (nodeId: string) => StoryNode | undefined;
  getNodesByStoryId: (storyId: string) => StoryNode[];
  updateStoryCover: (storyId: string, coverUrl: string) => void;
  updateNodeImage: (nodeId: string, imageUrl: string) => void;
}
