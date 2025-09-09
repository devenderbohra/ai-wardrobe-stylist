/**
 * API service functions for the AI Wardrobe Stylist application
 */

import { ApiResponse, ClothingItem } from '@/src/types';

const API_BASE_URL = '/api';

/**
 * Generic API fetch wrapper with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    // Handle API responses that are already wrapped in { success, data }
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      return data;
    }
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

/**
 * Clothing item management APIs
 */
export const clothingAPI = {
  /**
   * Get all clothing items for user
   */
  getAll: async (userId: string): Promise<ApiResponse<ClothingItem[]>> => {
    return apiRequest<ClothingItem[]>(`/clothing?userId=${userId}`);
  },

  /**
   * Create new clothing item
   */
  create: async (itemData: Partial<ClothingItem>): Promise<ApiResponse<ClothingItem>> => {
    return apiRequest<ClothingItem>('/clothing', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },

  /**
   * Update clothing item
   */
  update: async (itemId: string, updates: Partial<ClothingItem>): Promise<ApiResponse<ClothingItem>> => {
    return apiRequest<ClothingItem>(`/clothing/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete clothing item
   */
  delete: async (itemId: string, userId?: string): Promise<ApiResponse<{ success: boolean }>> => {
    const url = userId ? `/clothing/${itemId}?userId=${userId}` : `/clothing/${itemId}`;
    return apiRequest(url, {
      method: 'DELETE',
    });
  },

  /**
   * Upload clothing item with file
   */
  uploadWithFile: async (file: File, itemData: Partial<ClothingItem>): Promise<ApiResponse<ClothingItem>> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('data', JSON.stringify(itemData));

    try {
      const response = await fetch(`${API_BASE_URL}/clothing/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Upload failed' };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Upload failed. Please try again.' };
    }
  },

  /**
   * Import from URL
   */
  importFromUrl: async (url: string, userId: string): Promise<ApiResponse<ClothingItem>> => {
    return apiRequest<ClothingItem>('/clothing/import-url', {
      method: 'POST',
      body: JSON.stringify({ url, userId }),
    });
  },
};

/**
 * Gemini API integration
 */
export const geminiAPI = {
  /**
   * Generate styled outfit image
   */
  generateOutfitImage: async (request: { 
    occasionType: string; 
    selectedItems: string[]; 
    userPhotoType: 'headshot' | 'fullBody'; 
    userId: string; 
  }) => {
    return apiRequest('/gemini/generate-outfit', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};

/**
 * Error handling helper
 */
export const handleApiError = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return 'An unexpected error occurred. Please try again.';
};