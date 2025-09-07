/**
 * API endpoint to seed wardrobe with sample items for new users
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/src/lib/prisma';
import { createSeedItems } from '@/src/lib/seed-data';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'User ID is required'
    });
  }

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
        itemsAdded: 0
      });
    }

    // Ensure user exists in database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      // Create user if they don't exist
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
    
    // Save all items to database
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

    res.status(200).json({
      success: true,
      message: `Added ${savedItems.length} sample items to your wardrobe`,
      itemsAdded: savedItems.length,
      items: savedItems
    });

  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create sample wardrobe items',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}