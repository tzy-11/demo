import { Low, type Adapter } from 'lowdb';
import { LocalStorage } from 'lowdb/browser';

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

// 创建 async adapter wrapper
class AsyncLocalStorageAdapter implements Adapter<Database> {
  private storage: LocalStorage<Database>;
  
  constructor(key: string) {
    this.storage = new LocalStorage<Database>(key);
  }
  
  async read(): Promise<Database | null> {
    return this.storage.read();
  }
  
  async write(data: Database): Promise<void> {
    return this.storage.write(data);
  }
}

const adapter = new AsyncLocalStorageAdapter('ai-narrative-stories');
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
