/**
 * API endpoint to reset and fix a user's wardrobe with correct categorization
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
    console.log('Resetting wardrobe for user:', userId);

    // Delete all existing clothing items for this user
    const deletedItems = await prisma.clothingItem.deleteMany({
      where: { userId }
    });

    console.log('Deleted items:', deletedItems.count);

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

    // Create properly categorized seed items
    const seedItems = createSeedItems(userId);
    
    console.log('Creating seed items:', seedItems.map(item => ({ name: item.name, category: item.category })));

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

    console.log('Saved items:', savedItems.map(item => ({ name: item.name, category: item.category })));

    res.status(200).json({
      success: true,
      message: `Reset wardrobe with ${savedItems.length} properly categorized items`,
      deletedCount: deletedItems.count,
      itemsAdded: savedItems.length,
      items: savedItems.map(item => ({ id: item.id, name: item.name, category: item.category }))
    });

  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset wardrobe items',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}