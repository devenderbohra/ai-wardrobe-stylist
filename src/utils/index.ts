/**
 * Utility functions for the AI Wardrobe Stylist application
 */

import { ClothingCategory, ClothingType, ColorFamily, StyleType, Season } from '@/src/types';

/**
 * Generate unique ID for items
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Convert file to base64 string for API usage
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix (data:image/jpeg;base64,)
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Validate image file type and size
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a JPEG, PNG, or WebP image' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be smaller than 10MB' };
  }

  return { valid: true };
};

/**
 * Compress image for optimal API usage
 */
export const compressImage = (file: File, maxWidth: number = 1024, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original if compression fails
          }
        },
        file.type,
        quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Extract domain from URL for e-commerce site detection
 */
export const extractDomain = (url: string): string | null => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return null;
  }
};

/**
 * Detect if URL is from supported e-commerce sites
 */
export const isSupportedEcommerceUrl = (url: string): boolean => {
  const supportedDomains = [
    'amazon.com',
    'zara.com',
    'hm.com',
    'uniqlo.com',
    'nike.com',
    'adidas.com',
    'gap.com',
    'oldnavy.com',
    'target.com',
    'walmart.com',
    'macys.com',
    'nordstrom.com',
    'shopify.com'
  ];
  
  const domain = extractDomain(url);
  return domain ? supportedDomains.some(supported => domain.includes(supported)) : false;
};

/**
 * Auto-categorize clothing based on keywords in title/description
 */
export const categorizeClothing = (title: string, description: string = ''): {
  category: ClothingCategory;
  type?: ClothingType;
  style: StyleType;
} => {
  const text = (title + ' ' + description).toLowerCase();
  
  // Category detection
  if (text.match(/\b(dress|gown|sundress|maxi|mini)\b/)) {
    return { category: 'dresses', type: 'dress', style: 'elegant' };
  }
  
  if (text.match(/\b(shoe|sneaker|boot|heel|sandal|loafer|oxford)\b/)) {
    const type = text.includes('sneaker') ? 'sneakers' : 
                 text.includes('boot') ? 'boots' :
                 text.includes('heel') ? 'heels' : 
                 text.includes('sandal') ? 'sandals' : 'other';
    return { category: 'shoes', type: type as ClothingType, style: 'casual' };
  }
  
  if (text.match(/\b(jacket|coat|blazer|cardigan|hoodie)\b/)) {
    const type = text.includes('jacket') ? 'jacket' :
                 text.includes('coat') ? 'coat' :
                 text.includes('cardigan') ? 'cardigan' : 'other';
    return { category: 'outerwear', type: type as ClothingType, style: 'casual' };
  }
  
  if (text.match(/\b(jean|pant|trouser|short|skirt|legging)\b/)) {
    const type = text.includes('jean') ? 'jeans' :
                 text.includes('pant') || text.includes('trouser') ? 'pants' :
                 text.includes('short') ? 'shorts' :
                 text.includes('skirt') ? 'skirt' :
                 text.includes('legging') ? 'leggings' : 'other';
    return { category: 'bottoms', type: type as ClothingType, style: 'casual' };
  }
  
  if (text.match(/\b(bag|purse|wallet|backpack|handbag|jewelry|necklace|earring|bracelet|watch|hat|cap|scarf|belt)\b/)) {
    return { category: 'accessories', style: 'trendy' };
  }
  
  // Default to tops
  const type = text.includes('t-shirt') || text.includes('tee') ? 't-shirt' :
               text.includes('shirt') ? 'shirt' :
               text.includes('blouse') ? 'blouse' :
               text.includes('sweater') ? 'sweater' :
               text.includes('tank') ? 'tank-top' :
               text.includes('hoodie') ? 'hoodie' : 'other';
               
  return { category: 'tops', type: type as ClothingType, style: 'casual' };
};

/**
 * Extract colors from text description
 */
export const extractColorsFromText = (text: string): ColorFamily[] => {
  const colorMap: Record<string, ColorFamily> = {
    'red': 'red',
    'pink': 'pink',
    'rose': 'pink',
    'blue': 'blue',
    'navy': 'navy',
    'royal': 'blue',
    'green': 'green',
    'olive': 'green',
    'yellow': 'yellow',
    'gold': 'yellow',
    'orange': 'orange',
    'purple': 'purple',
    'violet': 'purple',
    'brown': 'brown',
    'tan': 'brown',
    'beige': 'beige',
    'cream': 'beige',
    'black': 'black',
    'white': 'white',
    'gray': 'gray',
    'grey': 'gray',
    'silver': 'gray',
  };
  
  const lowerText = text.toLowerCase();
  const foundColors: ColorFamily[] = [];
  
  Object.entries(colorMap).forEach(([keyword, color]) => {
    if (lowerText.includes(keyword) && !foundColors.includes(color)) {
      foundColors.push(color);
    }
  });
  
  return foundColors.length > 0 ? foundColors : ['multi'];
};

/**
 * Determine appropriate seasons based on clothing type and description
 */
export const inferSeasons = (category: ClothingCategory, type?: ClothingType, description: string = ''): Season[] => {
  const text = description.toLowerCase();
  
  // Specific seasonal keywords
  if (text.includes('winter') || text.includes('warm') || text.includes('wool') || text.includes('fleece')) {
    return ['winter'];
  }
  if (text.includes('summer') || text.includes('light') || text.includes('cotton') || text.includes('linen')) {
    return ['summer'];
  }
  
  // Category-based inference
  switch (category) {
    case 'outerwear':
      if (type === 'coat' || type === 'jacket') return ['fall', 'winter'];
      if (type === 'cardigan') return ['spring', 'fall'];
      return ['all-season'];
      
    case 'shoes':
      if (type === 'boots') return ['fall', 'winter'];
      if (type === 'sandals') return ['spring', 'summer'];
      return ['all-season'];
      
    default:
      return ['all-season'];
  }
};

/**
 * Generate clothing item name from category and colors
 */
export const generateItemName = (category: ClothingCategory, colors: ColorFamily[], type?: ClothingType): string => {
  const colorStr = colors.length === 1 ? colors[0] : colors.length > 1 ? 'multicolor' : '';
  const typeStr = type || category.slice(0, -1); // Remove 's' from category
  
  return `${colorStr ? colorStr + ' ' : ''}${typeStr}`.trim();
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Combine CSS class names
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};