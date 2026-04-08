import { LowSync } from 'lowdb';
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

const adapter = new LocalStorage<Database>('ai-narrative-stories');
const defaultData: Database = { stories: [] };
export const db = new LowSync(adapter, defaultData);

export async function initDB() {
  db.read();
  db.data ||= defaultData;
}

export async function saveStory(story: Omit<Story, 'id' | 'createdAt'>) {
  db.read();
  const newStory: Story = {
    ...story,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
  db.data.stories.push(newStory);
  db.write();
  return newStory;
}

export async function getStories() {
  db.read();
  return db.data.stories;
}

export async function deleteStory(id: string) {
  db.read();
  db.data.stories = db.data.stories.filter(s => s.id !== id);
  db.write();
}
