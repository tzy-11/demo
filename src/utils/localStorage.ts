import type { MemoryStore } from '../types/memory';

const STORAGE_KEY = 'ai-narrative-memory';

export const saveMemoryToLocalStorage = (memory: MemoryStore): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch (error) {
    console.error('Error saving memory to localStorage:', error);
  }
};

export const loadMemoryFromLocalStorage = (): MemoryStore | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    console.error('Error loading memory from localStorage:', error);
    return null;
  }
};

export const clearMemoryFromLocalStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing memory from localStorage:', error);
  }
};