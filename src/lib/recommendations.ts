/**
 * AI-powered outfit recommendation engine
 * Provides smart clothing combinations based on occasion, season, and style preferences
 */

import { 
  ClothingItem, 
  Occasion, 
  Season, 
  StyleType, 
  ColorFamily,
  OutfitRecommendation,
  ClothingCategory 
} from '@/src/types';

/**
 * Color harmony scoring for outfit coordination
 */
const COLOR_HARMONY_MATRIX: Record<ColorFamily, { complementary: ColorFamily[]; compatible: ColorFamily[]; avoid: ColorFamily[] }> = {
  black: { 
    complementary: ['white', 'gray'], 
    compatible: ['red', 'blue', 'pink', 'yellow', 'green', 'purple', 'orange'], 
    avoid: ['brown'] 
  },
  white: { 
    complementary: ['black', 'navy'], 
    compatible: ['blue', 'red', 'green', 'pink', 'purple', 'orange', 'yellow'], 
    avoid: ['beige'] 
  },
  gray: { 
    complementary: ['black', 'white'], 
    compatible: ['red', 'blue', 'pink', 'yellow', 'green', 'purple', 'orange'], 
    avoid: [] 
  },
  navy: { 
    complementary: ['white', 'beige'], 
    compatible: ['red', 'pink', 'yellow', 'gray'], 
    avoid: ['black', 'brown'] 
  },
  blue: { 
    complementary: ['orange', 'yellow'], 
    compatible: ['white', 'gray', 'navy', 'beige'], 
    avoid: ['green', 'purple'] 
  },
  red: { 
    complementary: ['green', 'white'], 
    compatible: ['black', 'gray', 'navy', 'beige'], 
    avoid: ['orange', 'pink'] 
  },
  green: { 
    complementary: ['red', 'pink'], 
    compatible: ['beige', 'brown', 'white', 'navy'], 
    avoid: ['blue', 'purple'] 
  },
  yellow: { 
    complementary: ['purple', 'blue'], 
    compatible: ['white', 'gray', 'black', 'navy'], 
    avoid: ['orange', 'green'] 
  },
  orange: { 
    complementary: ['blue', 'navy'], 
    compatible: ['white', 'black', 'brown', 'beige'], 
    avoid: ['red', 'pink'] 
  },
  purple: { 
    complementary: ['yellow', 'green'], 
    compatible: ['white', 'gray', 'black'], 
    avoid: ['red', 'orange'] 
  },
  pink: { 
    complementary: ['green', 'navy'], 
    compatible: ['white', 'gray', 'black', 'beige'], 
    avoid: ['red', 'orange'] 
  },
  brown: { 
    complementary: ['blue', 'green'], 
    compatible: ['beige', 'white', 'orange', 'yellow'], 
    avoid: ['black', 'purple'] 
  },
  beige: { 
    complementary: ['navy', 'brown'], 
    compatible: ['white', 'blue', 'green', 'pink'], 
    avoid: ['yellow'] 
  },
  multi: { 
    complementary: ['black', 'white'], 
    compatible: ['gray', 'navy', 'beige'], 
    avoid: [] 
  }
};

/**
 * Occasion-appropriate style mappings
 */
const OCCASION_STYLE_MAP: Record<Occasion, { preferred: StyleType[]; acceptable: StyleType[]; avoid: StyleType[] }> = {
  work: {
    preferred: ['business', 'elegant'],
    acceptable: ['casual'],
    avoid: ['sporty', 'trendy']
  },
  casual: {
    preferred: ['casual', 'sporty'],
    acceptable: ['trendy'],
    avoid: ['business', 'elegant']
  },
  date: {
    preferred: ['elegant', 'trendy'],
    acceptable: ['casual'],
    avoid: ['sporty', 'business']
  },
  formal: {
    preferred: ['elegant', 'business'],
    acceptable: [],
    avoid: ['casual', 'sporty', 'trendy']
  },
  party: {
    preferred: ['trendy', 'elegant'],
    acceptable: ['casual'],
    avoid: ['business', 'sporty']
  }
};

/**
 * Essential clothing combinations for complete outfits
 */
const OUTFIT_COMBINATIONS = [
  // Top + Bottom + Shoes
  {
    required: ['tops', 'bottoms', 'shoes'],
    optional: ['accessories', 'outerwear'],
    weight: 1.0
  },
  // Dress + Shoes
  {
    required: ['dresses', 'shoes'],
    optional: ['accessories', 'outerwear'],
    weight: 1.0
  },
  // Top + Bottom + Shoes + Outerwear (for layering)
  {
    required: ['tops', 'bottoms', 'shoes', 'outerwear'],
    optional: ['accessories'],
    weight: 0.9
  }
];

/**
 * Calculate color harmony score between two items
 */
