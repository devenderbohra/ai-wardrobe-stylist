/**
 * Simple in-memory database for demo/production use
 * This simulates database persistence for the hackathon demo
 */

import { ClothingItem } from '@/src/types';

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  photos: any;
  styleProfile: any;
}

// In-memory storage
const memoryDB = {
  users: new Map<string, UserProfile>(),
  clothingItems: new Map<string, ClothingItem[]>(),
  initialized: false
};

export const memoryDatabase = {
  // User operations
  async getUserById(userId: string): Promise<UserProfile | null> {
    return memoryDB.users.get(userId) || null;
  },

  async createUser(userData: Partial<UserProfile> & { id: string }): Promise<UserProfile> {
    const user: UserProfile = {
      id: userData.id,
      name: userData.name || null,
      email: userData.email || `${userData.id}@demo.styledandstudied.com`,
      photos: userData.photos || null,
      styleProfile: userData.styleProfile || null
    };
    memoryDB.users.set(user.id, user);
    return user;
  },

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const existingUser = memoryDB.users.get(userId);
    const updatedUser: UserProfile = {
      id: userId,
      name: updates.name ?? existingUser?.name ?? null,
      email: updates.email ?? existingUser?.email ?? `${userId}@demo.styledandstudied.com`,
      photos: updates.photos ?? existingUser?.photos ?? null,
      styleProfile: updates.styleProfile ?? existingUser?.styleProfile ?? null
    };
    memoryDB.users.set(userId, updatedUser);
    return updatedUser;
  },

  // Clothing items operations
  async getClothingItems(userId: string): Promise<ClothingItem[]> {
    return memoryDB.clothingItems.get(userId) || [];
  },

  async createClothingItem(userId: string, item: ClothingItem): Promise<ClothingItem> {
    const userItems = memoryDB.clothingItems.get(userId) || [];
    userItems.push(item);
    memoryDB.clothingItems.set(userId, userItems);
    return item;
  },

  async deleteClothingItems(userId: string): Promise<void> {
    memoryDB.clothingItems.set(userId, []);
  },

  async updateClothingItem(userId: string, itemId: string, updates: Partial<ClothingItem>): Promise<ClothingItem | null> {
    const userItems = memoryDB.clothingItems.get(userId) || [];
    const itemIndex = userItems.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) return null;
    
    const updatedItem = { ...userItems[itemIndex], ...updates };
    userItems[itemIndex] = updatedItem;
    memoryDB.clothingItems.set(userId, userItems);
    return updatedItem;
  }
};

export const isMemoryDBMode = () => {
  return process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL?.startsWith('postgresql');
};