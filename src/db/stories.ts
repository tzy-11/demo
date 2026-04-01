import { Low } from 'lowdb';

export interface Story {
  id: string;
  prompt: string;
  content: string;
  options: string[];
  imagePrompt: string;
  style: string;
  createdAt: string;
}

interface Database {
  stories: Story[];
}

// 使用内存存储作为适配器
class MemoryAdapter {
  private data: Database | null = null;
  private key: string;

  constructor(key: string) {
    this.key = key;
    // 从本地存储读取数据
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        this.data = JSON.parse(stored);
      } catch (e) {
        this.data = null;
      }
    }
  }

  async read(): Promise<Database | null> {
    return this.data;
  }

  async write(data: Database): Promise<void> {
    this.data = data;
    localStorage.setItem(this.key, JSON.stringify(data));
  }
}

const adapter = new MemoryAdapter('ai-narrative-stories');
const defaultData: Database = { stories: [] };
export const db = new Low(adapter, defaultData);

export async function initDB() {
  await db.read();
  db.data ||= defaultData;
}

export async function saveStory(story: Omit<Story, 'id' | 'createdAt'>) {
  await db.read();
  const newStory: Story = {
    ...story,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  db.data.stories.push(newStory);
  await db.write();
  return newStory;
}

export async function getStories() {
  await db.read();
  return db.data.stories;
}

export async function deleteStory(id: string) {
  await db.read();
  db.data.stories = db.data.stories.filter(s => s.id !== id);
  await db.write();
}
