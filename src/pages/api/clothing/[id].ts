import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/src/lib/prisma';
import { ApiResponse, ClothingItem } from '@/src/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ClothingItem | { success: boolean }>>
) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Item ID is required'
    });
  }

  try {
    if (req.method === 'PUT') {
      // Update clothing item
      const {
        userId,
        name,
        category,
        type,
        imageUrl,
        thumbnailUrl,
        colors,
        primaryColor,
        style,
        season,
        tags,
        brand,
        sourceUrl,
        isFavorite,
        wearCount,
        aiAnalysis
      } = req.body;

      // Verify the item belongs to the user
      const existingItem = await prisma.clothingItem.findUnique({
        where: { id }
      });

      if (!existingItem) {
        return res.status(404).json({
          success: false,
          error: 'Item not found'
        });
      }

      if (userId && existingItem.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this item'
        });
      }

      const updatedItem = await prisma.clothingItem.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(category && { category }),
          ...(type !== undefined && { type }),
          ...(imageUrl && { imageUrl }),
          ...(thumbnailUrl !== undefined && { thumbnailUrl }),
          ...(colors && { colors: JSON.stringify(colors) }),
          ...(primaryColor && { primaryColor }),
          ...(style && { style }),
          ...(season && { season: JSON.stringify(season) }),
          ...(tags && { tags: JSON.stringify(tags) }),
          ...(brand !== undefined && { brand }),
          ...(sourceUrl !== undefined && { sourceUrl }),
          ...(isFavorite !== undefined && { isFavorite }),
          ...(wearCount !== undefined && { wearCount }),
          ...(aiAnalysis !== undefined && { aiAnalysis: aiAnalysis ? JSON.stringify(aiAnalysis) : null }),
        }
      });

      const transformedItem: ClothingItem = {
        ...updatedItem,
        type: updatedItem.type === null ? undefined : updatedItem.type as any,
        category: updatedItem.category as any,
        thumbnailUrl: updatedItem.thumbnailUrl === null ? undefined : updatedItem.thumbnailUrl,
        primaryColor: updatedItem.primaryColor as any,
        style: updatedItem.style as any,
        sourceUrl: updatedItem.sourceUrl === null ? undefined : updatedItem.sourceUrl,
        brand: updatedItem.brand === null ? undefined : updatedItem.brand,
        colors: JSON.parse(updatedItem.colors),
        season: JSON.parse(updatedItem.season),
        tags: JSON.parse(updatedItem.tags),
        aiAnalysis: updatedItem.aiAnalysis ? JSON.parse(updatedItem.aiAnalysis) : undefined,
      };

      return res.status(200).json({
        success: true,
        data: transformedItem
      });
    }

    if (req.method === 'DELETE') {
      // Delete clothing item
      const { userId } = req.query;

      // Verify the item exists and belongs to the user
      const existingItem = await prisma.clothingItem.findUnique({
        where: { id }
      });

      if (!existingItem) {
        return res.status(404).json({
          success: false,
          error: 'Item not found'
        });
      }

      if (userId && existingItem.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this item'
        });
      }

      // Delete the item and its outfit associations
      await prisma.clothingItem.delete({
        where: { id }
      });

      return res.status(200).json({
        success: true,
        data: { success: true }
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Clothing item API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}