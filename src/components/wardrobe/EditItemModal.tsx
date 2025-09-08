/**
 * Modal for editing clothing item details
 */

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { ClothingItem, ClothingCategory } from '@/src/types';
import { cn } from '@/src/utils';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface EditItemModalProps {
  item: ClothingItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemId: string, updates: Partial<ClothingItem>) => Promise<void>;
  isLoading?: boolean;
}

const CATEGORIES: Array<{ value: ClothingCategory; label: string }> = [
  { value: 'tops', label: 'Tops' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'dresses', label: 'Dresses' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessories', label: 'Accessories' }
];

const STYLES = [
  { value: 'casual', label: 'Casual' },
  { value: 'business', label: 'Business' },
  { value: 'elegant', label: 'Elegant' },
  { value: 'sporty', label: 'Sporty' },
  { value: 'trendy', label: 'Trendy' }
];

const COLORS = [
  'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'black', 'white', 
  'gray', 'brown', 'beige', 'navy', 'orange', 'multi'
];

const SEASONS = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
  { value: 'winter', label: 'Winter' }
];

const EditItemModal: React.FC<EditItemModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: item.name,
    category: item.category,
    type: item.type || '',
    colors: item.colors,
    primaryColor: item.primaryColor,
    style: item.style,
    season: item.season,
    tags: item.tags,
    brand: item.brand || '',
    isFavorite: item.isFavorite
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: item.name,
        category: item.category,
        type: item.type || '',
        colors: item.colors,
        primaryColor: item.primaryColor,
        style: item.style,
        season: item.season,
        tags: item.tags,
        brand: item.brand || '',
        isFavorite: item.isFavorite
      });
    }
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates: Partial<ClothingItem> = {
      name: formData.name.trim(),
      category: formData.category,
      type: formData.type.trim() || undefined,
      colors: formData.colors,
      primaryColor: formData.primaryColor,
      style: formData.style,
      season: formData.season,
      tags: formData.tags,
      brand: formData.brand.trim() || undefined,
      isFavorite: formData.isFavorite
    };

    await onSave(item.id, updates);
  };

  const handleColorToggle = (color: string) => {
    const currentColors = formData.colors;
    const newColors = currentColors.includes(color)
      ? currentColors.filter(c => c !== color)
      : [...currentColors, color];
    
    setFormData(prev => ({
      ...prev,
      colors: newColors,
      primaryColor: newColors.length > 0 ? newColors[0] : 'multi'
    }));
  };

  const handleSeasonToggle = (season: string) => {
    const currentSeasons = formData.season;
    const newSeasons = currentSeasons.includes(season)
      ? currentSeasons.filter(s => s !== season)
      : [...currentSeasons, season];
    
    setFormData(prev => ({
      ...prev,
      season: newSeasons
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Edit Item</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ClothingCategory }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={isLoading}
            >
              {CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type (e.g., t-shirt, jeans, dress)
            </label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., t-shirt, jeans, blazer"
              disabled={isLoading}
            />
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Nike, H&M, Zara"
              disabled={isLoading}
            />
          </div>

          {/* Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Style
            </label>
            <select
              value={formData.style}
              onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            >
              {STYLES.map(style => (
                <option key={style.value} value={style.value}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Colors
            </label>
            <div className="grid grid-cols-7 gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorToggle(color)}
                  className={cn(
                    'h-8 rounded border-2 transition-colors',
                    formData.colors.includes(color) ? 'border-purple-500' : 'border-gray-300',
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
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {/* Seasons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suitable Seasons
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SEASONS.map(season => (
                <label key={season.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.season.includes(season.value)}
                    onChange={() => handleSeasonToggle(season.value)}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  {season.label}
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Add tag..."
                disabled={isLoading}
              />
              <Button
                type="button"
                onClick={handleAddTag}
                variant="secondary"
                disabled={!newTag.trim() || isLoading}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Favorite */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isFavorite}
                onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
                className="mr-2"
                disabled={isLoading}
              />
              Mark as favorite
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditItemModal;