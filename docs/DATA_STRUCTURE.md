# 核心数据结构与状态管理约定 (API Schema)

为了保证大家使用 Vibe Coding 时，AI 生成的代码能够完美对接，这里统一定义全局的数据结构（基于 TypeScript）以及 Zustand Store 的方法调用接口。
所有模块请严格遵守以下接口定义进行开发。

---

## 一、 数据结构定义 (State)

### 1. 作品 (Story) - 由 D 模块主导管理
`Story` 是最高层级的数据，所有的章节、记忆、图片都挂载在它下面。

```typescript
export interface Story {
  id: string;          // 唯一ID (如 UUID)
  title: string;       // 故事标题
  author: string;      // 故事作者 (默认可为空或默认昵称)
  summary: string;     // 故事简介/背景设定
  coverUrl?: string;   // 封面图URL（留给 E模块 渲染）
  createdAt: number;   // 创建时间戳
  updatedAt: number;   // 最后修改时间
}
```

### 2. 章节/剧情节点 (StoryNode) - A、B、D 模块共用
由于是互动小说，采用树状/网状节点结构，而不是传统的线性章节。

```typescript
export interface StoryNode {
  id: string;
  storyId: string;     // 关联的 Story ID
  title: string;       // 章节/节点标题 (如：第一章-初始森林)
  content: string;     // AI 生成的故事正文（A模块 Editor 核心操作字段）
  chapterName?: string;// 章节卷管理,用于在后台将节点逻辑分组 (如 "序章", "第一卷")
  nodeSummary?: string; // 每个节点的简要大纲，可以根据这个字段生成后续内容
  
  // --- 视觉扩展字段 (留给 E模块 对接AI画图) ---
  imagePrompt?: string;// 画图提示词
  imageUrl?: string;   // 渲染出的图片URL
  
  // --- 互动分支 (留给 B模块 Player 渲染按钮) ---
  options: StoryOption[];
  
  isRoot?: boolean;    // 是否为故事的起始节点
}
```

### 3. 分支选项 (StoryOption)
```typescript
export interface StoryOption {
  id: string;
  text: string;            // 按钮上显示的文字 (如："推开那扇门")
  nextNodeId: string | null; // 选择后跳转的节点ID。如果是新分支还没生成，则为 null
}
```

---

## 二、 状态管理约定 (Zustand Actions)

这些是全局的数据操作。D会用 Zustand + persist 中间件 (结合 utils/localStorage) 实现这个 Store 的状态持久化。**其他模块（A, B, E）请一律调用以下方法来读写数据。**

```typescript
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
  // 修改章节节点元数据 (如：修改节点标题 title、章节卷名称 chapterName 等)
  updateNodeMetadata: (nodeId: string, updates: Partial<StoryNode>) => void;

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
```