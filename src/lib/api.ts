/**
 * API service functions for the AI Wardrobe Stylist application
 */

import { 
  ApiResponse, 
  ClothingItem, 
  UrlImportRequest, 
  UrlImportResult,
  GeminiImageRequest,
  GeminiImageResponse,
  OutfitRecommendationRequest,
  OutfitRecommendationResponse,
  User,
  Outfit
} from '@/src/types';

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
 * Upload image file to server
 */
export async function uploadImage(file: File): Promise<ApiResponse<{ url: string; thumbnailUrl?: string }>> {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Upload failed',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Upload failed. Please try again.',
    };
  }
}

/**
 * Import clothing item from URL
 */
export async function importFromUrl(request: UrlImportRequest): Promise<ApiResponse<UrlImportResult>> {
  return apiRequest<UrlImportResult>('/clothing/import-url', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Analyze clothing image with AI
 */
export async function analyzeClothingImage(imageUrl: string): Promise<ApiResponse<any>> {
  return apiRequest('/clothing/analyze', {
    method: 'POST',
    body: JSON.stringify({ imageUrl }),
  });
}

/**
 * User management APIs
 */
export const userAPI = {
  /**
   * Create new user profile
   */
  create: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    return apiRequest<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Get user profile
   */
  get: async (userId: string): Promise<ApiResponse<User>> => {
    return apiRequest<User>(`/users/${userId}`);
  },

  /**
   * Update user profile
   */
  update: async (userId: string, updates: Partial<User>): Promise<ApiResponse<User>> => {
    return apiRequest<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Upload user photos
   */
  uploadPhotos: async (userId: string, photos: { headshot?: File; fullBody?: File }): Promise<ApiResponse<{ photos: User['photos'] }>> => {
    const formData = new FormData();
    if (photos.headshot) formData.append('headshot', photos.headshot);
    if (photos.fullBody) formData.append('fullBody', photos.fullBody);
    formData.append('userId', userId);

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/photos`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Photo upload failed' };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Photo upload failed. Please try again.' };
    }
  },
};

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
   * Get single clothing item
   */
  get: async (itemId: string): Promise<ApiResponse<ClothingItem>> => {
    return apiRequest<ClothingItem>(`/clothing/${itemId}`);
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
  generateOutfitImage: async (request: GeminiImageRequest): Promise<ApiResponse<GeminiImageResponse>> => {
    return apiRequest<GeminiImageResponse>('/gemini/generate-outfit', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Analyze clothing item
   */
  analyzeClothing: async (imageBase64: string): Promise<ApiResponse<any>> => {
    return apiRequest('/gemini/analyze-clothing', {
      method: 'POST',
      body: JSON.stringify({ image: imageBase64 }),
    });
  },
};

/**
 * Outfit management APIs
 */
export const outfitAPI = {
  /**
   * Get all outfits for user
   */
  getAll: async (userId: string): Promise<ApiResponse<Outfit[]>> => {
    return apiRequest<Outfit[]>(`/outfits?userId=${userId}`);
  },

  /**
   * Get single outfit
   */
  get: async (outfitId: string): Promise<ApiResponse<Outfit>> => {
    return apiRequest<Outfit>(`/outfits/${outfitId}`);
  },

  /**
   * Create new outfit
   */
  create: async (outfitData: Partial<Outfit>): Promise<ApiResponse<Outfit>> => {
    return apiRequest<Outfit>('/outfits', {
      method: 'POST',
      body: JSON.stringify(outfitData),
    });
  },

  /**
   * Update outfit
   */
  update: async (outfitId: string, updates: Partial<Outfit>): Promise<ApiResponse<Outfit>> => {
    return apiRequest<Outfit>(`/outfits/${outfitId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete outfit
   */
  delete: async (outfitId: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiRequest(`/outfits/${outfitId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get outfit recommendations
   */
  getRecommendations: async (request: OutfitRecommendationRequest): Promise<ApiResponse<OutfitRecommendationResponse>> => {
    return apiRequest<OutfitRecommendationResponse>('/outfits/recommendations', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Generate outfit with Gemini
   */
  generateWithAI: async (userId: string, request: {
    occasionType: string;
    selectedItems?: string[];
    userPhotoType: 'headshot' | 'fullBody';
  }): Promise<ApiResponse<Outfit>> => {
    return apiRequest<Outfit>('/outfits/generate', {
      method: 'POST',
      body: JSON.stringify({ userId, ...request }),
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