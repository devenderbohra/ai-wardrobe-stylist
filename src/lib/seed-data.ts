/**
 * Seed data for new users - creates sample wardrobe items
 */

import { ClothingItem, ClothingCategory } from '@/src/types';
import { generateId } from '@/src/utils';

export const SAMPLE_CLOTHING_ITEMS = [
  {
    name: "Classic White Button-Down Shirt",
    category: "tops" as ClothingCategory,
    type: "shirt",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
    colors: ["white"],
    primaryColor: "white",
    style: "business",
    season: ["spring", "summer", "fall", "winter"],
    tags: ["professional", "versatile", "classic"],
    brand: "Sample Brand",
    description: "A timeless white button-down shirt perfect for professional and casual looks."
  },
  {
    name: "Dark Wash Straight Jeans",
    category: "bottoms" as ClothingCategory,
    type: "jeans",
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
    colors: ["blue"],
    primaryColor: "blue",
    style: "casual",
    season: ["spring", "fall", "winter"],
    tags: ["denim", "comfortable", "everyday"],
    brand: "Sample Denim Co.",
    description: "Comfortable straight-cut jeans in a classic dark wash."
  },
  {
    name: "Little Black Dress",
    category: "dresses" as ClothingCategory,
    type: "cocktail",
    imageUrl: "https://images.unsplash.com/photo-1566479179817-c62b8ed2b518?w=400",
    colors: ["black"],
    primaryColor: "black",
    style: "elegant",
    season: ["spring", "summer", "fall"],
    tags: ["formal", "versatile", "timeless"],
    brand: "Elegant Designs",
    description: "The perfect little black dress for any formal occasion."
  },
  {
    name: "Navy Blazer",
    category: "outerwear" as ClothingCategory,
    type: "blazer",
    imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400",
    colors: ["navy"],
    primaryColor: "navy",
    style: "business",
    season: ["spring", "fall", "winter"],
    tags: ["professional", "structured", "classic"],
    brand: "Professional Wear",
    description: "A sharp navy blazer that adds sophistication to any outfit."
  },
  {
    name: "White Sneakers",
    category: "shoes" as ClothingCategory,
    type: "sneakers",
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
    colors: ["white"],
    primaryColor: "white",
    style: "casual",
    season: ["spring", "summer", "fall"],
    tags: ["comfortable", "versatile", "athletic"],
    brand: "Comfort Steps",
    description: "Clean white sneakers perfect for casual and athletic wear."
  },
  {
    name: "Striped T-Shirt",
    category: "tops" as ClothingCategory,
    type: "t-shirt",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    colors: ["white", "navy"],
    primaryColor: "white",
    style: "casual",
    season: ["spring", "summer"],
    tags: ["stripes", "casual", "comfortable"],
    brand: "Casual Classics",
    description: "Classic navy and white striped t-shirt for relaxed styling."
  }
];

export const SAMPLE_URLS = [
  "https://www.uniqlo.com/us/en/men/t-shirts-and-polos",
  "https://www.zara.com/us/en/woman/dresses-c1838216.html", 
  "https://www2.hm.com/en_us/men/products/jeans.html",
  "https://www.asos.com/women/dresses/casual-dresses/cat/?cid=8799",
];

/**
 * Creates seed clothing items for a new user
 */
export const createSeedItems = (userId: string): ClothingItem[] => {
  const now = new Date();
  
  return SAMPLE_CLOTHING_ITEMS.map((item, index) => ({
    id: generateId(),
    userId,
    ...item,
    sourceUrl: undefined,
    dateAdded: new Date(now.getTime() - (index * 24 * 60 * 60 * 1000)), // Stagger dates
    lastWorn: undefined,
    wearCount: Math.floor(Math.random() * 5), // Random wear count 0-4
    isFavorite: index < 2, // First 2 items are favorites
    notes: undefined,
    aiAnalysis: {
      confidence: 0.9,
      description: `Pre-loaded sample item: ${item.description}`,
      suggestedCategory: item.category,
      suggestedColors: item.colors,
      analysisDate: now
    }
  }));
};