/**
 * Simplified image upload API - using base64 for better deployment compatibility
 */

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageData, fileName } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // For demo purposes, we'll just return the base64 data as the URL
    // In production, you would upload to a cloud storage service like AWS S3, Cloudinary, etc.
    
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const mockFilename = `${timestamp}-${randomId}.jpg`;
    
    // Return the base64 data directly for demo purposes
    res.status(200).json({
      success: true,
      url: imageData, // Use base64 directly for demo
      thumbnailUrl: imageData, // Same for thumbnail
      filename: mockFilename,
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    
    res.status(500).json({ 
      error: 'Upload failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}