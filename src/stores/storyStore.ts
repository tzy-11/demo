import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// 数据结构定义
export interface Story {
  id: string;          // 唯一ID (如 UUID)
  title: string;       // 故事标题
  author: string;      // 故事作者 (默认可为空或默认昵称)
  summary: string;     // 故事简介/背景设定
  coverUrl?: string;   // 封面图URL（留给 E模块 渲染）
  createdAt: number;   // 创建时间戳
  updatedAt: number;   // 最后修改时间
}

export interface StoryOption {
  id: string;
  text: string;            // 按钮上显示的文字 (如："推开那扇门")
  nextNodeId: string | null; // 选择后跳转的节点ID。如果是新分支还没生成，则为 null
}

export interface StoryNode {
  id: string;
  storyId: string;     // 关联的 Story ID
  title: string;       // 章节/节点标题 (如：第一章-初始森林)
  content: string;     // AI 生成的故事正文（A模块 Editor 核心操作字段）
  chapterName?: string;// 章节卷管理,用于在后台将节点逻辑分组 (如 "序章", "第一卷")
  
  // --- 视觉扩展字段 (留给 E模块 对接AI画图) ---
  imagePrompt?: string;// 画图提示词
  imageUrl?: string;   // 渲染出的图片URL
  
  // --- 互动分支 (留给 B模块 Player 渲染按钮) ---
  options: StoryOption[];
  
  isRoot?: boolean;    // 是否为故事的起始节点
}

// 状态管理接口
export interface StoryStoreState {
  // === 数据源 (State) ===
  stories: Story[];
  nodes: StoryNode[];
  
  // ==========================================
  // D 模块（作品管理）主要使用的基础 CRUD & 导出
  // ==========================================
  
  // 获取所有作品列表
  getStories: () => Story[];
  // 创建新作品（建议同时自动生成一个 isRoot: true 的初始节点）
  createStory: (title: string, author: string, summary: string) => Story;
  // 修改作品信息 (如：修改标题、简介、作者)
  updateStory: (storyId: string, updates: Partial<Story>) => void;
  // 删除作品及关联的所有节点
  deleteStory: (storyId: string) => void;
  // 根据 ID 获取单个作品详情
  getStoryById: (storyId: string) => Story | undefined;
  // 导出整部作品 (将故事树状结构打包成纯文本/Markdown 字符串)
  exportStory: (storyId: string) => string;

  // ==========================================
  // A 模块（Editor 长篇创作）主要使用的方法
  // ==========================================
  
  // 更新节点的正文内容和画图提示词
  updateNodeContent: (nodeId: string, content: string, imagePrompt?: string) => void;
  // 当 AI 生成了新的剧情分支时，调用此方法向当前节点添加选项
  addOptionToNode: (nodeId: string, option: Omit<StoryOption, 'id'>) => StoryOption;
  // 当作者点选某个分支并让 AI 生成新剧情后，创建新节点并自动与上一章的 option 绑定
  createNewNodeFromOption: (storyId: string, optionId: string, nodeData: Partial<StoryNode>) => StoryNode;
  // 删除节点/剪枝 (当对某条剧情支线不满意时，删除该节点及其后续衍生的所有子节点)
  deleteNode: (nodeId: string) => void;

  // ==========================================
  // B 模块（Player 互动阅读）主要使用的方法
  // ==========================================
  
  // 获取整个故事的起始节点（第一章入口）
  getRootNode: (storyId: string) => StoryNode | undefined;
  // 根据 ID 获取特定节点（当玩家点击分支选项跳转时使用）
  getNodeById: (nodeId: string) => StoryNode | undefined;
  // 获取某部作品下的所有节点列表 (用来渲染进度图或者预加载)
  getNodesByStoryId: (storyId: string) => StoryNode[];

  // ==========================================
  // E 模块（视觉体验）主要使用的方法
  // ==========================================
  
  // 当画图 API 返回结果后，保存图片 URL 到作品封面
  updateStoryCover: (storyId: string, coverUrl: string) => void;
  // 当画图 API 返回结果后，保存图片 URL 到对应的章节节点插图中
  updateNodeImage: (nodeId: string, imageUrl: string) => void;
}

