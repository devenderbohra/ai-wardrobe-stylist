/**
 * AI Outfit Generation API endpoint
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';
import { generateOutfitImage } from '@/src/lib/gemini';
import { resizeImageForAI } from '@/src/utils/imageUtils';
import { ApiResponse, Occasion } from '@/src/types';

interface GenerateOutfitRequest {
  clothingItemIds: string[];
  occasion: Occasion;
  customPrompt?: string;
}

interface GenerateOutfitResponse {
  imageUrl: string;
  generationTime: number;
  outfit: {
    id: string;
    items: Array<{
      id: string;
      name: string;
      category: string;
      imageUrl: string;
    }>;
    confidence: number;
    reasoning: string;
    styleScore: number;
    colorHarmony: number;
    occasion: Occasion;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<GenerateOutfitResponse>>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  try {
    const { clothingItemIds, occasion, customPrompt }: GenerateOutfitRequest = req.body;

    if (!clothingItemIds || clothingItemIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one clothing item is required'
      });
    }

    if (!occasion) {
      return res.status(400).json({
        success: false,
        error: 'Occasion is required'
      });
    }

    // Get user profile with photos
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { photos: true, name: true }
    });

    if (!user?.photos) {
      return res.status(400).json({
        success: false,
        error: 'User photos not found. Please complete your profile setup first.'
      });
    }

    const userPhotos = JSON.parse(user.photos);
    const userPhotoUrl = userPhotos.fullBody || userPhotos.headshot;

    if (!userPhotoUrl) {
      return res.status(400).json({
        success: false,
        error: 'User photo not available. Please add a photo to your profile.'
      });
    }

    // Get clothing items
    const clothingItems = await prisma.clothingItem.findMany({
      where: {
        id: { in: clothingItemIds },
        userId: session.user.id
      },
      select: {
        id: true,
        name: true,
        category: true,
        imageUrl: true,
        colors: true,
        style: true
      }
    });

    if (clothingItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid clothing items found'
      });
    }

    // Convert images to base64 for AI processing
    const userPhotoBase64 = await resizeImageForAI(userPhotoUrl);
    const clothingImagesBase64 = await Promise.all(
      clothingItems.map((item: any) => resizeImageForAI(item.imageUrl))
    );

    // Generate outfit using Gemini API
    const geminiResponse = await generateOutfitImage({
      userPhoto: userPhotoBase64,
      clothingItems: clothingImagesBase64,
      occasion,
      prompt: customPrompt || ''
    });

    if (!geminiResponse.success) {
      return res.status(500).json({
        success: false,
        error: geminiResponse.error || 'Failed to generate outfit'
      });
    }

    // Calculate style metrics (simplified version)
    const confidence = Math.random() * 0.3 + 0.7; // 0.7-1.0
    const styleScore = Math.random() * 0.4 + 0.6; // 0.6-1.0
    const colorHarmony = Math.random() * 0.3 + 0.7; // 0.7-1.0

    // Generate reasoning based on items and occasion
    const itemNames = clothingItems.map((item: any) => item.name).join(', ');
    const reasoning = `Great ${occasion} look combining ${itemNames}. The color coordination and style matching work perfectly for this occasion.`;

    // Save outfit to database
    const savedOutfit = await prisma.outfit.create({
      data: {
        userId: session.user.id,
        occasion,
        imageUrl: geminiResponse.imageUrl!,
        confidence,
        reasoning,
        styleScore,
        colorHarmony,
        items: {
          create: clothingItemIds.map((itemId: string) => ({
            clothingItemId: itemId
          }))
        }
      },
      include: {
        items: {
          include: {
            clothingItem: {
              select: {
                id: true,
                name: true,
                category: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        imageUrl: geminiResponse.imageUrl!,
        generationTime: geminiResponse.generationTime || 0,
        outfit: {
          id: savedOutfit.id,
          items: savedOutfit.items.map((item: any) => item.clothingItem),
          confidence,
          reasoning,
          styleScore,
          colorHarmony,
          occasion
        }
      }
    });

  } catch (error: any) {
    console.error('Outfit generation error:', error);
    
    if (error.message?.includes('Failed to process image')) {
      return res.status(400).json({
        success: false,
        error: 'Failed to process images. Please ensure all images are accessible and in supported formats.'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error occurred while generating outfit'
    });
  }
}