function calculateColorHarmony(item1: ClothingItem, item2: ClothingItem): number {
  const color1 = item1.primaryColor;
  const color2 = item2.primaryColor;
  
  if (color1 === color2) return 1.0; // Perfect match
  
  const harmony = COLOR_HARMONY_MATRIX[color1];
  if (!harmony) return 0.5; // Neutral if no data
  
  if (harmony.complementary.includes(color2)) return 0.95;
  if (harmony.compatible.includes(color2)) return 0.8;
  if (harmony.avoid.includes(color2)) return 0.2;
  
  return 0.6; // Neutral compatibility
}

/**
 * Calculate style compatibility score for an occasion
 */
function calculateStyleScore(items: ClothingItem[], occasion: Occasion): number {
  const styleMap = OCCASION_STYLE_MAP[occasion];
  let totalScore = 0;
  let itemCount = 0;
  
  items.forEach(item => {
    itemCount++;
    if (styleMap.preferred.includes(item.style)) {
      totalScore += 1.0;
    } else if (styleMap.acceptable.includes(item.style)) {
      totalScore += 0.7;
    } else if (styleMap.avoid.includes(item.style)) {
      totalScore += 0.2;
    } else {
      totalScore += 0.5; // Neutral
    }
  });
  
  return itemCount > 0 ? totalScore / itemCount : 0;
}

/**
 * Calculate overall color harmony for an outfit
 */
function calculateOutfitColorHarmony(items: ClothingItem[]): number {
  if (items.length < 2) return 1.0;
  
  let totalHarmony = 0;
  let pairCount = 0;
  
  // Calculate harmony between all pairs
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      totalHarmony += calculateColorHarmony(items[i], items[j]);
      pairCount++;
    }
  }
  
  return pairCount > 0 ? totalHarmony / pairCount : 1.0;
}

/**
 * Filter items by season appropriateness
 */
function filterBySeasonality(items: ClothingItem[], season?: Season): ClothingItem[] {
  if (!season) return items;
  
  return items.filter(item => 
    item.season.includes(season) || item.season.includes('all-season')
  );
}

/**
 * Group clothing items by category
 */
function groupItemsByCategory(items: ClothingItem[]): Record<ClothingCategory, ClothingItem[]> {
  const groups: Record<ClothingCategory, ClothingItem[]> = {
    tops: [],
    bottoms: [],
    dresses: [],
    outerwear: [],
    shoes: [],
    accessories: []
  };
  
  items.forEach(item => {
    groups[item.category].push(item);
  });
  
  return groups;
}

/**
 * Generate outfit combinations based on required categories
 */
function generateCombinations(
  groups: Record<ClothingCategory, ClothingItem[]>,
  combination: typeof OUTFIT_COMBINATIONS[0],
  maxCombinations: number = 50
): ClothingItem[][] {
  const combinations: ClothingItem[][] = [];
  
  // Get required items
  const requiredLists = combination.required.map(cat => groups[cat as ClothingCategory]).filter(list => list.length > 0);
  
  // If any required category is missing, skip this combination type
  if (requiredLists.length !== combination.required.length) {
    return combinations;
  }
  
  // Generate all possible combinations (with limits to prevent explosion)
  const generateRecursive = (currentOutfit: ClothingItem[], listIndex: number) => {
    if (combinations.length >= maxCombinations) return;
    
    if (listIndex >= requiredLists.length) {
      combinations.push([...currentOutfit]);
      return;
    }
    
    const currentList = requiredLists[listIndex];
    const maxItems = Math.min(currentList.length, 5); // Limit items per category
    
    for (let i = 0; i < maxItems; i++) {
      const item = currentList[i];
      // Avoid duplicate items in same outfit
      if (!currentOutfit.find(existing => existing.id === item.id)) {
        currentOutfit.push(item);
        generateRecursive(currentOutfit, listIndex + 1);
        currentOutfit.pop();
      }
    }
  };
  
  generateRecursive([], 0);
  return combinations;
}

/**
 * Score and rank outfit combinations
 */
function scoreOutfitCombination(
  items: ClothingItem[],
  occasion: Occasion,
  preferredColors?: ColorFamily[]
): OutfitRecommendation {
  const styleScore = calculateStyleScore(items, occasion);
  const colorHarmony = calculateOutfitColorHarmony(items);
  
  // Color preference bonus
  let colorPreferenceBonus = 0;
  if (preferredColors && preferredColors.length > 0) {
    const hasPreferredColor = items.some(item => 
      preferredColors.includes(item.primaryColor) ||
      item.colors.some(color => preferredColors.includes(color))
    );
    colorPreferenceBonus = hasPreferredColor ? 0.1 : 0;
  }
  
  // Freshness bonus (prefer less worn items)
  const avgWearCount = items.reduce((sum, item) => sum + item.wearCount, 0) / items.length;
  const freshnessBonus = Math.max(0, (10 - avgWearCount) / 10 * 0.1);
  
  // Favorite bonus
  const favoriteBonus = items.some(item => item.isFavorite) ? 0.05 : 0;
  
  const baseScore = (styleScore * 0.5) + (colorHarmony * 0.4);
  const totalScore = Math.min(1.0, baseScore + colorPreferenceBonus + freshnessBonus + favoriteBonus);
  
  // Generate reasoning
  const reasoning = generateOutfitReasoning(items, occasion, styleScore, colorHarmony);
  
  return {
    items,
    confidence: totalScore,
    reasoning,
    styleScore,
    colorHarmony,
    occasion
  };
}

