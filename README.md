# AI 叙事创作平台

一个基于 React + TypeScript + Vite 构建的 AI 叙事创作平台，集成了 Claude API 用于智能故事生成，支持记忆系统管理和交互式故事体验。

## 功能特性

### 核心功能
- **AI 叙事生成引擎**：一键生成故事，支持多种风格控制
- **记忆跨度系统**：管理角色、剧情和场景记忆
- **长篇故事创作**：支持章节管理和内容扩展
- **交互式体验引擎**：动态选项和分支故事
- **创作者工作台**：智能编辑辅助

### 技术栈
- React 19.2.4
- TypeScript 5.9.3
- Vite 8.0.1
- Tailwind CSS 4.2.2
- Zustand 5.0.12 (状态管理)
- React Router 7.13.2 (路由)
- LowDB 7.0.1 (本地数据存储)

## 快速开始

### 环境要求
- Node.js 18.0 或更高版本
- npm 9.0 或更高版本

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <项目地址>
   cd demo
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置 API 密钥**
   - 打开 `src/ai/narrative-engine/claude-api.ts` 文件
   - 在 `ClaudeAPI` 类的构造函数中填写您的 Anthropic API 密钥

4. **启动开发服务器**
   ```bash
   npm run dev
   ```
   访问 http://localhost:5173 即可查看项目

5. **构建生产版本**
   ```bash
   npm run build
   ```
   构建产物将保存在 `dist` 目录中

## 项目结构

```
demo/
├── public/              # 静态资源
├── src/
│   ├── ai/             # AI 相关功能
│   │   ├── narrative-engine/  # 叙事引擎
│   │   └── prompt-templates/  # 提示模板
│   ├── components/     # 通用组件
│   ├── db/             # 数据存储
│   ├── pages/          # 页面组件
│   │   ├── Home.tsx    # 首页
│   │   ├── Editor.tsx  # 编辑器
│   │   ├── Memory.tsx  # 记忆系统
│   │   └── Player.tsx  # 播放器
│   ├── stores/         # 状态管理
│   ├── types/          # TypeScript 类型定义
│   ├── utils/          # 工具函数
│   ├── App.tsx         # 应用主组件
│   └── main.tsx        # 应用入口
├── tailwind.config.js  # Tailwind 配置
└── vite.config.ts      # Vite 配置
```

## 使用指南

### 1. 编辑器 (Editor)
- 在文本框中输入故事主题或初始设定
- 选择故事风格（如奇幻、科幻、冒险等）
- 点击「生成故事」按钮，AI 将自动生成故事内容
- 生成的故事将包含多个选项，可选择不同的发展方向

### 2. 记忆系统 (Memory)
- **角色管理**：添加、编辑和管理故事角色
- **事件管理**：记录和管理故事中的重要事件
- **场景管理**：创建和管理故事场景
- 所有记忆数据会自动保存到本地存储

### 3. 播放器 (Player)
- 阅读生成的故事内容
- 选择不同的选项来体验不同的故事发展
- 查看故事的完整流程和分支

## 核心 API

### Claude API 封装
- `claudeAPI.generateStory()`: 生成故事内容
- `claudeAPI.generateOptions()`: 生成故事选项
- `claudeAPI.generateImagePrompt()`: 生成图像提示词

### 记忆系统 API
- `useMemoryStore.addCharacter()`: 添加角色
- `useMemoryStore.addEvent()`: 添加事件
- `useMemoryStore.addSetting()`: 添加场景
- `useMemoryStore.getRelevantMemories()`: 获取相关记忆

## 自定义配置

### 故事风格
在 `src/ai/prompt-templates/styles.ts` 文件中可以添加或修改故事风格。

### 提示模板
在 `src/ai/prompt-templates/prompt-builder.ts` 文件中可以自定义提示模板。

## 浏览器兼容性
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+



