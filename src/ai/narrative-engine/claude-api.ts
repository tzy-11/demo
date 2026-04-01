import type { AIChatRequest, AIChatResponse, StoryGenerationRequest, StoryGenerationResponse } from '../../types/ai';

class ClaudeAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string = '') {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.anthropic.com/v1/messages';
  }

  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    // 模拟 API 响应
    if (!this.apiKey) {
      return this.mockChatResponse(request);
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          messages: request.messages,
          model: request.model,
          temperature: request.temperature || 0.7,
          max_tokens: request.max_tokens || 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Chat API error:', error);
      return this.mockChatResponse(request);
    }
  }

  async generateStory(request: StoryGenerationRequest): Promise<StoryGenerationResponse> {
    // 构建系统提示
    const systemPrompt = `
你是一个专业的故事生成器，擅长根据用户提供的起点生成引人入胜的故事。

要求：
1. 根据用户输入的起点，生成一个完整的场景
2. 包含环境描述、角色对话和动作
3. 为故事生成 3-4 个合理的选项，引导故事发展
4. 保持风格一致，符合用户指定的风格
5. 生成一个适合图像生成的提示词

风格：${request.style === 'default' ? '默认' : request.style}
`;

    // 构建用户消息
    const userMessage = `故事起点：${request.prompt}`;

    // 调用聊天 API
    const chatResponse = await this.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      model: 'claude-3-opus-20240229',
      temperature: request.temperature || 0.8,
      max_tokens: request.maxLength || 1500,
    });

    // 解析响应
    const assistantMessage = chatResponse.choices[0].message.content;
    return this.parseStoryResponse(assistantMessage);
  }

  private mockChatResponse(request: AIChatRequest): AIChatResponse {
    const userInput = request.messages[request.messages.length - 1].content;
    const storyContent = this.generateDynamicStory(userInput);

    return {
      id: 'mock-response-' + Date.now(),
      object: 'message',
      created: Math.floor(Date.now() / 1000),
      model: request.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: storyContent,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 200,
        total_tokens: 300,
      },
    };
  }

  private generateDynamicStory(userInput: string): string {
    const keywords = userInput.toLowerCase();
    let story = '';
    let options: string[] = [];
    let imagePrompt = '';

    if (keywords.includes('侦探') || keywords.includes('推理')) {
      story = `夜幕降临，${userInput}。办公室里只有一盏昏黄的台灯还在亮着，桌上散落着几张照片和一份神秘的档案。电话铃声突然响起，打破了寂静...`;
      options = ['1. 接听电话', '2. 先查看档案', '3. 检查照片', '4. 观察窗外'];
      imagePrompt = '昏暗的侦探办公室，台灯照亮桌面，散落的照片和档案，窗外夜色';
    } else if (keywords.includes('冒险') || keywords.includes('探险')) {
      story = `${userInput}。眼前是一片未知的领域，远处传来奇怪的声音。背包里的装备有限，必须做出选择...`;
      options = ['1. 向声音方向前进', '2. 寻找安全的地方休息', '3. 检查地图', '4. 呼叫队友'];
      imagePrompt = '神秘的探险场景，未知的地形，远处有光芒，冒险者背影';
    } else if (keywords.includes('科幻') || keywords.includes('未来')) {
      story = `${userInput}。全息屏幕上闪烁着警告信号，飞船的AI系统发出提示音。时间紧迫，必须立即做出决定...`;
      options = ['1. 查看警告详情', '2. 联系指挥中心', '3. 启动紧急程序', '4. 手动控制飞船'];
      imagePrompt = '未来科幻场景，全息屏幕，飞船内部，蓝色科技光效';
    } else {
      story = `${userInput}。故事就这样开始了。周围的环境充满了未知和可能性，每一个选择都将影响接下来的发展...`;
      options = ['1. 仔细观察周围', '2. 与他人交谈', '3. 寻找线索', '4. 等待时机'];
      imagePrompt = `${userInput.substring(0, 50)}的场景，充满氛围感`;
    }

    return `${story}\n\n选择：\n${options.join('\n')}\n\n图像提示词：${imagePrompt}`;
  }

  private parseStoryResponse(response: string): StoryGenerationResponse {
    // 简单解析故事响应
    const lines = response.split('\n');
    let story = '';
    const options: string[] = [];
    let imagePrompt = '';

    let inStory = true;
    let inOptions = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('选择：')) {
        inStory = false;
        inOptions = true;
        continue;
      }
      
      if (trimmedLine.startsWith('图像提示词：')) {
        inOptions = false;
        imagePrompt = trimmedLine.replace('图像提示词：', '');
        continue;
      }
      
      if (inStory && trimmedLine) {
        story += line + '\n';
      }
      
      if (inOptions && trimmedLine && (trimmedLine.startsWith('1.') || trimmedLine.startsWith('2.') || trimmedLine.startsWith('3.') || trimmedLine.startsWith('4.'))) {
        options.push(trimmedLine);
      }
    }

    return {
      story: story.trim(),
      options,
      imagePrompt: imagePrompt.trim() || '神秘的场景，充满悬念和未知',
    };
  }
}

// 导出单例
export const claudeAPI = new ClaudeAPI();
export default ClaudeAPI;