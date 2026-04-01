export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIChatRequest {
  messages: AIChatMessage[];
  model: string;
  temperature?: number;
  max_tokens?: number;
}

export interface AIChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: AIChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StoryGenerationRequest {
  prompt: string;
  style: string;
  maxLength?: number;
  temperature?: number;
}

export interface StoryGenerationResponse {
  story: string;
  options: string[];
  imagePrompt?: string;
}