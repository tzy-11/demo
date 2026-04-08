import type { AIChatRequest, AIChatResponse, StoryGenerationRequest, StoryGenerationResponse } from '../../types/ai';

class QwenAIClass {
  private apiKey: string;
  private baseUrl: string = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

  constructor(apiKey: string = '') {
    this.apiKey = apiKey || import.meta.env.VITE_ZHIPU_API_KEY || import.meta.env.REACT_APP_ZHIPU_API_KEY || '';
  }

  /**
   * 【核心优化 1】随机生成系统提示词，每次都不一样
   */
  /**
   * 【核心优化】全题材适配的动态系统提示词
   * 接收用户输入的 style（题材/风格），动态生成剧本杀主笔的系统设定
   */
  private getRandomSystemPrompt(style: string): string {
    // 1. 提取目标题材（如果没有传入或为 default，则使用兜底题材）
    const targetGenre = (style && style !== 'default') ? style : '充满变数与沉浸感的互动故事';

    // 2. 随机叙事视角（通用化，适用于恋爱、悬疑、日常等任何题材）
    const perspectives = [
      '使用细腻的第二人称“你”进行叙事，注重角色内心的情感波动和周围环境的氛围渲染。',
      '使用客观冷峻的第二人称“你”进行叙事，像摄像机一样精准描述发生的事件和对话，留白给玩家自己体会。',
      '使用带有轻微“不可靠叙述”倾向的口吻，字里行间暗示事情并不像表面看起来那么简单（不论是恋爱还是悬疑，都要有反转感）。'
    ];
    
    // 3. 随机节奏调度（不再局限于生死危机，而是“戏剧冲突”）
    const pacingFocus = [
      '电影感调度：注重微表情、小动作和场景细节的描写，用环境来烘托当前的情绪（如暧昧、紧张、悲伤）。',
      '对话驱动：通过一段极其拉扯、信息量大或带有试探性的对话来推动剧情，展现人物性格。',
      '草蛇灰线：在看似平淡的场景描写或对话中，隐藏一个微小但不寻常的细节，为后续的剧情转折埋下伏笔。'
    ];

    // 4. 通用禁忌元素（防止 AI 写出套路化的流水账网文）
    const randomForbidden = [
      '绝对不要平铺直叙地介绍人物背景或世界观，必须通过角色的对话、穿着或当前发生的事件侧面展现。',
      '不要让NPC或配角的反应过于扁平化或顺从，他们应该有自己的私心、目的或隐藏情绪。',
      '不要写出完美的“龙傲天”或“玛丽苏”开局，主角必须面临某种困境、纠结、或者资源/信息的匮乏。',
      '选项设置绝对不能是“好的/不要”这种废话，每个选项都必须代表一种截然不同的态度、策略或情感倾向。'
    ];

    const randomPerspective = perspectives[Math.floor(Math.random() * perspectives.length)];
    const randomFocus = pacingFocus[Math.floor(Math.random() * pacingFocus.length)];
    const forbidden = randomForbidden[Math.floor(Math.random() * randomForbidden.length)];

    return `
你是一个顶级的互动文学（Text AVG）主笔和游戏系统。

【核心题材/风格指令】：
本次你被指定创作的题材是：》》》【${targetGenre}】《《《。
你所有的文字基调、用词习惯、情节设计，都必须完美契合这个题材的商业级爆款标准！

【基础排版要求】：
1. 先输出完整的故事正文，必须包含生动的描写、动作或对话，字数要充足。
2. 故事正文输出完毕后，务必单独换行，以「选择：」为标题，输出3-4个推动剧情的选项。
3. 每个选项严格使用「数字. 选项内容」的格式，单独占一行。
4. 禁止将选项混在正文中，禁止给选项加粗。
5. 禁止输出任何图像提示词、绘图相关内容。

【本局剧本特定调度指令】：
- 叙事角度：${randomPerspective}
- 节奏调度：${randomFocus}
- 绝对禁忌：${forbidden}

请你立刻进入状态，以此题材的最高水准，给玩家带来最意想不到、最具沉浸感的展开！
`;
  }

  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    if (!this.apiKey) {
      return this.mockChatResponse(request);
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          messages: request.messages,
          model: request.model || 'qwen-turbo',
          // 【核心优化 2】稍微调高温度，增加随机性
          temperature: request.temperature || 0.9,
          top_p: 0.95, // 增加 top_p 参数，让采样更多样
          max_tokens: request.max_tokens || 1200,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`通义千问 API 错误 (${response.status}): ${errorData.error?.message || '请求失败'}`);
      }

      const data = await response.json();
      return data as AIChatResponse;
    } catch (error) {
      console.error('通义千问 Chat API 调用失败:', error);
      return this.mockChatResponse(request);
    }
  }

  async generateStory(request: StoryGenerationRequest): Promise<StoryGenerationResponse> {
    // 每次都获取随机的系统提示词
    const systemPrompt = this.getRandomSystemPrompt(request.style);
    const userMessage = `故事起点：${request.prompt}`;

    const chatResponse = await this.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      model: 'qwen-turbo',
      temperature: request.temperature || 0.9,
      max_tokens: request.maxLength || 1500,
    });

    const assistantMessage = chatResponse.choices[0].message.content;
    return this.parseStoryResponse(assistantMessage);
  }

  private mockChatResponse(request: AIChatRequest): AIChatResponse {
    const userInput = request.messages[request.messages.length - 1].content;
    const storyContent = this.generateDynamicStory(userInput);

    return {
      id: 'mock-qwen-response-' + Date.now(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: request.model || 'qwen-turbo',
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

    if (keywords.includes('侦探') || keywords.includes('推理')) {
      story = `夜幕降临，${userInput}。办公室里只有一盏昏黄的台灯还在亮着，桌上散落着几张照片和一份神秘的档案。电话铃声突然响起，打破了寂静...`;
      options = ['1. 接听电话', '2. 先查看档案', '3. 检查照片', '4. 观察窗外'];
    } else if (keywords.includes('冒险') || keywords.includes('探险')) {
      story = `${userInput}。眼前是一片未知的领域，远处传来奇怪的声音。背包里的装备有限，必须做出选择...`;
      options = ['1. 向声音方向前进', '2. 寻找安全的地方休息', '3. 检查地图', '4. 呼叫队友'];
    } else if (keywords.includes('科幻') || keywords.includes('未来')) {
      story = `${userInput}。全息屏幕上闪烁着警告信号，飞船的AI系统发出提示音。时间紧迫，必须立即做出决定...`;
      options = ['1. 查看警告详情', '2. 联系指挥中心', '3. 启动紧急程序', '4. 手动控制飞船'];
    } else {
      story = `${userInput}。故事就这样开始了。周围的环境充满了未知和可能性，每一个选择都将影响接下来的发展...`;
      options = ['1. 仔细观察周围', '2. 与他人交谈', '3. 寻找线索', '4. 等待时机'];
    }

    return `${story}\n\n选择：\n${options.join('\n')}`;
  }

  private parseStoryResponse(response: string): StoryGenerationResponse {
    console.log('🔍 开始解析 AI 原始响应:', response);
    let rawText = response.trim();

    const allOptions: string[] = [];
    const superOptionRegex = /(?:\*\*)?(?:选项)?\s*(\d+)[.、：:]\s*([\s\S]*?)(?=(?:\*\*)?(?:选项)?\s*\d+[.、：:]|\n\s*选择：|$)/g;
    let optionMatch;

    while ((optionMatch = superOptionRegex.exec(rawText)) !== null) {
      const optText = optionMatch[2]
        .replace(/\*\*/g, '')
        .replace(/\n/g, ' ')
        .replace(/[\\/*\-"']+$/g, '')
        .trim();
      if (optText && optText.length > 3) {
        allOptions.push(`${optionMatch[1]}. ${optText}`);
      }
    }

    let cleanStory = rawText.replace(superOptionRegex, '');
    cleanStory = cleanStory
      .replace(/(\*\*)?(选择|选项|故事选项|接下来的选项)(\*\*)?[:：]\s*/g, '')
      .replace(/---+/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    let finalOptions = allOptions;
    let isFallback = false;

    if (finalOptions.length === 0) {
      console.warn('⚠️ 未解析到AI输出的有效选项，启用兜底默认选项');
      isFallback = true;
      finalOptions = [
        '1. 继续深入探索，寻找更多线索',
        '2. 停下脚步，仔细观察周围环境',
        '3. 原路返回，更换探索方向'
      ];
    }

    const result = {
      story: cleanStory || rawText,
      options: finalOptions,
      imagePrompt: '',
      isFallback: isFallback
    };

    console.log(`✅ 解析完成 | 抓到选项数: ${finalOptions.length} | 选项列表:`, finalOptions);
    return result;
  }
}

export const claudeAPI = new QwenAIClass();
export default QwenAIClass;