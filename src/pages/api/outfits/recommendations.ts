/**
 * API route for generating outfit recommendations
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { generateOutfitRecommendations } from '@/src/lib/recommendations';
import { 
  OutfitRecommendationRequest, 
  OutfitRecommendationResponse,
  ClothingItem 
} from '@/src/types';

// Mock database - in a real app, this would be replaced with actual database queries
const mockWardrobe: Record<string, ClothingItem[]> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      userId,
      occasion,
      season,
      preferredColors,
      excludeItemIds,
      includeItemIds,
      maxRecommendations = 10
    }: OutfitRecommendationRequest = req.body;

    // Validate required fields
    if (!userId || !occasion) {
      return res.status(400).json({ 
        error: 'userId and occasion are required' 
      });
    }

    // Validate occasion type
    const validOccasions = ['casual', 'work', 'date', 'formal', 'party'];
    if (!validOccasions.includes(occasion)) {
      return res.status(400).json({ 
        error: `Invalid occasion. Must be one of: ${validOccasions.join(', ')}` 
      });
    }

    // Get user's wardrobe items
    // In a real app, this would be a database query
    const wardrobeItems = mockWardrobe[userId] || [];
    
    if (wardrobeItems.length === 0) {
      return res.status(400).json({ 
        error: 'No wardrobe items found. Please add some clothing items first.' 
      });
    }

    const startTime = Date.now();

    // Generate recommendations
    const recommendations = generateOutfitRecommendations(wardrobeItems, occasion, {
      season,
      preferredColors,
      excludeItemIds,
      includeItemIds,
      maxRecommendations
    });

    const processingTime = Date.now() - startTime;

    const response: OutfitRecommendationResponse = {
      recommendations,
      totalCount: recommendations.length,
      processingTime
    };

    res.status(200).json(response);

  } catch (error: any) {
    console.error('Recommendation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate outfit recommendations',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Helper function to populate mock wardrobe for testing
export function setMockWardrobe(userId: string, items: ClothingItem[]) {
  mockWardrobe[userId] = items;
}

// Helper function to add item to mock wardrobe
export function addToMockWardrobe(userId: string, item: ClothingItem) {
  if (!mockWardrobe[userId]) {
    mockWardrobe[userId] = [];
  }
  mockWardrobe[userId].push(item);
}