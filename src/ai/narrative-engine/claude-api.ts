import type { 
  AIChatRequest, 
  AIChatResponse, 
  StoryGenerationRequest, 
  StoryGenerationResponse, 
  OptionsGenerationRequest, 
  OptionsGenerationResponse 
} from '../../types/ai';

class AIAPI {
  private apiKey: string;
  private baseUrl: string = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'; // 智谱 V4 官方推荐地址
  private defaultModel: string = 'glm-4-flash';

  constructor() {
    // 直接从环境变量读取智谱 API Key
    const envKey = import.meta.env.VITE_ZHIPU_API_KEY;
    if (!envKey) {
      console.warn('警告: 未找到 VITE_ZHIPU_API_KEY 环境变量，AI 功能可能无法使用。');
    }
    this.apiKey = envKey || '';
  }

  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          messages: request.messages,
          model: request.model || this.defaultModel,
          temperature: request.temperature || 0.7,
          max_tokens: request.max_tokens || 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`智谱 API 错误: ${response.status} - ${errorData.error?.message || '未知错误'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI 聊天接口报错:', error);
      throw error;
    }
  }

  async generateStory(request: StoryGenerationRequest): Promise<StoryGenerationResponse> {
    const systemPrompt = `
你是一个专业的故事生成器，擅长根据用户提供的起点生成引人入胜的故事。

要求：
1. 根据用户输入的起点，生成一个完整的场景
2. 包含环境描述、角色对话和动作
3. 必须在故事末尾以"选项："开头，列出 3-4 个合理的选择，引导故事发展
4. 必须在选项之后以"图像提示词："开头，生成一个适合作为插图的画面描述
5. 保持风格一致，符合用户指定的风格

风格：${request.style === 'default' ? '默认' : request.style}
`;

    const userMessage = `故事起点：${request.prompt}`;

    const chatResponse = await this.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      model: this.defaultModel,
      temperature: request.temperature || 0.8,
      max_tokens: request.maxLength || 1500,
    });

    const assistantMessage = chatResponse.choices[0].message.content;
    return this.parseStoryResponse(assistantMessage);
  }

  private parseStoryResponse(response: string): StoryGenerationResponse {
    const lines = response.split('\n');
    let story = '';
    const options: string[] = [];
    let imagePrompt = '';

    let parsingMode: 'story' | 'options' | 'image' = 'story';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      if (trimmedLine.includes('选项：')) {
        parsingMode = 'options';
        continue;
      }
      
      if (trimmedLine.includes('图像提示词：')) {
        parsingMode = 'image';
        imagePrompt = trimmedLine.replace('图像提示词：', '').trim();
        continue;
      }

      if (parsingMode === 'story') {
        story += line + '\n';
      } else if (parsingMode === 'options') {
        // 匹配 "1. xxx" 或 "- xxx" 格式的选项
        if (/^(\d+\.|-)\s+/.test(trimmedLine)) {
          options.push(trimmedLine.replace(/^(\d+\.|-)\s+/, '').trim());
        }
      } else if (parsingMode === 'image') {
        imagePrompt += ' ' + trimmedLine;
      }
    }

    return {
      story: story.trim(),
      options: options.length > 0 ? options : ['继续前进', '仔细观察', '转身离开'],
      imagePrompt: imagePrompt.trim() || '神秘的场景，充满悬念和未知',
    };
  }

  async generateOptions(request: OptionsGenerationRequest): Promise<OptionsGenerationResponse> {
    const systemPrompt = `
你是一个专业的故事选项生成器。请根据以下故事内容和上下文，直接生成 3-4 个合理的选项。
要求：
- 每行一个选项，以数字开头（如 "1. "）
- 不要输出任何其他解释性文字
`;

    const userMessage = `故事内容：${request.story}\n\n上下文：${request.context}`;

    const chatResponse = await this.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      model: this.defaultModel,
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = chatResponse.choices[0].message.content;
    return this.parseOptionsResponse(assistantMessage);
  }

  private parseOptionsResponse(response: string): OptionsGenerationResponse {
    const lines = response.split('\n');
    const options: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (/^\d+\./.test(trimmedLine)) {
        options.push(trimmedLine.replace(/^\d+\.\s*/, ''));
      }
    }

    if (options.length === 0) {
      return { options: ['继续前进', '仔细观察', '与他人交谈', '寻找线索'] };
    }

    return { options };
  }
}

export default AIAPI;