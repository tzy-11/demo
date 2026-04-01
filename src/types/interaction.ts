// 1. 互动选项定义
export interface Choice {
  id: string;
  text: string;         // 玩家看到的选项文本
  hint?: string;        // AI对该选项潜在后果的暗示（悬停显示）
  isHidden?: boolean;   // 是否因缺少条件而隐藏（预留字段）
  targetNodeId?: string;// 指向的下一个剧情节点ID
}

// 2. 剧情节点定义（树状结构）
export interface StoryNode {
  id: string;
  title: string;
  content: string;      // 章节正文
  choices: Choice[];    // 附带的选项
  parentId: string | null; // 父节点，用于回滚
  createdAt: number;
}
