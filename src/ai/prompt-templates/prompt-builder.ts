import { storyStyles } from './styles';

interface PromptOptions {
  style: string;
  prompt: string;
  context?: string;
  memory?: string;
}

export class PromptBuilder {
  static buildStoryPrompt(options: PromptOptions): string {
    const style = storyStyles[options.style] || storyStyles.default;
    
    let prompt = style.systemPrompt;
    
    // 添加上下文信息（如果有）
    if (options.context) {
      prompt += `\n\n上下文信息：\n${options.context}`;
    }
    
    // 添加记忆信息（如果有）
    if (options.memory) {
      prompt += `\n\n相关记忆：\n${options.memory}`;
    }
    
    // 添加用户输入
    prompt += `\n\n故事起点：${options.prompt}`;
    
    return prompt;
  }

  static buildContinuationPrompt(currentStory: string, style: string): string {
    const storyStyle = storyStyles[style] || storyStyles.default;
    
    return `
${storyStyle.systemPrompt}

当前故事：
${currentStory}

请继续这个故事，保持风格一致，并为故事生成 3-4 个合理的选项。
`;
  }

  static buildImagePrompt(sceneDescription: string, style: string): string {
    const styleName = storyStyles[style]?.name || '默认';
    
    return `
基于以下场景描述，生成一个适合图像生成的提示词：

场景：${sceneDescription}
风格：${styleName}

要求：
1. 详细描述场景的视觉元素
2. 突出风格特点
3. 适合 DALL-E 3 或 Stable Diffusion 生成
4. 语言简洁明了
`;
  }
}