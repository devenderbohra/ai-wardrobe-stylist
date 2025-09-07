/**
 * User profile API endpoint
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/src/lib/prisma';
import { ApiResponse } from '@/src/types';

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  photos: {
    headshot?: string;
    fullBody?: string;
  } | null;
  styleProfile: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<UserProfile>>
) {
  // DEMO: Use demo user from request body or query
  const userId = req.method === 'GET' ? req.query.userId as string : req.body.userId;
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'User ID required'
    });
  }

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId
        },
        select: {
          id: true,
          name: true,
          email: true,
          photos: true,
          styleProfile: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Parse JSON fields
      const photos = user.photos ? JSON.parse(user.photos) : null;
      const styleProfile = user.styleProfile ? JSON.parse(user.styleProfile) : null;

      return res.status(200).json({
        success: true,
        data: {
          ...user,
          photos,
          styleProfile
        }
      });
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get user profile'
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { photos, styleProfile } = req.body;
      
      const updateData: any = {};
      if (photos) {
        updateData.photos = JSON.stringify(photos);
      }
      if (styleProfile) {
        updateData.styleProfile = JSON.stringify(styleProfile);
      }

      const user = await prisma.user.update({
        where: {
          id: userId
        },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          photos: true,
          styleProfile: true
        }
      });

      // Parse JSON fields
      const parsedPhotos = user.photos ? JSON.parse(user.photos) : null;
      const parsedStyleProfile = user.styleProfile ? JSON.parse(user.styleProfile) : null;

      return res.status(200).json({
        success: true,
        data: {
          ...user,
          photos: parsedPhotos,
          styleProfile: parsedStyleProfile
        }
      });
    } catch (error) {
      console.error('Failed to update user profile:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update user profile'
      });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  });
}