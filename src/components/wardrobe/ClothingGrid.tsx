/**
 * Grid component for displaying clothing items
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { ClothingItem, ClothingCategory } from '@/src/types';
import { cn } from '@/src/utils';
import Card from '../ui/Card';
import Button from '../ui/Button';

export interface ClothingGridProps {
  items: ClothingItem[];
  onItemClick?: (item: ClothingItem) => void;
  onFavorite?: (item: ClothingItem) => void;
  onEdit?: (item: ClothingItem) => void;
  onDelete?: (item: ClothingItem) => void;
  selectedItems?: string[]; // Item IDs that are selected
  multiSelect?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

// Category colors for visual organization
const CATEGORY_COLORS: Record<ClothingCategory, string> = {
  tops: 'bg-blue-100 text-blue-800',
  bottoms: 'bg-green-100 text-green-800',
  dresses: 'bg-pink-100 text-pink-800',
  outerwear: 'bg-purple-100 text-purple-800',
  shoes: 'bg-yellow-100 text-yellow-800',
  accessories: 'bg-indigo-100 text-indigo-800'
};

const ClothingGrid: React.FC<ClothingGridProps> = ({
  items,
  onItemClick,
  onFavorite,
  onEdit,
  onDelete,
  selectedItems = [],
  multiSelect = false,
  loading = false,
  emptyMessage = 'No clothing items found',
  className
}) => {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  
  const handleImageError = (itemId: string) => {
    setImageErrors(prev => new Set(prev).add(itemId));
  };

  const isSelected = (itemId: string) => selectedItems.includes(itemId);

  if (loading) {
    return (
      <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4', className)}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg mb-3" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          {emptyMessage}
        </h3>
        <p className="text-gray-600">
          Start building your digital wardrobe by uploading clothing items
        </p>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4', className)}>
      {(items || []).map((item) => (
        <Card
          key={item.id}
          padding="sm"
          className={cn(
            'relative group overflow-hidden',
            isSelected(item.id) && 'ring-2 ring-purple-500 bg-purple-50',
            onItemClick && 'cursor-pointer'
          )}
          onClick={() => onItemClick?.(item)}
        >
          {/* Image */}
          <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden mb-3">
            {imageErrors.has(item.id) ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            ) : (
              <Image
                src={item.thumbnailUrl || item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                onError={() => handleImageError(item.id)}
              />
            )}
            
            {/* Selection indicator */}
            {multiSelect && (
              <div className="absolute top-2 left-2">
                <div className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                  isSelected(item.id)
                    ? 'bg-purple-600 border-purple-600'
                    : 'bg-white border-gray-300'
                )}>
                  {isSelected(item.id) && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            )}
            
            {/* Favorite indicator */}
            {item.isFavorite && (
              <div className="absolute top-2 right-2">
                <Heart className="w-5 h-5 text-red-500 fill-current" />
              </div>
            )}
            
            {/* Source URL indicator */}
            {item.sourceUrl && (
              <div className="absolute bottom-2 right-2">
                <ExternalLink className="w-4 h-4 text-gray-500" />
              </div>
            )}

            {/* Action buttons - show on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
              {onFavorite && (
                <Button
                  size="sm"
                  variant={item.isFavorite ? 'primary' : 'secondary'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavorite(item);
                  }}
                >
                  <Heart className={cn('w-4 h-4', item.isFavorite && 'fill-current')} />
                </Button>
              )}
              
              {onEdit && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(item);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
              
              {onDelete && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Item details */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
              {item.name}
            </h4>
            
            <div className="flex items-center justify-between">
              <span className={cn(
                'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium',
                CATEGORY_COLORS[item.category]
              )}>
                {item.category}
              </span>
              
              <div className="flex items-center space-x-1">
                {item.colors.slice(0, 3).map((color, index) => (
                  <div
                    key={index}
                    className={cn(
                      'w-3 h-3 rounded-full border border-gray-300',
                      // Color classes - would need to be dynamic based on color value
                      color === 'red' && 'bg-red-500',
                      color === 'blue' && 'bg-blue-500',
                      color === 'green' && 'bg-green-500',
                      color === 'yellow' && 'bg-yellow-500',
                      color === 'purple' && 'bg-purple-500',
                      color === 'pink' && 'bg-pink-500',
                      color === 'black' && 'bg-gray-900',
                      color === 'white' && 'bg-white',
                      color === 'gray' && 'bg-gray-500',
                      color === 'brown' && 'bg-yellow-700',
                      color === 'beige' && 'bg-yellow-200',
                      color === 'navy' && 'bg-blue-900',
                      color === 'orange' && 'bg-orange-500',
                      color === 'multi' && 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500'
                    )}
                    title={color}
                  />
                ))}
                {item.colors.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{item.colors.length - 3}
                  </span>
                )}
              </div>
            </div>
            
            {/* Wear count */}
            <div className="text-xs text-gray-500">
              Worn {item.wearCount} {item.wearCount === 1 ? 'time' : 'times'}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ClothingGrid;