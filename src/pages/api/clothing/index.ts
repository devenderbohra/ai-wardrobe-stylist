import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions, prisma } from '@/src/lib/auth';
import { ApiResponse, ClothingItem } from '@/src/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ClothingItem[] | ClothingItem>>
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  const userId = session.user.id;

  try {
    if (req.method === 'GET') {
      // Get all clothing items for the user
      const items = await prisma.clothingItem.findMany({
        where: { userId },
        orderBy: { dateAdded: 'desc' }
      });

      const transformedItems: ClothingItem[] = items.map(item => ({
        ...item,
        category: item.category as any,
        colors: JSON.parse(item.colors),
        season: JSON.parse(item.season),
        tags: JSON.parse(item.tags),
        aiAnalysis: item.aiAnalysis ? JSON.parse(item.aiAnalysis) : undefined,
      }));

      return res.status(200).json({
        success: true,
        data: transformedItems
      });
    }

    if (req.method === 'POST') {
      // Create new clothing item
      const {
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
        aiAnalysis
      } = req.body;

      const newItem = await prisma.clothingItem.create({
        data: {
          userId,
          name,
          category,
          type,
          imageUrl,
          thumbnailUrl,
          colors: JSON.stringify(colors),
          primaryColor,
          style,
          season: JSON.stringify(season),
          tags: JSON.stringify(tags),
          brand,
          sourceUrl,
          isFavorite: isFavorite || false,
          aiAnalysis: aiAnalysis ? JSON.stringify(aiAnalysis) : null,
        }
      });

      const transformedItem: ClothingItem = {
        ...newItem,
        category: newItem.category as any,
        colors: JSON.parse(newItem.colors),
        season: JSON.parse(newItem.season),
        tags: JSON.parse(newItem.tags),
        aiAnalysis: newItem.aiAnalysis ? JSON.parse(newItem.aiAnalysis) : undefined,
      };

      return res.status(201).json({
        success: true,
        data: transformedItem
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Clothing API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}