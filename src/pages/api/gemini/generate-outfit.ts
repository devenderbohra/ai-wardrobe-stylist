/**
 * API route for generating outfit images using Gemini 2.5 Flash Image
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { generateOutfitImage } from '@/src/lib/gemini';
import { GeminiImageRequest } from '@/src/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userPhoto, clothingItems, occasion, prompt }: GeminiImageRequest = req.body;

    // Validate required fields
    if (!userPhoto || !clothingItems || !occasion) {
      return res.status(400).json({ 
        error: 'userPhoto, clothingItems, and occasion are required' 
      });
    }

    if (!Array.isArray(clothingItems) || clothingItems.length === 0) {
      return res.status(400).json({ 
        error: 'At least one clothing item is required' 
      });
    }

    // Validate clothing items count (max 5 for performance)
    if (clothingItems.length > 5) {
      return res.status(400).json({ 
        error: 'Maximum 5 clothing items allowed per outfit generation' 
      });
    }

    // Validate base64 format
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(userPhoto)) {
      return res.status(400).json({ 
        error: 'Invalid user photo format. Must be base64 encoded.' 
      });
    }

    for (let i = 0; i < clothingItems.length; i++) {
      if (!base64Regex.test(clothingItems[i])) {
        return res.status(400).json({ 
          error: `Invalid clothing item ${i + 1} format. Must be base64 encoded.` 
        });
      }
    }

    // Generate the outfit image
    const result = await generateOutfitImage({
      userPhoto,
      clothingItems,
      occasion,
      prompt
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        imageUrl: result.imageUrl,
        generationTime: result.generationTime
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        generationTime: result.generationTime
      });
    }

  } catch (error: any) {
    console.error('Outfit generation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate outfit image',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}