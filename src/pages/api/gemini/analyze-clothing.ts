/**
 * API route for analyzing clothing items using Gemini Vision
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { analyzeClothingImage } from '@/src/lib/gemini';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ 
        error: 'Image data is required' 
      });
    }

    // Validate base64 format
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(image)) {
      return res.status(400).json({ 
        error: 'Invalid image format. Must be base64 encoded.' 
      });
    }

    // Analyze the clothing item
    const result = await analyzeClothingImage(image);

    if (result.success) {
      res.status(200).json({
        success: true,
        analysis: result.analysis
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }

  } catch (error: any) {
    console.error('Clothing analysis error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to analyze clothing item',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}