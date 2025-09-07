/**
 * API route for importing clothing items from URLs
 */

import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { prisma } from '@/src/lib/prisma';
import { 
  generateId,
  extractDomain,
  isSupportedEcommerceUrl,
  categorizeClothing,
  extractColorsFromText,
  inferSeasons,
  generateItemName 
} from '@/src/utils';
import { ClothingItem, UrlImportResult } from '@/src/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, userId } = req.body;
    console.log('URL import request (v2):', { url: url?.substring(0, 50), userId: userId?.substring(0, 10) });

    if (!url || !userId) {
      return res.status(400).json({ 
        error: 'URL and userId are required' 
      });
    }

    // Validate URL format
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return res.status(400).json({ 
        error: 'Invalid URL format' 
      });
    }

    // Check if it's a supported e-commerce site
    const domain = extractDomain(url);
    const isSupported = isSupportedEcommerceUrl(url);
    console.log('Domain validation:', { domain, isSupported });
    
    if (!isSupported) {
      return res.status(400).json({ 
        error: `${domain} is not currently supported. Please try uploading an image instead.` 
      });
    }

    // Scrape the product page
    const productData = await scrapeProductData(url);
    
    if (!productData.success || !productData.data) {
      return res.status(400).json({ 
        error: productData.error || 'Failed to extract product information from URL' 
      });
    }

    // Auto-categorize the clothing item
    const { category, type, style } = categorizeClothing(
      productData.data.title, 
      productData.data.description
    );

    // Extract colors
    const colors = extractColorsFromText(
      `${productData.data.title} ${productData.data.description}`
    );

    // Infer seasons
    const seasons = inferSeasons(category, type, productData.data.description);

    // Create clothing item
    const clothingItem: ClothingItem = {
      id: generateId(),
      userId,
      name: generateItemName(category, colors, type) || productData.data.title.substring(0, 50),
      category,
      type,
      imageUrl: productData.data.imageUrl,
      colors,
      primaryColor: colors[0] || 'multi',
      style,
      season: seasons,
      tags: [],
      sourceUrl: url,
      brand: productData.data.brand,
      dateAdded: new Date(),
      wearCount: 0,
      isFavorite: false,
      aiAnalysis: {
        confidence: 0.7,
        description: `Imported from ${extractDomain(url)}`,
        suggestedCategory: category,
        suggestedColors: colors,
        analysisDate: new Date(),
      }
    };

    // Save to database
    try {
      const savedItem = await prisma.clothingItem.create({
        data: {
          id: clothingItem.id,
          userId: clothingItem.userId,
          name: clothingItem.name,
          category: clothingItem.category,
          type: clothingItem.type || null,
          imageUrl: clothingItem.imageUrl,
          colors: JSON.stringify(clothingItem.colors),
          primaryColor: clothingItem.primaryColor,
          style: clothingItem.style,
          season: JSON.stringify(clothingItem.season),
          tags: JSON.stringify(clothingItem.tags),
          sourceUrl: clothingItem.sourceUrl || null,
          brand: clothingItem.brand || null,
          dateAdded: clothingItem.dateAdded,
          wearCount: clothingItem.wearCount,
          isFavorite: clothingItem.isFavorite,
          aiAnalysis: JSON.stringify(clothingItem.aiAnalysis),
        },
      });

      res.status(200).json({
        success: true,
        item: savedItem,
        extractedData: productData.data,
      });
    } catch (dbError) {
      console.error('Database save error:', dbError);
      res.status(500).json({
        success: false,
        error: 'Failed to save item to database',
      });
    }

  } catch (error: any) {
    console.error('URL import error:', error);
    res.status(500).json({ 
      error: 'Failed to import item from URL',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Scrape product data from e-commerce URLs
 */
async function scrapeProductData(url: string): Promise<{
  success: boolean;
  data?: {
    title: string;
    imageUrl: string;
    price?: string;
    brand?: string;
    description?: string;
  };
  error?: string;
}> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const domain = extractDomain(url);

    let title = '';
    let imageUrl = '';
    let price = '';
    let brand = '';
    let description = '';

    // Domain-specific selectors
    switch (domain) {
      case 'amazon.com':
        title = $('#productTitle').text().trim();
        imageUrl = $('#imgTagWrapperId img').attr('src') || '';
        price = $('.a-price-whole').first().text().trim();
        brand = $('#bylineInfo').text().trim();
        description = $('#feature-bullets ul').text().trim();
        break;

      case 'zara.com':
        title = $('.product-detail-info__header-name').text().trim();
        imageUrl = $('.media-image img').first().attr('src') || '';
        price = $('.price__amount').text().trim();
        description = $('.product-detail-info__description').text().trim();
        break;

      case 'hm.com':
        title = $('.ProductName-module--productName__2P8JW').text().trim();
        imageUrl = $('.ProductImages-module--productImages__2gCNS img').first().attr('src') || '';
        price = $('.ProductPrice-module--productItemPrice__3-wKI').text().trim();
        description = $('.ProductDescription-module--productDescription__1bNGR').text().trim();
        break;

      case 'uniqlo.com':
        title = $('.pdp-product-name').text().trim();
        imageUrl = $('.pdp-image img').first().attr('src') || '';
        price = $('.pdp-product-price').text().trim();
        description = $('.pdp-product-description').text().trim();
        break;

      default:
        // Generic selectors for other sites
        title = $('h1').first().text().trim() || 
                $('[class*="title"]').first().text().trim() ||
                $('[class*="name"]').first().text().trim();
        
        imageUrl = $('[class*="product"] img').first().attr('src') ||
                   $('[class*="image"] img').first().attr('src') ||
                   $('img[alt*="product"]').first().attr('src') || '';
        
        price = $('[class*="price"]').first().text().trim();
        description = $('[class*="description"]').first().text().trim();
    }

    // Clean up extracted data
    title = title.replace(/\s+/g, ' ').trim();
    description = description.replace(/\s+/g, ' ').trim();
    
    // Ensure we have at least a title and image
    if (!title || !imageUrl) {
      return {
        success: false,
        error: 'Could not extract product title or image from the URL'
      };
    }

    // Convert relative URLs to absolute
    if (imageUrl.startsWith('//')) {
      imageUrl = 'https:' + imageUrl;
    } else if (imageUrl.startsWith('/')) {
      const baseUrl = new URL(url);
      imageUrl = `${baseUrl.protocol}//${baseUrl.host}${imageUrl}`;
    }

    return {
      success: true,
      data: {
        title,
        imageUrl,
        price,
        brand,
        description
      }
    };

  } catch (error: any) {
    console.error('Scraping error:', error);
    return {
      success: false,
      error: 'Failed to fetch product data from URL'
    };
  }
}