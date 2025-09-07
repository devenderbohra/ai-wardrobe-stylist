/**
 * API route for handling image uploads
 */

import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { validateImageFile } from '@/src/utils';

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Invalid file type. Please upload JPEG, PNG, or WebP images only.'));
      return;
    }
    cb(null, true);
  }
});

// Middleware wrapper for Next.js
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Run multer middleware
    await runMiddleware(req, res, upload.single('image'));

    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Generate optimized images
    const originalPath = file.path;
    const filename = file.filename;
    const nameWithoutExt = path.parse(filename).name;
    
    // Create thumbnail
    const thumbnailFilename = `${nameWithoutExt}-thumb.webp`;
    const thumbnailPath = path.join(path.dirname(originalPath), thumbnailFilename);
    
    await sharp(originalPath)
      .resize(300, 300, { fit: 'cover', position: 'center' })
      .webp({ quality: 80 })
      .toFile(thumbnailPath);

    // Optimize main image
    const optimizedFilename = `${nameWithoutExt}-optimized.webp`;
    const optimizedPath = path.join(path.dirname(originalPath), optimizedFilename);
    
    await sharp(originalPath)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(optimizedPath);

    // Clean up original file
    fs.unlinkSync(originalPath);

    // Return URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3000`;
    const imageUrl = `${baseUrl}/uploads/${optimizedFilename}`;
    const thumbnailUrl = `${baseUrl}/uploads/${thumbnailFilename}`;

    res.status(200).json({
      success: true,
      url: imageUrl,
      thumbnailUrl: thumbnailUrl,
      filename: optimizedFilename,
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    
    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ 
      error: 'Upload failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};