// 创建 Zustand store
const useStoryStore = create<StoryStoreState>()(
  persist(
    (set, get) => ({
      // 初始状态
      stories: [],
      nodes: [],

      // D 模块方法
      getStories: () => get().stories,
      
      createStory: (title, author, summary) => {
        const storyId = uuidv4();
        const story: Story = {
          id: storyId,
          title,
          author,
          summary,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        // 创建初始节点
        const rootNode: StoryNode = {
          id: uuidv4(),
          storyId,
          title: '初始章节',
          content: '故事开始...',
          options: [],
          isRoot: true,
        };

        set((state) => ({
          stories: [...state.stories, story],
          nodes: [...state.nodes, rootNode],
        }));

        return story;
      },

      updateStory: (storyId, updates) => {
        set((state) => ({
          stories: state.stories.map((story) =>
            story.id === storyId
              ? { ...story, ...updates, updatedAt: Date.now() }
              : story
          ),
        }));
      },

      deleteStory: (storyId) => {
        set((state) => ({
          stories: state.stories.filter((story) => story.id !== storyId),
          nodes: state.nodes.filter((node) => node.storyId !== storyId),
        }));
      },

      getStoryById: (storyId) => {
        return get().stories.find((story) => story.id === storyId);
      },

      exportStory: (storyId) => {
        const story = get().stories.find((s) => s.id === storyId);
        if (!story) return '';

        const nodes = get().nodes.filter((node) => node.storyId === storyId);
        const rootNode = nodes.find((node) => node.isRoot);

        if (!rootNode) return '';

        // 递归构建故事树
        const buildStoryTree = (node: StoryNode, level = 0) => {
          let result = `${'#'.repeat(level + 1)} ${node.title}\n\n`;
          result += `${node.content}\n\n`;

          if (node.options.length > 0) {
            result += '## 选项\n\n';
            node.options.forEach((option, index) => {
              result += `${index + 1}. ${option.text}\n`;
              if (option.nextNodeId) {
                const nextNode = nodes.find((n) => n.id === option.nextNodeId);
                if (nextNode) {
                  result += '\n';
                  result += buildStoryTree(nextNode, level + 2);
                }
              }
            });
          }

          return result;
        };

        return `# ${story.title}\n\n## 简介\n\n${story.summary}\n\n${buildStoryTree(rootNode)}`;
      },

      // A 模块方法
      updateNodeContent: (nodeId, content, imagePrompt) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId
              ? { ...node, content, imagePrompt }
              : node
          ),
        }));
      },

      addOptionToNode: (nodeId, option) => {
        const newOption: StoryOption = {
          id: uuidv4(),
          ...option,
        };

        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId
              ? { ...node, options: [...node.options, newOption] }
              : node
          ),
        }));

        return newOption;
      },

      createNewNodeFromOption: (storyId, optionId, nodeData) => {
        const newNodeId = uuidv4();
        const newNode: StoryNode = {
          id: newNodeId,
          storyId,
          title: nodeData.title || '新章节',
          content: nodeData.content || '',
          options: nodeData.options || [],
          chapterName: nodeData.chapterName,
          imagePrompt: nodeData.imagePrompt,
          imageUrl: nodeData.imageUrl,
        };

        // 更新选项的 nextNodeId
        set((state) => ({
          nodes: [
            ...state.nodes.map((node) =>
              node.options.some((opt) => opt.id === optionId)
                ? {
                    ...node,
                    options: node.options.map((opt) =>
                      opt.id === optionId ? { ...opt, nextNodeId: newNodeId } : opt
                    ),
                  }
                : node
            ),
            newNode,
          ],
        }));

        return newNode;
      },

      deleteNode: (nodeId) => {
        const nodeToDelete = get().nodes.find((node) => node.id === nodeId);
        if (!nodeToDelete) return;

        // 找出所有需要删除的节点（当前节点及其所有子节点）
        const nodesToDelete = new Set<string>();
        const findChildNodes = (id: string) => {
          nodesToDelete.add(id);
          get().nodes.forEach((node) => {
            if (node.options.some((opt) => opt.nextNodeId === id)) {
              findChildNodes(node.id);
            }
          });
        };

        findChildNodes(nodeId);

        // 更新父节点的选项，将指向被删除节点的选项的 nextNodeId 设为 null
        set((state) => ({
          nodes: state.nodes
            .filter((node) => !nodesToDelete.has(node.id))
            .map((node) => ({
              ...node,
              options: node.options.map((opt) =>
                nodesToDelete.has(opt.nextNodeId || '')
                  ? { ...opt, nextNodeId: null }
                  : opt
              ),
            })),
        }));
      },

      // B 模块方法
      getRootNode: (storyId) => {
        return get().nodes.find((node) => node.storyId === storyId && node.isRoot);
      },

      getNodeById: (nodeId) => {
        return get().nodes.find((node) => node.id === nodeId);
      },

      getNodesByStoryId: (storyId) => {
        return get().nodes.filter((node) => node.storyId === storyId);
      },

      // E 模块方法
      updateStoryCover: (storyId, coverUrl) => {
        set((state) => ({
          stories: state.stories.map((story) =>
            story.id === storyId ? { ...story, coverUrl } : story
          ),
        }));
      },

      updateNodeImage: (nodeId, imageUrl) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId ? { ...node, imageUrl } : node
          ),
        }));
      },
    }),
    {
      name: 'story-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useStoryStore;