/**
 * API endpoint for generating outfit images using Gemini 2.5 Flash Image
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { generateOutfitImage } from '@/src/lib/gemini';
import { GeminiImageRequest, GeminiImageResponse } from '@/src/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GeminiImageResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      generationTime: 0
    });
  }

  try {
    const request: GeminiImageRequest = req.body;

    console.log('Gemini outfit generation request received:', {
      hasUserPhoto: !!request.userPhoto,
      clothingItemsCount: request.clothingItems?.length || 0,
      occasion: request.occasion
    });

    // Validate required fields
    if (!request.userPhoto) {
      return res.status(400).json({
        success: false,
        error: 'User photo is required for outfit generation',
        generationTime: 0
      });
    }

    if (!request.clothingItems || request.clothingItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one clothing item is required',
        generationTime: 0
      });
    }

    // Generate the outfit image
    const result = await generateOutfitImage(request);

    // Return the result
    res.status(200).json(result);

  } catch (error: any) {
    console.error('Gemini outfit generation error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during outfit generation',
      generationTime: 0
    });
  }
}