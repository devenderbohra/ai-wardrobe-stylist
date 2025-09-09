import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/src/lib/prisma';
import { createSeedItems } from '@/src/lib/seed-data';
import { ApiResponse, ClothingItem } from '@/src/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ClothingItem[] | ClothingItem>>
) {
  // DEMO: Use demo user from query params for GET, body for POST
  const userId = req.method === 'GET' ? req.query.userId as string : req.body.userId;
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'User ID required'
    });
  }

  try {
    if (req.method === 'GET') {
      // Get all clothing items for the user
      const items = await prisma.clothingItem.findMany({
        where: { userId },
        orderBy: { dateAdded: 'desc' }
      });

      const transformedItems: ClothingItem[] = items.map(item => ({
        ...item,
        type: item.type === null ? undefined : item.type as any,
        category: item.category as any,
        thumbnailUrl: item.thumbnailUrl === null ? undefined : item.thumbnailUrl,
        primaryColor: item.primaryColor as any,
        style: item.style as any,
        sourceUrl: item.sourceUrl === null ? undefined : item.sourceUrl,
        brand: item.brand === null ? undefined : item.brand,
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
      const { action } = req.body;
      
      // Handle seed and reset actions
      if (action === 'seed') {
        return handleSeedWardrobe(req, res, userId);
      } else if (action === 'reset') {
        return handleResetWardrobe(req, res, userId);
      }
      
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
        type: newItem.type === null ? undefined : newItem.type as any,
        category: newItem.category as any,
        thumbnailUrl: newItem.thumbnailUrl === null ? undefined : newItem.thumbnailUrl,
        primaryColor: newItem.primaryColor as any,
        style: newItem.style as any,
        sourceUrl: newItem.sourceUrl === null ? undefined : newItem.sourceUrl,
        brand: newItem.brand === null ? undefined : newItem.brand,
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

async function handleSeedWardrobe(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    // Check if user already has items
    const existingItems = await prisma.clothingItem.findMany({
      where: { userId },
      take: 1
    });

    if (existingItems.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'User already has wardrobe items',
        data: []
      });
    }

    // Ensure user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      await prisma.user.create({
        data: {
          id: userId,
          name: 'Demo User',
          email: `${userId}@demo.styledandstudied.com`
        }
      });
    }

    // Create seed items
    const seedItems = createSeedItems(userId);
    const savedItems = await Promise.all(
      seedItems.map(item => 
        prisma.clothingItem.create({
          data: {
            id: item.id,
            userId: item.userId,
            name: item.name,
            category: item.category,
            type: item.type || null,
            imageUrl: item.imageUrl,
            colors: JSON.stringify(item.colors),
            primaryColor: item.primaryColor,
            style: item.style,
            season: JSON.stringify(item.season),
            tags: JSON.stringify(item.tags),
            sourceUrl: item.sourceUrl || null,
            brand: item.brand || null,
            dateAdded: item.dateAdded,
            wearCount: item.wearCount,
            isFavorite: item.isFavorite,
            aiAnalysis: item.aiAnalysis ? JSON.stringify(item.aiAnalysis) : null,
          }
        })
      )
    );

    return res.status(200).json({
      success: true,
      message: `Added ${savedItems.length} sample items`,
      data: savedItems
    });
  } catch (error) {
    console.error('Seed error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to seed wardrobe'
    });
  }
}

async function handleResetWardrobe(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    // Delete existing items
    const deletedItems = await prisma.clothingItem.deleteMany({
      where: { userId }
    });

    // Ensure user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      await prisma.user.create({
        data: {
          id: userId,
          name: 'Demo User',
          email: `${userId}@demo.styledandstudied.com`
        }
      });
    }

    // Create new seed items
    const seedItems = createSeedItems(userId);
    const savedItems = await Promise.all(
      seedItems.map(item => 
        prisma.clothingItem.create({
          data: {
            id: item.id,
            userId: item.userId,
            name: item.name,
            category: item.category,
            type: item.type || null,
            imageUrl: item.imageUrl,
            colors: JSON.stringify(item.colors),
            primaryColor: item.primaryColor,
            style: item.style,
            season: JSON.stringify(item.season),
            tags: JSON.stringify(item.tags),
            sourceUrl: item.sourceUrl || null,
            brand: item.brand || null,
            dateAdded: item.dateAdded,
            wearCount: item.wearCount,
            isFavorite: item.isFavorite,
            aiAnalysis: item.aiAnalysis ? JSON.stringify(item.aiAnalysis) : null,
          }
        })
      )
    );

    return res.status(200).json({
      success: true,
      message: `Reset wardrobe with ${savedItems.length} items`,
      data: savedItems
    });
  } catch (error) {
    console.error('Reset error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to reset wardrobe'
    });
  }
}