/**
 * Generate human-readable reasoning for outfit recommendation
 */
function generateOutfitReasoning(
  items: ClothingItem[],
  occasion: Occasion,
  styleScore: number,
  colorHarmony: number
): string {
  const reasons: string[] = [];
  
  // Style appropriateness
  if (styleScore >= 0.8) {
    reasons.push(`Perfect ${occasion} styling with well-coordinated pieces`);
  } else if (styleScore >= 0.6) {
    reasons.push(`Good fit for ${occasion} with versatile styling`);
  }
  
  // Color coordination
  if (colorHarmony >= 0.85) {
    reasons.push('Excellent color coordination');
  } else if (colorHarmony >= 0.7) {
    reasons.push('Good color harmony');
  }
  
  // Special features
  const favorites = items.filter(item => item.isFavorite);
  if (favorites.length > 0) {
    reasons.push(`Includes ${favorites.length} of your favorite pieces`);
  }
  
  const unworn = items.filter(item => item.wearCount === 0);
  if (unworn.length > 0) {
    reasons.push(`Features ${unworn.length} fresh pieces from your wardrobe`);
  }
  
  return reasons.length > 0 ? reasons.join('. ') + '.' : 'Solid outfit combination for the occasion.';
}

/**
 * Main function to generate outfit recommendations
 */
export function generateOutfitRecommendations(
  wardrobeItems: ClothingItem[],
  occasion: Occasion,
  options: {
    season?: Season;
    preferredColors?: ColorFamily[];
    excludeItemIds?: string[];
    includeItemIds?: string[];
    maxRecommendations?: number;
  } = {}
): OutfitRecommendation[] {
  const {
    season,
    preferredColors,
    excludeItemIds = [],
    includeItemIds = [],
    maxRecommendations = 10
  } = options;
  
  // Filter items
  let availableItems = wardrobeItems.filter(item => !excludeItemIds.includes(item.id));
  
  // Apply seasonal filtering
  if (season) {
    availableItems = filterBySeasonality(availableItems, season);
  }
  
  // Ensure included items are present
  const includedItems = includeItemIds.length > 0 
    ? wardrobeItems.filter(item => includeItemIds.includes(item.id))
    : [];
  
  // Group items by category
  const groups = groupItemsByCategory(availableItems);
  
  // Generate all possible outfit combinations
  const allCombinations: ClothingItem[][] = [];
  
  OUTFIT_COMBINATIONS.forEach(combinationType => {
    const combinations = generateCombinations(groups, combinationType, 100);
    
    combinations.forEach(combo => {
      // If there are required included items, make sure they're in this combo
      if (includedItems.length > 0) {
        const hasAllIncluded = includedItems.every(required => 
          combo.some(item => item.id === required.id)
        );
        if (hasAllIncluded) {
          allCombinations.push(combo);
        }
      } else {
        allCombinations.push(combo);
      }
    });
  });
  
  // Score and sort combinations
  const scoredOutfits = allCombinations.map(items => 
    scoreOutfitCombination(items, occasion, preferredColors)
  );
  
  // Sort by confidence score (descending)
  scoredOutfits.sort((a, b) => b.confidence - a.confidence);
  
  // Remove duplicates and return top recommendations
  const uniqueOutfits: OutfitRecommendation[] = [];
  const seenCombinations = new Set<string>();
  
  for (const outfit of scoredOutfits) {
    const combinationKey = outfit.items.map(item => item.id).sort().join('-');
    
    if (!seenCombinations.has(combinationKey) && uniqueOutfits.length < maxRecommendations) {
      seenCombinations.add(combinationKey);
      uniqueOutfits.push(outfit);
    }
  }
  
  return uniqueOutfits;
}

/**
 * Get quick outfit suggestions for immediate wear
 */
export function getQuickOutfitSuggestions(
  wardrobeItems: ClothingItem[],
  occasion: Occasion,
  maxSuggestions: number = 3
): OutfitRecommendation[] {
  // Prefer recently added and less worn items
  const prioritizedItems = wardrobeItems
    .sort((a, b) => {
      const aDays = (Date.now() - a.dateAdded.getTime()) / (1000 * 60 * 60 * 24);
      const bDays = (Date.now() - b.dateAdded.getTime()) / (1000 * 60 * 60 * 24);
      
      // Score: lower wear count + recently added + favorites
      const aScore = (10 - a.wearCount) + (aDays < 7 ? 5 : 0) + (a.isFavorite ? 3 : 0);
      const bScore = (10 - b.wearCount) + (bDays < 7 ? 5 : 0) + (b.isFavorite ? 3 : 0);
      
      return bScore - aScore;
    });
  
  return generateOutfitRecommendations(prioritizedItems, occasion, {
    maxRecommendations: maxSuggestions
  });
}